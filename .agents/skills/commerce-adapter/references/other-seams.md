# Other seams

The commerce adapter carries the catalog, the cart, the wishlists, and the
orders. Everything else a store keeps sits behind a seam of its own, swapped
without touching the commerce adapter or the other seams. Move each one when the
backend holds that data. Until then, the demo version keeps working.

- [Blog](#blog)
- [Sign-in](#sign-in)
- [Order screens](#order-screens)
- [Account modules](#account-modules)

## Blog

`ContentAdapter` in `src/lib/blog/adapter.ts`, bound in `src/lib/blog/config.ts`.
It is apart from the commerce adapter because a store's blog often lives in a
CMS of its own, and `src/lib/blog/adapters/demo/` is the reference.

- A listing returns `PostSummary` and an article returns `Post`, so map the CMS's
  list and detail endpoints onto those 2, and never fetch bodies for a listing.
- Map rich text onto `PostBlock[]`. A CMS that only hands out markup returns 1
  `html` block.
- `Post.productSlugs` names catalog products, and the article page resolves them
  through the commerce adapter, so they have to be the catalog's slugs.

## Sign-in

`AuthAdapter` in `src/lib/auth/adapter.ts`, bound in `src/lib/auth/config.ts`.
Implement `signIn`, `register`, `getCustomer`, and `signOut`, and return the
backend's token (a customer access token, a JWT, a session id) as an opaque
string. Add `changePassword` where the backend owns the password, and
`deleteAccount` where it can erase a customer, or point it at your own endpoint
or support queue. `src/lib/auth/adapters/demo.ts` is the reference.

`isDemoAuth` in `src/lib/auth/config.ts` turns false once your adapter is bound,
and every `demo-*.ts` file below stops answering with it.

## Order screens

The 4 order methods sit on the commerce adapter, but the order screens ask more
of a backend than those methods do:

- **`lookupOrder`** queries the order table by number, checks the email
  server-side, and returns the backend's order id as the token. Put a rate
  limiter where `trackOrderAction` marks: the lookup is a public endpoint that
  answers questions about strings a caller supplies.
- **`listOrders`** is the same query scoped to the customer, filtered and paged
  in the database rather than in the browser. Match `search` against whatever a
  shopper has to hand: the order number, the carrier's number, the products, the
  date. Never narrower than the product titles.
- **`countActiveOrders`** in `src/lib/orders/index.ts`, the number badged beside
  Orders, reads every order for want of a database: give it a `COUNT(*)` over
  the same statuses.
- **`listDeliveredLines`** beside it, what an account lists as owned, reads every
  delivered order the same way: answer it with 1 query over order lines.
- **`OrderTracking.reschedule`** comes from the calendar your checkout books
  delivery windows from. Leave it out inside your cut-off.

Then delete `commerce/adapters/demo/order-book.ts`, the sample orders, and
`fulfillment.ts` beside it, which reads an order's stage off a clock. Real
fulfillment arrives as carrier events.

## Account modules

Each keeps a shopper's records in a cookie in the demo, and its `demo-*.ts`
files give the sample customer something to look at.

| Module | Delete | Point at your backend |
| --- | --- | --- |
| `src/lib/addresses/` | `store.ts`, `demo-book.ts` | The customer's address book. One with 1 billing and 1 shipping address maps those 2 onto the book. |
| `src/lib/payments/` | `vault.ts`, `demo-vault.ts` | The provider's stored-method calls, behind `readVault` and `writeVault`, or called from `index.ts` and `actions.ts` directly. |
| `src/lib/profile/` | `store.ts`, `demo-profile.ts` | The customer record. Sizes and the home usually live in custom fields on it. |
| `src/lib/reviews/` | `demo-reviews.ts` | `index.ts`, reading your reviews platform or table, scoped to the customer. |
| `src/lib/rewards/` | `demo-ledger.ts`, `demo-offers.ts` | `index.ts`, reading your loyalty provider. `listOffers` queries its discounts, scoped to the customer. |

What each module leaves for a real backend to finish:

- **Payments:** the provider's hosted field replaces the card form in the dialog
  and the checkout's `CardFields`, and no card number ever reaches the server.
  Connecting a wallet is a redirect to the provider and a callback that calls
  `savePaymentMethodAction` with what came back. `LinkWallet` in
  `components/account/payment-method-dialog.tsx` stands in for that trip.
- **Profile:** `connectAccountAction` belongs at the end of an OAuth callback
  rather than behind a button, and the demo argument passing the shopper's own
  address as `account` is the line to delete. `setTwoFactorAction` is called
  once the auth backend's enrollment flow succeeds.
- **Reviews:** each storefront's review panel hands a `ReviewDraft` to its
  `onReviewSubmit` prop. Upload the photos and clips to your media store first,
  then post the review with what came back.
- **Rewards:** `referralCode` derives a code that cannot be revoked. Replace it
  with the code your loyalty provider mints.
- **The checkout:** it collects an address and a card each time. Once the
  address book and the vault are real, offer them there: read
  `listSavedAddresses` and `listSavedPaymentMethods` in the checkout page, and
  fill the fields from the defaults.
