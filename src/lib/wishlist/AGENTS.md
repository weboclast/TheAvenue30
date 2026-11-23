# Wishlist

Which lists this visitor holds. The lists belong to the commerce adapter:
`Wishlist`, `WishlistItem`, and the rest live in `commerce/types.ts`, and the
wishlist methods sit on `CommerceAdapter`. Client-safe: `lists.ts`, with the
sort options and the length limits.

- **An item is a product, not a configuration of one.** Unlike a
  `CartLineInput`, a save carries a slug and nothing else, and the wishlist card
  offers the colors again.
- **An item carries the whole `Product`**, resolved on every read, so a list
  saved months ago shows today's price and stock, in the same `ProductCard` the
  catalog uses.
- **Saving works signed out**, and a guest's saves carry into the account they
  register for free. Only the account page that shows the lists is gated, by the
  account layout.
- **1 list is `default`, and a heart saves there**, in 1 click that never asks
  which list. The list is chosen on the wishlist page, and opening a list points
  saves at it. The adapter keeps the invariant: exactly 1 list carries the flag,
  deleting it hands the flag on, and `WishlistPatch.default` can only be `true`.
- **Emptying a heart removes the product from every list**, through `setSaved`.
  The wishlist page removes by `WishlistItemRef` instead, which names 1 item in 1
  list.
- **A selection is 1 call.** `removeWishlistItems` and `moveWishlistItems` take
  refs, so never loop a batch in a screen.
- **Sorting happens in the browser**, in `lists.ts`, because a list arrives whole
  and small. A backend that pages long lists moves the sort into its query.
- **A list is private, and there is no setting for it.** Sharing takes a
  server-side store, a public route, and a claim state, and a toggle that only
  changed a badge would read as finished when it isn't. Add the field with the
  route that makes it true.

Demo stand-in: `commerce/adapters/demo/wishlist.ts`, which encodes every list
into the token. Its caps are what a 4 KB cookie holds, not what a shopper
deserves.
