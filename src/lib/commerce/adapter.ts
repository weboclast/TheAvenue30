import type { DemoSlug } from '@/lib/demos'
import type {
  BannerPlacement,
  Bundle,
  BundleChoice,
  CampaignBanner,
  Collection,
  CartLineInput,
  CartLinePatch,
  CartPatch,
  CartState,
  Category,
  CategoryPromo,
  CategoryShelf,
  CategoryTag,
  CheckoutInput,
  FeaturedReviewList,
  GridCampaign,
  HeroCampaign,
  HeroSlide,
  NavMenu,
  Order,
  OrderList,
  OrderQuery,
  OrderState,
  Product,
  ProductBanner,
  ProductList,
  ProductQuery,
  ProductReviewList,
  SearchSuggestionQuery,
  SearchSuggestions,
  ShoppableScene,
  VisualSearchSample,
  WishlistInput,
  WishlistItemInput,
  WishlistItemRef,
  WishlistPatch,
  WishlistState,
} from './types'

/**
 * The contract between the storefront and its commerce backend. The template
 * ships 1 implementation, the demo data in `./adapters/demo/`, and connecting a
 * real backend means writing another and selecting it in `./config.ts`.
 *
 * The catalog, the cart, the wishlists, and the orders are required. The
 * optional methods are merchandising and reviews a backend may not hold: leave
 * one out and the facade answers it empty, so the section it feeds renders
 * nothing. Every read is scoped to a `demo`, which a single-store backend maps
 * to its one store, and reads must be side-effect free because they run during
 * rendering.
 */
export interface CommerceAdapter {
  /** Primary navigation and mega-menu content for a demo. */
  getMenu(demo: DemoSlug): Promise<NavMenu>

  /** A demo's category taxonomy as a tree of top-level {@link Category} nodes. */
  getCategoryTree(demo: DemoSlug): Promise<Category[]>

  /**
   * The departments a shopper picks between before anything else, in the order
   * to offer them: Women and Men in a clothing store. The first is the default,
   * where a first visit lands.
   *
   * Top-level categories, but not every top-level category is one: 6 of those
   * is 6 aisles, not 6 departments. Empty for a store that doesn't divide its
   * catalog this way, which takes the switch off its header entirely.
   */
  getDepartments?(demo: DemoSlug): Promise<Category[]>

  /** A single category by slug within a demo, or `null` if it does not exist. */
  getCategory(demo: DemoSlug, slug: string): Promise<Category | null>

  /**
   * The slides the storefront's home page opens with, in the order to present
   * them. Empty for a demo that leads with something else, which renders no
   * hero at all rather than an empty frame.
   *
   * Its own read rather than a {@link BannerPlacement}, because the hero is not
   * a banner: each slide places a cut-out by hand and sells 1 product from a
   * card standing behind it. A slide naming a product the catalog no longer
   * carries is dropped here, so the page never renders a hero quoting a price
   * nothing has.
   */
  getHeroSlides?(demo: DemoSlug): Promise<HeroSlide[]>

  /**
   * The campaigns a home opens with, in running order. Empty where none are
   * merchandised. Pass a department's slug for its own home; neither list falls
   * back to the other.
   */
  getHeroCampaigns?(demo: DemoSlug, department?: string): Promise<HeroCampaign[]>

  /**
   * The rooms the home's hero shows, in tab order, each photographed with the
   * store's own pieces tagged in it. A tag naming a product the catalog no
   * longer carries, or cannot sell right now, is dropped. Empty where none are
   * merchandised.
   */
  getShoppableScenes?(demo: DemoSlug): Promise<ShoppableScene[]>

  /**
   * The photos visual search offers to try, each match holding the 1 piece
   * tagged there, sold out or not; the facade fills the rest of its row. A tag
   * naming a product the catalog no longer carries is dropped. Pass a
   * department's slug for its own: those and the ones with no department.
   * Empty where none are merchandised.
   */
  getVisualSearchSamples?(demo: DemoSlug, department?: string): Promise<VisualSearchSample[]>

  /**
   * Featured-product banners for a category, in the order to present them.
   * Empty when nothing is promoted there.
   *
   * A category that promotes nothing inherits from its nearest ancestor that
   * does, so one campaign can cover a whole branch and a single subcategory can
   * still override it. The adapter resolves that, not the page, so every
   * backend inherits the same way.
   */
  getCategoryBanners?(demo: DemoSlug, categorySlug: string): Promise<ProductBanner[]>

  /**
   * Editorial campaigns across the top of a category listing, in display order.
   * Not inherited, unlike {@link getCategoryBanners}: a campaign shows only on
   * the category it is filed under.
   */
  getCategoryCampaigns?(demo: DemoSlug, categorySlug: string): Promise<CampaignBanner[]>

  /**
   * Editorial campaigns a category places in cells of its product grid, in
   * position order. Not inherited, and hidden by the listing on a refined view.
   * Leave out the slug for the catalog's own listing, the one no category
   * narrows. See {@link GridCampaign}.
   */
  getCategoryGridCampaigns?(demo: DemoSlug, categorySlug?: string): Promise<GridCampaign[]>

  /**
   * The banners a category promotes *below* its products, laid out as a grid
   * rather than a hero. Empty when nothing is promoted there.
   *
   * Authored separately from {@link getCategoryBanners} so a category can lead
   * with one campaign and close with another, and inherited the same way.
   */
  getCategoryTiles?(demo: DemoSlug, categorySlug: string): Promise<ProductBanner[]>

  /**
   * The same grid of tiles, for a page that is not a category listing: the
   * cart, the checkout, the storefront home. Empty where the placement is
   * unfilled, which is most of them in a store that runs 1 campaign at a time.
   *
   * Nothing is inherited here, because a placement has no taxonomy above it to
   * inherit from. A merchandiser names the tiles each page carries, and the same
   * campaign can appear on a category listing and on the cart without being
   * authored twice.
   */
  getPlacementTiles?(demo: DemoSlug, placement: BannerPlacement): Promise<ProductBanner[]>

  /**
   * The campaigns a page lays out as a mosaic rather than a row of equals: a
   * square feature, a wide banner beside it, and the 2 squares below that.
   * Empty where the placement is unfilled.
   *
   * Read positionally, so the order is the layout and the frames are fixed. A
   * placement carrying fewer than 4 shows nothing.
   */
  getPlacementMosaic?(demo: DemoSlug, placement: BannerPlacement): Promise<ProductBanner[]>

  /**
   * The campaign a category places *inside* its product grid, or `null` where
   * none is merchandised. The 1 kind of category merchandising that is not
   * inherited: a promo is placed on the categories it belongs in, by name. See
   * {@link CategoryPromo} for why.
   *
   * Returning one does not mean showing one: the listing decides that, and hides
   * it on a refined or paged-on view. See {@link CategoryPromo}.
   */
  getCategoryPromo?(demo: DemoSlug, categorySlug: string): Promise<CategoryPromo | null>

  /**
   * Campaigns drawn at promo size for a page that is not a category listing, in
   * the order to present them. Empty where nothing is merchandised there.
   *
   * The portrait counterpart of {@link getPlacementTiles}: same data, different
   * frame, picked by the space a placement has.
   */
  getPlacementPromos?(demo: DemoSlug, placement: BannerPlacement): Promise<ProductBanner[]>

  /**
   * Editorial campaigns for a page that is not a category listing, in the order
   * to present them. Empty where nothing is merchandised there.
   *
   * The {@link CampaignBanner} counterpart of {@link getPlacementPromos}, for a
   * storefront whose merchandising is photography rather than products. Pass a
   * department's slug for its own pages, such as its home or its menu; neither
   * list falls back to the other.
   */
  getPlacementCampaigns?(demo: DemoSlug, placement: BannerPlacement, department?: string): Promise<CampaignBanner[]>

  /**
   * The store's curated collections, in the order to present them, each with
   * its look resolved against the catalog. Empty for a store that merchandises
   * none. Pass a department's slug for the ones its page lists: its own, and
   * those with no department.
   */
  getCollections?(demo: DemoSlug, department?: string): Promise<Collection[]>

  /** A single collection by slug, or `null` if it does not exist. */
  getCollection?(demo: DemoSlug, slug: string): Promise<Collection | null>

  /**
   * Merchandised search terms offered as chips below a category listing, in the
   * order to present them. Empty where none are authored.
   *
   * Each one carries the refinement it applies, so a chip can express a
   * combination the sidebar would take several clicks to reach. Inherited the
   * same way as the banners, which is what lets a subcategory offer sharper
   * tags than the branch it hangs off.
   *
   * A tag that matches nothing in *this* category is left out. Inheritance
   * hands a narrow subcategory the whole branch's row, and most of it means
   * nothing there: without this, an E-Readers listing holding 1 Kindle offers
   * "iPhone 17" and empties itself when the shopper takes it. A backend that
   * can't check cheaply should author tags per category instead of returning
   * them all.
   */
  getCategoryTags?(demo: DemoSlug, categorySlug: string): Promise<CategoryTag[]>

  /**
   * The curated shelf below a category listing, or `null` where none is
   * merchandised. Inherited the same way as the banners.
   */
  getCategoryShelf?(demo: DemoSlug, categorySlug: string): Promise<CategoryShelf | null>

  /**
   * The "buy together" offers this store runs, in the order to present them.
   * Empty for a store that bundles nothing.
   *
   * Each one arrives with its products resolved and its price counted, so no
   * screen adds a set up. Buying one is {@link addCartBundle}.
   */
  getBundles?(demo: DemoSlug): Promise<Bundle[]>

  /** A filtered, sorted catalog listing for a demo. Called with no query returns everything. */
  listProducts(demo: DemoSlug, query?: ProductQuery): Promise<ProductList>

  /** A single product by slug within a demo, or `null` if it does not exist. */
  getProduct(demo: DemoSlug, slug: string): Promise<Product | null>

  /**
   * What the header's search panel shows while a shopper types: suggested
   * terms, the products matching so far, and the total behind them.
   *
   * Apart from {@link listProducts} because a backend with a predictive search
   * endpoint answers all 3 in 1 request. Without one, run the ordinary search
   * and return `terms: []`.
   */
  getSearchSuggestions(demo: DemoSlug, query: SearchSuggestionQuery): Promise<SearchSuggestions>

  /**
   * Every review a product carries, newest first, with the aggregate and star
   * histogram they roll up to. Empty for a product nobody has reviewed. The whole
   * set comes back in one read on purpose (see {@link ProductReviewList});
   * {@link ProductReviewList.summary} is optional and the facade fills it in.
   */
  getProductReviews?(demo: DemoSlug, slug: string): Promise<ProductReviewList>

  /**
   * The reviews a store picked to quote away from its product pages, in the
   * order to show them, with the rating every review it holds adds up to. Empty
   * where none are picked.
   *
   * Picked by hand from product and store reviews alike, the way a review
   * platform lets a merchant feature them. Drop a pick whose product has left
   * the catalog.
   */
  getFeaturedReviews?(demo: DemoSlug): Promise<FeaturedReviewList>

  /**
   * Every wishlist the `token` addresses, in the order to present them, each
   * with its saved products resolved against the catalog. Empty for a visitor
   * who has saved nothing.
   *
   * The token is whatever the last wishlist call returned, handed back from the
   * visitor's cookie by `lib/wishlist`, and it works the way the cart's does:
   * side-effect free, and `null` means no lists rather than an error. Exactly 1
   * of the lists carries `default`, which is the one {@link addWishlistItem}
   * saves into when the input names none.
   */
  getWishlists(demo: DemoSlug, token: string | null): Promise<WishlistState>

  /**
   * Opens a list, points new saves at it, and creates the wishlist store when
   * there is no token yet. Somebody who just named a list is about to fill it.
   *
   * Throw with a message a shopper can read (a name already taken, a cap on how
   * many lists an account keeps): the Server Action calling this returns it for
   * the screen to show.
   */
  createWishlist(demo: DemoSlug, token: string | null, input: WishlistInput): Promise<WishlistState>

  /** Renames a list, rewrites its description, or points new saves at it. Fields the patch leaves out are left alone. */
  updateWishlist(demo: DemoSlug, token: string | null, id: string, patch: WishlistPatch): Promise<WishlistState>

  /**
   * Deletes a list and everything saved in it. Deleting the last one leaves no
   * lists, not a broken token; deleting the default one hands that to another,
   * because a heart always needs somewhere to save.
   */
  deleteWishlist(demo: DemoSlug, token: string | null, id: string): Promise<WishlistState>

  /**
   * Saves a product, into the list the input names or the `default` one
   * otherwise. Opens a first list for a visitor who has none, so a heart works
   * before a shopper has thought about lists at all. Saving something already in
   * the list leaves it where it is rather than doubling it.
   *
   * Throw the same way {@link createWishlist} does for a save the store refuses.
   */
  addWishlistItem(demo: DemoSlug, token: string | null, input: WishlistItemInput): Promise<WishlistState>

  /** Takes items out, across as many lists as the refs name. An item already gone is not an error. */
  removeWishlistItems(demo: DemoSlug, token: string | null, items: WishlistItemRef[]): Promise<WishlistState>

  /**
   * Moves items into another list, taking them out of the ones they were in. An
   * item already in the destination is left there rather than doubled.
   */
  moveWishlistItems(
    demo: DemoSlug,
    token: string | null,
    items: WishlistItemRef[],
    wishlistId: string,
  ): Promise<WishlistState>

  /**
   * The cart a `token` addresses, or an empty cart when the token is `null` or
   * no longer names anything. The token is whatever the last cart call returned,
   * handed back from the visitor's cookie by `lib/cart`.
   *
   * Side-effect free like every other read, which is what lets a page render it.
   * A backend that only creates carts on write returns an empty one here rather
   * than opening a cart for a visitor who is still browsing.
   */
  getCart(demo: DemoSlug, token: string | null): Promise<CartState>

  /**
   * Adds a configured product, raising the quantity of the matching line when
   * the same configuration is already in the cart. Creates the cart when there
   * is no token yet.
   *
   * Throw with a message a shopper can read (nothing in stock, a quantity cap):
   * the Server Action calling this returns it for the screen to show.
   */
  addCartLine(demo: DemoSlug, token: string | null, line: CartLineInput): Promise<CartState>

  /**
   * Changes one line: its quantity, its protection plan, the device handed in
   * against it. Fields the patch leaves out are left alone.
   *
   * Throw the same way {@link addCartLine} does for a change the store refuses.
   */
  updateCartLine(demo: DemoSlug, token: string | null, lineId: string, patch: CartLinePatch): Promise<CartState>

  /**
   * Adds every product in a bundle, at the bundle's own price. All or nothing: a
   * backend that sells the set as a product of its own adds that product, and one
   * that does not adds the parts with the discount spread across them. Leave it
   * out with {@link getBundles} in a store that sells no bundles.
   *
   * 1 call rather than several {@link addCartLine}s, because the price belongs to
   * the set: a screen that added the parts itself would be naming what they cost.
   *
   * Throw the same way {@link addCartLine} does for an offer the store will not
   * sell, which includes a part that has gone out of stock. `choices` follow the
   * offer's items, and one left out takes the offer's color and default options.
   */
  addCartBundle?(demo: DemoSlug, token: string | null, bundleId: string, choices?: BundleChoice[]): Promise<CartState>

  /** Takes a line out. Removing the last one leaves an empty cart, not a broken token. */
  removeCartLine(demo: DemoSlug, token: string | null, lineId: string): Promise<CartState>

  /**
   * Changes the cart itself rather than a line in it: gift wrapping, a discount
   * code. Throw with a message a shopper can read for a code the store will not
   * honor.
   */
  updateCart(demo: DemoSlug, token: string | null, patch: CartPatch): Promise<CartState>

  /**
   * Turns the cart a `token` addresses into an order, and hands back the handle
   * the order is read by. The cart is emptied by the same call, so the token
   * that placed the order stops addressing anything.
   *
   * The only write on this interface that is not the cart, and the one place a
   * shopper's own details are sent. Card data is deliberately not among them:
   * see {@link CheckoutInput}.
   *
   * Throw with a message a shopper can read for an order the store will not take
   * (an empty cart, an address it does not ship to, a payment that was refused),
   * the same way {@link addCartLine} does.
   */
  placeOrder(demo: DemoSlug, token: string | null, input: CheckoutInput): Promise<OrderState>

  /**
   * A placed order by the token {@link placeOrder} returned, or `null` when the
   * token names nothing. Side-effect free like every other read.
   */
  getOrder(demo: DemoSlug, token: string | null): Promise<Order | null>

  /**
   * Guest order lookup: the order matching both the order `number` and the
   * `email` it was placed with, and the token to read it back by. `null` when
   * nothing matches, which is an ordinary answer rather than an error.
   *
   * A backend that can find an order by number alone must still check the email
   * here. Order numbers run in sequence, and the screen behind this shows a home
   * address, a phone number, and what somebody bought.
   *
   * The token is the capability, exactly as the cart's is, and
   * `src/lib/orders/` is what keeps it.
   */
  lookupOrder(demo: DemoSlug, number: string, email: string): Promise<OrderState | null>

  /**
   * One page of the orders placed by `email`, newest first, narrowed by `query`.
   *
   * The 1 order read that takes no token: what entitles the caller is a
   * signed-in session, which `src/lib/orders/` resolves to an email first. Never
   * expose it to an address a visitor merely typed, or the history becomes the
   * enumeration oracle {@link lookupOrder} is careful not to be.
   *
   * A backend keyed by customer id looks the customer up here; the storefront
   * has no id every backend agrees on.
   */
  listOrders(demo: DemoSlug, email: string, query: OrderQuery): Promise<OrderList>
}
