'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { AuthCardHeading } from './auth-card'
import { SignInForm } from './sign-in-form'

interface CheckoutSignInFlowProps {
  /**
   * Renders the heading. Defaults to `AuthCardHeading` (the page context); the
   * drawer passes one that renders `DrawerTitle`/`DrawerDescription`.
   */
  renderHeading?: (heading: { title: string; description: string }) => React.ReactNode
  /**
   * Called once the shopper is signed in. Defaults to navigating to the
   * checkout; the drawer closes itself instead.
   */
  onComplete?: () => void
}

const defaultRenderHeading = ({ title, description }: { title: string; description: string }) => (
  <AuthCardHeading title={title} description={description} />
)

/**
 * Sign-in for the checkout gate, shared by the `/checkout-sign-in` page and the
 * checkout sign-in drawer.
 *
 * Email and password, because that is the customer sign-in nearly every
 * commerce backend offers.
 */
export function CheckoutSignInFlow({ renderHeading = defaultRenderHeading, onComplete }: CheckoutSignInFlowProps) {
  const router = useRouter()

  return (
    <>
      {renderHeading({
        title: 'Sign in for faster checkout',
        description: 'Your addresses and payment methods, already filled in.',
      })}
      <SignInForm
        onSuccess={onComplete ?? (() => router.push('/checkout'))}
        forgotPasswordSlot={
          <Link
            href="/forgot-password"
            className="text-foreground hover:text-foreground-intense text-sm underline transition-colors hover:no-underline motion-reduce:transition-none"
          >
            Forgot password?
          </Link>
        }
      />
      <p className="text-sm">
        New to The Avenue 30?{' '}
        <Link href="/register" className="text-foreground-intense font-medium underline hover:no-underline">
          Create account
        </Link>
      </p>
    </>
  )
}
