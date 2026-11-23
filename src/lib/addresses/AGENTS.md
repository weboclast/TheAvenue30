# Addresses

A shopper's address book. Client-safe: `book.ts`.

- **Not on the commerce adapter.** An address belongs to the shopper on every
  storefront, so the facade takes no `demo`. Most backends keep an address book,
  so point `store.ts` at it. One that keeps 1 billing and 1 shipping address
  maps those 2 onto the book.
- **A saved address is an `Address` plus a label.** The 8 postal fields are the
  ones the checkout collects and an order records. Anything a store adds (a gate
  code, delivery instructions) goes on `SavedAddress`, never on `Address`,
  which an order also carries.
- **Exactly 1 address leads while there is one.** `withDefault` in `actions.ts`
  decides it: the first one saved takes the flag, deleting the leader hands it
  on, and `AddressPatch.default` can only be `true`. Screens never set the flag
  on 2 rows, or clear the last one.
- **An edit may change every field**, unlike a saved card. A shopper who moves
  edits the address they have.
- **2 validators, kept in step.** `validateAddressFields` in
  `components/address-fields.tsx` runs in the dialog, and `validateAddress` in
  `lib/validation.ts` runs in the action, the checkout, and the order address
  change.
- **The checkout doesn't read the book yet.** It collects an address each time.
  Offering the book there means reading `listSavedAddresses` in the checkout
  page and filling `AddressFields` from the default, once a backend is in place.

Demo stand-ins: `store.ts` (a cookie) and `demo-book.ts` (the sample customer's
book).
