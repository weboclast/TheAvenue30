import type { Metadata } from 'next'
import Link from 'next/link'
import { RecentOrders } from '@/components/fashion/order-tracking/recent-orders'
import { TrackOrderForm } from '@/components/orders/track-order-form'
// Demo scaffolding. Deleting the demo data breaks this import on purpose:
// sample credentials must not survive into a real store.
import { DEMO_CUSTOMER, DEMO_ORDER_NUMBERS } from '@/lib/demo-customer'
import { getRecentOrders } from '@/lib/orders'

export const metadata: Metadata = {
  title: 'Track order',
}

/**
 * Guest order lookup, and where `order-tracking/[id]` sends anyone it cannot
 * show an order to. Orders this visitor already holds are offered first.
 * `?number=` and `?email=` prefill the fields, the way a shipping email's button
 * would; neither grants anything.
 */
export default async function FashionOrderTrackingLookupPage({ searchParams }: PageProps<'/order-tracking'>) {
  const [{ number, email }, recent] = await Promise.all([searchParams, getRecentOrders('fashion')])

  return (
    <main className="container flex flex-1 flex-col items-center pt-8 pb-16 sm:pt-10 md:pt-14 md:pb-20 xl:pt-16 xl:pb-24">
      <div className="flex w-full max-w-lg flex-col gap-10">
        <header className="flex flex-col gap-3">
          <h1 className="text-foreground-intense text-4xl font-medium text-balance md:text-5xl">Track your order</h1>
          <p className="text-pretty">
            Your order number starts with APC and is in your confirmation email. Use the email address you ordered with.
          </p>
        </header>

        <RecentOrders orders={recent} />

        <div className="flex flex-col gap-5">
          {recent.length ? <h2 className="text-foreground-intense text-xl font-medium">Track another order</h2> : null}
          <TrackOrderForm
            demo="fashion"
            defaultNumber={typeof number === 'string' ? number : undefined}
            defaultEmail={typeof email === 'string' ? email : undefined}
            fieldVariant="outline"
            spinnerVariant="dots"
          />
          <p>
            For this demo, track{' '}
            <span className="text-foreground-intense font-mono">{DEMO_ORDER_NUMBERS.outForDelivery}</span> with{' '}
            <span className="text-foreground-intense font-medium">{DEMO_CUSTOMER.email}</span>.
          </p>
        </div>

        <p>
          Lost the email?{' '}
          <Link
            href="/contact"
            className="text-foreground-intense outline-ring rounded-4xs font-medium underline hover:no-underline focus-visible:outline-2 focus-visible:outline-offset-2"
          >
            Write to us
          </Link>{' '}
          and we find the order for you.
        </p>
      </div>
    </main>
  )
}
