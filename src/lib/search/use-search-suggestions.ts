'use client'

import { useEffect, useState } from 'react'
import type { SearchSuggestions } from '@/lib/commerce/types'
import type { DemoSlug } from '@/lib/demos'
import { searchSuggestionsAction } from './actions'
import { MIN_SEARCH_LENGTH, SEARCH_DEBOUNCE_MS, SEARCH_PRODUCT_LIMIT } from './constants'

/** What a search panel renders, and how far along the answer behind it is. */
export interface SearchSuggestionsState {
  /** What to show now: the answer for this term, or the closest one already in hand. */
  suggestions: SearchSuggestions | null
  /** The answer showing is for a shorter term than the one typed, so a better one is coming. */
  pending: boolean
  /** The term is long enough to search on, so the panel has something to open for. */
  ready: boolean
}

/**
 * Debounced suggestions for whatever is in a search field, for the panel under
 * it. Every storefront's header uses this; only the panel it draws differs.
 *
 * Answers are kept by term for as long as the field is mounted and its scope
 * holds, which makes backspacing instant and is never a substitute for the
 * commerce layer's own caching. Until the exact answer lands, the one for the
 * longest prefix already held stands in, so the panel narrows as a word is
 * typed rather than blanking between keystrokes. Keying by term is also what makes a slow response
 * harmless: it fills its own entry and can never overwrite a newer one.
 *
 * @param productLimit Products to preview, which is what the panel's grid holds.
 * @param categorySlug Search only this category and the ones under it, such as the department on screen.
 */
export function useSearchSuggestions(
  demo: DemoSlug,
  term: string,
  productLimit: number = SEARCH_PRODUCT_LIMIT,
  categorySlug?: string,
): SearchSuggestionsState {
  const [answers, setAnswers] = useState(() => new Map<string, SearchSuggestions>())
  const [scope, setScope] = useState(categorySlug)

  // A field outlives a change of scope, like a department switch, and old answers are wrong in the new one.
  if (scope !== categorySlug) {
    setScope(categorySlug)
    setAnswers(new Map())
  }

  const query = term.trim()
  const ready = query.length >= MIN_SEARCH_LENGTH
  const exact = ready ? answers.get(query) : undefined

  useEffect(() => {
    if (!ready || answers.has(query)) return

    let live = true
    const timer = setTimeout(async () => {
      const result = await searchSuggestionsAction(demo, query, productLimit, categorySlug)
      if (!live) return
      setAnswers((current) => new Map(current).set(query, result))
    }, SEARCH_DEBOUNCE_MS)

    return () => {
      live = false
      clearTimeout(timer)
    }
  }, [demo, query, ready, answers, productLimit, categorySlug])

  return {
    suggestions: ready ? (exact ?? nearest(answers, query)) : null,
    pending: ready && exact === undefined,
    ready,
  }
}

/** The answer for the longest prefix of `query` already held, or `null` for none. */
function nearest(answers: Map<string, SearchSuggestions>, query: string): SearchSuggestions | null {
  for (let end = query.length - 1; end >= MIN_SEARCH_LENGTH; end--) {
    const answer = answers.get(query.slice(0, end))
    if (answer) return answer
  }

  return null
}
