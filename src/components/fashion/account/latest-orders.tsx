import Link from 'next/link'
import { buttonVariants } from '@appica/ui-react/button'
import { TEXT_ACTION } from '@/components/fashion/text-action'
import type { Order } from '@/lib/commerce/types'
import { cn } from '@/lib/utils'
import { ORDERS_HREF } from './account-nav'
import { OrderRow } from './order-row'

/** How many orders still on their way the Overview lists before "All orders" takes over. */
const SHOWN = 2

interface LatestOrdersProps {
  /** The account's orders, newest first. */
  orders: Order[]
  className?: string
}

/**
 * The Overview's answer to "where is my order?": the ones still on their way,
 * or the last one once everything has arrived. Renders nothing for an account
 * that has never ordered.
 */
export function LatestOrders({ orders, className }: LatestOrdersProps) {
  const moving = orders.filter((order) => order.tracking.status !== 'delivered')
  const shown = moving.length > 0 ? moving.slice(0, SHOWN) : orders.slice(0, 1)

  if (shown.length === 0) return null

  return (
    <section aria-labelledby="latest-orders" className={cn('flex flex-col gap-2', className)}>
      <div className="flex items-baseline justify-between gap-4">
        <h2 id="latest-orders" className="text-foreground-intense text-2xl font-medium">
          {moving.length > 0 ? 'On the way' : 'Your last order'}
        </h2>
        <Link
          href={ORDERS_HREF}
          data-slot="button"
          className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }), TEXT_ACTION)}
        >
          All orders
        </Link>
      </div>

      <ul className="divide-y">
        {shown.map((order) => (
          <li key={order.number} className="py-5">
            <OrderRow order={order} heading="h3" />
          </li>
        ))}
      </ul>
    </section>
  )
}
