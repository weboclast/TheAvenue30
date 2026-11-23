'use client'

import { useState } from 'react'

/**
 * What a panel shows, held while it closes: `value` while `open`, and the last
 * value it had open once it is not. A panel whose content is cleared on close
 * would otherwise empty the moment its exit starts, and fade out as a bare frame.
 *
 * Pass values that keep their identity between renders, such as state or props:
 * an object built inline is new every render, and would be stored every render.
 */
export function useHeldWhileClosing<T>(value: T, open: boolean): T {
  const [held, setHeld] = useState(value)
  if (open && value !== held) setHeld(value)
  return open ? value : held
}
