'use client'

import { useId } from 'react'
import { Gift } from '@appica/icons-react'
import { Switch } from '@appica/ui-react/switch'
import { useToastManager } from '@appica/ui-react/toast'
import { Price } from '@/components/price'
import { useCart } from '@/lib/cart/cart-context'
import { errorToast } from '@/lib/toast'

interface CartGiftWrapProps {
  /** Shown under the row while the order is wrapped: the checkout's gift note. */
  children?: React.ReactNode
}

/**
 * Gift wrapping for the whole order, under the bag's lines and in the checkout.
 * Renders nothing where the store does not offer it.
 */
export function CartGiftWrap({ children }: CartGiftWrapProps) {
  const { cart, updateCart, pending } = useCart()
  const toast = useToastManager()
  const id = useId()

  const giftBox = cart.giftBox
  if (!giftBox) return null

  const toggle = async (added: boolean) => {
    const result = await updateCart({ giftBox: added })
    if (!result.ok) toast.add(errorToast('Could not update the gift wrapping', result.error))
  }

  return (
    <div data-slot="cart-gift-wrap" className="flex flex-col gap-4 rounded-sm border p-4">
      {/* A grid, so the icon centers on the label's row while the price and the
          switch span the description's too, as in a checkout's option cards. */}
      <div className="grid grid-cols-[auto_minmax(0,1fr)_auto_auto] items-center gap-x-4">
        <Gift aria-hidden className="text-foreground-intense size-6" />
        <label htmlFor={id} className="text-foreground-intense cursor-pointer text-lg font-medium">
          Gift wrapping
        </label>
        <Price
          money={giftBox.price}
          scaleFraction={false}
          className="text-foreground-intense row-span-2 font-mono font-semibold"
        />
        <Switch
          id={id}
          checked={giftBox.added}
          disabled={pending}
          onCheckedChange={(next) => void toggle(next)}
          className="row-span-2"
        />
        <p className="col-start-2 text-sm">Wrapped in tissue in a recycled box, with the prices left off.</p>
      </div>
      {giftBox.added ? children : null}
    </div>
  )
}
