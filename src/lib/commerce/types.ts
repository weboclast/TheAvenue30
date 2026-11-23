/*
 * Commerce domain model: the contract every storefront screen reads against.
 *
 * These types are the seam between the UI and whatever backend supplies the
 * data. Components and pages import *only* from here (and from the `index.ts`
 * facade); they never touch an adapter directly. Connecting a backend means
 * writing an adapter that maps its payloads onto these shapes, with no screen
 * changes.
 */

/**
 * A monetary value. Amount is in the currency's major units (e.g. `1299.0` for
 * $1,299.00). Readability wins over cent-integers here, since the demo data is
 * authored by hand. Format for display with {@link formatMoney} from
 * `./format`, never by string-concatenating the code.
 */
export interface Money {
  amount: number
  currencyCode: CurrencyCode
}

/** ISO 4217 codes the storefront supports. Extend as demos add currencies. */
export type CurrencyCode = 'USD' | 'EUR' | 'GBP'

/** An image reference. Dimensions are required so `next/image` can reserve space and avoid layout shift. */
export interface ProductImage {
  /** Path under `/public` (demo adapter) or an absolute URL (remote adapters). */
  src: string
  alt: string
  width: number
  height: number
}

/**
 * Whether a product can currently be purchased. `preorder` is a real sale of
 * something not yet released, so it buys and checks out like any other line;
 * `out-of-stock` cannot be bought at all, and its page offers a back-in-stock
 * alert instead of a buy button. Pair either with {@link Product.availableAt}.
 */
export type ProductAvailability = 'in-stock' | 'out-of-stock' | 'preorder'

/**
 * A merchandising flag rendered as a pill on product cards.
 *
 * These are *domain* values, not styles: the card maps each to a Badge variant
 * and label in one place, so an adapter only has to translate its backend's own
 * tags onto this union. Adding a flag
 * means extending the union and its preset, with no screen changes.
 */
export type ProductBadge = 'sale' | 'new' | 'bestseller' | 'limited' | 'exclusive'

/** Aggregate customer rating for a product, or across a whole store. */
export interface ProductRating {
  /** Mean score, 0-5. */
  value: number
  /** Number of ratings that produced {@link value}. */
  count: number
}

/**
 * One product's photography, named by the role each shot plays rather than by
 * its position in a list.
 *
 * {@link image} is the product's featured image in most backends, and
 * {@link gallery} is the rest of its media list. Backends rarely model a hover
 * shot or a packshot, so {@link hoverImage} and {@link packshot} are storefront
 * decisions. An adapter that has no opinion can leave them out, or point the
 * hover shot at `gallery[0]`.
 */
export interface ProductMedia {
  /** The card and gallery lead shot. Always present. */
  image: ProductImage
  /**
   * Second shot, revealed when a pointer rests on the card. Omit to leave the
   * card static. That is right for accessories that ship a single catalog photo, or
   * where the next shot is packaging that reads badly as a hover.
   */
  hoverImage?: ProductImage
  /** Remaining product-page shots, in the order they should be presented. */
  gallery: ProductImage[]
  /**
   * The piece on its own, off the body: a flat lay, an invisible-mannequin
   * shot, or a still life. One of the shots above rather than an extra, so it
   * can be {@link image} itself, as a shoe's usually is. A card asked for it
   * falls back to {@link image} where it is missing.
   */
  packshot?: ProductImage
}

/**
 * A color variant. Product cards render a swatch per color; selecting one
 * swaps the card's photography, so each color carries its own media and the
 * idle/hover pair always matches the chosen swatch.
 */
export interface ProductColor {
  /** Display name, e.g. `'Cosmic Orange'`. */
  name: string
  /** Any CSS color string the swatch dot can be painted with, e.g. `'#D9622B'`. */
  hex: string
  media: ProductMedia
  /**
   * The material up close, in this color: a square of fabric or wood that a
   * picker shows in place of {@link hex}, and a page sets beside the materials.
   */
  swatch?: ProductImage
}

/** A unit a {@link ProductDimensions} can be measured in. */
export type LengthUnit = 'cm' | 'in'

/**
 * The box a piece takes up, which is what a shopper holds against the space it
 * has to fit: width side to side, depth front to back, height floor to top.
 * Format with {@link formatDimensions} from `./format`.
 */
export interface ProductDimensions {
  width: number
  depth: number
  height: number
  /** The unit all 3 are in. */
  unit: LengthUnit
  /** A round piece, whose width and depth are both its diameter: a lamp, a round table. */
  round?: boolean
}

/**
 * Line drawings of a piece seen from the front and from the side, ink on
 * transparency. Each is cropped to the piece itself, so a dimension line drawn
 * along an edge measures it: width under the front, depth under the side,
 * height beside either. The 2 share one scale.
 */
export interface ProductDrawings {
  /** Seen from the front: its width and height. */
  front: ProductImage
  /** Seen from the side: its depth and height. */
  side: ProductImage
}

/**
 * A configuration choice offered on the product page and rendered as a row of
 * pills: ear tip material, storage, band size.
 *
 * This is the *presentational* half of variant selection: it names the choice
 * and what each value adds to the price. Which concrete SKU a combination of
 * values resolves to is a backend concern: the cart receives the configuration
 * and the adapter resolves it. An adapter maps its own option sets onto this
 * shape and the page prices the selection itself.
 *
 * `size` is the 1 reserved {@link id}: a clothing storefront reads it to draw
 * the size scale on a product card, through `productSizes` in
 * `./product-options.ts`. An adapter selling apparel maps its size option onto
 * that id; everything else is free-form.
 */
export interface ProductOption {
  id: string
  /** Shown before the selected value, e.g. `'Ear tip material'`. */
  label: string
  values: ProductOptionValue[]
}

/** One choice within a {@link ProductOption}, e.g. `'256GB'`. */
export interface ProductOptionValue {
  id: string
  label: string
  /**
   * Added to {@link Product.price} when this value is chosen, shown beside the
   * label as `(+$12)`. Omit for the values that cost nothing extra, usually the
   * first one, which the page selects by default.
   */
  priceDelta?: Money
  /**
   * Whether this value can still be bought. A sold-out value stays on the page,
   * struck through, because a shopper reads "my size is gone" from an absent
   * pill as "this doesn't come in my size".
   * @default true
   */
  available?: boolean
  /**
   * The piece's size in this value, where the value changes it: a longer table,
   * a wider bed. Leave it out where it changes nothing, and on the first value,
   * which {@link Product.dimensions} already describes.
   */
  dimensions?: ProductDimensions
}

/** One condition a handed-in device can be in, and the share of its value that pays. */
export interface TradeInCondition {
  id: string
  /** Shown on the pill, e.g. `'Like new'`. */
  label: string
  /** Share of {@link TradeInModel.value} this condition pays. `0.8` is 80%. */
  rate: number
}

/** One device a shopper can hand in. */
export interface TradeInModel {
  id: string
  /** The model as a shopper would name it, e.g. `'iPhone 15'`. */
  label: string
  /** What it pays in the best condition, before {@link ProductTradeIn.maxSavingsRate} caps it. */
  value: Money
}

/**
 * A family of devices under one brand, e.g. iPhone or Galaxy Tab. The picker
 * shows families as tiles, so each carries a photo of a representative device.
 */
export interface TradeInDevice {
  id: string
  label: string
  image: ProductImage
  /** Models in the order they are presented, newest first. */
  models: TradeInModel[]
}

/** A brand whose devices the store takes in. */
export interface TradeInBrand {
  id: string
  name: string
  devices: TradeInDevice[]
}

/**
 * A trade-in offer shown on the product page: hand in an old device, take the
 * credit off this one. The nested brands, devices, and models are what the
 * trade-in dialog walks the shopper through to reach a quote.
 *
 * Resolved by `commerce/programs/trade-in.ts` unless an adapter holds a real
 * quote, since no commerce backend models trade-in natively.
 */
export interface ProductTradeIn {
  /**
   * The headline the product page leads with, 0-1: `0.7` reads as "Save up to
   * 70%". It advertises the program and does not cap a quote, which is worth
   * what the handed-in device is worth.
   */
  maxSavingsRate: number
  /** Brands accepted, in the order they are presented. */
  brands: TradeInBrand[]
  /** Conditions offered, best first. The quote starts on the first one. */
  conditions: TradeInCondition[]
}

/**
 * One device picked out of a {@link ProductTradeIn}, by the ids that offer
 * carries. It is what a screen sends and what the cart stores, never the money:
 * a quote is priced from the offer (see `commerce/programs/trade-in.ts`), so a
 * shopper cannot name their own credit by editing the request.
 */
export interface TradeInSelection {
  brandId: string
  deviceId: string
  modelId: string
  conditionId: string
}

/**
 * One labeled line of a product's spec sheet.
 *
 * {@link id} is what makes 2 products comparable: smart comparison lines up the
 * specs both sides carry and drops the rest. So an id has to mean the same
 * measurement everywhere it appears, whatever each product calls it on the
 * page. Anything measuring endurance is `battery-life`.
 */
export interface ProductSpec {
  /** Stable id, shared across the catalog, e.g. `'battery-life'`. */
  id: string
  /** What is measured, e.g. `'Battery life'`. */
  label: string
  /** What it reads as, e.g. `'9 hours'`. Free text, and the only part rendered. */
  value: string
  /**
   * The number inside {@link value}, in whatever unit the id measures. Set it
   * and a comparison can weigh the 2 sides against each other; leave it out and
   * the spec is compared as text, which is what `'Version 5.3'` and
   * `'Smart adaptive'` want.
   *
   * More is taken to be better, so leave it out for a measure where less wins
   * (weight, latency) rather than authoring a number that would read backwards.
   */
  amount?: number
  /**
   * What this spec means for a shopper, in a sentence: `'Lasts a full workday on
   * one charge.'` Two surfaces read it out rather than writing a line of their
   * own, so this is where a merchandiser puts the copy they want shown. Plain
   * English renders it in place of {@link value}; a comparison uses it for the
   * spec's row.
   *
   * It is also what an assistant is asked to write where it is missing. Doing
   * that once, into the catalog, beats doing it per page view: the sentence is
   * the same every time, and a claim made about a product is worth reading
   * before it ships.
   */
  benefit?: string
  /**
   * Heading this spec is listed under on the product page, e.g. `'Product
   * identifiers'`. Specs carrying no group lead the sheet under no heading of
   * their own, and every group keeps the order the sheet first names it in.
   *
   * Display only. A comparison ignores it, since 2 stores can file the same
   * measurement under different headings and {@link id} is what lines them up.
   */
  group?: string
  /**
   * Whether a comparison may weigh this spec. Identifier rows (the brand, the
   * product line, where it was assembled) belong on a spec sheet but say nothing
   * about which of 2 devices is the better buy, so they sit the table out.
   * @default true
   */
  comparable?: boolean
}

/**
 * One spec rewritten as a sentence, which is what the product page's plain
 * English toggle swaps in. What a store's assistant returns from
 * `ProductSpecs`' `onExplain`, and what the demo reads off the sheet until one
 * is wired up.
 */
export interface ProductSpecExplanation {
  /** The spec this rewrites, from {@link ProductSpec.id}. */
  id: string
  /** The sentence shown in place of {@link ProductSpec.value}. */
  text: string
}

/**
 * One run of smart comparison: the verdict, then a row per spec both devices
 * carry. What a store's assistant returns from
 * `ProductSmartComparison`'s `onCompare`, and what the demo generates locally
 * until one is wired up.
 */
export interface SmartComparison {
  /**
   * The verdict, in order. Split into runs so the page can emphasize part of
   * it; an assistant that answers with 1 block of prose maps to a single run.
   */
  summary: SmartComparisonSegment[]
  /** A row per spec both sides carry, in the order the product sheet lists them. */
  rows: SmartComparisonRow[]
}

/** One run of the verdict, emphasized or not. */
export interface SmartComparisonSegment {
  text: string
  /**
   * Render this run as the sentence the eye lands on.
   * @default false
   */
  emphasis?: boolean
}

/** One spec, as the 2 devices answer it. */
export interface SmartComparisonRow {
  /** What is measured, from {@link ProductSpec.label}. */
  label: string
  /** What the shopper gains here, e.g. `'Lasts a full workday on one charge.'` */
  gain: string
  /** How much better, e.g. `'+100%'`. Absent where the spec has no numbers to weigh. */
  delta?: string
  /** What the product on the page reads as. */
  value: string
  /** What the device it is compared against reads as. */
  comparedValue: string
}

/**
 * The assistant's read on a whole comparison set: the verdict, then the product
 * it names for each priority a shopper might be buying on. What a store returns
 * from `SmartVerdict`'s `onVerdict`, and what the demo generates locally until
 * one is wired up.
 *
 * Unlike {@link SmartComparison}, which weighs a product against 1 device a
 * shopper already owns, this weighs the 2 to 4 they picked against each other,
 * none of which they have.
 */
export interface ComparisonVerdict {
  /** The verdict, in order. Split into runs so the panel can emphasize part of it. */
  summary: SmartComparisonSegment[]
  /** A product per priority, in the order to present them. Empty where nothing stands out. */
  picks: ComparisonPick[]
}

/** One product the verdict singles out, and what it wins on. */
export interface ComparisonPick {
  /** The priority it wins, e.g. `'Best overall'`. */
  label: string
  /** The product it names, by {@link Product.slug}. */
  productSlug: string
  /** Why, in a sentence. */
  reason: string
}

/**
 * An extended-warranty add-on offered beside the buy button. Plans are listed in
 * the order they should be presented, and none is selected by default. The
 * shopper opts in.
 *
 * Most stores price these by rule rather than per product, which is what
 * `commerce/programs/protection.ts` does.
 */
export interface ProductProtectionPlan {
  id: string
  label: string
  price: Money
  /** How long it covers, in years from delivery. Absent where the store does not say. */
  years?: number
}

/** One thing a product's page sells it on, with a photograph that shows it. */
export interface ProductFeature {
  /** A few words, e.g. `'Premium quality'`. */
  title: string
  /** 1 or 2 sentences backing the title up. */
  description: string
  image: ProductImage
}

/** A sellable product, as every storefront screen sees it. */
export interface Product {
  id: string
  /** URL segment, e.g. `lumo-pulse-17-pro` → `/electronics/product/lumo-pulse-17-pro`. */
  slug: string
  title: string
  /**
   * The product in a sentence or two, shown under the title on the product page
   * and available to any surface that needs a summary (mega-menu tiles, search
   * results, meta descriptions). Required, because a product with nothing to say
   * for itself leaves a hole on the page. Every adapter can map something here,
   * even if only the first paragraph of the store's own copy.
   *
   * This is the *only* prose a product carries. What follows it further down the
   * page is structured: specs, reviews, Q&A.
   */
  description: string
  /**
   * Headline specs for the card, at most 3. Short fragments like
   * `'M4 Chip'`, joined with a separator for display. Longer, structured spec
   * tables belong to the product page and arrive with it.
   */
  specs?: string[]
  /**
   * The structured spec sheet. The product page lists it as its specs section,
   * in sheet order and under the headings {@link ProductSpec.group} names, and
   * smart comparison weighs 2 devices on it.
   *
   * Absent for a product the store holds no measured specs for, which drops the
   * section and the comparison together: giving a product a sheet whose ids
   * match its shelf-mates is the whole job of adding it to the comparison set.
   * Unlike {@link specs}, which is display prose for a card.
   */
  specSheet?: ProductSpec[]
  /**
   * The piece's overall size, for anything a shopper has to find room for.
   * Absent where size is not the question, which is most of an electronics
   * catalog.
   */
  dimensions?: ProductDimensions
  brand?: string
  /**
   * Photography for the default color. When {@link colors} is present this is
   * the first color's media.
   */
  media: ProductMedia
  /** Color variants with per-color swatch and media. Absent for single-color products. */
  colors?: ProductColor[]
  /** Line drawings to set {@link dimensions} against. Absent for a product the store has none of. */
  drawings?: ProductDrawings
  /**
   * What the product page sells it on, in order: a few photographed points
   * beyond the spec sheet. Absent for most products, which drops the section.
   */
  features?: ProductFeature[]
  /**
   * Non-color configuration choices shown on the product page. Absent for a
   * product that ships one way.
   */
  options?: ProductOption[]
  /**
   * Warranty add-ons offered on the product page. An adapter sets this only for
   * a product it holds real plans for; leaving it out hands the decision to the
   * storefront's protection program, which prices a plan from the product's
   * categories and price (see `commerce/programs`). What a page finally renders
   * is whichever of the 2 resolved.
   */
  protectionPlans?: ProductProtectionPlan[]
  /**
   * The trade-in offer for this product. Left out hands the decision to the
   * storefront's trade-in program, the same way {@link protectionPlans} does.
   */
  tradeIn?: ProductTradeIn
  /**
   * Whether the page offers the assistant's spec comparison against a device
   * the shopper already owns. Left out hands the decision to the storefront's
   * comparison program, which offers it where the categories qualify *and*
   * {@link specSheet} gives it enough to compare on. Not the same thing as the
   * compare list a product card toggles, which is a shopper's own selection.
   */
  smartComparison?: boolean
  price: Money
  /** Original price when on sale; renders struck-through next to {@link price}. */
  compareAtPrice?: Money
  /**
   * Loyalty points this purchase earns, shown as a badge beside the price.
   * Absent when the product earns nothing beyond the program's base rate.
   * The demo uses it for bonus-earning products. The program itself (Appica Club)
   * arrives with the rewards module.
   */
  rewardPoints?: number
  /**
   * Units sold in the trailing period, the figure a "popular" or "bestselling"
   * shelf ranks on. Only a backend can measure it, so most adapters map it from
   * their own analytics rather than storing it on the product; the demo dataset
   * authors it directly. Absent means "not ranked".
   */
  unitsSold?: number
  /**
   * The aggregate shown beside the title on cards and on the product page, where
   * it links down to the reviews themselves. Absent for a product nobody has
   * reviewed, which is what puts the card and the section into their empty
   * state.
   *
   * The demo adapter derives it from the reviews it holds, so the star cluster
   * and the section heading can never disagree. A backend that counts ratings
   * separately from written reviews (most do) returns its own figure here and
   * the two legitimately differ.
   */
  rating?: ProductRating
  badges: ProductBadge[]
  availability: ProductAvailability
  /**
   * The date this product becomes buyable, as `YYYY-MM-DD`: a release date
   * while it is on `preorder`, an expected restock while it is `out-of-stock`.
   * Absent when the store won't commit to one, which every screen has to
   * survive. Format it with {@link formatDate} from `./format`.
   */
  availableAt?: string
  /** Categories this product belongs to, by {@link Category.id} (top-level and subcategory). */
  categoryIds: string[]
  /**
   * Free-text tags: what {@link ProductQuery.search} matches on besides the
   * title, brand, and description, and what related-product lookups compare.
   * Not the same thing as a {@link CategoryTag}, which is authored per category.
   */
  tags: string[]
  /**
   * Alternatives to show on this product's page, by {@link Product.slug}, in the
   * order to show them. Set it and the shelf is exactly this list; leave it out
   * and the storefront derives one from the catalog (see
   * `commerce/programs/related.ts`), which is what most products should do.
   *
   * It is worth authoring where the rule has too little to work with: a product
   * alone in its subcategory, or one whose closest neighbors by price sell for a
   * different job. Resolved through {@link ProductQuery.slugs}, which skips what
   * it can't find, so a retired product shortens the shelf instead of emptying
   * it.
   */
  relatedSlugs?: string[]
  /**
   * Structured, filterable attributes, keyed by attribute id: `{ memory: ['256 GB'] }`.
   * A catalog filter is built from one of these keys (see {@link Filter}), so a
   * product that omits a key doesn't appear under that filter.
   *
   * Values are display strings, spelled the same way on every product, since
   * that is what groups them into one filter value. Kept separate from
   * {@link specs}, which is display-only prose for the card.
   */
  attributes?: Record<string, string[]>
}

/** The shots a product card shows, out of a {@link ProductMedia}. The gallery is the product page's alone. */
export type CardProductMedia = Pick<ProductMedia, 'image' | 'hoverImage' | 'packshot'>

/**
 * A {@link Product} as a product card, a search result, or a drawer's row reads
 * it. A whole product type-checks here too, so trim one with `toCardProduct`
 * from `./card-product` wherever a Server Component hands it to a card.
 */
export interface CardProduct extends Pick<
  Product,
  | 'id'
  | 'slug'
  | 'title'
  | 'specs'
  | 'dimensions'
  | 'options'
  | 'price'
  | 'compareAtPrice'
  | 'rewardPoints'
  | 'rating'
  | 'badges'
  | 'availability'
> {
  /** Photography for the default color. */
  media: CardProductMedia
  /** Each color's swatch and photography. */
  colors?: (Pick<ProductColor, 'name' | 'hex'> & { media: CardProductMedia })[]
}

/** A device smart comparison can weigh a product against: enough to name it in the picker and line up its spec sheet. */
export type ComparableProduct = Pick<Product, 'slug' | 'title' | 'brand' | 'specSheet'>

/**
 * A photo or a clip a reviewer attached. {@link src} is a still in both cases -
 * for a clip, the poster frame the rail shows until it plays - and the
 * dimensions describe that still rather than the video.
 */
export interface ProductReviewMedia {
  kind: 'image' | 'video'
  /** Path under `/public` (demo adapter) or an absolute URL (remote adapters). */
  src: string
  alt: string
  width: number
  height: number
  /** The clip to play. Required for `kind: 'video'`, ignored otherwise. */
  videoSrc?: string
}

/**
 * One dimension a reviewer scored on the review form, 1-5. These are answers to
 * a question the store asked, unlike {@link ProductReview.praises}, which is
 * read out of the prose. A store that asks for none leaves them out.
 */
export interface ProductReviewAspect {
  /** Stable across reviews, which is what lets scores average: `'ease-of-use'`. */
  id: string
  /** Shown beside the bar, e.g. `'Easy to use'`. */
  label: string
  /** The reviewer's score, 1-5. */
  score: number
}

/**
 * How a garment fit, as its reviewer answered the store's fit question: `-2`
 * runs very small, `0` true to size, `2` runs very large.
 */
export type ReviewFit = -2 | -1 | 0 | 1 | 2

/** What every customer review carries, whatever it is about. */
export interface Review {
  id: string
  /** Display name, as the reviewer gave it. */
  author: string
  /** When it was written, as `YYYY-MM-DD`. Format it with {@link formatDate} from `./format`. */
  date: string
  /** Stars awarded, 1-5. Whole numbers: no store collects half a star. */
  rating: number
  /** The headline, where the store's form asks for one. */
  title?: string
  /** The review itself. The only prose it carries, so a long one is truncated rather than split. */
  body: string
  /**
   * Whether the store could match this review to an order. Shown as a "Verified
   * purchase" mark, so never set it for a review the store cannot vouch for.
   */
  verified: boolean
}

/** One customer review of a product. */
export interface ProductReview extends Review {
  /**
   * What the reviewer bought, joined for display (`'Midnight Black, 256GB'`).
   * Absent for a product that ships 1 way. Apparel labels its 2 halves apart,
   * in {@link color} and {@link size}.
   */
  variant?: string
  /** The color bought, by {@link ProductColor.name}. */
  color?: string
  /** The size bought, as labeled, which is what a {@link fit} answer is relative to. */
  size?: string
  /** How it fit. Averaged into {@link ProductReviewList.fit}. */
  fit?: ReviewFit
  /** Photos and clips, in the order the reviewer attached them. */
  media?: ProductReviewMedia[]
  /**
   * Dimensions this reviewer scored. Averaged across reviews into
   * {@link ProductReviewSummary.aspects}.
   */
  aspects?: ProductReviewAspect[]
  /**
   * What this review is warm about: `['Sound quality', 'Battery life']`. Spelled
   * the same way across a product's reviews, since that is what groups them into
   * one topic. A store fills these from a sentiment pass or from form tags.
   */
  praises?: string[]
  /**
   * What this review is critical of, in the same vocabulary as {@link praises}.
   * Kept apart from the star rating deliberately: a 4-star review is usually 4
   * stars *because* it criticizes something. Appearing in both lists is normal.
   */
  criticisms?: string[]
  /** Shoppers who marked this review helpful. */
  helpfulCount: number
}

/** Which way a topic's mentions leaned, across the reviews that raised it. */
export type ReviewSentiment = 'positive' | 'negative'

/** One dimension averaged across every review that scored it. */
export interface ReviewAspectSummary {
  /** From {@link ProductReviewAspect.id}. */
  id: string
  label: string
  /** The mean score as a share of 5, so `0.9` is 4.5 stars. Format it with {@link formatPercent}. */
  rate: number
}

/** One subject reviewers keep returning to, and how they felt about it. */
export interface ReviewTopic {
  /** From {@link ProductReview.praises} or {@link ProductReview.criticisms}, e.g. `'Battery life'`. */
  label: string
  /** Reviews that raised it, praise and criticism together. */
  count: number
  /** Whichever side of it more reviewers came down on. */
  sentiment: ReviewSentiment
}

/** A topic in a reviewer's own words: what the summary rests its claim on. */
export interface ReviewHighlight {
  /** The {@link ReviewTopic.label} this illustrates. */
  topic: string
  sentiment: ReviewSentiment
  /** A sentence lifted from a review that raised the topic. Never written for the shopper. */
  quote: string
}

/**
 * What the assistant makes of a product's reviews. The 3 lists answer different
 * questions: {@link aspects} is what reviewers *scored*, so a percentage;
 * {@link topics} is what they *talked about*, so a count with a leaning;
 * {@link highlights} is those topics in their own words.
 *
 * An adapter that generates this returns it on {@link ProductReviewList.summary};
 * otherwise the facade derives one (see `commerce/programs/reviews.ts`), which is
 * where a store wires its own model in. Data rather than a client-side call, so
 * the widget is complete on the first paint.
 */
export interface ProductReviewSummary {
  /** The paragraph, 2-4 sentences. */
  text: string
  /**
   * The sizing advice reviewers add up to, in a sentence: `'Most found it true
   * to size, so take your usual one.'` Apparel only: absent where no review
   * answered the fit question.
   */
  sizing?: string
  /** Dimensions reviewers scored, highest first. Empty where the store asks for none. */
  aspects: ReviewAspectSummary[]
  /** Subjects reviewers raised, most-mentioned first. */
  topics: ReviewTopic[]
  /** Pull-quotes behind the topics, praise before criticism. */
  highlights: ReviewHighlight[]
}

/** Where a product's fit answers land: the mean places it on the scale, the counts back it up. */
export interface ProductFit {
  /** The mean {@link ReviewFit}, from `-2` to `2`. */
  average: number
  /** Answers per point on the scale. Points nobody picked are `0`. */
  counts: Record<ReviewFit, number>
  /** Reviews that answered, the sum of {@link counts}. */
  total: number
}

/**
 * A product's reviews, with the aggregate they roll up to.
 *
 * The whole list arrives at once, because a product's reviews are a bounded set
 * and every refinement the page offers (sort order, star filter) is then instant
 * on data already in the browser. A store holding thousands of reviews per
 * product should paginate here instead, and move sorting with it.
 */
export interface ProductReviewList {
  /** Newest first, which is the order the page opens on. */
  reviews: ProductReview[]
  /** Mean and count over {@link reviews}, and what {@link Product.rating} is set from. */
  rating: ProductRating
  /** How many reviews awarded each star, keyed `1` to `5`. Stars nobody gave are `0`. */
  histogram: Record<number, number>
  /** The fit answers, averaged. Absent where no review answered the fit question. */
  fit?: ProductFit
  /** The assistant's read on the set. Absent for a product with too few reviews to summarize. */
  summary?: ProductReviewSummary
}

/**
 * A review of the store rather than of anything it sells: its delivery, its
 * showroom, its service. Review platforms collect these apart from product
 * reviews, and they count toward the store's rating, never a product's.
 */
export interface StoreReview extends Review {
  /** What it is about, as a shopper would name it: `'Delivery'`. */
  topic: string
}

/** The piece a featured review is about, in the configuration the reviewer bought. */
export interface ReviewedProduct {
  /** By {@link Product.slug}. */
  slug: string
  title: string
  /** The photography for the color bought, or the product's own where the review names none. */
  image: ProductImage
  /** The same on its own: its {@link ProductMedia.packshot}. */
  packshot?: ProductImage
}

/**
 * A review picked to quote away from its product page. A product review comes
 * with its piece, resolved against the catalog; a store review has none.
 */
export type FeaturedReview =
  { kind: 'product'; review: ProductReview; product: ReviewedProduct } | { kind: 'store'; review: StoreReview }

/** The reviews a store picked to quote, and what every review it holds adds up to. */
export interface FeaturedReviewList {
  /** In the order to show them. */
  reviews: FeaturedReview[]
  /**
   * Mean and count over every published review, product and store alike,
   * picked or not, so a row of picked praise never stands in for the whole.
   */
  rating: ProductRating
}

/** One node of the catalog taxonomy. The tree is at most 2 levels deep. */
export interface Category {
  id: string
  /** URL segment, e.g. `smartphones`. */
  slug: string
  name: string
  /** Parent category id, or `null` for a top-level category. */
  parentId: string | null
  /**
   * Card image. Optional because not every category is merchandised as a card.
   * The Electronics demo authors no artwork of its own: the adapter fills this
   * in from the image of a representative product (see the demo dataset's
   * `categoryCovers`), so the taxonomy stays pure structure.
   */
  image?: ProductImage
  /**
   * Child categories. Populated when the category is returned as part of a
   * tree (see {@link CommerceAdapter.getCategoryTree}); omitted for flat lookups.
   */
  children?: Category[]
}

/**
 * A banner's background in one theme. Both fills are authored, because a
 * gradient that flatters a cut-out in light mode is rarely the one that does in
 * dark mode.
 */
export interface ProductBannerFill {
  /** Any CSS `background` value: a color, a gradient, or several layers. Used verbatim. */
  value: string
  /**
   * How light the fill reads. The banner sets dark text on a `light` fill and
   * light text on a `dark` one, so describe the fill honestly.
   */
  tone: 'light' | 'dark'
}

/**
 * A promoted product: artwork, a headline, and a price over an authored
 * background.
 *
 * It carries its own copy and artwork rather than pointing at a
 * {@link Product}, because a campaign is written and shot for the banner and
 * outlives any one catalog entry. Only {@link href} and {@link price} tie it
 * back, and those are the 2 to keep true.
 *
 * One shape serves every size the storefront draws a campaign at: the hero
 * above a category's products ({@link CommerceAdapter.getCategoryBanners},
 * where several become a carousel and one stays a still), the grid of tiles
 * below them ({@link CommerceAdapter.getCategoryTiles}), the single cell inside
 * the listing itself ({@link CategoryPromo}), and the same grid of tiles on a
 * page that is not a listing at all
 * ({@link CommerceAdapter.getPlacementTiles}).
 */
export interface ProductBanner {
  id: string
  /** Small line above the title, usually the product's name. */
  eyebrow: string
  /** The headline, set at display size. A phrase rather than a sentence. */
  title: string
  /** Product artwork, framed wide rather than square like a card shot. {@link fit} says how it is cropped. */
  image: ProductImage
  /**
   * A clip the frame plays over {@link image}, where the frame plays one at
   * all. {@link image} has to be its first frame, because that is the still
   * shown until the clip runs, and wherever it cannot.
   */
  clip?: string
  /**
   * How the artwork meets the edges of a grid tile: `contain` stands a cut-out
   * on the fill behind it, `cover` crops a photograph to the tile's edges and
   * leaves the fill showing only while it loads. The hero banner sets its
   * artwork beside the copy and ignores this.
   * @default 'contain'
   */
  fit?: 'contain' | 'cover'
  /**
   * Which end of the listing cell the copy sits at. Pick the end the artwork
   * leaves empty, so a shot with its subject low in the frame takes `top`. The
   * scrim that keeps the copy legible moves with it, and the artwork anchors to
   * the opposite end so a crop eats the empty half rather than the subject.
   *
   * Only the cell reads this. The hero sets its copy beside the artwork, and a
   * tile always splits copy from price to opposite edges.
   * @default 'bottom'
   */
  copyAlign?: 'top' | 'bottom'
  price: Money
  /** Original price when the product is marked down; renders struck through. */
  compareAtPrice?: Money
  /** Where the call to action leads, usually the product's page. */
  href: string
  /**
   * Call-to-action label. Keep it true to the product's
   * {@link Product.availability}: "Pre-order" for something unreleased.
   * @default 'Shop now'
   */
  ctaLabel?: string
  /** Background per theme. */
  background: { light: ProductBannerFill; dark: ProductBannerFill }
}

/**
 * An editorial campaign across the top of a category listing, or in a cell of
 * its grid ({@link GridCampaign}): a photograph, a line of copy, and a link.
 * Unlike {@link ProductBanner}, it names no product and quotes no price.
 */
export interface CampaignBanner {
  id: string
  /** A short line above {@link title}, e.g. the room it is set in. */
  eyebrow?: string
  /** A phrase, set over the photograph. */
  title: string
  /** The photograph, shot wide above a listing and portrait for a grid cell. With a {@link clip}, its first frame. */
  image: ProductImage
  /** A muted clip over {@link image}, which has to be its first frame. A loop ends there too, so it has no seam. */
  clip?: string
  /**
   * The part of the photograph kept in view when cropped, as `object-position` percentages.
   * @default { x: 50, y: 50 }
   */
  focus?: { x: number; y: number }
  /** Where the campaign leads, usually a filtered catalog listing. */
  href: string
  /**
   * Call-to-action label. A grid cell is a link as a whole, so it may show none.
   * @default 'Explore'
   */
  ctaLabel?: string
}

/**
 * A piece of a collection's look, for the thumbnails on its card and the cards
 * beside its look photograph. Only {@link slug} is authored; the adapter
 * resolves the rest from the catalog, so neither shows a retired piece.
 */
export interface CollectionPiece {
  /** By {@link Product.slug}. */
  slug: string
  title: string
  /** The product's lead shot. */
  image: ProductImage
}

/**
 * A curated edit of the catalog: a name, a cover photograph, and the pieces in
 * it, like a season's edit or a room. Where a {@link CampaignBanner} leads to a
 * filtered listing, a collection is a listing of its own, and its pieces are
 * named one by one. See {@link CommerceAdapter.getCollections}.
 */
export interface Collection {
  id: string
  /** URL segment, e.g. `linen-days`. */
  slug: string
  title: string
  /** When it was cut, e.g. `'Summer 2026'`, set above the title. Omit for one that isn't seasonal, like a room. */
  season?: string
  /** 1 or 2 sentences under the title. */
  description: string
  /** The cover photograph, shown wide, square, and portrait, so shoot it with room around the subject. */
  image: ProductImage
  /**
   * The part of the photograph kept in view when cropped, as `object-position` percentages.
   * @default { x: 50, y: 50 }
   */
  focus?: { x: number; y: number }
  /**
   * The pieces, by {@link Product.slug}, in running order. The collection's
   * page lists them through {@link ProductQuery.slugs}.
   */
  slugs: string[]
  /** An outfit from the collection, piece by piece, from {@link slugs}. A card shows the first 4. Empty for none. */
  look: CollectionPiece[]
  /**
   * One photograph of every {@link look} piece worn together, set beside them
   * by a "shop the look" section. Not the cover, which sells a mood: this one
   * has to show each piece.
   */
  lookImage?: ProductImage
  /** Whether it opens the collections page, in the slider of featured collections. */
  featured?: boolean
  /** Whether the home page shows it. A department's home shows the ones its collections page lists. */
  onHome?: boolean
  /**
   * The department whose collections page lists it, by {@link Category.slug}.
   * Omit for one every department lists, and in a store with no departments.
   */
  department?: string
}

/**
 * A page that carries promoted products without being a category listing, and
 * so has no category to inherit them from, or `menu`, the header's mega-menu
 * panel. Each one names a spot a merchandiser
 * fills by hand (see {@link CommerceAdapter.getPlacementTiles} for the wide
 * frame and {@link CommerceAdapter.getPlacementPromos} for the portrait one); a
 * placement nobody has filled shows nothing, which is the normal state for most
 * of them.
 */
export type BannerPlacement = 'cart' | 'checkout' | 'home' | 'account' | 'blog' | 'menu'

/**
 * Where a hero slide's cut-out stands, in percent of the stage's width. The
 * stage is the end half of the hero and holds a fixed aspect ratio, so the same
 * 3 numbers place the artwork at every viewport.
 *
 * Measure them off the artwork's own bounding box with no transparent margin
 * around it, and crop the file to that box: a cut-out padded with empty pixels
 * places differently from the same shot cropped tight.
 */
export interface HeroPlacement {
  /** Distance from the stage's start edge to the artwork's start edge. */
  x: number
  /** Distance from the stage's top edge to the artwork's top edge. */
  y: number
  /** How wide the artwork runs. Its height follows from its own proportions. */
  width: number
}

/**
 * The product a hero slide sells, or a scene tags. Only {@link slug} is
 * authored; a backend resolves the rest from its catalog, so a price edited
 * there is the price the hero quotes.
 */
export interface HeroProduct {
  /** By {@link Product.slug}. A slug that has left the catalog drops the slide or the tag. */
  slug: string
  title: string
  /** Artwork for the glass card: square for a slide, the piece on its own for a tag. Never the cut-out on the stage. */
  image: ProductImage
  price: Money
  compareAtPrice?: Money
}

/**
 * One slide of the storefront's opening hero: a campaign headline on the start
 * side, and on the end side a cut-out standing in front of a glass card that
 * sells the product.
 *
 * Distinct from {@link ProductBanner}, which a category hero, a tile, and a
 * mosaic cell all share. This is the 1 frame that composes 3 layers around a
 * single cut-out, and the placement, accent, and card below mean nothing in
 * those other frames. See {@link CommerceAdapter.getHeroSlides}.
 */
export interface HeroSlide {
  id: string
  /** The model, beside the brand's mark in the badge. The mark already says the brand. */
  eyebrow: string
  /**
   * The brand's mark, shown in its own colors. {@link ProductImage.alt} names
   * the brand.
   */
  mark: ProductImage
  /**
   * Sets {@link mark} on a white plate, which is what lets a mark that is pure
   * black (Bose, Apple, Sony) read on the hero at all, and what a wide wordmark
   * needs to sit beside a square glyph. Turn it off for a mark that already
   * carries its own ground.
   * @default true
   */
  markPlate?: boolean
  /** The headline, set at display size. A phrase rather than a sentence. */
  title: string
  /**
   * 2 lines under the call to action: the first sets the product up, the second
   * lands it. Written as 2 because they are set in different weights.
   */
  story: readonly [string, string]
  product: HeroProduct
  /**
   * What the glass card's add button puts in the cart. Name every choice the
   * product offers, or a backend cannot tell which item it is; `defaultCartLine`
   * picks the first color and the first value of each option.
   */
  quickAdd: CartLineInput
  /** Where the call to action leads, usually the product's page. */
  href: string
  /**
   * Call-to-action label.
   * @default 'Shop now'
   */
  ctaLabel?: string
  /** The cut-out on the stage: a subject on transparency, cropped to itself. */
  image: ProductImage
  placement: HeroPlacement
  /** The tint on the glass card's bar. Dark ink sits on it, so keep it light in either theme. */
  accent: string
  /**
   * Background per theme, under the hero's own sheen and flare. Both tones are
   * `dark`: the copy over them is white, and the header floating on top reads
   * this to switch to light ink.
   */
  background: { light: ProductBannerFill; dark: ProductBannerFill }
}

/**
 * One slide of a hero that opens a home with campaigns: a short display title
 * over a flat ground, and a cut-out standing on the frame's foot. Where a
 * {@link HeroSlide} sells 1 product, this one usually leads to a collection.
 * See {@link CommerceAdapter.getHeroCampaigns}.
 */
export interface HeroCampaign {
  id: string
  /** A few words above the title, e.g. `'New collection'`. */
  eyebrow: string
  /** Set in capitals 11 characters to a line, on 2 lines: keep each word to 11 and the whole over 11. */
  title: string
  /** 1 or 2 sentences under the title. */
  description: string
  /** Where the call to action leads, usually a collection. */
  href: string
  /**
   * Call-to-action label.
   * @default 'Shop now'
   */
  ctaLabel?: string
  /**
   * The cut-out on transparency. Every slide's file shares 1 canvas size, the
   * subject near its middle and running off its foot, so the slides can trade
   * places in one frame without moving.
   */
  image: ProductImage
  /** Any CSS background, a color or a gradient. The copy over it is white, so keep 4.5:1 against it. */
  background: string
}

/**
 * A room photographed with the store's own pieces in it, each tagged where it
 * stands, so a shopper can pick a piece out of the picture. The home's hero
 * shows one per room. See {@link CommerceAdapter.getShoppableScenes}.
 */
export interface ShoppableScene {
  id: string
  /** The room, as the tab that opens it: `'Living room'`. */
  title: string
  /** 1 sentence under the title. */
  description: string
  /** Where the room's own listing is, usually a collection. */
  href: string
  /**
   * Call-to-action label.
   * @default 'Shop the room'
   */
  ctaLabel?: string
  /**
   * The photograph, wide. Every scene shares 1 ratio, so the frame holds still
   * as they change, and the tags are placed on this exact crop.
   */
  image: ProductImage
  /** The pieces in the picture, in the order to present them. */
  tags: SceneTag[]
}

/** A piece tagged in a {@link ShoppableScene}: where it stands in the photograph, and what it is. */
export interface SceneTag {
  /** Across the photograph, as a percentage of its width. */
  x: number
  /** Down the photograph, as a percentage of its height. */
  y: number
  product: HeroProduct
}

/**
 * A piece visual search found in a photo, and the products that look like it.
 * It is what a store's image search service answers, and what a
 * {@link VisualSearchSample} answers in advance.
 */
export interface VisualMatch {
  /** What the piece is, as a shopper would name it: `'Armchair'`. */
  label: string
  /**
   * Where it stands, as percentages of the photo's width and height, as a
   * {@link SceneTag} is placed. Left out by a service that matches the photo whole.
   */
  point?: { x: number; y: number }
  /** Best match first. */
  products: HeroProduct[]
}

/**
 * A photo a shopper can try visual search with when they have none of their
 * own. Its pieces are tagged by hand, so it answers without a search service.
 * See {@link CommerceAdapter.getVisualSearchSamples}.
 */
export interface VisualSearchSample {
  id: string
  /** A short name for the photo, which the button that tries it reads out: `'Reading corner'`. */
  title: string
  /** Shot at the frame's own ratio, so it fills it, and the points are placed on this exact crop. */
  image: ProductImage
  /** 1 per tagged piece, in the order to present them. */
  matches: VisualMatch[]
}

/**
 * A campaign that takes a cell inside a category's product grid, between the
 * cards rather than above or below them.
 *
 * It is merchandising, not a result: it never passes through `listProducts`, so
 * no filter narrows it, no sort moves it, and the listing's total keeps counting
 * products only. That is also why it shows on an unrefined first page and steps
 * aside once the shopper refines or pages on. A cell that answers none of the
 * refinements the shopper just made is noise sitting in the middle of their
 * answers.
 *
 * For the same reason it is the 1 piece of category merchandising that never
 * cascades: a hero above the grid reads as the branch talking, while a card
 * among the products reads as one of the products. A campaign that belongs in
 * several categories is placed in each of them by name.
 */
export interface CategoryPromo {
  /** The campaign itself, drawn at card size rather than hero or tile size. */
  banner: ProductBanner
  /**
   * Which cell it takes, 1-based and counting itself, so `6` puts it last in
   * row 2 of a 3-column grid. Clamped to the end of a page holding fewer cards.
   *
   * The grid reflows from 2 columns to 4, so a slot lands in a different corner
   * at every width. Pick one that ends a row at the widths that matter most.
   */
  position: number
}

/**
 * An editorial campaign in a cell of a category's product grid. It follows the
 * rules of {@link CategoryPromo} (never filtered, sorted, or inherited), but a
 * listing can hold several, and each one counts toward the cells a screen loads.
 */
export interface GridCampaign {
  campaign: CampaignBanner
  /**
   * Which cell it takes, 1-based and counting the campaigns before it. One with
   * no product after it is left out, so a short listing never ends on a campaign.
   */
  position: number
}

/**
 * One chip in a category's "search by popular tags" row: a label, and the
 * refinement it applies to the listing above it.
 *
 * A tag earns its place by doing in 1 click what the sidebar takes several
 * clicks to express, or by naming something no filter carries: a model family,
 * a feature, a price ceiling. A tag that repeats a single filter value is a
 * worse copy of the control already sitting beside the products, with no count
 * and no way to combine, so don't author those.
 *
 * The fields below are AND-ed, the same way the sidebar combines its own
 * controls. `@/lib/catalog-filters` turns one into a URL; nothing else knows how
 * a refinement is spelled in the query string.
 */
export interface CategoryTag {
  /**
   * What the chip reads. Keep it to a few words: the row wraps, and one long
   * pill among short ones reads as a mistake.
   */
  label: string
  /** Free-text search, for what no filter carries: `'iPhone 17'`, `'OLED'`. */
  search?: string
  /** Filter selections, keyed and tokenized exactly like {@link ProductQuery.filters}. */
  filters?: Record<string, string[]>
  /**
   * Price bounds in major units, `[min, max]`. Both ends are required: half a
   * range has no spelling in the query string.
   */
  price?: [number, number]
}

/**
 * A curated row of products under a category listing: a heading and the running
 * order to show it in.
 *
 * It cross-sells rather than repeating the grid above it, so the slugs usually
 * name products from outside the category. Resolved through
 * {@link ProductQuery.slugs}, which skips what it can't find, so a retired
 * product shortens the shelf instead of emptying it.
 */
export interface CategoryShelf {
  /** Heading above the row, e.g. `'Accessories for your phone'`. */
  title: string
  /** Products to show, by {@link Product.slug}, in the order to show them. */
  slugs: string[]
}

/**
 * A set of products sold together for less than they cost apart: the store's
 * "buy together" offer.
 *
 * Adapter data rather than a storefront rule, because commerce platforms
 * commonly sell a bundle as a product of its own. {@link price} arrives counted,
 * the way a cart's totals do, and {@link CommerceAdapter.addCartBundle} is the
 * only thing that honors it.
 */
export interface Bundle {
  id: string
  /** Names the offer, in the cart and to assistive tech, e.g. `'iPhone 17 Pro and its case'`. */
  title: string
  /** What it holds, in the order to show them. Always 2 or more. */
  items: BundleItem[]
  /** What the set costs together. */
  price: Money
  /** What the same products cost bought separately; renders struck through beside {@link price}. */
  compareAtPrice: Money
}

/** One product in a {@link Bundle}, in the finish the offer leads with. */
export interface BundleItem {
  product: Product
  /**
   * The finish to show first, by {@link ProductColor.name}. Absent for a
   * single-color product, and where the offer takes no view. A shopper can still
   * pick another: color is a choice the bundle's price does not depend on.
   */
  color?: string
}

/**
 * What a shopper picked of 1 product in a {@link Bundle}, sent to
 * {@link CommerceAdapter.addCartBundle} in the order of its items. An option's
 * surcharge is added on top of the bundle's price, as it is on its own.
 */
export type BundleChoice = Pick<CartLineInput, 'color' | 'options'>

/**
 * The primary navigation, including mega-menu content. Kept separate from the
 * raw {@link Category} tree so merchandisers can curate menu structure,
 * campaigns, and emphasis independently of the taxonomy.
 */
export interface NavMenu {
  items: NavItem[]
}

/**
 * A top-level entry in the primary navigation, with or without a mega-menu.
 *
 * The 3 optional parts are what the mega-menu draws, in the order it draws
 * them: the subcategory cards, the chips under them, and the campaigns along
 * the bottom. An item carrying none of them is a plain link, which is what
 * "% BIG SALE" is.
 */
export interface NavItem {
  id: string
  label: string
  href: string
  /** `sale` renders the item in the emphasis (red) treatment, like "% BIG SALE". */
  emphasis?: 'default' | 'sale'
  /** What this item opens onto, shown as cards. Omit for a plain link. */
  links?: NavLink[]
  /** Merchandised shortcuts the panel offers, usually the same ones the listing does. */
  tags?: CategoryTag[]
  /** Campaigns along the bottom of the panel: 1 fills the row, 2 split it. */
  banners?: ProductBanner[]
}

/** A single link inside a mega-menu, usually a subcategory. */
export interface NavLink {
  label: string
  href: string
  /**
   * Artwork for the card, captioned as the link rather than as the product in
   * the shot. A link without one is left out: the panel is a grid of cards.
   */
  image?: ProductImage
}

/**
 * Sort orders a catalog listing can request.
 *
 * `best-selling` asks the backend which products actually sell. Every commerce
 * platform measures it, and only the backend can know. Screens request the order and never rank products
 * themselves, so a "Bestsellers" shelf is truthful the moment a real adapter is
 * plugged in.
 */
export type ProductSort = 'featured' | 'best-selling' | 'discount' | 'price-asc' | 'price-desc' | 'newest' | 'rating'

/**
 * One refinement offered beside a catalog listing: a brand list, a color row, a
 * price range.
 *
 * Filters are returned by the backend rather than declared by the UI, since only
 * the backend knows which values a result set holds and how many products each
 * would leave. An adapter maps its own payload onto this union and the sidebar
 * renders whatever arrives, in the order it arrives. A listing with nothing
 * worth refining returns no filters, and the sidebar disappears with them.
 *
 * Ask for them with {@link ProductQuery.withFilters}; read them off
 * {@link ProductList.filters}.
 */
export type Filter = ListFilter | ColorFilter | RangeFilter

/** What every filter carries, whatever its shape. */
interface FilterBase {
  /**
   * Stable identifier, also the URL parameter the storefront refines with, so
   * keep it short and URL-safe: `brand`, `memory`, `price`.
   */
  id: string
  /** Heading above the filter's control, e.g. `'Memory capacity'`. */
  label: string
}

/** A multi-select list of values, rendered as checkboxes. */
export interface ListFilter extends FilterBase {
  kind: 'list'
  values: FilterValue[]
}

/** A multi-select list of colors, rendered as labeled swatches. */
export interface ColorFilter extends FilterBase {
  kind: 'color'
  values: ColorFilterValue[]
}

/**
 * A numeric span, rendered as a slider with a pair of inputs.
 *
 * Refined through {@link ProductQuery.minPrice} and {@link ProductQuery.maxPrice}
 * rather than through {@link ProductQuery.filters}, since a span is not a list of
 * tokens. The storefront reserves the `price` query parameter for it, so a
 * range filter's id has to be `price` (see `@/lib/catalog-filters`).
 */
export interface RangeFilter extends FilterBase {
  kind: 'range'
  /** Lowest and highest values present in the result set. */
  min: number
  max: number
  /** Set to format the bounds as money. Absent leaves them as plain numbers. */
  currencyCode?: CurrencyCode
}

/** One selectable value inside a {@link ListFilter}. */
export interface FilterValue {
  /**
   * URL-safe token the storefront sends back in {@link ProductQuery.filters}.
   * Opaque to the UI: it is minted by the adapter and only ever handed back.
   */
  value: string
  /** What the shopper reads, e.g. `'256 GB'`. */
  label: string
  /**
   * How many products this value would leave, counted with this filter's own
   * selections lifted, so a second brand shows what it would add rather than 0.
   */
  count: number
}

/** One selectable color inside a {@link ColorFilter}. */
export interface ColorFilterValue extends FilterValue {
  /** Any CSS color string the swatch can be painted with, e.g. `'#D9622B'`. */
  hex: string
}

/** Filters and options for {@link CommerceAdapter.listProducts}. */
export interface ProductQuery {
  /** Restrict to a category by {@link Category.slug} (includes descendants). */
  categorySlug?: string
  /**
   * Restrict to specific products by {@link Product.slug}, returned in the order
   * listed, which is how a hand-curated shelf pins its own running order. Slugs that
   * match nothing are skipped, so a shelf survives a product being retired.
   * The adapter keeps the order, re-sorting what its backend returns where it
   * must, so screens never re-sort. An explicit {@link sort} overrides it.
   */
  slugs?: string[]
  /** Restrict to products marked down from a list price, for the offers shelf. */
  onSale?: boolean
  /** Restrict to what can be bought right now, behind the listing's "only in stock" switch. */
  inStock?: boolean
  /**
   * Filter selections, keyed by {@link Filter.id}, holding {@link FilterValue.value}
   * tokens: `{ brand: ['apple', 'samsung'] }`. Values within one filter are OR-ed,
   * separate filters are AND-ed.
   */
  filters?: Record<string, string[]>
  /** Lowest price to include, in major units. Pairs with {@link maxPrice}. */
  minPrice?: number
  /** Highest price to include, in major units. */
  maxPrice?: number
  /**
   * Return the filters describing this result set on {@link ProductList.filters}.
   * Off by default: shelves and carousels have nothing to refine, and on a real
   * backend filter counts cost an extra request.
   */
  withFilters?: boolean
  /** Free-text search across title, brand, description, and tags. */
  search?: string
  sort?: ProductSort
  /**
   * 1-based page for catalog pagination. Providing this (or {@link pageSize})
   * paginates the result; omit both for a full, unpaginated list.
   */
  page?: number
  /** Items per page when paginating. Defaults to the adapter's page size. */
  pageSize?: number
  /**
   * Skip this many matching products before the window starts, overriding the
   * one {@link page} implies. It is how a listing fits products around cells the
   * grid spends on something else: a page giving 1 cell to a promo asks for 11
   * products at offset 0, and the page after it asks for 12 at offset 11, so no
   * product falls between the two.
   *
   * A caller passing this owns its own page arithmetic, {@link ProductList.pageCount}
   * included, since that count still counts products only.
   */
  offset?: number
  /**
   * Hard cap on returned items for top-N surfaces (carousels, mega-menu). Applied
   * only when not paginating.
   */
  limit?: number
}

/** Result of a catalog listing, including pagination metadata. */
export interface ProductList {
  products: Product[]
  /** Total products matching the query, before pagination. */
  total: number
  /** Current 1-based page (`1` when not paginated). */
  page: number
  /** Items per page (equals the returned count when not paginated). */
  pageSize: number
  /** Total number of pages (`1` when not paginated). */
  pageCount: number
  /**
   * Refinements available for this result set, in the order to present them.
   * Empty unless the query asked for them with {@link ProductQuery.withFilters}.
   */
  filters: Filter[]
}

/** What the header's search panel asks for while a shopper is typing. */
export interface SearchSuggestionQuery {
  /** What has been typed so far, untrimmed. */
  term: string
  /**
   * Search only this category and the ones under it, by {@link Category.slug}.
   * Suggested terms are held to it too, so none opens an empty listing.
   */
  categorySlug?: string
  /** How many products to preview. */
  productLimit?: number
  /** How many suggested terms to offer. */
  termLimit?: number
}

/**
 * What the search panel draws: terms to refine into, the products matching
 * already, and how many there are in total.
 *
 * Its own read rather than a {@link ProductQuery} with a `search`, because the
 * 3 come back together on the backends that have a predictive endpoint, and
 * splitting them would cost 2. An adapter without one runs the
 * search it has and returns no {@link terms}, which the panel is built to
 * survive.
 *
 * Every term must be one the catalog can answer, since a suggestion that leads
 * to an empty listing is worse than no suggestion. The demo adapter harvests
 * them from product tags, brands, and category names for exactly that reason.
 */
export interface SearchSuggestions {
  /** The term each row offers to search for, ranked, e.g. `'Charger'`. */
  terms: string[]
  /** Top matching products, ranked by the adapter. */
  products: Product[]
  /** Every product the term matches, which is what "see all" leads to. */
  total: number
}

/**
 * A list of products a shopper saved to come back to, as every screen sees it.
 *
 * A store keeps several per shopper: "Gifts" apart from "For me", and products
 * moved between them. Exactly 1 of them is {@link Wishlist.default}, which is
 * where a heart saves, so a shopper who never opens the account area still has
 * exactly 1 wishlist and never has to choose.
 *
 * Read them with `getWishlists` from `@/lib/wishlist`, which pairs the visitor's
 * wishlist token with the adapter. Mutations are the Server Actions beside it.
 */
export interface Wishlist {
  id: string
  name: string
  /** What the shopper wrote about it. Absent for a list they only named. */
  description?: string
  /**
   * Whether new saves land here. Exactly 1 list carries it, so a heart never has
   * to ask, and it moves with {@link WishlistPatch.default}. A shopper who has
   * only ever had 1 list has it on that one.
   */
  default: boolean
  /** What is saved in it, newest first. Empty for a list nothing has been put in yet. */
  items: WishlistItem[]
}

/**
 * One saved product. The whole {@link Product} rather than a copy of its title
 * and price, so the card that shows it is the card the catalog shows, and a
 * price cut reaches a list somebody saved months ago.
 */
export interface WishlistItem {
  /** Identifies the item within its list, and the handle removing and moving take. */
  id: string
  product: Product
  /** The day it was saved, as `YYYY-MM-DD`. Format it with {@link formatDate} from `./format`. */
  addedAt: string
}

/**
 * One saved item, and the list holding it. Removing and moving take these
 * rather than bare ids, so a selection spanning 2 lists is still 1 call.
 */
export interface WishlistItemRef {
  wishlistId: string
  itemId: string
}

/**
 * What a screen saves: a product, and where it goes.
 *
 * A product rather than a configuration of one, unlike {@link CartLineInput}. A
 * wishlist is a list of things worth another look, and a shopper who saved a
 * phone before choosing a color has not chosen wrongly.
 */
export interface WishlistItemInput {
  /** The product being saved, by {@link Product.slug}. */
  productSlug: string
  /** The list it joins. Absent saves it to the {@link Wishlist.default} one, which is what a heart does. */
  wishlistId?: string
}

/** What a screen needs to open a list. */
export interface WishlistInput {
  name: string
  description?: string
}

/** What can change about a list. A field left out is left alone. */
export interface WishlistPatch {
  name?: string
  /** `null` clears it. */
  description?: string | null
  /**
   * Points new saves at this list, and takes that off whichever list held it.
   * There is deliberately no way to say `false`: a shopper always has somewhere
   * for a heart to save, so the flag moves rather than clearing.
   */
  default?: true
}

/** Every list a token addresses, and the token that now addresses them. */
export interface WishlistState {
  wishlists: Wishlist[]
  token: string | null
}

/**
 * A shopping cart, as every screen sees it. Everything a cart view needs is
 * already counted here, so no screen adds lines up itself: swapping the adapter
 * swaps where the totals are calculated, not whether they agree.
 *
 * Read one with `getCart` from `@/lib/cart`, which pairs the visitor's cart
 * token with the adapter. Mutations are the Server Actions beside it.
 */
export interface Cart {
  id: string
  lines: CartLine[]
  /** Sum of every line's quantity, the number on the header cart badge. */
  totalQuantity: number
  /** Sum of line totals, before add-ons, shipping, and tax. */
  subtotal: Money
  /**
   * What the add-ons come to: every line's protection plan, plus the gift box
   * when it is on. Absent when the shopper has taken none.
   */
  services?: Money
  /**
   * What the sale prices already took off {@link subtotal}, shown as a figure to
   * feel good about rather than a deduction. Absent when nothing in the cart is
   * on sale.
   */
  savings?: Money
  /** What the handed-in devices pay, deducted from {@link total}. Absent when none were. */
  tradeInCredit?: Money
  /** Gift wrapping for the whole order. Absent where the store does not offer it. */
  giftBox?: CartGiftBox
  /** The discount code redeemed, absent until one is. */
  discount?: CartDiscount
  /** The loyalty points staked on this order, absent until some are. */
  rewards?: CartRewards
  /**
   * How many points the shopper has left to stake, absent for a guest and for a
   * store that runs no loyalty program.
   *
   * The one figure on this object the commerce adapter does not count: a balance
   * belongs to the shopper rather than to the cart, so `lib/cart` reads it from
   * `lib/rewards` and puts it here. See that module's `AGENTS.md`.
   */
  rewardsBalance?: number
  /**
   * The ways this order can reach the shopper, in the order to offer them.
   * Absent for an empty cart. The demo quotes the same set everywhere; a real
   * backend quotes them against the shipping address, so treat the list as
   * something that changes when the address does.
   */
  deliveryOptions?: DeliveryOption[]
  /** The option chosen, absent until the checkout selects one. */
  delivery?: CartDelivery
  /** What {@link delivery} costs, already counted into {@link total}. Absent until one is chosen. */
  shipping?: Money
  /**
   * What the order comes to: {@link subtotal} plus {@link services} and
   * {@link shipping}, less the trade-in credit and the discount. Shipping joins
   * it the moment a delivery option is chosen, which is why the cart page reads
   * a total without it and the checkout reads one with it. Tax is settled by the
   * payment provider, where the address that decides it is known.
   */
  total: Money
}

/** Gift wrapping for a whole order, offered as one row under the cart's lines. */
export interface CartGiftBox {
  price: Money
  /** True once the shopper has added it, which is when {@link price} counts toward {@link Cart.services}. */
  added: boolean
}

/**
 * Loyalty points spent on an order, and what they paid for.
 *
 * Stored as the count rather than as the money, so a cart that changes under a
 * shopper re-prices the same points instead of carrying a credit the order can
 * no longer absorb.
 */
export interface CartRewards {
  /** Points applied, already deducted from {@link Cart.total}. */
  points: number
  /** What they take off, at the program's own point value. */
  credit: Money
}

/** A discount code the shopper redeemed, and what it takes off. */
export interface CartDiscount {
  /** The code as the store spells it, not as the shopper typed it. */
  code: string
  /** What it takes off, already deducted from {@link Cart.total}. */
  amount: Money
}

/** One configured product in the cart, the quantity ordered, and what it comes to. */
export interface CartLine {
  /**
   * Identifies the line within its cart, and the only handle a screen has on it:
   * updating and removing take this. Stable for one product in one
   * configuration, which is what makes adding it twice raise the quantity
   * instead of opening a second line. The add-ons below are deliberately not
   * part of it, so changing a plan changes a line rather than opening another.
   */
  id: string
  productId: string
  /**
   * The product this line bought, by {@link Product.slug}. It is the handle
   * every catalog-side action takes, which is what lets a cart row save itself
   * to a wishlist without looking the product up by title.
   */
  productSlug: string
  title: string
  /** The photography for the configuration bought, so a color choice shows the color ordered. */
  image: ProductImage
  /** The same configuration on its own, for a cart drawn on cut-outs: its {@link ProductMedia.packshot}. */
  packshot?: ProductImage
  /**
   * The choices this line was bought in, in the order to show them. Absent for a
   * product that ships one way. Already resolved to labels, because a cart view
   * has no product to look ids up against.
   */
  options?: CartLineOption[]
  unitPrice: Money
  quantity: number
  /** {@link unitPrice} times {@link quantity}. */
  lineTotal: Money
  /** The same line at the product's compare-at price, struck through beside {@link lineTotal}. Absent off sale. */
  compareAtTotal?: Money
  /**
   * The bundle this line was bought as part of, by {@link Bundle.title}. Absent
   * for a line bought on its own, and the only thing on the row that explains
   * why it is priced below the catalog.
   */
  bundle?: string
  /** The day this line is expected to arrive, as `YYYY-MM-DD`. Absent where the store will not estimate one. */
  deliveryEstimate?: string
  /**
   * Protection plans offered for this line, in the order to present them. Absent
   * where the store sells none for the product. Resolved by the adapter, like
   * the labels above: the cart screen has no product to ask.
   */
  protectionPlans?: ProductProtectionPlan[]
  /** The plan the shopper took, one of {@link protectionPlans}. Its price is part of {@link Cart.services}. */
  protectionPlan?: ProductProtectionPlan
  /** The trade-in offer for this line's product. Absent where the store makes none. */
  tradeInOffer?: ProductTradeIn
  /** The device handed in against this line, and what it pays. Part of {@link Cart.tradeInCredit}. */
  tradeIn?: CartLineTradeIn
  /** Link back to the product page. */
  href: string
}

/** A device handed in against one cart line, quoted by the store rather than by the screen. */
export interface CartLineTradeIn {
  /** What was picked, by the ids on the line's {@link CartLine.tradeInOffer}. */
  selection: TradeInSelection
  /** The model as a shopper reads it back, e.g. `'iPhone 15 Pro'`. */
  model: string
  /** The condition it was quoted in, e.g. `'Like new'`. */
  condition: string
  /** What the store pays for it. */
  credit: Money
}

/** One resolved choice on a cart line, e.g. `{ label: 'Storage', value: '256 GB' }`. */
export interface CartLineOption {
  label: string
  value: string
}

/**
 * What a screen adds to the cart: a product, the choices made on its page, and
 * whatever was bought alongside it.
 *
 * Deliberately not a variant id. The template's product model configures a
 * product with a color and a set of options (see {@link ProductOption}), and
 * which SKU that combination resolves to is the adapter's problem: a
 * variant-based backend looks one up from these, a single-SKU one ignores them.
 */
export interface CartLineInput {
  /** The product being added, by {@link Product.slug}. */
  productSlug: string
  /**
   * How many to add. Added to what the matching line already holds.
   * @default 1
   */
  quantity?: number
  /** The chosen finish, by {@link ProductColor.name}. Omit for a single-color product. */
  color?: string
  /** The chosen option values, by {@link ProductOption.id} to {@link ProductOptionValue.id}. */
  options?: Record<string, string>
  /** The protection plan bought with it, by {@link ProductProtectionPlan.id}. Omit for none. */
  protectionPlanId?: string
  /** A device handed in against it. Omit for none. */
  tradeIn?: TradeInSelection
}

/**
 * What can change about a line already in the cart. Every field left out is left
 * alone, so a screen changing a plan does not have to restate the quantity.
 */
export interface CartLinePatch {
  /** How many the shopper is taking, always 1 or more. Taking the line out is `removeCartLine`. */
  quantity?: number
  /** The protection plan on the line, by id. `null` takes the plan off. */
  protectionPlanId?: string | null
  /** The device handed in against the line. `null` withdraws it. */
  tradeIn?: TradeInSelection | null
}

/** What can change about the cart itself, rather than about one line in it. */
export interface CartPatch {
  /** Whether the order is gift wrapped. */
  giftBox?: boolean
  /** A discount code to redeem. `null` drops the one applied. */
  discountCode?: string | null
  /**
   * How many loyalty points to stake on the order. `null` or `0` takes them all
   * back off.
   *
   * A count, never a figure: the adapter prices it, and `updateCartAction`
   * clamps it against the balance the shopper actually holds before the adapter
   * ever sees it. A number arriving from a browser is a number somebody can
   * edit, which is the same reason a trade-in is sent as a selection.
   */
  rewardPoints?: number | null
  /** How the order reaches the shopper. `null` clears the choice, and the shipping with it. */
  delivery?: CartDelivery | null
}

export interface CartState {
  cart: Cart
  token: string | null
}

/**
 * One way an order can reach the shopper, as the checkout offers it.
 *
 * Delivery is chosen for the whole order rather than per line, which is how
 * most backends price shipping from a single location. A backend that really
 * does split a shipment maps its primary group onto this list.
 */
export interface DeliveryOption {
  id: string
  /** How the store names it, e.g. `'Standard delivery'`. */
  name: string
  /** What it adds to the order. An amount of `0` is shown as "Free". */
  price: Money
  /** A line under the name: the store a pickup happens at, what a courier will do at the door. */
  description?: string
  /** When it is expected. Absent where the store will not estimate. */
  arrival?: DeliveryWindow
  /**
   * The days a shopper picks a time window from, for an option that books one.
   * An option with a schedule cannot be ordered until a slot is picked, which is
   * why it is never the {@link preselected} one.
   */
  schedule?: DeliveryDay[]
  /**
   * Who actually moves the parcel. Absent where nobody does, which is what a
   * pickup is, and where the store does not say who it hands off to.
   */
  carrier?: DeliveryCarrier
  /**
   * The store the order is collected from, for an option collected rather than
   * delivered. The order records its address as the shipping address, under the
   * collector's name, so a checkout offering it needs no street address from the
   * shopper.
   */
  pickup?: PickupLocation
  /**
   * Marks the option a shopper who changes nothing gets, so the order can be
   * paid for without touching this section. Normally the cheapest option that
   * actually delivers, and never one that books a slot, which would leave the
   * order incomplete. Exactly 1 option carries it.
   */
  preselected?: boolean
}

/** A store an order can be collected from, as a pickup option names it. */
export interface PickupLocation {
  /** How a shopper knows the store, e.g. `'Copenhagen'`. */
  name: string
  /** Where it is. Everything an {@link Address} holds except who it is for. */
  address: Omit<Address, 'firstName' | 'lastName' | 'phone'>
  /** When the counter is open, in the store's own words. */
  hours?: string
  /** A photograph of the store. Absent where the store has none. */
  image?: ProductImage
}

/**
 * The company carrying an order, as the receipt names it. Separate from the
 * option a shopper picked: "Standard delivery" is what the store sells, and this
 * is who it bought that from.
 */
export interface DeliveryCarrier {
  /** The company, e.g. `'Group Express'`. */
  name: string
  /** How long they take, in their own words, e.g. `'Est. 2 - 4 days shipping'`. */
  note?: string
  /** Their mark, square. Absent where the store has no artwork for them. */
  logo?: ProductImage
}

/** When an order is expected, as an inclusive range of `YYYY-MM-DD` days. */
export interface DeliveryWindow {
  from: string
  /** Absent for an option that names a single day. */
  to?: string
}

/** One bookable day, and the windows still open on it. */
export interface DeliveryDay {
  /** The day, as `YYYY-MM-DD`. */
  date: string
  slots: DeliverySlot[]
}

/** One bookable window within a {@link DeliveryDay}. */
export interface DeliverySlot {
  id: string
  /** Start and end as 24-hour `HH:mm`. Formatted for display with `formatTimeRange`. */
  from: string
  to: string
}

/** The delivery a shopper picked, by the ids on {@link Cart.deliveryOptions}. */
export interface CartDelivery {
  optionId: string
  /** The window booked, for an option that schedules one. */
  slot?: DeliverySlotSelection
}

/** One booked window, by the day it falls on and the slot chosen within it. */
export interface DeliverySlotSelection {
  /** The day, as `YYYY-MM-DD`. */
  date: string
  slotId: string
}

/**
 * A postal address, as the checkout collects it and an order records it.
 *
 * Deliberately flat and shallow. Every backend spells an address its own way,
 * so the adapter renames these 8 fields and the screens never learn which
 * backend they are talking to.
 */
export interface Address {
  firstName: string
  lastName: string
  /** ISO 3166-1 alpha-2, e.g. `'US'`. */
  countryCode: string
  /** Town or city. */
  city: string
  /** State, province, or region. Absent for a country that has none. */
  state?: string
  postcode: string
  /** House or apartment number and street. */
  line1: string
  /** Reached on the delivery day, in E.164 where the shopper gave a country code. */
  phone?: string
}

/**
 * How an order was paid for, as a domain value rather than a brand.
 *
 * Like {@link ProductBadge}, the storefront maps each to a label and a mark in 1
 * place, so an adapter only has to translate whatever its provider calls these.
 * A store that takes a method not listed here extends the union and the map
 * beside it.
 */
export type PaymentMethodId = 'card' | 'klarna' | 'paypal' | 'apple-pay' | 'google-pay'

/**
 * What the checkout submits to place an order. The cart it is placed against
 * comes from the visitor's cart token, never from here: a Server Action is a
 * public endpoint, and a request naming its own lines would name its own prices.
 *
 * There is no card number in this shape, on purpose. Card details belong to the
 * payment provider's own hosted field and must never reach your server, so the checkout collects them client-side and
 * sends only which method was used.
 */
export interface CheckoutInput {
  /** Where the confirmation goes. */
  email: string
  /**
   * Where the order goes. For a collected order the adapter keeps the name and
   * phone and records the store's {@link PickupLocation.address} instead.
   */
  shippingAddress: Address
  paymentMethod: PaymentMethodId
  /**
   * The scheme and last 4 digits of the card used, for the receipt to name it.
   * A real integration reads these off what the provider returns from its own
   * field, never off an input this app rendered.
   */
  card?: OrderCard
  /** What the shopper typed into "Order notes". */
  notes?: string
  /** The note printed on the card in a gift-wrapped order. Absent where none was written. */
  giftMessage?: string
  /** Whether a guest asked for an account to be opened once the order is placed. */
  createAccount?: boolean
}

/**
 * A placed order: what the order confirmation reads back, and what an order lookup
 * shows later. Unlike a {@link Cart}, no figure on it changes again, so every one
 * is what was charged.
 *
 * {@link Order.tracking} is the exception, and the only part that still moves: a
 * parcel goes on travelling after the money has stopped. It rides along here
 * rather than behind a second read, which is also how the backends this template
 * targets return it.
 */
export interface Order {
  /** What a shopper quotes to support, e.g. `'APC-24810'`. */
  number: string
  /** When it was placed, as an ISO timestamp. */
  placedAt: string
  /** Where the confirmation was sent. */
  email: string
  /** What was bought, in the configuration it was bought in. */
  lines: CartLine[]
  shippingAddress: Address
  delivery: OrderDelivery
  /** Where the parcel has got to, and what the store still lets be changed about it. */
  tracking: OrderTracking
  paymentMethod: PaymentMethodId
  /** The card it was charged to, for a receipt that names one. Absent for every other method. */
  card?: OrderCard
  /**
   * The wallet account charged, as its provider hands it back: PayPal returns
   * the payer's email. What {@link card} is for a card, so a receipt says
   * *which* account paid rather than only that a wallet did.
   *
   * Deliberately not on {@link CheckoutInput}: like the carrier's tracking
   * number, the provider is the source of this, never a field the storefront
   * rendered. Absent for a card and for the wallets that return nothing worth
   * printing. Screens mask it before showing it.
   */
  walletAccount?: string
  subtotal: Money
  /** What the add-ons came to. Absent where the order carried none. */
  services?: Money
  /** What the sale prices took off {@link subtotal}. Absent where nothing was on sale. */
  savings?: Money
  /** What the handed-in devices paid. Absent where none were. */
  tradeInCredit?: Money
  /** The code redeemed, absent where none was. */
  discount?: CartDiscount
  /** The loyalty points spent on it, absent where none were. */
  rewards?: CartRewards
  shipping: Money
  /** What was charged. */
  total: Money
  notes?: string
  /** The note on the gift card, absent where none was written. */
  giftMessage?: string
}

/**
 * The card on a receipt. Never enough to charge with, and deliberately so: a
 * payment provider hands back the scheme and the last 4 digits precisely because
 * those are the only parts safe to store and show.
 */
export interface OrderCard {
  /** The scheme, spelled as it should read, e.g. `'Mastercard'`. */
  brand: string
  /** The last 4 digits of the number. */
  last4: string
}

/** How a placed order is reaching the shopper, resolved from the option they chose. */
export interface OrderDelivery {
  /** The option's name as the store offered it, e.g. `'Doorstep delivery'`. */
  name: string
  price: Money
  arrival?: DeliveryWindow
  /** The window booked, for an option that scheduled one. */
  slot?: OrderDeliverySlot
  /** Who is carrying it, copied from the option at the moment it was ordered. */
  carrier?: DeliveryCarrier
  /** The store it is collected from, for a collected order. Its address is also {@link Order.shippingAddress}. */
  pickup?: PickupLocation
  /**
   * The carrier's own consignment number, which is not {@link Order.number}: the
   * store mints an order number at checkout, the carrier issues this when it
   * takes the parcel. Absent until then, and absent for good on an order nobody
   * carries, so a screen showing it has to handle its not being there yet.
   */
  trackingNumber?: string
}

/** A booked delivery window, resolved to the day and hours it falls on. */
export interface OrderDeliverySlot {
  /** The day, as `YYYY-MM-DD`. */
  date: string
  /** Start and end as 24-hour `HH:mm`. */
  from: string
  to: string
}

/**
 * How far along an order is, as the 4 stages a shopper is told about. Carriers
 * report dozens of scan codes; a tracker that lists them all answers "where is my
 * parcel" worse than one that does not.
 *
 * A store with its own vocabulary extends the union and the labels beside it, the
 * way {@link PaymentMethodId} is extended. Cancellations and refunds are not
 * points on this line: add them as their own field when the account order history
 * needs them.
 */
export type OrderStatus = 'confirmed' | 'processing' | 'out-for-delivery' | 'delivered'

/** One stage on the tracker, in the order the stages happen. */
export interface OrderTrackingStep {
  status: OrderStatus
  /** How this stage reads to a shopper, e.g. `'Out for delivery'`. */
  label: string
  /** When it happened, as an ISO timestamp. Absent for a stage not reached yet. */
  at?: string
  /** A live note on the stage in progress, e.g. `'In transit'`. Absent on every other stage. */
  note?: string
  /** How far through this stage the order is, `0` to `100`. */
  progress: number
}

/**
 * Where an order has got to, and what that still allows.
 *
 * The permissions are the store's answer rather than the screen's: they are
 * policy, they differ per backend, and a page deciding them for itself would
 * offer a shopper an action their store refuses.
 */
export interface OrderTracking {
  /** The stage the order is in now. */
  status: OrderStatus
  /** Every stage, reached or not, in order. */
  steps: OrderTrackingStep[]
  /** Whether the delivery address can still be changed. False once the parcel has left. */
  addressEditable: boolean
  /** Whether a return can still be opened against it. */
  returnable: boolean
  /**
   * The days a booked delivery window can move to, with the windows open on
   * each. Absent for an order that booked none, and once its day is too close.
   */
  reschedule?: DeliveryDay[]
}

/**
 * A placed order and the handle it is read back by. The token is opaque to the
 * storefront exactly like a cart token: a real backend returns its order id, and
 * `lib/checkout` puts it in a cookie.
 */
export interface OrderState {
  order: Order
  token: string
}

/**
 * How the account's order history narrows a customer's orders.
 * `src/lib/account-orders.ts` is the only place that knows how these are spelled
 * in a URL.
 *
 * There is no sort: a history runs newest first, and an older order is reached
 * through {@link search} rather than by reordering the list.
 */
export interface OrderQuery {
  /** Only orders in this stage. Absent shows every stage. */
  status?: OrderStatus
  /**
   * Free text, matched against whatever a shopper has to hand: the order number,
   * the carrier's, the products, the date. An adapter decides how loosely, but
   * never narrower than the product titles.
   */
  search?: string
  /**
   * 1-based page.
   * @default 1
   */
  page?: number
  /** Orders per page. The adapter picks its own default when this is absent. */
  pageSize?: number
}

/** One page of a customer's orders, newest first. */
export interface OrderList {
  orders: Order[]
  /** Orders matching the query, before pagination. */
  total: number
  /** Current 1-based page. */
  page: number
  pageCount: number
}
