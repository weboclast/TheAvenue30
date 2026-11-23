# Commerce

The data layer: the seam between the storefront and whatever backend supplies
the catalog, the cart, the wishlists, and the orders. Client-safe: `types.ts`,
`format.ts`, and `card-product.ts`. Writing a new adapter is the
`commerce-adapter` skill.

- **`types.ts` is the contract.** Screens import it and the `index.ts` facade,
  never an adapter. An adapter-specific type reaching a component is a bug, so
  map it in the adapter.
- **Only the catalog, the cart, the wishlists, and the orders are required.**
  Merchandising and reviews are optional methods that the facade answers empty,
  so a section with nothing behind it renders nothing. Add the next
  merchandising read as optional too.
- **`getCommerce` is server-only.** Client Components get data as props from a
  Server Component, or through a Server Action.
- **A product card takes a `CardProduct`.** Trim with `toCardProduct` where a
  Server Component hands products to a card. A whole `Product` type-checks there
  too, and puts the product page's spec sheet and gallery in the page data.
- **`Money.amount` is in major units**: `1299.0` is $1,299.00. Format it with
  `formatMoney`, never by concatenating the currency.
- **Every read is scoped to a demo.** A single-store backend maps every slug to
  its one store.
- **A feature no backend has a field for is a program, not product data.**
  Protection plans, trade-in, smart comparison, and the shopping assistant's
  prompts live in `programs/` and reach screens through the facade, so they work
  on every adapter. Each picks its products with the rule in
  `programs/eligibility.ts`, so a store turns one on by naming categories and a
  price floor. A program may also need product data (smart comparison needs a
  `specSheet`), and an adapter that holds the real data returns it on the product
  and wins.
- **The writes carry a token.** The cart and wishlist methods take the visitor's
  opaque token and return the new state with whatever token now addresses it,
  so the adapter decides what a cart is. `lib/cart`, `lib/wishlist`,
  `lib/checkout`, and `lib/orders` are the only modules outside this one that
  import the adapter.
- **A bundle is adapter data**: `getBundles` reads one and `addCartBundle` buys it.
  Its discount is authored per item, never as a share of the set, which would
  put most of it on the expensive product: 12% off a $1,099 phone and a $49 case
  takes $132 off the phone. Per item, each line is what a refund, a tax rate, and
  a return need.
- **Featured reviews are adapter data**: `getFeaturedReviews` returns the
  merchant's picks with the store's rating beside them. That rating counts every
  review, picked or not, and a `StoreReview` counts toward it and toward no
  product's.
