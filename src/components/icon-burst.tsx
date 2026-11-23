'use client'

import { type CSSProperties, useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'

/**
 * The spray, fixed rather than random so every render agrees with itself.
 * Distances stay within ~20px, which is what lets the burst sit inside a small
 * control without escaping a parent that clips its overflow.
 */
const PARTICLES = [
  { x: 0, y: -20, size: 2.5, duration: 600, delay: 0, endScale: 0.6 },
  { x: 13, y: -13, size: 3.25, duration: 660, delay: 30, endScale: 0.5 },
  { x: 18, y: 0, size: 2.25, duration: 580, delay: 15, endScale: 0.65 },
  { x: 14, y: 14, size: 2.9, duration: 640, delay: 45, endScale: 0.55 },
  { x: 0, y: 17, size: 2.5, duration: 610, delay: 10, endScale: 0.6 },
  { x: -14, y: 14, size: 3.1, duration: 680, delay: 35, endScale: 0.5 },
  { x: -18, y: 0, size: 2.15, duration: 590, delay: 20, endScale: 0.65 },
  { x: -15, y: -15, size: 2.75, duration: 650, delay: 40, endScale: 0.55 },
]

/** Longest particle duration plus its delay, which is when the burst can be cleared. */
const BURST_MS = 720

/**
 * The timing behind {@link IconBurst}: `bursting` says whether to render one,
 * and `burst()` starts or restarts it.
 *
 * Firing while a burst is already running replays it from the beginning rather
 * than being ignored, because the particles are mounted only while `bursting` is
 * true and a CSS animation restarts when its element is.
 */
export function useIconBurst() {
  const [bursting, setBursting] = useState(false)
  const burstRef = useRef<ReturnType<typeof setTimeout>>(undefined)

  useEffect(() => () => clearTimeout(burstRef.current), [])

  const burst = () => {
    // Re-arm on every fire: unmounting and remounting is what replays it.
    setBursting(false)
    clearTimeout(burstRef.current)
    requestAnimationFrame(() => setBursting(true))
    burstRef.current = setTimeout(() => setBursting(false), BURST_MS)
  }

  return { bursting, burst }
}

/**
 * A short spray of particles thrown from the center of the nearest positioned
 * ancestor, as the acknowledgment for a click worth celebrating.
 *
 * Render it only while {@link useIconBurst}'s `bursting` is true: it animates on
 * mount and has nothing to show afterward. The particles are painted in
 * `currentColor`, so color it through `className` or leave it to inherit. The
 * control it sits in needs its own positioning, and enough room that a ~20px
 * throw is not clipped away.
 */
export function IconBurst({ className }: { className?: string }) {
  return (
    <span aria-hidden className={cn('pointer-events-none absolute inset-s-1/2 top-1/2 size-0', className)}>
      {PARTICLES.map((particle, index) => (
        <span
          key={index}
          className="animate-icon-burst absolute rounded-full bg-current opacity-0 motion-reduce:animate-none"
          style={
            {
              '--particle-x': `${particle.x}px`,
              '--particle-y': `${particle.y}px`,
              '--particle-end-scale': particle.endScale,
              insetInlineStart: `${-particle.size / 2}px`,
              top: `${-particle.size / 2}px`,
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              animationDuration: `${particle.duration}ms`,
              animationDelay: `${particle.delay}ms`,
            } as CSSProperties
          }
        />
      ))}
    </span>
  )
}
