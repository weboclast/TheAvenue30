import type { ComponentProps } from 'react'
import { CaretDownFilled, CaretLeftFilled, CaretRightFilled, CaretUpFilled } from '@appica/icons-react'
import { cn } from '@/lib/utils'

/*
 * 2 carets chasing each other through a 1-glyph window: the one at rest leaves
 * the way it points as the next arrives behind it. Kept here so every caret
 * moves alike.
 */

/** `className` for a `CarouselPrev` or `CarouselNext` holding a caret: the hover group, inert while the arrow is disabled. */
export const CARET_ARROW = 'group has-data-disabled:pointer-events-none'

/** `className` for the caret on a menu's trigger, which turns over while the menu is open. Mark the trigger `group/trigger`. */
export const ROTATING_CARET =
  'size-3.5 transition-transform duration-200 ease-out group-data-popup-open/trigger:rotate-180 motion-reduce:transition-none'

/** Movement shared by both glyphs. `size-full` opts out of a button's own icon sizing. */
const SWAP =
  'col-start-1 row-start-1 size-full transition-transform duration-350 ease-out motion-reduce:transition-none'

/**
 * The glyph each direction shows, and where its 2 copies start and end. Written
 * out per direction, since Tailwind only finds class names it can read.
 */
const TRAVEL = {
  forward: {
    Caret: CaretRightFilled,
    leaves: 'motion-safe:group-hover:translate-x-full motion-safe:group-focus-visible:translate-x-full',
    arrives: '-translate-x-full motion-safe:group-hover:translate-x-0 motion-safe:group-focus-visible:translate-x-0',
  },
  back: {
    Caret: CaretLeftFilled,
    leaves: 'motion-safe:group-hover:-translate-x-full motion-safe:group-focus-visible:-translate-x-full',
    arrives: 'translate-x-full motion-safe:group-hover:translate-x-0 motion-safe:group-focus-visible:translate-x-0',
  },
  down: {
    Caret: CaretDownFilled,
    leaves: 'motion-safe:group-hover:translate-y-full motion-safe:group-focus-visible:translate-y-full',
    arrives: '-translate-y-full motion-safe:group-hover:translate-y-0 motion-safe:group-focus-visible:translate-y-0',
  },
  up: {
    Caret: CaretUpFilled,
    leaves: 'motion-safe:group-hover:-translate-y-full motion-safe:group-focus-visible:-translate-y-full',
    arrives: 'translate-y-full motion-safe:group-hover:translate-y-0 motion-safe:group-focus-visible:translate-y-0',
  },
}

interface CaretSwapProps extends ComponentProps<'span'> {
  /**
   * Which way the caret points, and so which way both glyphs travel.
   * @default 'forward'
   */
  direction?: keyof typeof TRAVEL
}

/**
 * The storefront's caret, swapping itself out on hover. Decorative, so it
 * carries no label: put `group` on the button or link holding it, and size the
 * glyph by sizing this window.
 */
export function CaretSwap({ direction = 'forward', className, ...props }: CaretSwapProps) {
  const { Caret, leaves, arrives } = TRAVEL[direction]

  return (
    // The mirror turns the horizontal pair around in RTL and leaves the vertical pair as it is.
    <span aria-hidden className={cn('relative grid size-4 overflow-hidden rtl:-scale-x-100', className)} {...props}>
      <Caret className={cn(SWAP, leaves)} />
      <Caret className={cn(SWAP, arrives)} />
    </span>
  )
}
