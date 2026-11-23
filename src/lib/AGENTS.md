# Library modules

Each folder here is the seam between the screens and whatever answers 1 concern:
the cart, the orders, a shopper's addresses. Its own `AGENTS.md` lists what is
particular to it. These rules hold in all of them.

## Files

- **The contract file is the 1 copy of the types, limits, and lists** that a form
  renders and an action validates against, and it is safe on the client. A limit
  stated twice is how a value the server rejects gets typed in full. Each
  module's `AGENTS.md` names its client-safe files, and the rest are server-only.
- **`index.ts` is the facade** that screens read from. Screens never import an
  adapter, a store, or a token file.
- **`actions.ts` holds the writes**, since a cookie can only be set from a Server
  Action or a Route Handler.
- **`token.ts` is the module's cookie.** `store.ts`, `vault.ts`, and `demo-*.ts`
  are demo stand-ins: a cookie where a backend belongs, and sample data shown
  only under the demo sign-in. Don't build on them. The `commerce-adapter`
  skill covers replacing each one.

## Server Actions

An action is a public endpoint, so its arguments are whatever the caller sent.

- Resolve the session before touching anything a shopper owns.
- Narrow a `demo` argument with `isDemoSlug` before it reaches an adapter.
- Validate again on the server with the rules the form ran, from
  `lib/validation.ts` or the module's contract, so the 2 cannot drift.
- Take selections, never figures: a trade-in as a device and a condition,
  points as a count clamped here, a bundle by its id. The adapter prices them.
- Refuse with `{ ok: false, error }` and a message a shopper can read. An
  adapter throws that message, and the action turns it into the result.

## Cookies

- **A cookie holds an opaque token and nothing else**: whatever the adapter
  issued, such as a cart id. Never a line, a price, a total, a customer, or a
  role, because a visitor can edit it.
- **What a shopper carries is 1 cookie per demo**, because every commerce read
  is scoped to a demo: 2 storefronts, 2 carts. What belongs to the shopper
  (their session, profile, addresses, and saved cards) spans every demo.

## Client stores

The cart, the wishlist, and the comparison each keep a client store.

- **Every mutation returns the new state, and nothing is revalidated.** The
  store adopts what the action handed back, so the page behind it doesn't
  re-render. Reach for `revalidatePath` only when a server-rendered screen has
  to change while the shopper stays on it, and know that it re-runs that page's
  reads.
- **The provider mounts once, in the demo's own `layout.tsx`**, above both
  `(shop)` and `(checkout)`. Mounted in each group, the store remounts between
  the cart and the checkout, and 2 providers in 1 tree disagree.

## Reads

- **Reads run during rendering, so they are side-effect free**: no writes, no
  analytics, no query logging.
- **The facades' `cache` is per-request memoization**, not a data cache. Never
  add a module-level cache: it leaks across requests and across users.
- **Refinements live in the query string** (tab, sort, page, filters), and the
  module's contract is the only place that knows how its parameters are spelled.
