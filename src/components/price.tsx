import type { ComponentProps } from 'react'
import { formatMoneyParts } from '@/lib/commerce/format'
import type { Money } from '@/lib/commerce/types'
import { cn } from '@/lib/utils'

interface PriceProps extends Omit<ComponentProps<'span'>, 'children'> {
  money: Money
  /** BCP-47 locale. Defaults to the storefront's; wire to the active one with i18n. */
  locale?: string
  /**
   * Set the cents in smaller type. Turn it off wherever the price is already
   * secondary (a struck compare-at price, a line total in a summary), where a
   * second hierarchy inside a demoted number has nothing to play against, and a
   * strike drawn at one height crosses two type sizes unevenly.
   */
  scaleFraction?: boolean
  /** Announce the amount as the original price, for the struck compare-at price beside a sale price. */
  compareAt?: boolean
}

/**
 * A price with its cents set in smaller type, the way a price tag is typeset,
 * so the figure that matters reads first.
 *
 * The fraction stays on the baseline rather than riding a `<sub>` or a
 * `vertical-align`. `line-through` is painted once, at the baseline of the
 * element that declares it, straight across every descendant, so a shifted
 * fraction is missed by the strike on a compare-at price, and looks dropped
 * everywhere else. Smaller and lighter carries the emphasis on its own.
 *
 * Screen readers get the amount as 1 run of `sr-only` text, not a number, a
 * pause, and 2 loose digits. The root is `relative` so that text cannot escape
 * a horizontally scrolling row and widen the page.
 */
export function Price({ money, locale, scaleFraction = true, compareAt = false, className, ...props }: PriceProps) {
  const { whole, fraction } = formatMoneyParts(money, locale)

  return (
    <span data-slot="price" className={cn('relative whitespace-nowrap', className)} {...props}>
      <span className="sr-only">{`${compareAt ? 'Original price: ' : ''}${whole}${fraction}`}</span>
      <span aria-hidden>
        {whole}
        {fraction ? (
          <span
            data-slot="price-fraction"
            className={cn('align-baseline', scaleFraction && 'text-[0.7em] font-medium')}
          >
            {fraction}
          </span>
        ) : null}
      </span>
    </span>
  )
}
