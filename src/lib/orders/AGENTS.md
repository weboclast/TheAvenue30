# Orders

Which orders this visitor may see. The order belongs to the commerce adapter:
`Order`, `OrderTracking`, and `OrderStatus` live in `commerce/types.ts`, and
`lookupOrder` and `listOrders` sit on `CommerceAdapter`. Client-safe:
`returns.ts`.

- **2 entitlements, and only this module knows the difference.** A guest holds a
  token, and a signed-in shopper a session. `getTrackedOrder` tries both, so the
  account's list links straight into the tracker, and `listAccountOrders`
  resolves the session to an email before `listOrders` sees one. Never pass the
  adapter an email that arrived with the request: the account history answers
  in full, so a typed address would make it an enumeration oracle.
- **The token is the capability, and the URL grants nothing.** A stranger typing
  `/order-tracking/APC-058291` gets the lookup form. The page renders only with
  the cookie a successful lookup wrote, and the number in the URL is checked
  against that order.
- **A lookup takes the order number and the email.** Numbers run in sequence, and
  the tracker shows a home address, a phone number, and a purchase. Never drop
  the email to save a keystroke.
- **A failed lookup never says which half was wrong.** 1 generic message, always,
  or the form confirms which numbers exist.
- **Rate-limit the lookup before it meets a real order table.** `trackOrderAction`
  marks where the limiter goes.
- **An address change, a moved delivery, and a return are requests, not
  writes.** The 3 actions validate, return the line the shopper is shown, and
  leave the queueing to the store's desk.
- **What a shopper may do comes from the adapter.**
  `OrderTracking.addressEditable`, `.returnable`, and `.reschedule` are store
  policy, so a page never decides them.
- **Return reasons are per storefront**, from `returnReasons(demo)` in
  `returns.ts`, which the drawer renders and the action validates against.
- **The order placed a moment ago is `lib/checkout`'s.** `getRecentOrders` reads
  its cookie beside the lookup's, so the lookup page offers both before asking
  for a number.

Demo stand-ins: `commerce/adapters/demo/order-book.ts` (the sample orders), and
`fulfillment.ts` beside it, the only openly faked part of the data layer. It
reads an order's stage off a clock, where a real store gets carrier events.
