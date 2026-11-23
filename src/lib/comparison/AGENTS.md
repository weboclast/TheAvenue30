# Comparison

What a shopper is weighing up side by side. Client-safe: `set.ts` and
`comparison-context.tsx`.

- **Nothing here is on the commerce adapter.** Which 3 phones somebody is
  deciding between is not a record a backend keeps, so the cookie holds slugs
  rather than a token, and comparison works on every backend unchanged. A store
  that wants comparisons in its analytics posts them from the action.
- **Comparing is never gated.** A first-time visitor compares before they would
  register, so nothing here checks for a session.
- **What comes out of the cookie is narrowed.** `readComparedSlugs` dedupes and
  caps, and the catalog read skips slugs it cannot resolve, so a screen never
  gets a 5th column.
- **Reading the set and resolving it are 2 calls.** A layout awaits
  `getComparedSlugs`, which touches no catalog, so the toggles are right on the
  first paint. It hands `getComparedProducts` on unawaited, and the compare bar
  streams in behind `<Suspense>`. Awaiting both holds up every page's shell.
- **2 hooks, and only `useComparedProducts` suspends.** `useComparison` is the
  state a toggle reads on every card in a grid. Merged, a whole catalog listing
  would wait on the products.
- **`MAX_COMPARED` lives in `set.ts`**, where the drawer counts against it and
  the action enforces it. A 5th product comes back as a refusal the toggle
  toasts.
- **The table is built in `set.ts`.** `comparisonSections` lines the spec sheets
  up by `ProductSpec.id`, so which rows exist is a catalog change. Identifier
  rows opt out with `comparable: false`, and "differences only" filters the same
  structure.
- **`ComparisonProvider` mounts wherever a `ProductCard` can render**, beside the
  cart's and the wishlist's. The card's compare toggle reads it, so a tree
  missing 1 of the 3 throws on render. The compare bar is storefront chrome, so
  it belongs in `(shop)`.

The screens are Electronics' own: `components/electronics/comparison/` and its
`(shop)/comparison` page. This module stays whichever demo does.
