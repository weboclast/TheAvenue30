import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Button } from '@appica/ui-react/button'
import { AuthCard, AuthCardPanel } from '@/components/auth/auth-card'
import { CheckoutSignInFlow } from '@/components/auth/checkout-sign-in-flow'
import { Logo } from '@/components/logo'
import { getCart } from '@/lib/cart'
import { REFERENCE_DEMO } from '@/lib/demos'

export const metadata: Metadata = {
  title: 'Checkout sign in',
}

/**
 * The gate an unauthenticated shopper lands on after "Proceed to checkout": sign
 * in or continue as guest.
 *
 * An empty cart is turned back here rather than at the checkout, which both ways
 * out lead to: bouncing from inside the checkout's own layout flashes its chrome
 * on the way past.
 */
export default async function CheckoutSignInPage() {
  const cart = await getCart(REFERENCE_DEMO)
  if (cart.lines.length === 0) redirect('/cart')

  return (
    <AuthCard className="max-w-130 md:flex-col">
      <AuthCardPanel className="sm:p-6">
        <Logo variant="mark" href="/" className="h-10 sm:h-12" />
        <CheckoutSignInFlow />
      </AuthCardPanel>
      <AuthCardPanel aside className="sm:p-6">
        <div className="flex flex-col gap-1.5">
          <h2 className="text-foreground-intense text-2xl font-medium">Guest checkout</h2>
          <p className="text-foreground text-sm">Sign up at checkout to grab some awesome The Avenue 30 perks!</p>
        </div>
        <Button
          variant="secondary"
          size="lg"
          className="w-full"
          nativeButton={false}
          render={<Link href="/checkout" />}
        >
          Continue as a guest
        </Button>
      </AuthCardPanel>
    </AuthCard>
  )
}
