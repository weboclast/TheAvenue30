'use client'

import { useEffect, useRef } from 'react'
import Link, { useLinkStatus } from 'next/link'
import { buttonVariants } from '@appica/ui-react/button'
import { Spinner } from '@appica/ui-react/spinner'
import { cn } from '@/lib/utils'

interface LoadMoreProps {
  /** The grid of the {@link shown} items loaded so far. */
  children: React.ReactNode
  shown: number
  /** Items in the whole listing. */
  total: number
  /** What the count calls them, plural: `'items'`, `'stories'`. */
  unit: string
  /** The `data-slot` of each item's link, which takes focus when a load comes from the keyboard. */
  focusSlot: string
  /** The listing with 1 more screen loaded. */
  href: string
  /** Whether the listing is longer than its first screen. Only then does the count show. */
  paged: boolean
  /**
   * The top of the next row, drawn behind the link while there is more to load.
   * Pass the grid's own gap as {@link className} with it, so it sits where that
   * row will.
   */
  teaser?: React.ReactNode
  className?: string
}

/**
 * The grid and the "Load more" link under it. A link, so every screen has an
 * address to come back to; it replaces the history entry, so Back leaves the
 * listing. Loaded from the keyboard, focus moves to the first new item.
 */
export function LoadMore({ children, shown, total, unit, focusSlot, href, paged, teaser, className }: LoadMoreProps) {
  const gridRef = useRef<HTMLDivElement>(null)
  // Index of the first item the pending load adds.
  const firstNew = useRef<number | null>(null)

  useEffect(() => {
    const index = firstNew.current
    if (index === null || shown <= index) return
    firstNew.current = null
    gridRef.current?.querySelectorAll<HTMLElement>(`[data-slot="${focusSlot}"]`)[index]?.focus({ preventScroll: true })
  }, [shown, focusSlot])

  const more = shown < total

  return (
    <div className={cn('flex flex-col gap-12', className)}>
      <div ref={gridRef}>{children}</div>

      {paged ? (
        <div className={cn('flex flex-col items-center gap-4', teaser && 'relative isolate pt-6')}>
          {teaser && more ? (
            <div aria-hidden className="absolute inset-0 -z-10">
              {teaser}
            </div>
          ) : null}
          {more ? (
            <Link
              href={href}
              scroll={false}
              replace
              prefetch={false}
              onClick={(event) => {
                // 0 is Enter or a screen reader. Focusing a card after a mouse click would reveal its controls.
                if (event.detail === 0) firstNew.current = shown
              }}
              data-slot="button"
              className={buttonVariants({ size: 'lg' })}
            >
              <LoadMoreLabel />
            </Link>
          ) : null}
          <p aria-live="polite" className="text-foreground-muted text-sm">
            Showing {shown} of {total} {unit}
          </p>
        </div>
      ) : null}
    </div>
  )
}

/** The link's label, or a spinner and "Loading" while the next screen is on its way. */
function LoadMoreLabel() {
  const { pending } = useLinkStatus()
  if (!pending) return 'Load more'

  return (
    <>
      <Spinner variant="dots" currentColor aria-hidden data-icon="start" className="text-xl" />
      Loading
    </>
  )
}
