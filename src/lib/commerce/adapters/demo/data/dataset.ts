import type {
  BannerPlacement,
  CampaignBanner,
  Category,
  CategoryPromo,
  CategoryShelf,
  CategoryTag,
  Collection,
  GridCampaign,
  HeroCampaign,
  HeroSlide,
  NavMenu,
  Product,
  ProductBanner,
  ProductImage,
  ProductReview,
  ShoppableScene,
  StoreReview,
  VisualSearchSample,
} from '@/lib/commerce/types'

/**
 * A "buy together" offer as the demo authors it: which products, in which
 * finish, and what each of them gives up to be in the set.
 *
 * Rates rather than prices, so editing a product's price in the catalog
 * re-prices every bundle holding it instead of leaving a stale figure on the
 * button. A backend that stores the bundle as a product of its own returns
 * that product's price and never builds one of these.
 */
export interface BundleOffer {
  id: string
  /** Names the offer wherever a shopper meets it again, e.g. on its cart lines. */
  title: string
  /** 2 or more products. An offer holding 1 is a markdown, not a bundle. */
  items: BundleOfferItem[]
}

/** One product in a {@link BundleOffer}, and what the offer takes off it. */
export interface BundleOfferItem {
  /** By {@link Product.slug}. One that has left the catalog drops the whole offer. */
  slug: string
  /** The finish the offer leads with, by the name the product's color carries. */
  color?: string
  /**
   * Share taken off this product's own price, between 0 and 1. Omit for a
   * product the offer sells at its usual price, which is what the hero of an
   * accessory bundle does: the companion carries the discount.
   *
   * Per item rather than across the set on purpose. A share of the combined
   * price puts most of the money on the expensive product, so a 12% offer on a
   * $1,099 phone and a $49 case takes $132 off the phone: a phone markdown, not
   * a bundle. Priced here, a case can never come off by more than $49.
   */
  discount?: number
}

/**
 * A home-page hero slide as the demo authors it: everything a
 * {@link HeroSlide} carries except the product and what its button adds, which
 * the adapter resolves from the slug. A slug nothing matches drops the slide.
 */
export interface HeroSlideSource extends Omit<HeroSlide, 'product' | 'quickAdd'> {
  /** The product the slide sells, by {@link Product.slug}. */
  slug: string
  /**
   * Square artwork for the glass card's thumbnail. Omit to use the product's
   * own primary shot, which is what a slide wants unless the campaign was shot
   * on a ground that clashes with its accent.
   */
  thumbnail?: ProductImage
}

/**
 * A shoppable scene as the demo authors it: each tag names its product by slug,
 * and by color where the photograph shows one other than the first, and the
 * adapter resolves the rest from the catalog.
 */
export interface ShoppableSceneSource extends Omit<ShoppableScene, 'tags'> {
  tags: SceneTagSource[]
}

/** A tag as the demo authors it: where it sits, and which product in which color. */
export interface SceneTagSource {
  x: number
  y: number
  /** By {@link Product.slug}. One that has left the catalog drops the tag. */
  slug: string
  /** The color the photograph shows, by name. Omit for the first. */
  color?: string
}

/** A visual search sample as the demo authors it: tagged as a scene is, each piece named. */
export interface VisualSearchSampleSource extends Omit<VisualSearchSample, 'matches'> {
  tags: (SceneTagSource & { label: string })[]
  /** The department it is offered in, by {@link Category.slug}. Omit for every department. */
  department?: string
}

/**
 * A collection as the demo authors it: everything a {@link Collection} carries
 * except its look, which is named by slug and resolved against the catalog.
 */
export interface CollectionSource extends Omit<Collection, 'look'> {
  /** The look's pieces, by {@link Product.slug}. Every one should also be in `slugs`. */
  look?: string[]
}

/**
 * Where a filter's values come from: `attribute` reads `product.attributes[id]`,
 * `category` the level below the listed category, `size` the sizes in stock,
 * and the rest the {@link Product} field they name.
 */
export type FilterSourceKind = 'attribute' | 'brand' | 'category' | 'color' | 'price' | 'size'

/** One value a {@link FilterSource} offers in place of several that products carry. */
export interface FilterGroup {
  label: string
  /** The product values it stands for. */
  members: string[]
  /** Its swatch, for a color filter. */
  hex?: string
}

/**
 * A filter the demo adapter offers on catalog listings, in presentation order.
 * The adapter builds each one against the products a listing actually matched,
 * so a filter with nothing to offer there is left out rather than rendered empty.
 */
export interface FilterSource {
  /** Becomes the filter's `id`, and with it the URL parameter, so keep it URL-safe. */
  id: string
  /** Becomes the filter's `label`, the heading above the control. */
  label: string
  /**
   * Where the values come from. `attribute` reads the {@link Product.attributes}
   * key matching {@link id}.
   * @default 'attribute'
   */
  from?: FilterSourceKind
  /**
   * Value order, by label, for the filters a count can't order sensibly (a ladder
   * of capacities). Anything not listed follows, numbers first, then by count.
   */
  order?: string[]
  /**
   * Broader values to offer in place of the products' own, in order: 'Oatmeal'
   * and 'Sand' filter as 'Beige'. Unlisted values, and ones a link names, stay.
   */
  groups?: FilterGroup[]
}

/**
 * The self-contained content for one demo storefront. Each demo folder under
 * `./` exports one of these; the registry in `./index.ts` maps a {@link DemoSlug}
 * to its dataset. Adding a niche is a copy-a-folder operation: author the
 * categories and the products (everything else is optional), list the product
 * photos in the folder's `photos.json`, and register the slug. The files load
 * from `/demo/<demo>/`, as `next.config.ts` explains.
 */
export interface DemoDataset {
  /** Flat category list with `parentId` links; the adapter assembles the tree. */
  categories: Category[]
  products: Product[]
  /** Primary navigation and mega-menu content. Omit for a header that builds its own from the categories. */
  menu?: NavMenu
  /**
   * Departments a shopper picks between, by slug and in the order to offer
   * them; the first is where a first visit lands. Omit for a store that sells
   * to everybody at once.
   */
  departments?: string[]
  /**
   * Merchandising map from {@link Category.id} to the slug of the product whose
   * primary image represents that category on a card. The adapter resolves it
   * into {@link Category.image}. Omit for a demo whose categories carry their
   * own artwork.
   */
  categoryCovers?: Record<string, string>
  /**
   * The slides the home page opens with, in presentation order. Omit for a demo
   * that leads with something other than a hero.
   *
   * Authored as {@link HeroSlideSource} rather than as a finished
   * {@link HeroSlide}: only the product's slug is written here and the adapter
   * resolves its title, price, and thumbnail from the catalog, so the hero can
   * never quote a price the product page disagrees with.
   */
  heroSlides?: HeroSlideSource[]
  /** The campaigns the home opens with, in running order. Omit for a demo that leads with something else. */
  heroCampaigns?: HeroCampaign[]
  /** The same, on a department's home, by the department's {@link Category.id}. Neither falls back to the other. */
  departmentHeroCampaigns?: Record<string, HeroCampaign[]>
  /** The rooms the home's hero shows, in tab order. Omit for a demo that leads with something else. */
  scenes?: ShoppableSceneSource[]
  /** The photos visual search offers to try, in the order to present them. Omit for a demo without it. */
  visualSearchSamples?: VisualSearchSampleSource[]
  /**
   * Featured-product banners by {@link Category.id}, each list in the order to
   * present it, shown as the hero above a category's products. A category left
   * out inherits its nearest listed ancestor's entry, so one top-level entry
   * covers a whole branch, and an empty list opts a branch back out. Omit for a
   * demo that promotes nothing.
   */
  categoryBanners?: Record<string, ProductBanner[]>
  /** Editorial campaigns by {@link Category.id}, in display order. Not inherited. */
  categoryCampaigns?: Record<string, CampaignBanner[]>
  /** The same, placed in cells of a category's product grid, in position order. Not inherited. */
  categoryGridCampaigns?: Record<string, GridCampaign[]>
  /** The same, in the grid of the catalog's own listing, the one no category narrows. */
  catalogGridCampaigns?: GridCampaign[]
  /** The same, for the banner grid below a category's products. Inherited the same way. */
  categoryTiles?: Record<string, ProductBanner[]>
  /**
   * The same grid again, for the pages that are not a category listing, by
   * {@link BannerPlacement}. Not inherited, there being no taxonomy above a
   * placement: a page left out carries no tiles. Omit for a demo that promotes
   * nothing outside its listings.
   */
  placementTiles?: Partial<Record<BannerPlacement, ProductBanner[]>>
  /**
   * The campaigns a placement lays out as a mosaic, in the order the frames
   * read: feature, wide, then the 2 squares. Omit for a demo that runs none.
   */
  placementMosaic?: Partial<Record<BannerPlacement, ProductBanner[]>>
  /**
   * The campaign inside a category's product grid, by {@link Category.id}. Not
   * inherited: a listing shows the promo filed under its own id and nothing
   * else. One campaign covering several categories is a single {@link
   * CategoryPromo} listed under each of their ids.
   */
  categoryPromos?: Record<string, CategoryPromo>
  /**
   * The same campaign artwork on the pages that are not a category listing, by
   * {@link BannerPlacement}. Not inherited, and not positioned: the placement
   * decides how to show the list. Omit for a demo that promotes nothing there.
   */
  placementPromos?: Partial<Record<BannerPlacement, ProductBanner[]>>
  /** Editorial campaigns on those pages, by {@link BannerPlacement}. Not inherited either. */
  placementCampaigns?: Partial<Record<BannerPlacement, CampaignBanner[]>>
  /** The same, on a department's own pages, by the department's {@link Category.id}. */
  departmentCampaigns?: Record<string, Partial<Record<BannerPlacement, CampaignBanner[]>>>
  /** Curated collections, in the order to present them. Omit for a demo that merchandises none. */
  collections?: CollectionSource[]
  /** Merchandised tag chips by {@link Category.id}, in chip order. Inherited the same way. */
  categoryTags?: Record<string, CategoryTag[]>
  /** The curated shelf below a category's products, by {@link Category.id}. Inherited the same way. */
  categoryShelves?: Record<string, CategoryShelf>
  /**
   * "Buy together" offers, in the order to present them. Omit for a demo that
   * bundles nothing.
   */
  bundles?: BundleOffer[]
  /**
   * Catalog refinements, in the order the sidebar presents them. Omit for a demo
   * whose listings offer none.
   */
  filters?: FilterSource[]
  /**
   * Customer reviews by {@link Product.slug}, newest first. A product left out
   * has none and the adapter leaves its {@link Product.rating} unset.
   *
   * This is where a rating comes from: the adapter averages these rather than
   * reading a figure authored on the product.
   */
  reviews?: Record<string, ProductReview[]>
  /** Reviews of the store itself, newest first. They count toward the store's rating and no product's. */
  storeReviews?: StoreReview[]
  /**
   * The reviews the storefront quotes away from product pages, by review id, in
   * the order to show them. Ids may name {@link reviews} or {@link storeReviews},
   * and one nothing matches is dropped. Omit for a demo that quotes none.
   */
  featuredReviews?: string[]
}
