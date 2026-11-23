# Cart

Which cart this visitor is holding. The cart itself belongs to the commerce
adapter: `Cart`, `CartLine`, and `CartLineInput` live in `commerce/types.ts`,
and the cart methods sit on `CommerceAdapter`. Client-safe: `cart-context.tsx`.

- **Totals are counted once, in the adapter.** The store never adds lines up,
  scales a price by a quantity, or predicts a subtotal for an optimistic update,
  and that covers `services`, `savings`, `tradeInCredit`, and `total`. A cart
  200ms behind beats one that disagrees with the backend about what an order
  costs.
- **A mutation is a patch.** `updateItem` takes a `CartLinePatch` and
  `updateCart` a `CartPatch`, and a field left out is left alone, so 2 controls
  on 1 row cannot overwrite each other.
- **A bundle is added by its id, in 1 call.** `addBundle` posts the offer with
  the color and options picked for each product, and `addCartBundle` adds them
  all at the bundle's price. The demo adapter keeps that price only while the
  cart holds the whole set.
- **A trade-in is a selection** of a device and a condition, priced by the
  adapter with `quoteTradeIn`.
- **Loyalty points are a count, clamped here.** `updateCartAction` caps
  `CartPatch.rewardPoints` against `getRewardsBalance`, the only layer that can
  resolve the session behind a balance. `Cart.rewardsBalance` is the 1 figure on
  a cart the adapter doesn't count, and `withRewardsBalance` puts it there on
  every path. See `lib/rewards/AGENTS.md`.
- **The store holds cart state, never cart UI.** It counts adds in `addCount` and
  stops there, so each demo's chrome decides what an add looks like (a header
  preview, a bag drawer). Demo-specific behavior in this module is a bug.
- **Awaiting `getCart` in the demo's layout** is what makes the header count
  right on the first paint. The cookie already made that layout dynamic.

Demo stand-in: `commerce/adapters/demo/cart.ts`, which encodes the whole cart
into the token for want of a backend to keep it.
