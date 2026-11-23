'use server'

import { getCommerce } from '@/lib/commerce'
import type { SearchSuggestions } from '@/lib/commerce/types'
import { type DemoSlug, isDemoSlug } from '@/lib/demos'
import { MAX_SEARCH_PRODUCT_LIMIT, MIN_SEARCH_LENGTH, SEARCH_PRODUCT_LIMIT, SEARCH_TERM_LIMIT } from './constants'

/*
 * The 1 search endpoint the header talks to. An action rather than a route
 * handler, so it carries the commerce layer's types end to end and no JSON
 * shape has to be kept in step by hand.
 *
 * Its arguments arrive from a Client Component, and an action is a public
 * endpoint, so they are whatever the caller sent: `demo` is narrowed against
 * the registry, `productLimit` is clamped, and a `categorySlug` naming nothing
 * finds nothing.
 */

/** Nothing found, and the shape a caller can render without a null check. */
const EMPTY: SearchSuggestions = { terms: [], products: [], total: 0 }

/**
 * Suggested terms and matching products for what has been typed so far.
 *
 * Never throws and never returns `null`: a search panel that has to handle an
 * error state for a keystroke is a panel that flickers. A term below
 * {@link MIN_SEARCH_LENGTH} resolves empty without reaching the adapter.
 *
 * @param productLimit Products to preview, up to {@link MAX_SEARCH_PRODUCT_LIMIT}.
 * @param categorySlug Search only this category and the ones under it.
 */
export async function searchSuggestionsAction(
  demo: DemoSlug,
  term: string,
  productLimit: number = SEARCH_PRODUCT_LIMIT,
  categorySlug?: string,
): Promise<SearchSuggestions> {
  if (!isDemoSlug(demo) || term.trim().length < MIN_SEARCH_LENGTH) return EMPTY

  const limit = Number.isInteger(productLimit) && productLimit > 0 ? productLimit : SEARCH_PRODUCT_LIMIT

  try {
    return await getCommerce(demo).getSearchSuggestions({
      term,
      categorySlug,
      productLimit: Math.min(limit, MAX_SEARCH_PRODUCT_LIMIT),
      termLimit: SEARCH_TERM_LIMIT,
    })
  } catch {
    return EMPTY
  }
}
