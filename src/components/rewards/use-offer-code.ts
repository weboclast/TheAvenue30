'use client'

import { useState } from 'react'
import { useCart } from '@/lib/cart/cart-context'

/**
 * Puts an offer's code on the cart or takes it back off, so a shopper never
 * carries the string to the checkout themselves. Whether it is on is read off
 * the cart, so it holds after a reload and clears once another code replaces
 * it. Each storefront draws its own offer around it.
 */
export function useOfferCode(code: string) {
  const { cart, updateCart, pending } = useCart()
  const [error, setError] = useState<string>()
  const [changed, setChanged] = useState(false)

  const stake = async (next: string | null) => {
    const result = await updateCart({ discountCode: next })
    setError(result.ok ? undefined : result.error)
    if (result.ok) setChanged(true)
  }

  return {
    applied: cart.discount?.code === code,
    /** Whether the shopper has put it on or taken it off here, so a live region speaks only after that. */
    changed,
    apply: () => stake(code),
    remove: () => stake(null),
    pending,
    /** The store's refusal, until the next attempt. */
    error,
  }
}
