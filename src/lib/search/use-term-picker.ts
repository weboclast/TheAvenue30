'use client'

import { type KeyboardEvent, useState } from 'react'

/**
 * Which suggested term a search field has picked, for the arrow keys and a
 * pointer hovering the list. `-1` while the query as typed is what Enter
 * searches for; the arrow keys cycle through it, above the first suggestion.
 */
export function useTermPicker(terms: string[]) {
  const [active, setActive] = useState(-1)

  return {
    /** The picked term's index, or `-1` for the query as typed. */
    active,
    setActive,
    /** Moves the pick on ArrowDown and ArrowUp, and leaves every other key alone. */
    onKeyDown: (event: KeyboardEvent<HTMLInputElement>) => {
      if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return
      if (terms.length === 0) return

      event.preventDefault()
      const step = event.key === 'ArrowDown' ? 1 : -1
      // Shifted up by 1 so the cycle includes -1, the query as typed.
      const stops = terms.length + 1
      setActive((current) => ((current + 1 + step + stops) % stops) - 1)
    },
    /** What Enter searches for: the picked term, or the query as typed. */
    termFor: (query: string) => (active >= 0 ? terms[active] : query),
  }
}
