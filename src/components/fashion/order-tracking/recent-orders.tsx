import Image from 'next/image'
import Link from 'next/link'
import { CaretSwap } from '@/components/fashion/caret-swap'
import type { Order } from '@/lib/commerce/types'
import { cn } from '@/lib/utils'

/**
 * The orders this visitor already holds, from `getRecentOrders`, so a shopper
 * back on the same device skips the form. Renders nothing when there are none.
 */
export function RecentOrders({ orders, className }: { orders: Order[]; className?: string }) {
  if (!orders.length) return null

  return (
    <section aria-labelledby="recent-orders" className={cn('flex flex-col gap-3', className)}>
      <h2 id="recent-orders" className="text-foreground-intense text-xl font-medium">
        Your recent orders
      </h2>
      <ul className="flex flex-col gap-2">
        {orders.map((order) => {
          const [first] = order.lines
          const stage = order.tracking.steps.find((step) => step.status === order.tracking.status)
          const items = order.lines.reduce((total, line) => total + line.quantity, 0)

          return (
            <li key={order.number}>
              <Link
                href={`/order-tracking/${order.number}`}
                className="group outline-ring hover:border-border-strong flex items-center gap-4 rounded-sm border p-3 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 motion-reduce:transition-none"
              >
                {first ? (
                  <span className="bg-background-muted rounded-2xs relative aspect-4/5 w-12 shrink-0 overflow-hidden">
                    <Image src={first.image.src} alt="" fill sizes="48px" className="object-cover" />
                  </span>
                ) : null}
                <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <span className="text-foreground-intense font-medium">Order {order.number}</span>
                  <span className="text-sm">{`${stage?.label} · ${items} ${items === 1 ? 'item' : 'items'}`}</span>
                </span>
                <CaretSwap className="size-4 shrink-0" />
              </Link>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
