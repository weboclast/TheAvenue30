# Auth

The seam to whatever issues sessions. Client-safe: `types.ts`, `customer.ts`,
`session-context.tsx`, and `@/lib/validation`.

- **`adapter.ts` is the contract**: `signIn`, `register`, `getCustomer`, and
  `signOut`. Screens import from `types.ts`, `index.ts`, and `actions.ts`, never
  from an adapter.
- **2 methods are optional.** `changePassword` is absent where a backend owns
  sign-in elsewhere (SSO, passwordless), so a screen asks `canChangePassword()`
  and leaves the control out. It returns a session, since some backends reissue
  the token. `deleteAccount` is more often absent than present, and is only the
  backend half of an erase, called from `deleteAccountAction` in
  `lib/profile/actions.ts`.
- **The demo token is unsigned.** A backend's token goes into the cookie as an
  opaque string, and nothing a screen trusts goes in beside it.
- **1 account spans every storefront**, so auth takes no `demo`.
- **Reading the session makes the whole route dynamic**, `<Suspense>` included.
  The boundary buys streaming, not a static shell, until the project opts into
  Cache Components. `AccountControl` in `components/electronics/header/header.tsx`
  is the pattern. Its button and menu are demo chrome, so they live beside that
  header, not in `components/auth/`.
- **Server Components read `getSession`, and Client Components take the customer
  as a prop.** `session-context.tsx` is for a store where prop-drilling stops
  paying. It is mounted nowhere, so no screen pays for it.
- **Front-end validation is a courtesy.** `@/lib/validation` runs in the form and
  again in the adapter, and a real backend rejects on its own terms.
- **Gate an area from its layout with `requireSession`**, as a demo's `account/`
  does. Per-page guards are how a route ships unguarded. Order tracking and the
  checkout are open on purpose.
- **Never move the gate into `proxy.ts`.** It sees that a cookie exists, not that
  it is valid, and Next.js scopes it to optimistic checks.
- **A query string that reaches `redirect()` goes through `safeNextPath`**, since
  `?next=//evil.com` is protocol-relative and leaves the site.

Demo stand-in: `adapters/demo.ts`. A real backend implements `AuthAdapter` and
binds it in `config.ts`.
