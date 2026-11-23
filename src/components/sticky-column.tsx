'use client'

import { type CSSProperties, type ComponentProps, useCallback, useState } from 'react'
import { cn } from '@/lib/utils'

/**
 * At `--sticky-top`, else the demo's `--header-height`, while the column fits on
 * screen. Once it doesn't, its end stays above the bottom edge and any bar
 * pinned there (`--buy-bar-height`), so a tall column scrolls to its end first.
 */
const PINNED_TOP =
  'top-[min(var(--sticky-top,var(--header-height,0px)),calc(100dvh-var(--column-height)-var(--buy-bar-height,0px)-1.5rem))]'

/**
 * A column that stays in view while the one beside it scrolls: a product
 * page's, or an account's sidebar. Add `sticky` and `self-start` at the
 * breakpoint where it sits in a grid. Give every column in the row one and the
 * shorter one sticks: the taller sets the row's height and has no room to move.
 */
export function StickyColumn({ className, style, ...props }: ComponentProps<'div'>) {
  const [height, setHeight] = useState(0)

  const measure = useCallback((column: HTMLDivElement) => {
    const observer = new ResizeObserver(([entry]) => setHeight(entry.borderBoxSize[0].blockSize))
    observer.observe(column)
    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={measure}
      style={{ '--column-height': `${height}px`, ...style } as CSSProperties}
      className={cn(PINNED_TOP, 'transition-[top] duration-300 ease-out motion-reduce:transition-none', className)}
      {...props}
    />
  )
}
