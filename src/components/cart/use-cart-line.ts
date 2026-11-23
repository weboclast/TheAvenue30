'use client'

import { useState } from 'react'
import { useToastManager } from '@appica/ui-react/toast'
import type { CartActionResult } from '@/lib/cart/actions'
import { useCart } from '@/lib/cart/cart-context'
import type { CartLine, TradeInSelection } from '@/lib/commerce/types'
import { errorToast } from '@/lib/toast'
import type { WishlistActionResult } from '@/lib/wishlist/actions'
import { useWishlist } from '@/lib/wishlist/wishlist-context'

/** How many of one line a shopper can carry, matching the cap the adapter enforces. */
export const MAX_QUANTITY = 99

/**
 * What every cart line shares: the quantity being typed, the writes behind the
 * line's controls, and `pending` while one is in flight. A refused change is
 * toasted and leaves the line as it was.
 */
export function useCartLine(line: CartLine) {
  const { updateItem, removeItem } = useCart()
  const { saved, setSaved } = useWishlist()
  const toast = useToastManager()
  const [pending, setPending] = useState(false)

  // Typing stays local; only the committed value reaches the server, which then leads.
  const [quantity, setQuantity] = useState(line.quantity)
  const [committed, setCommitted] = useState(line.quantity)
  if (committed !== line.quantity) {
    setCommitted(line.quantity)
    setQuantity(line.quantity)
  }

  const run = async (title: string, mutate: () => Promise<CartActionResult | WishlistActionResult>) => {
    setPending(true)
    const result = await mutate()
    setPending(false)
    if (!result.ok) toast.add(errorToast(title, result.error))
  }

  const wishlisted = saved(line.productSlug)

  return {
    pending,
    quantity,
    /** Holds what is being typed, before it is committed. */
    setQuantity,
    /** Clamps a quantity and writes it, where it changed. */
    commitQuantity: (next: number) => {
      const wanted = Math.min(Math.max(1, next), MAX_QUANTITY)
      setQuantity(wanted)
      if (wanted === line.quantity) return
      void run('Could not change the quantity', () => updateItem(line.id, { quantity: wanted }))
    },
    choosePlan: (planId: string | null) =>
      void run('Could not change the protection plan', () => updateItem(line.id, { protectionPlanId: planId })),
    applyTradeIn: (selection: TradeInSelection | null) =>
      void run('Could not apply the trade-in', () => updateItem(line.id, { tradeIn: selection })),
    remove: () => void run('Could not remove that', () => removeItem(line.id)),
    /** Whether the product is saved to a wishlist. */
    wishlisted,
    toggleWishlist: () => void run('Could not update your wishlist', () => setSaved(line.productSlug, !wishlisted)),
    /** Saves the product, then takes the line out, so a refusal leaves it in the cart rather than nowhere. */
    moveToWishlist: () =>
      void run('Could not move that to your wishlist', async () => {
        const result = await setSaved(line.productSlug, true)
        return result.ok ? removeItem(line.id) : result
      }),
  }
}
