# Payments

A shopper's saved payment methods. Client-safe: `methods.ts`, with the limits
and the labels.

- **No card number ever reaches this app**: not a field, a parameter, or a log
  line. A saved card is a scheme, 4 digits, an expiry, and a name, which is what
  a payment provider hands back because it is the only part safe to keep. The
  form sends only that, as the checkout's `CardFields` does, until the
  provider's hosted field replaces both.
- **Not on the commerce adapter.** Saved methods live with a payment provider,
  which a store picks apart from its commerce backend, and many commerce APIs
  don't expose them. A card follows the shopper, so the facade takes no `demo`.
- **Exactly 1 method leads while there is one.** `withDefault` in `actions.ts`
  decides it, and `PaymentMethodPatch.default` can only be `true`.
- **An edit cannot change what identifies the card.** The scheme and the last 4
  digits are not on `PaymentMethodPatch`, because a vault's token is bound to
  them. A reissued number goes through `savePaymentMethodAction(draft, replaces)`,
  which saves the new card and drops the old one in 1 write.
- **Billing is a country and a postcode**, the 2 fields an issuer check compares.
- **A wallet is a redirect, never a form.** A vaulted wallet (a PayPal billing
  agreement, a Klarna token) lists without an expiry or an edit. `LinkWallet` in
  `components/account/payment-method-dialog.tsx` stands in for the trip to the
  provider and back. Apple Pay and Google Pay are left out on purpose: a device
  provisions them, and there is nothing to save.
- **The checkout doesn't read saved methods yet.** It collects a card each time,
  in `payment-options.tsx`. Offering a saved one there means reading
  `listSavedPaymentMethods` in the checkout page, once a provider is in place.

Demo stand-ins: `vault.ts` (a cookie in place of the provider, behind
`readVault` and `writeVault`) and `demo-vault.ts` (the sample customer's cards).
