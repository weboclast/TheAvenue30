import { CheckoutHeader } from '@/components/fashion/checkout/checkout-header'
import { SlimFooter } from '@/components/slim-footer'
import { SkipTarget } from '@/components/skip-link'

/**
 * The Fashion checkout shell, around the checkout and its order confirmation:
 * its own stripped header instead of the storefront's, so nothing competes with
 * finishing the order. The bag and the wishlist are the demo layout's, above it.
 */
export default function FashionCheckoutLayout({ children }: LayoutProps<'/'>) {
  return (
    <div className="flex flex-1 flex-col">
      <CheckoutHeader />
      <SkipTarget />
      {children}
      <SlimFooter demo="fashion" />
    </div>
  )
}
