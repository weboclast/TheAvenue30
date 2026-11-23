'use client'

import { type RefObject, useEffect, useState } from 'react'

/** Where a header's mega-menu panel goes, in pixels. */
export interface PanelFrame {
  /** The page's width, less a gutter at each side. */
  width: number
  /** From a trigger's bottom edge to the header's, plus the gutter. */
  sideOffset: number
  /** From the page's inline-start edge to each trigger's, less the gutter, by the key it was registered under. */
  offsets: Record<string, number>
}

/**
 * Measures where a mega-menu panel goes: across the page under the header,
 * whichever trigger opened it. The panel is anchored to that trigger and
 * portalled to the body, so neither edge is expressible in CSS. Pass the
 * result's `sideOffset` to the positioner, and the opened trigger's offset,
 * negated, as its `alignOffset`.
 *
 * @param triggers Every trigger, by the menu item value it opens.
 * @param gutter The space the panel keeps from the page's sides and from the header.
 */
export function usePanelFrame(
  triggers: RefObject<Map<string, HTMLElement>>,
  rtl: boolean,
  gutter = 8,
): PanelFrame | undefined {
  const [frame, setFrame] = useState<PanelFrame>()

  useEffect(() => {
    const [first] = triggers.current.values()
    const header = first?.closest('header')
    if (!header) return

    const measure = () => {
      const page = document.documentElement.clientWidth
      const headerBottom = header.getBoundingClientRect().bottom
      const offsets: Record<string, number> = {}
      let sideOffset = gutter

      for (const [key, trigger] of triggers.current) {
        const box = trigger.getBoundingClientRect()
        // Below `lg` the triggers are hidden and measure 0, so the last frame stands.
        if (box.width === 0) return
        offsets[key] = (rtl ? page - box.right : box.left) - gutter
        sideOffset = headerBottom - box.bottom + gutter
      }
      setFrame({ width: page - 2 * gutter, sideOffset, offsets })
    }

    measure()
    // The triggers too, which move without the header resizing once the web font swaps in.
    const observer = new ResizeObserver(measure)
    observer.observe(header)
    for (const trigger of triggers.current.values()) observer.observe(trigger)
    return () => observer.disconnect()
  }, [triggers, rtl, gutter])

  return frame
}
