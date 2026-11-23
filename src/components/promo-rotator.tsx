'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useReducedMotion } from '@appica/ui-react/hooks/use-reduced-motion'
import { cn } from '@/lib/utils'

const ROTATE_INTERVAL_MS = 6000

/** One message in a {@link PromoRotator}. */
export interface PromoMessage {
  label: string
  /** Where the message leads. Omit for one that only informs, like a shipping threshold. */
  href?: string
}

interface PromoRotatorProps {
  messages: PromoMessage[]
  className?: string
}

/**
 * Cross-fades between promo messages, pausing while hovered or focused so a
 * link can be reached, and holding the first under reduced motion. The
 * messages share 1 grid cell, so toggle the rotator with `md:grid`, never
 * `md:block`.
 */
export function PromoRotator({ messages, className }: PromoRotatorProps) {
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const reduceMotion = useReducedMotion()

  useEffect(() => {
    if (paused || reduceMotion || messages.length < 2) return
    const rotation = window.setInterval(() => {
      setIndex((current) => (current + 1) % messages.length)
    }, ROTATE_INTERVAL_MS)
    return () => window.clearInterval(rotation)
  }, [paused, reduceMotion, messages.length])

  return (
    <p
      onPointerEnter={() => setPaused(true)}
      onPointerLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      className={cn('text-foreground-emphasis grid text-xs', className)}
    >
      {messages.map(({ label, href }, position) => {
        const shown = position === index
        const itemClass = cn(
          'col-start-1 row-start-1 truncate text-center transition-[opacity,filter] duration-700 motion-reduce:transition-none',
          shown ? 'opacity-100 blur-none' : 'opacity-0 blur-xs',
        )

        // `inert`, not `aria-hidden`: a hidden link stacked on top would still take focus and clicks.
        return href ? (
          <Link
            key={position}
            href={href}
            inert={!shown}
            className={cn(itemClass, 'outline-ring underline-offset-4 hover:underline')}
          >
            {label}
          </Link>
        ) : (
          <span key={position} inert={!shown} className={itemClass}>
            {label}
          </span>
        )
      })}
    </p>
  )
}
