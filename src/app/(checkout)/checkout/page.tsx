import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { CheckoutForm } from '@/components/fashion/checkout/checkout-form'
import { getSession } from '@/lib/auth'
import { getCart } from '@/lib/cart'

export const metadata: Metadata = {
  title: 'Checkout',
}

/**
 * The single-page checkout: contact, delivery, and payment, and the order
 * summary beside them.
 *
 * An empty bag goes back to the bag page, which already owns that state and the
 * shelves that give a shopper somewhere to go. Nothing on this route requires
 * an account.
 */
export default async function FashionCheckoutPage() {
  const [customer, cart] = await Promise.all([getSession(), getCart('fashion')])
  if (cart.lines.length === 0) redirect('/cart')

  return (
    <main className="flex flex-1 flex-col">
      <CheckoutForm customer={customer} />
    </main>
  )
}
