'use client'

import { type PointerEvent, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { LazyMotion, domAnimation, m, useMotionValue, useSpring, useTransform, useVelocity } from 'motion/react'
import { useReducedMotion } from '@appica/ui-react/hooks/use-reduced-motion'
import type { NavLink } from '@/components/fashion/link-column'
import type { ProductImage } from '@/lib/commerce/types'
import { cn } from '@/lib/utils'

/** How closely the tile trails the pointer. */
const FOLLOW = { stiffness: 500, damping: 40, mass: 0.5 }

/** How the tile's angle catches up and settles. */
const SETTLE = { stiffness: 200, damping: 18 }

/** How the tile fades and grows in, and what it shrinks back to. */
const SHOW = { opacity: { duration: 0.15 }, scale: { type: 'spring', stiffness: 400, damping: 28 } } as const
const HIDDEN = { opacity: 0, scale: 0.5 }

/** Pointer speed, in px a second, that leans the tile all the way. */
const FULL_LEAN_SPEED = 1500

/** In degrees, either way. */
const MAX_LEAN = 12

/** In degrees, leaning left and right by turns down the list. */
const REST_ANGLE = 6

/** One link in a {@link CategoryIndex}. */
export interface IndexLink extends NavLink {
  /** Replaces the cursor over the link. Leave it out for a link without one, like "Shop all". */
  image?: ProductImage
}

interface CategoryIndexProps {
  /** The heading over the links. */
  title: string
  links: IndexLink[]
  /** Merged over the tile under the cursor, to change its `bg-background` ground, size, or radius. */
  tileClassName?: string
  className?: string
}

/**
 * A titled column of links at display size. Under a mouse, a link's image
 * replaces the cursor on a tile that trails the pointer and leans the way it
 * moves, under the text and clipped to the box. Its images load on the first
 * mouse pass, so a phone never fetches them.
 */
export function CategoryIndex({ title, links, tileClassName, className }: CategoryIndexProps) {
  const reduce = useReducedMotion()
  const boxRef = useRef<HTMLDivElement>(null)
  // The box's corner in page coordinates, so the tile scrolls with the text.
  const origin = useRef({ x: 0, y: 0 })
  const [armed, setArmed] = useState(false)
  const [hovering, setHovering] = useState(false)
  // Kept after the pointer leaves, so the tile fades out on the image it showed.
  const [current, setCurrent] = useState(0)

  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const rest = useMotionValue(0)
  const followX = useSpring(x, FOLLOW)
  const followY = useSpring(y, FOLLOW)
  const lean = useTransform(useVelocity(followX), [-FULL_LEAN_SPEED, FULL_LEAN_SPEED], [-MAX_LEAN, MAX_LEAN])
  const rotate = useSpring(
    useTransform(() => rest.get() + lean.get()),
    SETTLE,
  )

  function track(event: PointerEvent) {
    x.set(event.pageX - origin.current.x)
    y.set(event.pageY - origin.current.y)
  }

  function show(event: PointerEvent, index: number) {
    const box = boxRef.current
    if (event.pointerType !== 'mouse' || !box) return

    const { left, top } = box.getBoundingClientRect()
    origin.current = { x: left + window.scrollX, y: top + window.scrollY }
    track(event)
    // Appear under the pointer, not fly in from where the tile last left.
    if (!hovering) {
      followX.jump(x.get())
      followY.jump(y.get())
    }
    rest.set(index % 2 ? -REST_ANGLE : REST_ANGLE)
    setCurrent(index)
    setHovering(true)
  }

  return (
    <LazyMotion features={domAnimation}>
      <div
        ref={boxRef}
        onPointerEnter={(event) => event.pointerType === 'mouse' && setArmed(true)}
        className={cn('relative isolate flex items-center overflow-hidden', className)}
      >
        <div className="relative z-1 flex flex-col gap-6 md:gap-8 lg:gap-10">
          <h2 className="text-foreground-intense font-mono text-lg uppercase">{title}</h2>
          <ul onPointerMove={(event) => hovering && track(event)} className="-my-2 flex flex-col xl:-my-3">
            {links.map(({ label, href, image }, index) => (
              <li key={href}>
                <Link
                  href={href}
                  onPointerEnter={image && ((event) => show(event, index))}
                  onPointerLeave={image && (() => setHovering(false))}
                  className={cn(
                    'text-foreground-subtle outline-ring inline-block rounded-xs py-2 text-4xl focus-visible:outline-2 md:text-5xl xl:py-3 xl:text-6xl',
                    'hover:text-foreground-intense focus-visible:text-foreground-intense active:text-foreground-intense',
                    'transition duration-250 ease-out motion-reduce:transition-none',
                    'active:duration-100 active:ease-in-out motion-safe:active:translate-y-px motion-safe:active:scale-[0.98]',
                    image && 'cursor-none',
                  )}
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {armed ? (
          <m.div
            aria-hidden
            // Physical on purpose: so are the pointer's coordinates.
            className="pointer-events-none absolute top-0 left-0"
            style={reduce ? { x, y } : { x: followX, y: followY, rotate }}
          >
            <m.div
              initial={HIDDEN}
              animate={hovering ? { opacity: 1, scale: 1 } : HIDDEN}
              transition={reduce ? { duration: 0 } : SHOW}
              className={cn(
                'bg-background relative size-20 -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-xs',
                tileClassName,
              )}
            >
              {links.map(({ href, image }, index) =>
                image ? (
                  <Image
                    key={href}
                    src={image.src}
                    alt=""
                    fill
                    sizes="80px"
                    className={cn(
                      'object-cover transition-opacity duration-150 motion-reduce:transition-none',
                      index !== current && 'opacity-0',
                    )}
                  />
                ) : null,
              )}
            </m.div>
          </m.div>
        ) : null}
      </div>
    </LazyMotion>
  )
}
