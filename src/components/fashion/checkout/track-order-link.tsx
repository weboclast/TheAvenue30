'use client'

import Link from 'next/link'
import { buttonVariants } from '@appica/ui-react/button'
import { useMediaQuery } from '@appica/ui-react/hooks/use-media-query'

/** From `sm` the button is large. Keep in step with `--breakpoint-sm` in `globals.css`. */
const LARGE_BUTTON = '(min-width: 31.25rem)'

/**
 * The receipt's way on to order tracking, straight to this order: the cookie
 * the checkout wrote already lets this visitor see it. A client component only
 * for its size, which a media query decides.
 */
export function TrackOrderLink({ orderNumber }: { orderNumber: string }) {
  const large = useMediaQuery(LARGE_BUTTON, { defaultValue: true })

  return (
    <Link
      href={`/order-tracking/${orderNumber}`}
      data-slot="button"
      className={buttonVariants({ size: large ? 'lg' : 'md' })}
    >
      Track your order
    </Link>
  )
}
