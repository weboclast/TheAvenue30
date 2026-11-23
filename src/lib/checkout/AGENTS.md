# Checkout

Which order this visitor just placed. The order belongs to the commerce
adapter: `Order`, `CheckoutInput`, and `OrderState` live in `commerce/types.ts`,
and `placeOrder` and `getOrder` sit on `CommerceAdapter`.

- **No card number in `CheckoutInput`, and none accepted here.** It belongs in
  the payment provider's hosted field and must never reach the server, which
  would drag the store into PCI scope. The checkout sends the method, the scheme,
  and the last 4 digits only. The demo's card fields validate the number and
  never submit it.
- **What was bought never comes from the browser.** The action hands the adapter
  the cart token, so the order is placed against the cart the server knows. A
  request naming its own lines would name its own prices.
- **Placing an order writes 2 cookies.** It sets the order and clears the cart,
  or the paid-for lines come back in the header.
- **The order cookie is a 2-hour handoff, not a history.** A later order belongs
  to the account, or to the guest lookup under `/order-tracking`. `lib/orders` is
  the only other module that reads this cookie, so "Track your order" resolves
  without a lookup.
- **The action returns rather than redirects**, and the screen navigates on `ok`.
- **Delivery is not here.** The option picked is a cart property, priced into
  `Cart.shipping` and changed with `updateCartAction`, like gift wrapping and a
  discount code. That keeps it across a reload, with totals counted in 1 place.
- **A collected order is recorded at its store.** A pickup option carries a
  `PickupLocation`, and the adapter records it as the shipping address, keeping
  only the collector's name and phone. The screen still sends a complete
  address, so the action's checks stay 1 set.
- **A gift note needs gift wrapping.** The adapter drops `giftMessage` from an
  unwrapped order, since the note is printed on the wrapping's card.

Demo stand-in: `commerce/adapters/demo/order.ts`, which encodes the order into
the token for want of an order book. It invents nothing, so a visitor with no
order gets `null` and the confirmation's empty state.
