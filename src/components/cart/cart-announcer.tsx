'use client'

import { useState } from 'react'
import { useCart } from '@/lib/cart/cart-context'
import type { Cart } from '@/lib/commerce/types'

interface CartAnnouncerProps {
  /** What the store calls the cart in shopper copy, capitalized, e.g. `'Bag'`. */
  noun: string
}

/**
 * Tells a screen reader what each cart change did: the product added, removed,
 * or recounted, then how many items the cart holds. Mount it once per demo, in
 * header chrome that every shop page renders, outside any popup.
 *
 * Only a mutation's answer speaks, never a server render, and a change that
 * leaves every line as it was, such as a plan or a code, stays quiet.
 */
export function CartAnnouncer({ noun }: CartAnnouncerProps) {
  const { cart, pending, addCount } = useCart()
  const [seen, setSeen] = useState({ cart, pending, addCount })
  const [message, setMessage] = useState('')

  if (seen.cart !== cart || seen.pending !== pending || seen.addCount !== addCount) {
    // A cart arriving while the previous render was pending is a mutation's answer.
    const answered = seen.pending && seen.cart !== cart
    const change = answered ? describeChange(seen.cart, cart, addCount !== seen.addCount) : null
    if (change) setMessage(`${change}. ${noun}, ${countLabel(cart.totalQuantity)}`)
    setSeen({ cart, pending, addCount })
  }

  // `aria-live` spelled out: a modal drawer hides everything outside it but live regions.
  return (
    <p role="status" aria-live="polite" className="sr-only">
      {message}
    </p>
  )
}

/** What happened to the lines between 2 carts, as the start of a sentence, or `null` when none changed. */
function describeChange(before: Cart, after: Cart, added: boolean): string | null {
  const previous = new Map(before.lines.map((line) => [line.id, line.quantity]))

  const arrived = after.lines.filter((line) => line.quantity > (previous.get(line.id) ?? 0))
  if (added && arrived.length > 0) {
    return arrived.length === 1 ? `${arrived[0].title} added` : `${arrived.length} products added`
  }

  const removed = before.lines.find((line) => !after.lines.some((next) => next.id === line.id))
  if (removed) return `${removed.title} removed`

  const recounted = after.lines.find((line) => (previous.get(line.id) ?? line.quantity) !== line.quantity)
  return recounted ? `Quantity of ${recounted.title} changed to ${recounted.quantity}` : null
}

/** The count the header's cart button names, e.g. `'3 items'`. */
function countLabel(count: number): string {
  if (count === 0) return 'empty'
  return `${count} ${count === 1 ? 'item' : 'items'}`
}
