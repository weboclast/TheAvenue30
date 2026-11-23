---
name: commerce-adapter
description: >-
  Connects this template to a real commerce backend (Shopify, WooCommerce,
  Medusa, BigCommerce, Saleor, commercetools, or a custom API) by writing an
  adapter behind its typed commerce interface, then removing the demo data. Use
  when asked to "connect my Shopify store", "hook up the real products",
  "replace the fake data", "pull the catalog from our API", or "wire up
  WooCommerce", and whenever the catalog, cart, checkout, or account pages
  should read live data. Covers the required and optional methods, the cart
  token, the mapping traps that silently produce a half-empty storefront, the
  blog, sign-in, and account seams, and the demo scaffolding to delete. Not for
  changing what a screen looks like, which is the appica-ui skill.
license: MIT
---

# Write a commerce adapter

The storefront never calls a backend. It calls a typed facade, which delegates
to 1 adapter. The template ships exactly 1, the demo data, and no adapter for any
platform: connecting a real backend means writing an adapter that maps that
backend's payloads onto the template's domain types. **No screen changes,
ever.** If you find yourself editing a component to fit the backend, the mapping
belongs in the adapter instead.

## Read these first, in this order

The seam is documented in the source, which is current in a way this skill
cannot be:

1. `src/lib/commerce/adapter.ts` is the interface, every method async. Its JSDoc
   covers the `demo` scoping, why reads must be side-effect free, and which
   methods are optional.
2. `src/lib/commerce/types.ts` is the domain model. Read a type's JSDoc before
   inventing a mapping for it: it says what each field means to a screen, which
   is what your backend's field has to be mapped onto.
3. `src/lib/commerce/adapters/demo/index.ts` is the reference implementation.
   Every real adapter answers the same questions this one does.
4. `src/lib/commerce/config.ts` is the 1 line that binds the adapter.

## Required and optional

The methods without a `?` on the interface are required, because no storefront
works without them:

- **Catalog:** `getMenu`, `getCategoryTree`, `getCategory`, `listProducts`,
  `getProduct`, `getSearchSuggestions`.
- **Cart:** `getCart`, `addCartLine`, `updateCartLine`, `removeCartLine`,
  `updateCart`.
- **Wishlists:** `getWishlists` and its 6 writes.
- **Orders:** `placeOrder`, `getOrder`, `lookupOrder`, `listOrders`.

The rest are optional: departments, every hero, banner, campaign, and placement
read, collections, category tags and shelves, bundles with `addCartBundle`, and
product and featured reviews. Leave one out and the facade answers it empty, so
the section it feeds renders nothing. Implement it when the data exists
somewhere: a CMS, your platform's custom content, a reviews platform.

## The procedure

Copy this checklist into your reply and tick it off as you go:

```
- [ ] 1. Adapter created beside the demo one
- [ ] 2. Catalog reads
- [ ] 3. Cart
- [ ] 4. Wishlists
- [ ] 5. Orders
- [ ] 6. Optional reads the backend has data for
- [ ] 7. Bound in config.ts, and compared with the demo adapter
- [ ] 8. Configuration documented at the top of the adapter
- [ ] 9. Other seams moved, where the backend holds that data
- [ ] 10. Demo removed, and pnpm verify passes
```

1. **Create `src/lib/commerce/adapters/<name>/index.ts`** exporting a
   `CommerceAdapter`. Build it beside the demo adapter, which keeps working until
   you switch.
2. **Implement the catalog reads.** Start with `getMenu`, `getCategoryTree`, and
   `getProduct`, which are enough to render a storefront and a product page.
   `listProducts` is the involved one, because it owns filtering, sorting, and
   pagination. `getSearchSuggestions` may run the ordinary search and return no
   terms.
3. **Implement the cart**, which is 5 methods and 1 idea: see "The cart token"
   below. `getCart` may return an empty cart and the mutations may throw until
   you get to it, and the storefront stays usable in the meantime.
4. **Implement the wishlists**, which are 7 methods carrying a token exactly as
   the cart's do, against your own list tables. `getWishlists` may return `[]`
   and the mutations may throw until you get to it: the hearts stay empty, and
   nothing else breaks. Return the customer's list id as the token, minted on the
   first save, and a guest's saves carry into the account they later create.
5. **Implement the orders**: `placeOrder`, `getOrder`, `lookupOrder`, and
   `listOrders`. The first 3 carry a token the way the cart does, and here it is
   also what entitles a visitor to see the order: `lookupOrder` must check the
   email server-side and answer `null` for a miss without saying which half was
   wrong. `Order.tracking` is where your backend's fulfillment events land, and
   it decides whether the screens offer an address change or a return.
   [references/other-seams.md](references/other-seams.md) has the queries the
   order screens need beyond these 4.
6. **Add the optional reads you have data for**, in any order.
7. **Wire it in** `src/lib/commerce/config.ts`: import your adapter and put it in
   place of `demoAdapter`. Flip the line back to compare the 2 on the same
   screens.
8. **Document its configuration at the top of the adapter file**, the way
   `src/lib/instagram.ts` does: which environment variables, where to get them,
   and what happens when they are absent. That file is the pattern to copy.
9. **Move the other seams** where the backend holds that data: the blog,
   sign-in, and the account modules each swap on their own. See
   [references/other-seams.md](references/other-seams.md).
10. **Remove the demo**, as below, and verify.

Credentials stay server-side. `config.ts` and the facade are `server-only`, so an
adapter that imports them can safely read `process.env`. Never put a secret in a
`NEXT_PUBLIC_` variable.

## The cart token

The cart and the wishlists are the only parts of the adapter that write, and the
only parts that carry per-visitor state. Both get that state from a token, and
what follows is written about the cart because the wishlists work the same way:
1 cookie, 1 opaque token, `{ …, token }` back from every call.

- Every cart method takes `token: string | null`, the value `src/lib/cart/` read
  out of this visitor's cookie, and returns `{ cart, token }`.
- **The token is yours to define.** For most backends it is the cart id you were
  issued: return it unchanged from every call, and return the new one from the
  call that created the cart. The demo adapter has nowhere to keep a cart, so it
  encodes the whole thing into the token instead. Your adapter should not.
- **Return `token: null` when the token stops addressing anything**, which clears
  the cookie. A backend that keeps a cart id after the last line is removed
  returns that id. The demo adapter, whose token _is_ the lines, returns `null`.
- **`CartLineInput` is a configuration, not a variant id**: a product slug, a
  color name, and option value ids. A variant-based backend resolves its SKU from
  those, here, in the adapter.
- **Throw with a message a shopper can read.** "Only 2 left in stock" reaches the
  screen, and an exception stack does not. The Server Action turns a throw into
  `{ ok: false, error }` and the storefront shows it.
- **The cart carries the add-ons, and prices them.** A line reports the
  protection plans offered for it and the one taken, and the trade-in offer and
  the device handed in against it. The cart reports what those come to in
  `services` and `tradeInCredit`, and the `total` with both settled. Every one of
  those figures is counted here, because a screen that adds them up will disagree with
  the order. Where the backend has no warranty or trade-in data, resolve the
  offers from `commerce/programs/` the way the demo adapter's `cart.ts` does.
- The cart is read on every storefront request, so keep it to 1 round trip.

## Mapping traps

These produce a storefront that renders without errors and is quietly wrong.

- **`ProductImage` requires `width` and `height`.** `next/image` reserves space
  with them, and a backend that omits dimensions gives you layout shift on every
  card. Fetch them, or set the known aspect ratio.
- **`Money.amount` is in major units.** `1299.0` means $1,299.00, and most
  platforms hand you minor units (cents). Divide once, in the adapter, never in a
  component, and format for display with `formatMoney` from
  `src/lib/commerce/format.ts`.
- **Filters are data, not screens.** The catalog sidebar renders whatever
  `Filter` values `listProducts` returns, so a brand list or a size filter is a
  change to what the adapter returns, never to a component. Map the backend's
  facet payload onto `ListFilter`, `ColorFilter`, or `RangeFilter`.
- **Refinements arrive in the query string.** `src/lib/catalog-filters.ts` is the
  only place that knows what a catalog parameter means: `parseCatalogFilters`
  reads a request into `AppliedFilters`, `toProductQuery` turns those into the
  `ProductQuery` the adapter receives, and the `with*` helpers change 1
  refinement. Don't build a catalog URL by hand, and don't teach the adapter
  about URLs.
- **`ProductBadge` is a domain union, not a style.** Map the backend's own tags
  onto `'sale' | 'new' | 'bestseller' | 'limited' | 'exclusive'`. Extending the
  union is a 1-line change plus its preset; passing a raw backend tag through is
  not.
- **`hoverImage` and `packshot` are storefront decisions**, and backends rarely
  model either. Leave `hoverImage` out, or point it at the first gallery shot.
  Pick `packshot` out of the media list by whatever marks it in the store, such
  as an alt text or a tag, or leave it out: a card asked for it shows the lead
  shot.
- **Reads run during rendering, so keep them side-effect free.** No cart
  mutation, no analytics call, no writes.
- **Every method takes a `demo` slug**, because the template can host several
  storefronts. A single-store backend maps every slug to the one store, or uses
  the slug to pick a channel or collection. If you have already reduced the template
  to 1 store, the union is 1 literal and this costs nothing.

## Caching

The facade wraps each read in React's `cache`, which de-duplicates identical
calls within 1 request and persists nothing between requests. That is request
memoization, not a data cache. Don't add a module-level cache to an adapter: it
leaks between requests and across users.

Catalog reads are meant to stream behind `<Suspense>`, while the menu and
category tree render into the static shell. The demo adapter adds artificial
latency so those loading states stay visible, and a real adapter gets it from
the network. Set `DEMO_COMMERCE_LATENCY_MS=0` to turn the demo's delay off while
comparing.

## Remove the demo

Once your adapter renders every screen the demo did, delete what only the demo
needs. The type-checker finds most of it, because deleting a demo file breaks
whatever still imports it.

- `src/lib/commerce/adapters/demo/`, the `/demo/` rewrite in `next.config.ts`
  that loads the sample media, `scripts/download-media.mjs` with its
  `package.json` script, and anything it saved in `public/demo/`. First give
  the components that show `/demo/shared/` artwork (search for it) images of
  their own, since that artwork goes with the rewrite.
- The demo hints in the screens: search for `in this demo` (discount codes, card
  numbers) and the `/order-tracking` pages' sample numbers.
- After the blog, sign-in, and account modules move too: the demo files
  [references/other-seams.md](references/other-seams.md) lists, the `isDemoAuth`
  lines that read them, and last `src/lib/demo-customer.ts`.

## Verify

```bash
pnpm verify
```

Then flip `config.ts` between the 2 adapters and compare the same screens. The
catalog exposes an incomplete mapping fastest: filters, sort order, pagination
counts, and badges all come from data the demo adapter supplies in full.

Check the states that are baked into the pages rather than living at their own
URLs: an out-of-stock product, an empty cart, a category with no banners, and a
filter combination that matches nothing.
