'use client'

import { type RefObject, useEffect, useState } from 'react'

/** How far above and below the viewport counts as near: 2 screens of scrolling. */
const NEAR_MARGIN = '200% 0px'

/**
 * Whether the element has come within 2 screens of the viewport, latched once it
 * has. For media that should be loaded by the time it scrolls in rather than with
 * the page. Pass `enabled` false while the element is not rendered.
 */
export function useNearViewport(ref: RefObject<Element | null>, enabled = true): boolean {
  const [near, setNear] = useState(false)

  useEffect(() => {
    const element = ref.current
    if (!enabled || !element) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        setNear(true)
        observer.disconnect()
      },
      { rootMargin: NEAR_MARGIN },
    )
    observer.observe(element)
    return () => observer.disconnect()
  }, [ref, enabled])

  return near
}
