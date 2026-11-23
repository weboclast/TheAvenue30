'use client'

import { Suspense, useState } from 'react'
import Link from 'next/link'
import { ShoppingBag } from '@appica/icons-react'
import { Button, buttonVariants } from '@appica/ui-react/button'
import {
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@appica/ui-react/drawer'
import { useDirection } from '@appica/ui-react/hooks/use-direction'
import { useMediaQuery } from '@appica/ui-react/hooks/use-media-query'
import { ScrollArea } from '@appica/ui-react/scroll-area'
import { CartAnnouncer } from '@/components/cart/cart-announcer'
import { useRemovalFocus } from '@/components/cart/use-removal-focus'
import { CartLineRow } from '@/components/fashion/cart/cart-line'
import { HangerArtwork } from '@/components/fashion/cart/hanger-artwork'
import { type DepartmentLink, useCurrentDepartment } from '@/components/fashion/use-current-department'
import { Price } from '@/components/price'
import { useCart } from '@/lib/cart/cart-context'
import { cn } from '@/lib/utils'
import { CartRecommendations, type RecommendedProduct } from './cart-recommendations'

/** From `sm` the drawer's buttons are large. Keep in step with `--breakpoint-sm` in `globals.css`. */
const LARGE_BUTTONS = '(min-width: 31.25rem)'

interface CartDrawerProps {
  /** The store's departments, which decide what the drawer recommends and where shopping continues. */
  departments: DepartmentLink[]
  /** The department opened last, for a page whose URL names none. */
  remembered?: string
  /** Best sellers by department slug, streamed in behind the page. */
  recommended: Promise<Record<string, RecommendedProduct[]>>
}

/**
 * The header's bag and the drawer it opens, which also opens itself on every
 * add. Copy says "bag"; code and routes keep `cart`.
 */
export function CartDrawer({ departments, remembered, recommended }: CartDrawerProps) {
  const { cart, addCount } = useCart()
  const { current } = useCurrentDepartment(departments, remembered)
  const rtl = useDirection() === 'rtl'
  const [open, setOpen] = useState(false)
  // Opened during render, not in an effect, so it lands in the same paint as the new count.
  const [answered, setAnswered] = useState(addCount)
  if (answered !== addCount) {
    setAnswered(addCount)
    setOpen(true)
  }

  const buttonSize = useMediaQuery(LARGE_BUTTONS, { defaultValue: true }) ? 'lg' : 'md'

  const { list, heading } = useRemovalFocus(cart.lines)

  const count = cart.totalQuantity
  const empty = cart.lines.length === 0
  const close = () => setOpen(false)

  const recommendations = (
    <Suspense>
      <CartRecommendations
        recommended={recommended}
        department={current}
        exclude={cart.lines.map((line) => line.productSlug)}
        onNavigate={close}
      />
    </Suspense>
  )

  return (
    <>
      <Drawer side={rtl ? 'left' : 'right'} open={open} onOpenChange={setOpen}>
        <DrawerTrigger
          render={
            // Triggers rename the slot; this takes it back for `globals.css`.
            <Button
              data-slot="button"
              variant="soft"
              aria-label={count ? `Bag, ${count} ${count === 1 ? 'item' : 'items'}` : 'Bag, empty'}
            >
              <ShoppingBag data-icon="start" />
              {count}
            </Button>
          }
        />
        <DrawerContent className="w-120" closeLabel="Close bag">
          {/* Kept when empty for the drawer's accessible name. */}
          <DrawerHeader className={empty ? 'sr-only' : undefined}>
            <DrawerTitle ref={heading} tabIndex={-1} className="font-medium outline-none">
              Your bag <span className="text-foreground-subtle text-xl font-normal">({count})</span>
            </DrawerTitle>
          </DrawerHeader>

          <DrawerBody className="overflow-hidden px-0">
            {/* Stretches the content to the viewport, so the empty state can center in it. */}
            <ScrollArea className="h-full" viewportProps={{ className: '*:flex *:min-h-full *:flex-col' }}>
              {/* `pt-12` clears the close button when there is no room to center. */}
              <div className={cn('flex flex-1 flex-col gap-6 px-6 py-1', empty && 'pt-12')}>
                {empty ? (
                  <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
                    <HangerArtwork />
                    <div className="flex flex-col items-center gap-2">
                      <p className="text-foreground-intense text-3xl font-medium sm:text-4xl">Your bag is empty</p>
                      <p className="max-w-72">When you add products to your shopping bag, they will appear here.</p>
                    </div>
                    <Link
                      href={current ? `/catalog/${current}` : '/catalog'}
                      onClick={close}
                      data-slot="button"
                      className={buttonVariants({ size: buttonSize })}
                    >
                      Continue shopping
                    </Link>
                  </div>
                ) : (
                  <ul ref={list} className="flex flex-col gap-4">
                    {cart.lines.map((line) => (
                      <CartLineRow key={line.id} line={line} onNavigate={close} />
                    ))}
                  </ul>
                )}
                {recommendations}
              </div>
            </ScrollArea>
          </DrawerBody>

          {empty ? null : (
            <DrawerFooter className="gap-3">
              <p className="flex items-center justify-between gap-4">
                Subtotal:
                <Price
                  money={cart.subtotal}
                  scaleFraction={false}
                  className="text-foreground-intense font-mono text-lg font-semibold"
                />
              </p>
              <Link
                href="/checkout"
                onClick={close}
                data-slot="button"
                className={buttonVariants({ size: buttonSize, className: 'w-full' })}
              >
                Checkout
              </Link>
              <Link
                href="/cart"
                onClick={close}
                data-slot="button"
                className={buttonVariants({ variant: 'soft', size: buttonSize, className: 'w-full' })}
              >
                View bag
              </Link>
            </DrawerFooter>
          )}
        </DrawerContent>
      </Drawer>
      <CartAnnouncer noun="Bag" />
    </>
  )
}
