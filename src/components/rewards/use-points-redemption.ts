'use client'

import { useState } from 'react'
import { useToastManager } from '@appica/ui-react/toast'
import { useCart } from '@/lib/cart/cart-context'
import type { Money } from '@/lib/commerce/types'
import { errorToast } from '@/lib/toast'

/** Loyalty points on the cart, as a summary's "Pay with points" row reads and changes them. */
export interface PointsRedemption {
  /** Points the shopper can spend. `0` for a guest and for a store running no program, where the row hides. */
  balance: number
  /** What the staked points take off the order. Absent while none are. */
  credit?: Money
  /** The count in the field, which leads the server until it is committed. */
  points: number
  setPoints: (points: number) => void
  /** Spends the whole balance, or takes every point back off. */
  setApplied: (applied: boolean) => void
  /** Stakes a typed count, held between 1 and the balance. */
  commit: (points: number) => void
}

/**
 * Spending loyalty points from a cart summary; each demo draws its own row. A
 * count is a request: the server caps it at the balance and at what the order can
 * absorb, and the field follows whatever comes back.
 */
export function usePointsRedemption(): PointsRedemption {
  const { cart, updateCart } = useCart()
  const toast = useToastManager()
  const balance = cart.rewardsBalance ?? 0
  const staked = cart.rewards?.points ?? 0

  const [points, setPoints] = useState(staked)
  const [committed, setCommitted] = useState(staked)
  if (committed !== staked) {
    setCommitted(staked)
    setPoints(staked)
  }

  const stake = async (count: number | null) => {
    const result = await updateCart({ rewardPoints: count })
    if (!result.ok) toast.add(errorToast('Your points could not be applied', result.error))
  }

  return {
    balance,
    credit: cart.rewards?.credit,
    points,
    setPoints,
    // The switch spends the lot, which is what almost every shopper wants. The field is the refinement.
    setApplied: (applied) => void stake(applied ? balance : null),
    commit: (next) => {
      const wanted = Math.min(Math.max(1, Math.round(next)), balance)
      setPoints(wanted)
      if (wanted !== staked) void stake(wanted)
    },
  }
}
