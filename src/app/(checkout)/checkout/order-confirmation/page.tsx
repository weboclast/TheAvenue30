import type { Metadata } from 'next'
import Link from 'next/link'
import { buttonVariants } from '@appica/ui-react/button'
import { RecommendedProducts } from '@/components/fashion/cart/recommended-products'
import { OrderConfirmation } from '@/components/fashion/checkout/order-confirmation'
import { Eyebrow } from '@/components/fashion/eyebrow'
import { getPlacedOrder } from '@/lib/checkout'
import { getDepartment } from '@/lib/departments'

export const metadata: Metadata = {
  title: 'Order confirmation',
}

/**
 * The order confirmation, read back from the order token the checkout stored,
 * with the department's best sellers under it.
 *
 * Both states live on this route: an order is confirmed once, so a bookmark
 * opened the next day lands on the empty state.
 */
export default async function FashionOrderConfirmationPage() {
  const [order, department] = await Promise.all([getPlacedOrder('fashion'), getDepartment('fashion')])
  const shopHref = department ? `/catalog/${department.slug}` : '/catalog'

  if (!order) {
    return (
      <main className="container flex flex-1 flex-col items-center justify-center gap-4 py-16 text-center sm:py-20 md:py-24">
        <Eyebrow>Order confirmation</Eyebrow>
        <h1 className="text-foreground-intense text-3xl font-medium md:text-4xl">No order to show</h1>
        <p className="mb-2 max-w-md text-pretty">
          This page confirms an order the moment it is placed. If you are looking for one from earlier, track it by its
          order number.
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          <Link href="/order-tracking" data-slot="button" className={buttonVariants({ size: 'lg' })}>
            Track your order
          </Link>
          <Link href={shopHref} data-slot="button" className={buttonVariants({ variant: 'soft', size: 'lg' })}>
            Continue shopping
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="flex flex-1 flex-col">
      <OrderConfirmation order={order} />
      <RecommendedProducts department={department?.slug} exclude={order.lines.map((line) => line.productSlug)} />
    </main>
  )
}
