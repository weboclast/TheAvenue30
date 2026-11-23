'use client'

import { type RefObject, useEffect } from 'react'

/** Read by the toasts in `globals.css`, the shopping assistant, and `StickyColumn`. */
const BUY_BAR_HEIGHT_VAR = '--buy-bar-height'

/**
 * Publishes how much of the screen's bottom edge a buy bar covers as
 * `--buy-bar-height`, so whatever else floats there rises above it. `0px` while
 * the bar is away, and while a breakpoint hides it.
 *
 * A sticky bar's own `bottom` offset counts as covered, since nothing fits in it.
 */
export function useBuyBarHeight(barRef: RefObject<HTMLElement | null>, shown: boolean) {
  useEffect(() => {
    const bar = barRef.current
    if (!bar) return

    const root = document.documentElement
    const publish = () => {
      const height = shown ? bar.offsetHeight : 0
      const offset = Number.parseFloat(getComputedStyle(bar).bottom) || 0
      root.style.setProperty(BUY_BAR_HEIGHT_VAR, height ? `${height + offset}px` : '0px')
    }
    publish()
    const observer = new ResizeObserver(publish)
    observer.observe(bar)

    return () => {
      observer.disconnect()
      root.style.removeProperty(BUY_BAR_HEIGHT_VAR)
    }
  }, [barRef, shown])
}
