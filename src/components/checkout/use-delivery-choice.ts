'use client'

import { useEffect, useOptimistic, useRef, useState, useTransition } from 'react'
import { useCart } from '@/lib/cart/cart-context'
import type { CartDelivery, DeliveryDay, DeliverySlotSelection } from '@/lib/commerce/types'

/**
 * What every delivery section shares: the options the cart offers, the one
 * chosen, held optimistically until the cart settles, and the cart write behind
 * a choice. The store's preselected option is booked once on arrival, and an
 * option that takes a slot books its first free one, so the choice and the total
 * never disagree.
 */
export function useDeliveryChoice() {
  const { cart, updateCart, pending } = useCart()
  const [error, setError] = useState<string>()
  const [, startChoosing] = useTransition()
  const [chosen, setChosen] = useOptimistic(cart.delivery)

  const options = cart.deliveryOptions ?? []
  const preselected = options.find((option) => option.preselected)

  // Guarded by a ref as well as by the cart: the effect re-runs before the
  // mutation it started has come back.
  const applied = useRef(false)
  useEffect(() => {
    if (cart.delivery || !preselected || applied.current) return
    applied.current = true
    void updateCart({ delivery: { optionId: preselected.id } })
  }, [cart.delivery, preselected, updateCart])

  const apply = (delivery: CartDelivery) =>
    startChoosing(async () => {
      setChosen(delivery)
      const result = await updateCart({ delivery })
      setError(result.ok ? undefined : result.error)
    })

  return {
    options,
    chosen,
    preselected,
    /** Why the store refused the last choice. */
    error,
    /** True while the cart reprices. */
    pending,
    /** Books a delivery as given, a slot included. */
    apply,
    /** Picks an option, booking its first free slot where it takes one. */
    choose: (optionId: string) => {
      const option = options.find((candidate) => candidate.id === optionId)
      const slot = option?.schedule && firstSlot(option.schedule)
      if (option?.schedule && !slot) return
      apply({ optionId, ...(slot && { slot }) })
    },
  }
}

/** The earliest free window in a schedule, or `undefined` where every day is full. */
function firstSlot(schedule: DeliveryDay[]): DeliverySlotSelection | undefined {
  const day = schedule.find((candidate) => candidate.slots.length > 0)
  const slot = day?.slots[0]
  return day && slot ? { date: day.date, slotId: slot.id } : undefined
}
