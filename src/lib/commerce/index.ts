import 'server-only'

import { cache } from 'react'
import type { DemoSlug } from '@/lib/demos'
import { adapter } from './config'
import { rankCompanions } from './programs/companions'
import { MIN_SHARED_SPECS, countSharedSpecs } from './programs/comparison'
import { MIN_RELATED, rankRelated } from './programs/related'
import { ratingHistogram, summarizeReviews } from './programs/reviews'
import { applyPrograms, getAssistantPrompts } from './programs'
import type {
  BannerPlacement,
  ComparableProduct,
  FeaturedReviewList,
  HeroProduct,
  Product,
  ProductQuery,
  ProductReviewList,
  SearchSuggestionQuery,
  VisualMatch,
} from './types'

/*
 * The commerce facade: the single entry point storefront screens call for data.
 * Every read is scoped to a demo (the template hosts multiple storefronts side by
 * side), so call `getCommerce` with the demo slug and use the returned
 * client:
 *
 *     import { getCommerce } from '@/lib/commerce'
 *     const commerce = getCommerce('electronics')
 *     const menu = await commerce.getMenu()
 *
 * The client delegates to whichever `adapter` is active in `./config`, so
 * the UI stays backend-agnostic: swap the adapter, not the screens.
 *
 * Reads are wrapped in React's `cache` to de-duplicate identical calls within a
 * single request (e.g. the header and the mega-menu both asking for the same
 * demo's menu). This is request-scoped memoization only, and nothing persists
 * between requests.
 *
 * Caching strategy: catalog reads are meant to *stream* behind a `<Suspense>`
 * boundary with a skeleton fallback (see the demo adapter's artificial latency),
 * while stable data like the menu and category tree render into the static shell.
 * When the project later opts into Cache Components (`cacheComponents: true`),
 * add `'use cache'` to the stable readers below. No call sites change.
 *
 * Reads are delegation, with 2 exceptions. The storefront's merchandising
 * programs (see `./programs`) run here: `getProduct` applies them to whatever
 * the adapter returned, and `getAssistantPrompts` is configuration with no
 * adapter behind it at all. Both sit here rather than in each adapter, so
 * protection plans and the shopping assistant work against every backend,
 * including ones that have no field to put them in. And
 * `getComparableProducts`, `getRelatedProducts`, and `getCompanionProducts`
 * compose ordinary reads instead of adding methods every adapter would have to
 * implement.
 * `getProductReviews` is the same shape as `getProduct`: the adapter supplies the
 * reviews, and the storefront's summarizer fills in the assistant's read on them
 * for any backend that writes none of its own.
 *
 * These functions are server-only. Client Components receive their data as props
 * from a Server Component, or via a Server Action. Import display types from
 * `@/lib/commerce/types` and `formatMoney` from `@/lib/commerce/format`, both of
 * which are safe on the client.
 */

/** What a store with no reviews behind its adapter shows: none, and no rating. */
const NO_REVIEWS: ProductReviewList = { reviews: [], rating: { value: 0, count: 0 }, histogram: ratingHistogram([]) }
const NO_FEATURED_REVIEWS: FeaturedReviewList = { reviews: [], rating: { value: 0, count: 0 } }

/** An optional method's answer, or `fallback` where the adapter leaves the method out. */
async function optional<T>(read: Promise<T> | undefined, fallback: T): Promise<T> {
  return (await read) ?? fallback
}

// Cached at module scope, keyed by (demo, …args), so repeated identical reads in
// one request hit the memo regardless of which component asked.
const getMenu = cache((demo: DemoSlug) => adapter.getMenu(demo))
const getCategoryTree = cache((demo: DemoSlug) => adapter.getCategoryTree(demo))
const getDepartments = cache((demo: DemoSlug) => optional(adapter.getDepartments?.(demo), []))
const getCategory = cache((demo: DemoSlug, slug: string) => adapter.getCategory(demo, slug))
const getHeroSlides = cache((demo: DemoSlug) => optional(adapter.getHeroSlides?.(demo), []))
const getHeroCampaigns = cache((demo: DemoSlug, department?: string) =>
  optional(adapter.getHeroCampaigns?.(demo, department), []),
)
const getShoppableScenes = cache((demo: DemoSlug) => optional(adapter.getShoppableScenes?.(demo), []))
const getCategoryBanners = cache((demo: DemoSlug, slug: string) =>
  optional(adapter.getCategoryBanners?.(demo, slug), []),
)
const getCategoryCampaigns = cache((demo: DemoSlug, slug: string) =>
  optional(adapter.getCategoryCampaigns?.(demo, slug), []),
)
const getCategoryGridCampaigns = cache((demo: DemoSlug, slug?: string) =>
  optional(adapter.getCategoryGridCampaigns?.(demo, slug), []),
)
const getCategoryTiles = cache((demo: DemoSlug, slug: string) => optional(adapter.getCategoryTiles?.(demo, slug), []))
const getPlacementTiles = cache((demo: DemoSlug, placement: BannerPlacement) =>
  optional(adapter.getPlacementTiles?.(demo, placement), []),
)
const getPlacementPromos = cache((demo: DemoSlug, placement: BannerPlacement) =>
  optional(adapter.getPlacementPromos?.(demo, placement), []),
)
const getPlacementMosaic = cache((demo: DemoSlug, placement: BannerPlacement) =>
  optional(adapter.getPlacementMosaic?.(demo, placement), []),
)
const getPlacementCampaigns = cache((demo: DemoSlug, placement: BannerPlacement, department?: string) =>
  optional(adapter.getPlacementCampaigns?.(demo, placement, department), []),
)
const getCollections = cache((demo: DemoSlug, department?: string) =>
  optional(adapter.getCollections?.(demo, department), []),
)
const getCollection = cache((demo: DemoSlug, slug: string) => optional(adapter.getCollection?.(demo, slug), null))
const getCategoryPromo = cache((demo: DemoSlug, slug: string) => optional(adapter.getCategoryPromo?.(demo, slug), null))
const getCategoryTags = cache((demo: DemoSlug, slug: string) => optional(adapter.getCategoryTags?.(demo, slug), []))
const getCategoryShelf = cache((demo: DemoSlug, slug: string) => optional(adapter.getCategoryShelf?.(demo, slug), null))
const getBundles = cache((demo: DemoSlug) => optional(adapter.getBundles?.(demo), []))
const listProducts = cache((demo: DemoSlug, query?: ProductQuery) => adapter.listProducts(demo, query))
const getSearchSuggestions = cache((demo: DemoSlug, query: SearchSuggestionQuery) =>
  adapter.getSearchSuggestions(demo, query),
)
const getProduct = cache(async (demo: DemoSlug, slug: string) => {
  const product = await adapter.getProduct(demo, slug)
  return product && applyPrograms(demo, product)
})
const getComparableProducts = cache(async (demo: DemoSlug, slug: string) => {
  const product = await getProduct(demo, slug)
  if (!product?.smartComparison) return []

  // Shelf-mates rather than the leaf category: earbuds are worth weighing
  // against over-ear headphones, and the shared-spec floor below is the honest
  // test of whether 2 devices answer the same questions.
  const tree = await getCategoryTree(demo)
  const root = tree.find((category) => product.categoryIds.includes(category.id))
  if (!root) return []

  const { products } = await listProducts(demo, { categorySlug: root.slug })
  return products
    .filter((candidate) => candidate.slug !== product.slug && countSharedSpecs(product, candidate) >= MIN_SHARED_SPECS)
    .map(comparableProduct)
})
const getRelatedProducts = cache(async (demo: DemoSlug, slug: string) => {
  const product = await getProduct(demo, slug)
  if (!product) return []

  // Curation wins outright, running order included: a merchandiser who named the
  // picks has already answered what the rule below can only estimate.
  if (product.relatedSlugs?.length) {
    const { products } = await listProducts(demo, { slugs: product.relatedSlugs })
    return products.filter((candidate) => candidate.slug !== product.slug)
  }

  const tree = await getCategoryTree(demo)
  const parent = tree.find((category) => product.categoryIds.includes(category.id))
  if (!parent) return []

  // The subcategory first, since that is the shelf the product actually stands
  // on. A thin one can't fill a row by itself, and a catalog holding a single
  // e-reader is the normal case rather than the broken one, so fall back to the
  // department above it instead of showing 1 card.
  const child = parent.children?.find((category) => product.categoryIds.includes(category.id))
  if (child) {
    const { products } = await listProducts(demo, { categorySlug: child.slug })
    const related = rankRelated(product, products)
    if (related.length >= MIN_RELATED) return related
  }

  const { products } = await listProducts(demo, { categorySlug: parent.slug })
  return rankRelated(product, products)
})
const getCompanionProducts = cache(async (demo: DemoSlug, slug: string) => {
  const [product, collections, tree] = await Promise.all([
    getProduct(demo, slug),
    getCollections(demo),
    getCategoryTree(demo),
  ])
  if (!product) return []

  // Every collection holding it, so a piece in 2 rooms draws on both.
  const slugs = [
    ...new Set(collections.flatMap((collection) => (collection.slugs.includes(slug) ? collection.slugs : []))),
  ]
  if (!slugs.length) return []

  const { products } = await listProducts(demo, { slugs })
  return rankCompanions(product, products, tree)
})
const getProductReviews = cache(async (demo: DemoSlug, slug: string): Promise<ProductReviewList> => {
  const [product, list] = await Promise.all([getProduct(demo, slug), adapter.getProductReviews?.(demo, slug)])
  if (!list) return NO_REVIEWS

  // A backend that writes its own summary keeps it; otherwise one is derived
  // here, so every adapter gets the feature.
  if (list.summary || !product) return list
  return { ...list, summary: summarizeReviews(product.title, list.reviews) }
})
const getFeaturedReviews = cache((demo: DemoSlug) => optional(adapter.getFeaturedReviews?.(demo), NO_FEATURED_REVIEWS))
const getVisualSearchSamples = cache(async (demo: DemoSlug, department?: string) => {
  const samples = await optional(adapter.getVisualSearchSamples?.(demo, department), [])
  return Promise.all(
    samples.map(async (sample) => {
      const matches = await Promise.all(sample.matches.map((match) => withLookalikes(demo, match)))
      return { ...sample, matches: matches.filter(({ products }) => products.length > 0) }
    }),
  )
})

/** Products a visual match shows at most: a row of 6 on a wide screen. */
const VISUAL_MATCH_LENGTH = 6

/**
 * A match's row: the tagged piece, then what stands in for it on its product
 * page. A sold-out piece keeps its point and shows only what stands in for it.
 */
async function withLookalikes(demo: DemoSlug, match: VisualMatch): Promise<VisualMatch> {
  const [piece] = match.products
  if (!piece) return match

  const [product, related] = await Promise.all([getProduct(demo, piece.slug), getRelatedProducts(demo, piece.slug)])
  const lead = product?.availability === 'out-of-stock' ? [] : [piece]
  const lookalikes = related.filter(({ availability }) => availability !== 'out-of-stock').map(heroProduct)
  return { ...match, products: [...lead, ...lookalikes].slice(0, VISUAL_MATCH_LENGTH) }
}

/** A product as smart comparison's picker reads it. A missing brand stays missing, not `undefined` in the page. */
function comparableProduct({ slug, title, brand, specSheet }: Product): ComparableProduct {
  return { slug, title, specSheet, ...(brand && { brand }) }
}

/** A product as a glass card shows it: the piece on its own where it has a packshot. */
function heroProduct({ slug, title, media, price, compareAtPrice }: Product): HeroProduct {
  return { slug, title, image: media.packshot ?? media.image, price, compareAtPrice }
}

/** A commerce client bound to one demo storefront. */
export interface Commerce {
  /** Primary navigation and mega-menu content. Stable, so it renders into the shell. */
  getMenu: () => ReturnType<typeof getMenu>
  /** Full category taxonomy as a tree. Stable, so it renders into the shell. */
  getCategoryTree: () => ReturnType<typeof getCategoryTree>
  /**
   * The departments the catalog is divided into, empty for a store with none.
   * Which one a shopper is in is `@/lib/departments`, that being their choice
   * rather than the store's data. Stable, so it renders into the shell.
   */
  getDepartments: () => ReturnType<typeof getDepartments>
  /** A single category by slug, or `null`. */
  getCategory: (slug: string) => ReturnType<typeof getCategory>
  /** The slides the home page opens with, in presentation order. Stable, so it renders into the shell. */
  getHeroSlides: () => ReturnType<typeof getHeroSlides>
  /** The campaigns a home opens with, or a department's home. Stable, so it renders into the shell. */
  getHeroCampaigns: (department?: string) => ReturnType<typeof getHeroCampaigns>
  /** The rooms the home's hero shows, their pieces tagged. Stable, so it renders into the shell. */
  getShoppableScenes: () => ReturnType<typeof getShoppableScenes>
  /**
   * The photos visual search offers to try, each match's row filled after its
   * tagged piece with the related products. Pass a department for its own.
   */
  getVisualSearchSamples: (department?: string) => ReturnType<typeof getVisualSearchSamples>
  /** Featured-product banners for a category, inherited from its ancestors. Stable, so it renders into the shell. */
  getCategoryBanners: (slug: string) => ReturnType<typeof getCategoryBanners>
  /** Editorial campaigns across the top of a category, never inherited. Stable, so it renders into the shell. */
  getCategoryCampaigns: (slug: string) => ReturnType<typeof getCategoryCampaigns>
  /** Editorial campaigns in cells of a category's grid, or the whole catalog's without a slug. Never inherited. Stable, so it renders into the shell. */
  getCategoryGridCampaigns: (slug?: string) => ReturnType<typeof getCategoryGridCampaigns>
  /** The banner grid below a category's products, inherited from its ancestors. Stable, so it renders into the shell. */
  getCategoryTiles: (slug: string) => ReturnType<typeof getCategoryTiles>
  /** The same banner grid on a page that is not a category listing. Stable, so it renders into the shell. */
  getPlacementTiles: (placement: BannerPlacement) => ReturnType<typeof getPlacementTiles>
  /** Campaigns at promo size on a page that is not a category listing. Stable, so it renders into the shell. */
  getPlacementPromos: (placement: BannerPlacement) => ReturnType<typeof getPlacementPromos>
  /** The 4 campaigns a page lays out as a mosaic, in frame order. Stable, so it renders into the shell. */
  getPlacementMosaic: (placement: BannerPlacement) => ReturnType<typeof getPlacementMosaic>
  /** Editorial campaigns on a page that is not a category listing, or on a department's own. Stable, so it renders into the shell. */
  getPlacementCampaigns: (placement: BannerPlacement, department?: string) => ReturnType<typeof getPlacementCampaigns>
  /** The store's curated collections, looks resolved, or a department's. Stable, so it renders into the shell. */
  getCollections: (department?: string) => ReturnType<typeof getCollections>
  /** A single collection by slug, or `null`. Stable, so it renders into the shell. */
  getCollection: (slug: string) => ReturnType<typeof getCollection>
  /** The campaign inside a category's product grid, or `null`. Stable, so it renders into the shell. */
  getCategoryPromo: (slug: string) => ReturnType<typeof getCategoryPromo>
  /** Merchandised tag chips for a category, inherited from its ancestors. Stable, so it renders into the shell. */
  getCategoryTags: (slug: string) => ReturnType<typeof getCategoryTags>
  /** The curated shelf below a category's products, or `null`. Stable, so it renders into the shell. */
  getCategoryShelf: (slug: string) => ReturnType<typeof getCategoryShelf>
  /** The store's "buy together" offers, already priced. Stable, so it renders into the shell. */
  getBundles: () => ReturnType<typeof getBundles>
  /** A filtered, sorted catalog listing. Stream behind `<Suspense>` for the loading state. */
  listProducts: (query?: ProductQuery) => ReturnType<typeof listProducts>
  /** A single product by slug with its storefront's programs applied, or `null`. Stream behind `<Suspense>` for the loading state. */
  getProduct: (slug: string) => ReturnType<typeof getProduct>
  /**
   * Suggested terms and matching products for a half-typed query, for the
   * header's search panel. Called from a Server Action on every debounced
   * keystroke, so it is the 1 read that must stay cheap.
   */
  getSearchSuggestions: (query: SearchSuggestionQuery) => ReturnType<typeof getSearchSuggestions>
  /**
   * Devices this product's page can be compared against: its shelf-mates that
   * answer enough of the same specs, newest listing order, never itself, each
   * trimmed to a {@link ComparableProduct}. Empty where the page offers no
   * comparison. Stream it behind `<Suspense>`.
   */
  getComparableProducts: (slug: string) => ReturnType<typeof getComparableProducts>
  /**
   * Alternatives to show below a product: its `relatedSlugs` where they are
   * authored, otherwise the closest thing the catalog holds, closest first and
   * never itself. Empty for a product no longer in the catalog. Stream it behind
   * `<Suspense>`.
   */
  getRelatedProducts: (slug: string) => ReturnType<typeof getRelatedProducts>
  /**
   * Pieces that go with a product: the rest of the collections it belongs to,
   * outside its own top-level category, 1 category at a time. Empty for a
   * product in no collection. Stream it behind `<Suspense>`.
   */
  getCompanionProducts: (slug: string) => ReturnType<typeof getCompanionProducts>
  /** A product's reviews, aggregate, histogram, and the assistant's read on them. Stream it behind `<Suspense>`. */
  getProductReviews: (slug: string) => ReturnType<typeof getProductReviews>
  /** The reviews the store picked to quote, and its rating across every review. Stream it behind `<Suspense>`. */
  getFeaturedReviews: () => ReturnType<typeof getFeaturedReviews>
  /** Starter prompts for the shopping assistant. Store configuration, so it renders into the shell. */
  getAssistantPrompts: () => string[]
}

/** Returns a {@link Commerce} client whose reads are scoped to `demo`. */
export function getCommerce(demo: DemoSlug): Commerce {
  return {
    getMenu: () => getMenu(demo),
    getCategoryTree: () => getCategoryTree(demo),
    getDepartments: () => getDepartments(demo),
    getCategory: (slug) => getCategory(demo, slug),
    getHeroSlides: () => getHeroSlides(demo),
    getHeroCampaigns: (department) => getHeroCampaigns(demo, department),
    getShoppableScenes: () => getShoppableScenes(demo),
    getVisualSearchSamples: (department) => getVisualSearchSamples(demo, department),
    getCategoryBanners: (slug) => getCategoryBanners(demo, slug),
    getCategoryCampaigns: (slug) => getCategoryCampaigns(demo, slug),
    getCategoryGridCampaigns: (slug) => getCategoryGridCampaigns(demo, slug),
    getCategoryTiles: (slug) => getCategoryTiles(demo, slug),
    getPlacementTiles: (placement) => getPlacementTiles(demo, placement),
    getPlacementPromos: (placement) => getPlacementPromos(demo, placement),
    getPlacementMosaic: (placement) => getPlacementMosaic(demo, placement),
    getPlacementCampaigns: (placement, department) => getPlacementCampaigns(demo, placement, department),
    getCollections: (department) => getCollections(demo, department),
    getCollection: (slug) => getCollection(demo, slug),
    getCategoryPromo: (slug) => getCategoryPromo(demo, slug),
    getCategoryTags: (slug) => getCategoryTags(demo, slug),
    getCategoryShelf: (slug) => getCategoryShelf(demo, slug),
    getBundles: () => getBundles(demo),
    listProducts: (query) => listProducts(demo, query),
    getProduct: (slug) => getProduct(demo, slug),
    getSearchSuggestions: (query) => getSearchSuggestions(demo, query),
    getComparableProducts: (slug) => getComparableProducts(demo, slug),
    getRelatedProducts: (slug) => getRelatedProducts(demo, slug),
    getCompanionProducts: (slug) => getCompanionProducts(demo, slug),
    getProductReviews: (slug) => getProductReviews(demo, slug),
    getFeaturedReviews: () => getFeaturedReviews(demo),
    getAssistantPrompts: () => getAssistantPrompts(demo),
  }
}

/**
 * The active adapter, for the modules that hold a visitor's tokens and nothing
 * else: `@/lib/cart`, `@/lib/wishlist`, `@/lib/checkout`, and `@/lib/orders`.
 * Their calls carry a token, so they can't go through the memoized client above.
 * Screens never import this.
 */
export { adapter as commerceAdapter, isDemoCommerce } from './config'
