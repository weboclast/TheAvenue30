'use client'

import { useEffect, useLayoutEffect, useRef } from 'react'
import type { CartLine } from '@/lib/commerce/types'

/** A line's first control a shopper can tab to. */
const FOCUSABLE = 'a[href]:not([tabindex="-1"]), button:not(:disabled), input:not([type="hidden"])'

/**
 * Keeps focus in a cart list when the line holding it is taken out: focus moves
 * to the line now in its place, or to the heading once none remain. Put `list`
 * on the element holding the `[data-slot="cart-line"]` rows, and `heading` on a
 * heading with `tabIndex={-1}` and `outline-none`.
 */
export function useRemovalFocus(lines: CartLine[]) {
  const list = useRef<HTMLUListElement>(null)
  const heading = useRef<HTMLHeadingElement>(null)
  const previous = useRef(lines)
  // Whether focus last landed in this list. A removed element drops focus without a `focusin`.
  const holding = useRef(false)

  useEffect(() => {
    const track = (event: FocusEvent) => {
      holding.current = Boolean(list.current?.contains(event.target as Node))
    }
    document.addEventListener('focusin', track)
    return () => document.removeEventListener('focusin', track)
  }, [])

  // A layout effect, so it runs before a popup's own recovery sends focus to the popup.
  useLayoutEffect(() => {
    const before = previous.current
    previous.current = lines
    const gone = before.findIndex((line) => !lines.some((next) => next.id === line.id))
    if (gone === -1 || !holding.current || document.activeElement !== document.body) return

    const rows = list.current?.querySelectorAll<HTMLElement>('[data-slot="cart-line"]') ?? []
    const target = rows[Math.min(gone, rows.length - 1)]?.querySelector<HTMLElement>(FOCUSABLE) ?? heading.current
    // Without scrolling: the next line slides up into the removed one's place.
    target?.focus({ preventScroll: true })
  }, [lines])

  return { list, heading }
}
