# Profile

A shopper's own record: who they are, how to reach them, their interests, sizes,
and home, and the 2 security settings an account carries. Client-safe:
`profile.ts`.

- **Not on the commerce adapter.** A shopper is the same on every storefront, so
  the facade takes no `demo`. Most backends keep a customer record, so point
  `store.ts` at it.
- **The session owns the email.** `getProfile` overwrites the stored email with
  the session's, and no screen here offers an email field: changing it is a
  verification round-trip for the auth adapter.
- **The name is stored here, though the session carries one.** A first edit
  copies the resolved profile into the store, which wins from then on, the way a
  backend's customer update does.
- **The options are data, not screens.** Editing `INTERESTS`, `CONTACT_METHODS`,
  `SIZE_SCALES`, `FIT_PREFERENCES`, `STAIRS`, `PARKING`, or `HOME_ROOMS` changes
  the form, the summary, and the validation together. An id the store retired is
  refused rather than dropped, so it surfaces here.
- **Sizes and the home are optional, and shared by every storefront.** A store
  that sells no clothing never shows sizes, and one that delivers nothing bulky
  never shows the home. A backend usually keeps both in custom fields on the
  customer.
- **`contactMethod` is not `lib/notifications.ts`.** That is what the store sends
  automatically, and this is how a person gets back to a shopper about an order.
- **2 actions stand in for flows a real store owns**, both marked in
  `actions.ts`. `connectAccountAction` is called by a button instead of an OAuth
  callback, and the demo passes the shopper's own address as `account`: that
  argument is the line to delete. `setTwoFactorAction` records a flag, while
  enrolling a factor belongs to the auth backend.
- **The danger zone reaches across seams.** `exportAccountDataAction` reads the
  addresses and payments modules, and `deleteAccountAction` clears their cookies
  and every demo's wishlist tokens, then signs out.
  - The export leaves orders out, since they sit behind the commerce adapter per
    storefront. Read `listAccountOrders` to add them.
  - The cart survives an erase, as it survives a sign-out: it belongs to the
    device.
  - `authAdapter.deleteAccount` is the backend half, and often missing. The
    storefront clears what it holds either way.
- **Changing a password is in `lib/auth`**, as `changePasswordAction` behind
  `canChangePassword()`.

Demo stand-ins: `store.ts` (a cookie) and `demo-profile.ts` (the sample
customer's record).
