import type { DemoSlug } from '@/lib/demos'
import type { CommerceAdapter } from '../../adapter'
import type {
  Category,
  CategoryTag,
  Collection,
  ColorFilterValue,
  FeaturedReview,
  FeaturedReviewList,
  Filter,
  FilterValue,
  HeroProduct,
  Product,
  ProductList,
  ProductQuery,
  ProductReview,
  ProductReviewList,
  ReviewedProduct,
  SearchSuggestions,
} from '../../types'
import { defaultCartLine, productSizes } from '../../product-options'
import { averageRating, ratingHistogram, summarizeFit } from '../../programs/reviews'
import { readBundles } from './bundles'
import { addCartBundle, addCartLine, readCart, removeCartLine, updateCart, updateCartLine } from './cart'
import { datasets } from './data'
import type { CollectionSource, DemoDataset, FilterSource, SceneTagSource } from './data'
import { listOrders, lookupOrder, placeOrder, readOrder } from './order'
import { searchProducts, suggestTerms } from './search'
import {
  addWishlistItem,
  createWishlist,
  deleteWishlist,
  moveWishlistItems,
  readWishlists,
  removeWishlistItems,
  updateWishlist,
} from './wishlist'

/*
 * In-memory adapter backed by the per-demo fixtures in `./data`. It ships with
 * the template so every storefront runs with zero backend configuration, and it
 * doubles as the reference implementation for writing your own. All logic is
 * generic over a `DemoDataset`.
 *
 * Catalog reads are given an artificial delay so the Suspense loading states are
 * visible in the demo. Real adapters get that delay from the network for free.
 * Tune it with `DEMO_COMMERCE_LATENCY_MS` (milliseconds; `0` disables it).
 */

const CATALOG_LATENCY_MS = Number(process.env.DEMO_COMMERCE_LATENCY_MS ?? 600)

/** Default catalog page size when a query paginates without specifying one. */
const DEFAULT_PAGE_SIZE = 12

/** Resolve after the configured catalog latency, so skeletons get a chance to show. */
function catalogDelay(): Promise<void> {
  if (CATALOG_LATENCY_MS <= 0) return Promise.resolve()
  return new Promise((resolve) => setTimeout(resolve, CATALOG_LATENCY_MS))
}

/** Look up a demo's dataset, or throw a clear error if it hasn't been authored yet. */
function datasetFor(demo: DemoSlug): DemoDataset {
  const dataset = datasets[demo]
  if (!dataset) {
    throw new Error(`No commerce dataset for demo "${demo}". Add one under adapters/demo/data/${demo}/.`)
  }
  return dataset
}

/**
 * Fill in a category's card image from the product the dataset merchandises as
 * its cover (see `DemoDataset.categoryCovers`). Categories that already carry
 * their own image, or that have no cover assigned, pass through untouched.
 */
function withCoverImage(category: Category, dataset: DemoDataset): Category {
  if (category.image) return category

  const coverSlug = dataset.categoryCovers?.[category.id]
  if (!coverSlug) return category

  const cover = dataset.products.find((product) => product.slug === coverSlug)
  if (!cover) return category

  // The card labels itself with the category name, so the image is captioned as
  // the category rather than as the product standing in for it.
  return { ...category, image: { ...cover.media.image, alt: category.name } }
}

/** Resolve a collection's look against the catalog. A slug naming nothing is dropped. */
function withLook({ look = [], ...collection }: CollectionSource, dataset: DemoDataset): Collection {
  const pieces = look.flatMap((slug) => {
    const product = dataset.products.find((entry) => entry.slug === slug)
    return product ? [{ slug, title: product.title, image: product.media.image }] : []
  })
  return { ...collection, look: pieces }
}

/**
 * A tagged piece as its glass card shows it, in the color the photograph does,
 * and whether it is sold out. `null` where the catalog no longer carries it.
 */
function taggedPiece(
  { slug, color }: SceneTagSource,
  dataset: DemoDataset,
): { product: HeroProduct; soldOut: boolean } | null {
  const product = dataset.products.find((entry) => entry.slug === slug)
  if (!product) return null

  const media = product.colors?.find((entry) => entry.name === color)?.media ?? product.media
  return {
    product: {
      slug,
      title: product.title,
      image: media.packshot ?? media.image,
      price: product.price,
      compareAtPrice: product.compareAtPrice,
    },
    soldOut: product.availability === 'out-of-stock',
  }
}

/**
 * Fill in a product's aggregate rating from the reviews the dataset holds, so the
 * star cluster and the reviews heading always count the same set. A product
 * nobody has reviewed keeps no rating.
 *
 * A real backend usually counts ratings separately from written reviews and
 * returns its own figure; then this drops out with the fixtures.
 */
function withRating(product: Product, dataset: DemoDataset): Product {
  const reviews = dataset.reviews?.[product.slug]
  if (!reviews?.length) return product

  return { ...product, rating: { value: averageRating(reviews), count: reviews.length } }
}

/** The piece a review is about, in the color it names where the catalog carries that color. */
function reviewedProduct(product: Product, review: ProductReview): ReviewedProduct {
  const media = product.colors?.find((color) => color.name === review.color)?.media ?? product.media
  return {
    slug: product.slug,
    title: product.title,
    image: media.image,
    ...(media.packshot && { packshot: media.packshot }),
  }
}

/**
 * The whole catalog with {@link withRating} applied, which is what the wishlist
 * resolves its saved slugs against: a saved card carries the same stars the
 * listing does.
 */
function ratedProducts(dataset: DemoDataset): Product[] {
  return dataset.products.map((product) => withRating(product, dataset))
}

/** Assemble a demo's flat category list into a tree of top-level nodes. */
function buildCategoryTree(dataset: DemoDataset): Category[] {
  const byParent = new Map<string | null, Category[]>()
  for (const category of dataset.categories) {
    const siblings = byParent.get(category.parentId) ?? []
    siblings.push(category)
    byParent.set(category.parentId, siblings)
  }

  const attachChildren = (category: Category): Category => {
    const node = withCoverImage(category, dataset)
    const children = byParent.get(node.id)
    return children ? { ...node, children: children.map(attachChildren) } : node
  }

  return (byParent.get(null) ?? []).map(attachChildren)
}

/** Collect a category's own id plus every descendant id, for "includes subcategories" filtering. */
function categoryIdWithDescendants(categories: Category[], slug: string): string[] {
  const root = categories.find((category) => category.slug === slug)
  if (!root) return []

  const ids = [root.id]
  const queue = [root.id]
  while (queue.length > 0) {
    const parentId = queue.shift()
    for (const category of categories) {
      if (category.parentId === parentId) {
        ids.push(category.id)
        queue.push(category.id)
      }
    }
  }
  return ids
}

/**
 * Walk a category and its ancestors until one of them has merchandising of this
 * kind, and return it. The closest wins, so a subcategory's own campaign beats
 * the branch it hangs off, and an entry authored empty stops the walk rather
 * than falling through to an ancestor's.
 *
 * Every `getCategory*` read below resolves through this except the in-grid
 * promo, which is placed by name (see `CategoryPromo`), so they all
 * inherit alike and each kind cascades on its own.
 */
function inherited<T>(dataset: DemoDataset, slug: string, byCategory?: Record<string, T>): T | undefined {
  if (!byCategory) return undefined

  let category = dataset.categories.find((entry) => entry.slug === slug)
  while (category) {
    const merchandising = byCategory[category.id]
    if (merchandising !== undefined) return merchandising

    const { parentId } = category
    category = parentId ? dataset.categories.find((entry) => entry.id === parentId) : undefined
  }
  return undefined
}

const sorters: Record<NonNullable<ProductQuery['sort']>, (a: Product, b: Product) => number> = {
  // "Featured" is whatever order the catalog itself lists. Sorting is stable,
  // so comparing nothing keeps the merchandiser's sequence intact.
  featured: () => 0,
  'price-asc': (a, b) => a.price.amount - b.price.amount,
  'price-desc': (a, b) => b.price.amount - a.price.amount,
  // Fixtures aren't dated, so "newest" approximates recency with the `new` badge.
  newest: (a, b) => Number(b.badges.includes('new')) - Number(a.badges.includes('new')),
  rating: (a, b) => (b.rating?.value ?? 0) - (a.rating?.value ?? 0),
  // Ranked on units sold, falling back to how many people have reviewed a
  // product for the long tail the demo data doesn't rank. Deliberately not on
  // rating *value*: a five-star niche item has not outsold a
  // four-and-a-half-star one everybody owns.
  'best-selling': (a, b) => (b.unitsSold ?? 0) - (a.unitsSold ?? 0) || (b.rating?.count ?? 0) - (a.rating?.count ?? 0),
  // Deepest markdown first, the convention for an offers shelf: the shopper is
  // there for the size of the saving, not the size of the price.
  discount: (a, b) => discountRatio(b) - discountRatio(a),
}

/*
 * Filtering. A real backend counts for itself, but the rule it counts by is the
 * same one to copy here: a filter's counts are taken with that filter's own
 * selections lifted and every other refinement still applied. So after ticking
 * "Apple", the brand list still says how many Samsung products are one tick
 * away, while the memory list has narrowed to Apple. Counting every filter
 * against the final result set instead fills the sidebar with zeroes.
 */

/** URL-safe token for a filter value, e.g. `'256 GB'` → `'256-gb'`. */
function filterToken(label: string): string {
  return label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

/** What a `category` filter offers on a listing of `slug`: its children, or the departments. */
function subcategories(categories: Category[], slug?: string): Category[] {
  const parentId = categories.find((category) => category.slug === slug)?.id ?? null
  return categories.filter((category) => category.parentId === parentId)
}

/** A product's labels under one filter, given the tokens the query picked there. */
type FilterReader = (product: Product, source: FilterSource, selected?: string[]) => string[]

/** The {@link FilterReader} for a listing of `categorySlug`. */
function filterReader(dataset: DemoDataset, categorySlug?: string): FilterReader {
  const branches = subcategories(dataset.categories, categorySlug).map((category) => ({
    name: category.name,
    ids: new Set(categoryIdWithDescendants(dataset.categories, category.slug)),
  }))
  const groupOf = new Map(
    dataset.filters?.map((source) => [
      source.id,
      new Map(source.groups?.flatMap((group) => group.members.map((member) => [member, group.label]))),
    ]),
  )

  const read = (product: Product, source: FilterSource): string[] => {
    switch (source.from) {
      case 'brand':
        return product.brand ? [product.brand] : []
      case 'category':
        return branches
          .filter((branch) => product.categoryIds.some((id) => branch.ids.has(id)))
          .map((branch) => branch.name)
      case 'color':
        return product.colors?.map((color) => color.name) ?? []
      case 'price':
        return []
      case 'size':
        return productSizes(product).flatMap((size) => (size.available === false ? [] : [size.label]))
      default:
        return product.attributes?.[source.id] ?? []
    }
  }

  return (product, source, selected = []) => {
    const groups = groupOf.get(source.id)
    const labels = read(product, source)
    if (!groups?.size) return labels

    // A value picked by name stays itself: a link to 'Sage' finds sage, not every green.
    const offered = labels.map((label) =>
      selected.includes(filterToken(label)) ? label : (groups.get(label) ?? label),
    )
    return [...new Set(offered)]
  }
}

/** Whether an amount falls inside the bounds a query asked for. Missing bounds are open ends. */
function withinPrice(amount: number, query: ProductQuery): boolean {
  if (query.minPrice != null && amount < query.minPrice) return false
  if (query.maxPrice != null && amount > query.maxPrice) return false
  return true
}

/**
 * Whether a product survives every filter refinement, optionally with one filter
 * lifted. Values inside a filter are OR-ed, filters are AND-ed. Passing `except`
 * is what produces a filter's own counts.
 */
function matchesFilters(
  product: Product,
  sources: FilterSource[],
  query: ProductQuery,
  read: FilterReader,
  except?: string,
): boolean {
  for (const source of sources) {
    if (source.id === except) continue

    if (source.from === 'price') {
      if (!withinPrice(product.price.amount, query)) return false
      continue
    }

    const selected = query.filters?.[source.id]
    if (!selected?.length) continue

    const tokens = read(product, source, selected).map(filterToken)
    if (!selected.some((token) => tokens.includes(token))) return false
  }
  return true
}

/** Declared order first, then numbers ascending, then the rest by count. */
function sortFilterValues<T extends FilterValue>(values: T[], order: string[] | undefined): T[] {
  const rank = new Map(order?.map((label, index) => [label, index]))
  return values.sort((a, b) => {
    const rankA = rank.get(a.label) ?? Infinity
    const rankB = rank.get(b.label) ?? Infinity
    if (rankA !== rankB) return rankA - rankB

    const numberA = Number(a.label)
    const numberB = Number(b.label)
    const numericA = Number.isFinite(numberA)
    const numericB = Number.isFinite(numberB)
    if (numericA !== numericB) return numericA ? -1 : 1
    if (numericA) return numberA - numberB

    return b.count - a.count || a.label.localeCompare(b.label)
  })
}

/**
 * Build every filter the dataset declares against `pool`, the products matched by
 * everything except the filter refinements themselves.
 *
 * A filter with nothing to choose between is left out rather than rendered as a
 * single dead row. One already in use stays, so it can be undone.
 */
function buildFilters(dataset: DemoDataset, pool: Product[], query: ProductQuery, read: FilterReader): Filter[] {
  const sources = dataset.filters ?? []
  const filters: Filter[] = []

  for (const source of sources) {
    const candidates = pool.filter((product) => matchesFilters(product, sources, query, read, source.id))

    if (source.from === 'price') {
      const amounts = candidates.map((product) => product.price.amount)
      const min = Math.floor(Math.min(...amounts))
      const max = Math.ceil(Math.max(...amounts))
      // A single price, or none at all, is a slider with nowhere to go.
      if (!Number.isFinite(min) || min === max) continue

      filters.push({
        id: source.id,
        label: source.label,
        kind: 'range',
        min,
        max,
        currencyCode: candidates[0].price.currencyCode,
      })
      continue
    }

    const counts = new Map<string, ColorFilterValue>()
    for (const product of candidates) {
      for (const label of read(product, source, query.filters?.[source.id])) {
        const existing = counts.get(label)
        if (existing) {
          existing.count += 1
          continue
        }
        const hex =
          source.groups?.find((group) => group.label === label)?.hex ??
          product.colors?.find((color) => color.name === label)?.hex ??
          ''
        counts.set(label, { value: filterToken(label), label, count: 1, hex })
      }
    }

    // Categories keep the taxonomy's order, like the menus.
    const order =
      source.from === 'category'
        ? subcategories(dataset.categories, query.categorySlug).map((category) => category.name)
        : (source.order ?? source.groups?.map((group) => group.label))
    const values = sortFilterValues([...counts.values()], order)
    if (values.length < 2 && !query.filters?.[source.id]?.length) continue

    filters.push(
      source.from === 'color'
        ? { id: source.id, label: source.label, kind: 'color', values }
        : // Drop the swatch, which only a color filter has a value for.
          {
            id: source.id,
            label: source.label,
            kind: 'list',
            values: values.map(({ value, label, count }) => ({ value, label, count })),
          },
    )
  }

  return filters
}

/**
 * Below this many surviving tags, a category shows no row at all. One or 2 chips
 * under a heading reads as a section that failed to load rather than a short
 * list, and a narrow subcategory has little to offer a shopper anyway.
 */
const MIN_CATEGORY_TAGS = 3

/**
 * Whether a product survives a tag's refinements, applying them the same way a
 * listing would. Used to drop the tags that a category inherited but has nothing
 * to show for.
 */
function matchesTag(product: Product, dataset: DemoDataset, tag: CategoryTag, read: FilterReader): boolean {
  if (tag.search) {
    const term = tag.search.toLowerCase()
    const found = [product.title, product.brand, product.description, ...product.tags].some((field) =>
      field?.toLowerCase().includes(term),
    )
    if (!found) return false
  }

  if (tag.price && !withinPrice(product.price.amount, { minPrice: tag.price[0], maxPrice: tag.price[1] })) {
    return false
  }

  return matchesFilters(product, dataset.filters ?? [], { filters: tag.filters }, read)
}

/** How far a product is marked down from its list price, `0` when it isn't. */
function discountRatio(product: Product): number {
  const listPrice = product.compareAtPrice?.amount
  if (!listPrice) return 0
  return 1 - product.price.amount / listPrice
}

/** The in-memory adapter backing every demo storefront. */
export const demoAdapter: CommerceAdapter = {
  async getMenu(demo) {
    return datasetFor(demo).menu ?? { items: [] }
  },

  async getCategoryTree(demo) {
    return buildCategoryTree(datasetFor(demo))
  },

  async getDepartments(demo) {
    const dataset = datasetFor(demo)
    const tree = buildCategoryTree(dataset)

    // Declared order, not taxonomy order; a slug naming nothing is dropped.
    return (dataset.departments ?? []).flatMap((slug) => {
      const department = tree.find((category) => category.slug === slug)
      return department ? [department] : []
    })
  },

  async getCategory(demo, slug) {
    const dataset = datasetFor(demo)
    const category = dataset.categories.find((entry) => entry.slug === slug)
    return category ? withCoverImage(category, dataset) : null
  },

  async getHeroSlides(demo) {
    const dataset = datasetFor(demo)

    return (dataset.heroSlides ?? []).flatMap(({ slug, thumbnail, ...slide }) => {
      const product = dataset.products.find((entry) => entry.slug === slug)
      if (!product) return []

      return [
        {
          ...slide,
          product: {
            slug,
            title: product.title,
            image: thumbnail ?? product.media.image,
            price: product.price,
            compareAtPrice: product.compareAtPrice,
          },
          quickAdd: defaultCartLine(product),
        },
      ]
    })
  },

  async getHeroCampaigns(demo, department) {
    const dataset = datasetFor(demo)
    if (!department) return dataset.heroCampaigns ?? []

    const category = dataset.categories.find((entry) => entry.slug === department)
    return (category && dataset.departmentHeroCampaigns?.[category.id]) ?? []
  },

  async getShoppableScenes(demo) {
    const dataset = datasetFor(demo)

    return (dataset.scenes ?? []).map(({ tags, ...scene }) => ({
      ...scene,
      tags: tags.flatMap((tag) => {
        const piece = taggedPiece(tag, dataset)
        return piece && !piece.soldOut ? [{ x: tag.x, y: tag.y, product: piece.product }] : []
      }),
    }))
  },

  async getVisualSearchSamples(demo, department) {
    const dataset = datasetFor(demo)

    return (dataset.visualSearchSamples ?? [])
      .filter((sample) => !department || !sample.department || sample.department === department)
      .map(({ id, title, image, tags }) => ({
        id,
        title,
        image,
        // A sold-out piece keeps its point: the facade answers it with lookalikes alone.
        matches: tags.flatMap((tag) => {
          const piece = taggedPiece(tag, dataset)
          return piece ? [{ label: tag.label, point: { x: tag.x, y: tag.y }, products: [piece.product] }] : []
        }),
      }))
  },

  async getCategoryBanners(demo, categorySlug) {
    const dataset = datasetFor(demo)
    return inherited(dataset, categorySlug, dataset.categoryBanners) ?? []
  },

  async getCategoryCampaigns(demo, categorySlug) {
    const dataset = datasetFor(demo)
    const category = dataset.categories.find((entry) => entry.slug === categorySlug)
    return (category && dataset.categoryCampaigns?.[category.id]) ?? []
  },

  async getCategoryGridCampaigns(demo, categorySlug) {
    const dataset = datasetFor(demo)
    if (categorySlug === undefined) return dataset.catalogGridCampaigns ?? []
    const category = dataset.categories.find((entry) => entry.slug === categorySlug)
    return (category && dataset.categoryGridCampaigns?.[category.id]) ?? []
  },

  async getCategoryTiles(demo, categorySlug) {
    const dataset = datasetFor(demo)
    return inherited(dataset, categorySlug, dataset.categoryTiles) ?? []
  },

  async getPlacementTiles(demo, placement) {
    return datasetFor(demo).placementTiles?.[placement] ?? []
  },

  async getPlacementMosaic(demo, placement) {
    return datasetFor(demo).placementMosaic?.[placement] ?? []
  },

  async getPlacementPromos(demo, placement) {
    return datasetFor(demo).placementPromos?.[placement] ?? []
  },

  async getPlacementCampaigns(demo, placement, department) {
    const dataset = datasetFor(demo)
    if (!department) return dataset.placementCampaigns?.[placement] ?? []

    const category = dataset.categories.find((entry) => entry.slug === department)
    return (category && dataset.departmentCampaigns?.[category.id]?.[placement]) ?? []
  },

  async getCollections(demo, department) {
    const dataset = datasetFor(demo)
    return (dataset.collections ?? [])
      .filter((collection) => !department || !collection.department || collection.department === department)
      .map((collection) => withLook(collection, dataset))
  },

  async getCollection(demo, slug) {
    const dataset = datasetFor(demo)
    const collection = dataset.collections?.find((entry) => entry.slug === slug)
    return collection ? withLook(collection, dataset) : null
  },

  async getCategoryPromo(demo, categorySlug) {
    const dataset = datasetFor(demo)
    // A plain lookup rather than the ancestor walk above: a promo shows where it
    // is authored and nowhere else.
    const category = dataset.categories.find((entry) => entry.slug === categorySlug)
    return (category && dataset.categoryPromos?.[category.id]) ?? null
  },

  async getCategoryTags(demo, categorySlug) {
    const dataset = datasetFor(demo)
    const tags = inherited(dataset, categorySlug, dataset.categoryTags) ?? []
    if (tags.length === 0) return []

    // Tags are authored for a branch, but they are shown on every category
    // under it, where most of them mean nothing: a row of 16 phone tags on an
    // E-Readers listing holding one Kindle is 14 chips that empty the grid.
    const ids = new Set(categoryIdWithDescendants(dataset.categories, categorySlug))
    const pool = dataset.products.filter((product) => product.categoryIds.some((id) => ids.has(id)))
    const read = filterReader(dataset, categorySlug)
    const live = tags.filter((tag) => pool.some((product) => matchesTag(product, dataset, tag, read)))

    return live.length >= MIN_CATEGORY_TAGS ? live : []
  },

  async getCategoryShelf(demo, categorySlug) {
    const dataset = datasetFor(demo)
    return inherited(dataset, categorySlug, dataset.categoryShelves) ?? null
  },

  async getBundles(demo) {
    const dataset = datasetFor(demo)
    return readBundles(dataset, ratedProducts(dataset))
  },

  async listProducts(demo, query: ProductQuery = {}) {
    await catalogDelay()

    const dataset = datasetFor(demo)
    // Attached first, so the `rating` sort and the cards agree with the page.
    let products = dataset.products.map((product) => withRating(product, dataset))

    // A curated selection carries its own order, so it both filters and sorts.
    if (query.slugs) {
      const positions = new Map(query.slugs.map((slug, index) => [slug, index]))
      products = products
        .filter((product) => positions.has(product.slug))
        .sort((a, b) => (positions.get(a.slug) ?? 0) - (positions.get(b.slug) ?? 0))
    }

    if (query.categorySlug) {
      const ids = new Set(categoryIdWithDescendants(dataset.categories, query.categorySlug))
      products = products.filter((product) => product.categoryIds.some((id) => ids.has(id)))
    }

    if (query.onSale) {
      products = products.filter((product) => discountRatio(product) > 0)
    }

    if (query.inStock) {
      products = products.filter((product) => product.availability === 'in-stock')
    }

    // Ranked rather than filtered, so the phone outranks the phone case when
    // the listing has no sort of its own (see `./search.ts`).
    if (query.search) {
      products = searchProducts(products, query.search, dataset.categories)
    }

    // Everything above narrows what the listing is; the filters below refine it.
    // Counts are taken against this set, before the refinements are applied.
    const read = filterReader(dataset, query.categorySlug)
    const filters = query.withFilters ? buildFilters(dataset, products, query, read) : []
    products = products.filter((product) => matchesFilters(product, dataset.filters ?? [], query, read))

    if (query.sort) {
      products = [...products].sort(sorters[query.sort])
    }

    const total = products.length

    // Pagination wins when requested; otherwise fall back to a simple top-N cap.
    if (query.page != null || query.pageSize != null || query.offset != null) {
      const pageSize = query.pageSize ?? DEFAULT_PAGE_SIZE
      const pageCount = Math.max(1, Math.ceil(total / pageSize))
      // An `offset` caller is placing products around cells that hold something
      // else, so its window is taken as given rather than clamped to a page
      // count that counts products only.
      const paged = Math.max(1, query.page ?? 1)
      const page = query.offset != null ? paged : Math.min(paged, pageCount)
      // Bounded by the last product rather than by `pageCount`, which counts
      // products only: a caller reserving grid cells legitimately asks for a
      // window past the last page that count implies.
      const start = query.offset != null ? Math.min(query.offset, Math.max(0, total - 1)) : (page - 1) * pageSize
      return {
        products: products.slice(start, start + pageSize),
        total,
        page,
        pageSize,
        pageCount,
        filters,
      } satisfies ProductList
    }

    if (query.limit != null) {
      products = products.slice(0, query.limit)
    }

    return { products, total, page: 1, pageSize: products.length, pageCount: 1, filters } satisfies ProductList
  },

  async getProduct(demo, slug) {
    await catalogDelay()

    const dataset = datasetFor(demo)
    const product = dataset.products.find((candidate) => candidate.slug === slug)
    return product ? withRating(product, dataset) : null
  },

  // The only catalog read with no artificial latency: a panel that answers a
  // keystroke 600ms late reads as broken rather than as loading.
  async getSearchSuggestions(demo, { term, categorySlug, productLimit = 5, termLimit = 7 }) {
    const dataset = datasetFor(demo)
    let products = ratedProducts(dataset)
    let categories = dataset.categories

    if (categorySlug) {
      const ids = new Set(categoryIdWithDescendants(dataset.categories, categorySlug))
      products = products.filter((product) => product.categoryIds.some((id) => ids.has(id)))
      categories = categories.filter((category) => ids.has(category.id))
    }

    const matches = searchProducts(products, term, categories)
    // Inside a category, its own name narrows nothing.
    const termSources = categories.filter((category) => category.slug !== categorySlug)

    return {
      terms: suggestTerms(products, termSources, term, termLimit),
      products: matches.slice(0, productLimit),
      total: matches.length,
    } satisfies SearchSuggestions
  },

  async getProductReviews(demo, slug) {
    await catalogDelay()

    const reviews = datasetFor(demo).reviews?.[slug] ?? []
    return {
      reviews,
      rating: { value: reviews.length ? averageRating(reviews) : 0, count: reviews.length },
      histogram: ratingHistogram(reviews),
      fit: summarizeFit(reviews),
      // No summary: the fixtures hold reviews, not an assistant's read on them.
      // The facade derives one, which is where a store wires its own in.
    } satisfies ProductReviewList
  },

  async getFeaturedReviews(demo) {
    await catalogDelay()

    const dataset = datasetFor(demo)
    const storeReviews = dataset.storeReviews ?? []
    const productReviews = Object.entries(dataset.reviews ?? {}).flatMap(([slug, reviews]) =>
      reviews.map((review) => ({ slug, review })),
    )

    const reviews = (dataset.featuredReviews ?? []).flatMap((id): FeaturedReview[] => {
      const store = storeReviews.find((review) => review.id === id)
      if (store) return [{ kind: 'store', review: store }]

      const match = productReviews.find(({ review }) => review.id === id)
      const product = match && dataset.products.find((entry) => entry.slug === match.slug)
      return product ? [{ kind: 'product', review: match.review, product: reviewedProduct(product, match.review) }] : []
    })

    const all = [...productReviews.map(({ review }) => review), ...storeReviews]
    return {
      reviews,
      rating: { value: all.length ? averageRating(all) : 0, count: all.length },
    } satisfies FeaturedReviewList
  },

  async getWishlists(demo, token) {
    return readWishlists(ratedProducts(datasetFor(demo)), token)
  },

  async createWishlist(demo, token, input) {
    return createWishlist(ratedProducts(datasetFor(demo)), token, input)
  },

  async updateWishlist(demo, token, id, patch) {
    return updateWishlist(ratedProducts(datasetFor(demo)), token, id, patch)
  },

  async deleteWishlist(demo, token, id) {
    return deleteWishlist(ratedProducts(datasetFor(demo)), token, id)
  },

  async addWishlistItem(demo, token, input) {
    return addWishlistItem(ratedProducts(datasetFor(demo)), token, input)
  },

  async removeWishlistItems(demo, token, items) {
    return removeWishlistItems(ratedProducts(datasetFor(demo)), token, items)
  },

  async moveWishlistItems(demo, token, items, wishlistId) {
    return moveWishlistItems(ratedProducts(datasetFor(demo)), token, items, wishlistId)
  },

  async getCart(demo, token) {
    return readCart(demo, datasetFor(demo), token)
  },

  async addCartLine(demo, token, line) {
    return addCartLine(demo, datasetFor(demo), token, line)
  },

  async updateCartLine(demo, token, lineId, patch) {
    return updateCartLine(demo, datasetFor(demo), token, lineId, patch)
  },

  async addCartBundle(demo, token, bundleId, choices) {
    return addCartBundle(demo, datasetFor(demo), token, bundleId, choices)
  },

  async removeCartLine(demo, token, lineId) {
    return removeCartLine(demo, datasetFor(demo), token, lineId)
  },

  async updateCart(demo, token, patch) {
    return updateCart(demo, datasetFor(demo), token, patch)
  },

  async placeOrder(demo, token, input) {
    return placeOrder(demo, datasetFor(demo), token, input)
  },

  async getOrder(demo, token) {
    return readOrder(demo, datasetFor(demo), token)
  },

  async lookupOrder(demo, number, email) {
    return lookupOrder(demo, datasetFor(demo), number, email)
  },

  async listOrders(demo, _email, query) {
    return listOrders(demo, datasetFor(demo), query)
  },
}
