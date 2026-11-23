# Search

The engine behind every storefront's search field. Client-safe: `constants.ts`.

- **The engine, never the panel.** Each demo draws its own suggestions, because a
  spec row and a lookbook tile are different compositions. What they share lives
  here: the timing, the limits, the URL contract, the 1 endpoint, how a field
  picks a term and highlights what was typed (`useTermPicker`, `splitMatch`),
  and what its live region announces (`searchStatus`).
- **`constants.ts` holds the 1 spelling of `?q=` and the 1 debounce.**
  `catalog-filters.ts` reserves the same parameter, so keep the 2 in step.
- **A panel asks for as many products as its grid holds**, as the hook's third
  argument. The action clamps it to `MAX_SEARCH_PRODUCT_LIMIT`.
- **A panel can search 1 category and what is under it.** A store with
  departments passes the one on screen to the hook and to `searchHref`, and a
  store without passes nothing and searches everything.
- **The action never throws and never returns `null`.** A refused slug, a backend
  that fell over, and a term nobody matched are all 1 empty result, so a panel
  never flickers into an error state.
- **Suggested terms come from the catalog**, never from a hand-written list: a
  suggestion that opens an empty listing is worse than none. The demo adapter
  harvests them from tags, brands, and category names.
- **Ranking belongs to the adapter.** The demo's is a scored substring match, with
  no stemming, typo tolerance, or synonyms on purpose: a demo that searched
  better than the backend replacing it would set the wrong expectation.

The results page is not here. A search is the demo's own `/catalog` listing with
`?q=` on it.
