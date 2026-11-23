'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { Button } from '@appica/ui-react/button'
import { Popover, PopoverContent, PopoverTrigger } from '@appica/ui-react/popover'
import { Progress } from '@appica/ui-react/progress'
import { ScrollArea } from '@appica/ui-react/scroll-area'
import { LegalToc } from '@/components/legal/legal-toc'
import type { LegalTocItem } from '@/lib/legal'
import { cn } from '@/lib/utils'

/** How far down the document the reader is, 0-100. */
function useScrollProgress(): number {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    let frame = 0
    const measure = () => {
      frame = 0
      const { scrollHeight } = document.documentElement
      const travel = scrollHeight - window.innerHeight
      setProgress(travel > 0 ? Math.min(100, Math.max(0, (window.scrollY / travel) * 100)) : 0)
    }
    const onScroll = () => {
      // rAF-throttled, so a scroll never queues more than 1 re-render per frame.
      if (!frame) frame = window.requestAnimationFrame(measure)
    }

    measure()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      if (frame) window.cancelAnimationFrame(frame)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [])

  return progress
}

/** Rides above the compare bar, the way the shopping assistant does. */
const PLACEMENT = 'fixed z-40 bottom-[max(--spacing(4),calc(var(--compare-bar-height,0px)+--spacing(2)))]'

interface LegalTocFloatingProps {
  items: LegalTocItem[]
  className?: string
}

/**
 * The table of contents below `lg`, where there is no room for a rail: a fixed
 * button whose ring tracks reading progress, opening the full outline in a
 * popover. Picking a heading closes it, because the anchor it jumps to is behind
 * the panel. It floats in the start corner, the one the shopping assistant leaves free.
 */
export function LegalTocFloating({ items, className }: LegalTocFloatingProps) {
  const progress = useScrollProgress()
  const [open, setOpen] = useState(false)
  // The popover portals into here rather than the body, so it stays inside the
  // rail's own stacking and scroll context.
  const anchor = useRef<HTMLDivElement>(null)

  const closeOnHeading = useCallback((event: React.MouseEvent<HTMLElement>) => {
    if ((event.target as HTMLElement).closest('a')) setOpen(false)
  }, [])

  if (items.length === 0) return null

  return (
    <div ref={anchor} className={cn(PLACEMENT, 'inset-s-4', className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          className="bg-background before:border-border-strong dark:shadow-black/72we0 shadow-[0_4px_12px_-2px_var(--shadow-color),0_16px_32px_-8px_var(--shadow-color)] shadow-black/25"
          render={
            // The trigger renames the slot; this takes it back, so `[data-slot='button']` rules reach it.
            <Button data-slot="button" variant="outline" size="icon-md" aria-label="On this page">
              <Progress
                variant="circular"
                value={progress}
                size={24}
                thickness={3}
                aria-hidden="true"
                className="pointer-events-none **:data-[slot=progress-indicator]:transition-none"
              />
            </Button>
          }
        />

        <PopoverContent container={anchor} side="top" align="start" arrow={false} className="w-64 overflow-hidden p-0">
          <ScrollArea scrollbarVisibility="auto" className="max-h-[min(70svh,30rem)] p-4">
            <LegalToc items={items} onClick={closeOnHeading} />
          </ScrollArea>
        </PopoverContent>
      </Popover>
    </div>
  )
}
