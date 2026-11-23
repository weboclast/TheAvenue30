import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { buttonVariants } from '@appica/ui-react/button'
import { ORDERS_HREF } from '@/components/fashion/account/account-nav'
import { CaretSwap } from '@/components/fashion/caret-swap'
import { OrderDetails } from '@/components/fashion/checkout/order-details'
import { OrderSummary } from '@/components/fashion/checkout/order-summary'
import { ChangeAddressAction, ViewInvoiceAction } from '@/components/fashion/order-tracking/order-actions'
import { TrackingHelp } from '@/components/fashion/order-tracking/tracking-help'
import { TrackingStatus } from '@/components/fashion/order-tracking/tracking-status'
import { getAccountOrder } from '@/lib/orders'
import { cn } from '@/lib/utils'

export async function generateMetadata({ params }: PageProps<'/account/orders/[id]'>): Promise<Metadata> {
  const order = await getAccountOrder('fashion', (await params).id)
  return { title: order ? `Order ${order.number}` : 'Order details' }
}

/**
 * One order inside the account, built from the same pieces as its public
 * tracking page. Entitlement is the session, not the URL: `getAccountOrder`
 * answers only for an order this customer placed, and anything else is a 404.
 */
export default async function FashionAccountOrderPage({ params }: PageProps<'/account/orders/[id]'>) {
  const { id } = await params
  const order = await getAccountOrder('fashion', id)

  if (!order) notFound()

  return (
    <>
      <Link
        href={ORDERS_HREF}
        data-slot="button"
        className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }), 'group -ms-2.5 w-fit')}
      >
        <CaretSwap direction="back" data-icon="start" className="size-3" />
        Orders
      </Link>

      <div className="grid items-start gap-10 xl:grid-cols-12 xl:gap-8">
        <div className="flex min-w-0 flex-col gap-10 xl:col-span-7">
          <TrackingStatus order={order} />
          <OrderDetails
            order={order}
            addressAction={order.tracking.addressEditable ? <ChangeAddressAction order={order} /> : null}
            paymentAction={<ViewInvoiceAction order={order} />}
          />
        </div>

        {/* Clears the header's pinned bar, like the bag's summary. */}
        <OrderSummary order={order} className="min-w-0 xl:sticky xl:top-20 xl:col-span-5 xl:row-span-2" />

        <TrackingHelp order={order} className="min-w-0 xl:col-span-7" />
      </div>
    </>
  )
}
