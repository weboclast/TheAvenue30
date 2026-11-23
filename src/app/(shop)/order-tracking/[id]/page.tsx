import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { OrderDetails } from '@/components/fashion/checkout/order-details'
import { OrderSummary } from '@/components/fashion/checkout/order-summary'
import { ChangeAddressAction, ViewInvoiceAction } from '@/components/fashion/order-tracking/order-actions'
import { TrackingHelp } from '@/components/fashion/order-tracking/tracking-help'
import { TrackingStatus } from '@/components/fashion/order-tracking/tracking-status'
import { SUMMARY_ASIDE, SUMMARY_GRID, SUMMARY_MAIN } from '@/components/fashion/summary-layout'
import { getTrackedOrder } from '@/lib/orders'
import { cn } from '@/lib/utils'

export async function generateMetadata({ params }: PageProps<'/order-tracking/[id]'>): Promise<Metadata> {
  const order = await getTrackedOrder('fashion', (await params).id)
  return { title: order ? `Tracking order ${order.number}` : 'Order tracking' }
}

/**
 * Where an order has got to, laid out like the receipt it grew from: the stage
 * and the details beside the summary, then the 1 thing worth doing next. The URL
 * grants nothing: what lets this render is the cookie a lookup or the checkout
 * wrote, checked against the number in the path. See `lib/orders/AGENTS.md`.
 */
export default async function FashionOrderTrackingPage({ params }: PageProps<'/order-tracking/[id]'>) {
  const { id } = await params
  const order = await getTrackedOrder('fashion', id)

  // Not an error: a guessed number and an expired lookup both land back on the
  // form with the number filled in.
  if (!order) redirect(`/order-tracking?number=${encodeURIComponent(id)}`)

  return (
    <main className={cn('container flex-1 pt-8 pb-16 md:pt-12 md:pb-20 lg:pt-14 xl:pb-24', SUMMARY_GRID)}>
      <div className={cn('flex flex-col gap-10', SUMMARY_MAIN)}>
        <TrackingStatus order={order} />
        <OrderDetails
          order={order}
          addressAction={order.tracking.addressEditable ? <ChangeAddressAction order={order} /> : null}
          paymentAction={<ViewInvoiceAction order={order} />}
        />
      </div>

      <OrderSummary order={order} className={cn(SUMMARY_ASIDE, 'lg:top-20 lg:row-span-2')} />

      <TrackingHelp order={order} className={SUMMARY_MAIN} />
    </main>
  )
}
