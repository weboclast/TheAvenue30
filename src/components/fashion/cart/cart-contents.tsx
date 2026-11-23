'use client'

import { useRef } from 'react'
import Link from 'next/link'
import { buttonVariants } from '@appica/ui-react/button'
import { useRemovalFocus } from '@/components/cart/use-removal-focus'
import { SUMMARY_ASIDE, SUMMARY_GRID, SUMMARY_MAIN } from '@/components/fashion/summary-layout'
import { useBuyBarHeight } from '@/components/use-buy-bar-height'
import { Price } from '@/components/price'
import { useCart } from '@/lib/cart/cart-context'
import { cn } from '@/lib/utils'
import { CartGiftWrap } from './cart-gift-wrap'
import { CartLineRow } from './cart-line'
import { CartSummary } from './cart-summary'
import { EmptyCart } from './empty-cart'

/**
 * The bag itself: the lines, and what they come to. It reads the cart on the
 * client, so taking the last line out empties the page the shopper is on.
 */
export function CartContents({ shopHref }: { shopHref: string }) {
  const { cart } = useCart()
  const checkoutBarRef = useRef<HTMLDivElement>(null)
  useBuyBarHeight(checkoutBarRef, cart.lines.length > 0)
  const { list, heading } = useRemovalFocus(cart.lines)

  if (cart.lines.length === 0) return <EmptyCart shopHref={shopHref} headingRef={heading} />

  return (
    <section className="container flex flex-col gap-6 pt-8 pb-16 md:pt-10 md:pb-20 xl:pt-12 xl:pb-24">
      <h1 className="text-foreground-intense text-3xl font-medium md:text-4xl">
        Your bag <span className="text-foreground-subtle text-2xl font-normal md:text-3xl">({cart.totalQuantity})</span>
      </h1>

      <div className={SUMMARY_GRID}>
        <div className={cn('flex flex-col gap-6', SUMMARY_MAIN)}>
          <ul ref={list} className="divide-y border-y *:py-6">
            {cart.lines.map((line) => (
              <CartLineRow key={line.id} line={line} movable />
            ))}
          </ul>
          <CartGiftWrap />
        </div>

        {/* Clears the header's pinned `h-14` bar. */}
        <CartSummary className={cn(SUMMARY_ASIDE, 'lg:top-20')} />

        {/* Below `lg`, checkout rides the screen's bottom until the bag ends, standing in for the summary's. */}
        <div
          ref={checkoutBarRef}
          className="bg-background/80 sticky bottom-4 z-10 flex items-center justify-between gap-4 rounded-sm border py-2 ps-6 pe-2 backdrop-blur-xl lg:hidden"
        >
          <p className="flex flex-col">
            Total
            <Price
              money={cart.total}
              scaleFraction={false}
              className="text-foreground-intense font-mono text-lg font-semibold"
            />
          </p>
          <Link href="/checkout" data-slot="button" className={buttonVariants({ size: 'lg' })}>
            Checkout
          </Link>
        </div>
      </div>
    </section>
  )
}
