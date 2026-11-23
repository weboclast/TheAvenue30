/*
 * What every storefront's search agrees on, whatever its header looks like.
 *
 * Safe on both sides of the network: no server-only imports, no browser
 * globals. The panel, the hook, and the Server Action all read these, so a
 * demo that draws its own search UI inherits the same timings and limits.
 */

import type { SearchSuggestions } from '@/lib/commerce/types'

/** The query parameter a search lands on, and the 1 spelling of it. `catalog-filters.ts` reserves the same key. */
export const SEARCH_PARAM = 'q'

/**
 * How many characters it takes before the panel asks for anything. Below this a
 * fragment matches most of the catalog, so the answer is noise.
 */
export const MIN_SEARCH_LENGTH = 2

/**
 * How long typing has to settle before the request goes out. Short enough to
 * feel immediate, long enough that a typed word costs 1 request rather than 1
 * per letter.
 */
export const SEARCH_DEBOUNCE_MS = 180

/** Products previewed in a panel that asks for no count of its own. */
export const SEARCH_PRODUCT_LIMIT = 5

/** The most products a panel can ask for. The action clamps to it. */
export const MAX_SEARCH_PRODUCT_LIMIT = 12

/** Suggested terms offered beside them. */
export const SEARCH_TERM_LIMIT = 7

/**
 * What a search field's live region says, so a screen reader hears what the
 * panel shows. Empty until the answer for the exact term lands: a stand-in
 * answer for a shorter term would announce the wrong count.
 *
 * @param scope Where the search ran, such as a department's name.
 */
export function searchStatus(
  suggestions: SearchSuggestions | null,
  pending: boolean,
  term: string,
  scope?: string,
): string {
  if (pending || !suggestions) return ''
  if (suggestions.total > 0) return suggestions.total === 1 ? '1 result' : `${suggestions.total} results`
  return scope ? `No results for “${term}” in ${scope}` : `No results for “${term}”`
}

/** The listing a term or a raw query opens: a demo's whole catalog, or 1 category of it. */
export function searchHref(demo: string, term: string, categorySlug?: string): string {
  const path = categorySlug ? `/catalog/${categorySlug}` : '/catalog'
  return `${path}?${SEARCH_PARAM}=${encodeURIComponent(term)}`
}

/**
 * A suggestion split around the first place the typed term appears in it, so a
 * panel can set that part apart. Matched trimmed and without regard to case;
 * with no match, the whole label is `before`.
 */
export function splitMatch(label: string, term: string): { before: string; match: string; after: string } {
  const typed = term.trim()
  const at = typed ? label.toLowerCase().indexOf(typed.toLowerCase()) : -1
  if (at < 0) return { before: label, match: '', after: '' }

  return {
    before: label.slice(0, at),
    match: label.slice(at, at + typed.length),
    after: label.slice(at + typed.length),
  }
}
