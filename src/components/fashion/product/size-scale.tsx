import type { ProductOptionValue } from '@/lib/commerce/types'
import { cn } from '@/lib/utils'

/**
 * How many sizes the card lists before it starts counting. Past this the column
 * is taller than the photograph it sits on, and a run that long is read as a
 * wall rather than scanned.
 */
const MAX_VISIBLE = 5

/** `py-2` over a 16px line puts each number on the same 32px step as the heart above them. */
const PILL = 'py-2 text-center font-mono text-xs leading-4 font-medium'

interface SizeScaleProps extends Omit<React.ComponentProps<'ul'>, 'children'> {
  /** The size run, in the order to present it, from `productSizes`. */
  sizes: ProductOptionValue[]
  /** Names the run for assistive tech, e.g. `'Sizes, Oversized cable-knit sweater'`. */
  label: string
}

/**
 * The run of sizes a garment comes in, down the side of its card. Sold-out
 * sizes stay on the list, struck through: a shopper reads a missing 44 as "this
 * doesn't come in my size" rather than "my size has gone". A long run is cut to
 * the first few and closed with a count of what is left to buy.
 *
 * Deliberately not interactive. Picking a size is a decision made on the
 * product page, against a fit guide and a returns policy; here it answers the
 * one question that stops a shopper opening the page at all.
 */
export function SizeScale({ sizes, label, className, ...props }: SizeScaleProps) {
  const visible = sizes.slice(0, MAX_VISIBLE)
  // Only what can still be bought is counted: a tally of sold-out sizes offers
  // the shopper nothing to open the page for.
  const more = sizes.slice(MAX_VISIBLE).filter((size) => size.available !== false).length

  return (
    <ul data-slot="size-scale" aria-label={label} className={cn('flex flex-col gap-1', className)} {...props}>
      {visible.map((size) => {
        const soldOut = size.available === false
        return (
          <li
            key={size.id}
            className={cn(PILL, soldOut ? 'text-foreground-subtle line-through' : 'text-foreground-emphasis')}
          >
            {size.label}
            {soldOut ? <span className="sr-only">, sold out</span> : null}
          </li>
        )
      })}
      {more > 0 ? (
        <li className={cn(PILL, 'text-foreground-muted')}>
          +{more}
          <span className="sr-only"> more sizes available</span>
        </li>
      ) : null}
    </ul>
  )
}
