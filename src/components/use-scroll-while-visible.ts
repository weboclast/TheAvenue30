'use client'

import { useEffect } from 'react'
import type { CarouselApi } from '@appica/ui-react/carousel'

/**
 * Stops a Carousel's Auto Scroll while the carousel is off screen and starts it
 * again on the way back, so a marquee nobody can see costs no frames. A pause the
 * carousel keeps for itself, for hover or focus, is left alone.
 */
export function useScrollWhileVisible(api: CarouselApi | undefined) {
  useEffect(() => {
    if (!api) return

    const root = api.rootNode()
    // Only a drift stopped here is started here, so a hold outlasts the trip off screen.
    let stopped = false

    const observer = new IntersectionObserver(([entry]) => {
      // Looked up each time: the carousel rebuilds the plugin when reduced motion changes.
      const autoScroll = api.plugins().autoScroll
      if (!autoScroll) return

      if (!entry.isIntersecting) {
        if (autoScroll.isPlaying()) {
          autoScroll.stop()
          stopped = true
        }
        return
      }
      // Focus arriving by Tab scrolls the carousel in after it has stopped the drift.
      if (stopped && !root.contains(document.activeElement)) autoScroll.play()
      stopped = false
    })
    observer.observe(root)
    return () => observer.disconnect()
  }, [api])
}
