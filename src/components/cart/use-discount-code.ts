'use client'

import { useEffect, useRef, useState } from 'react'
import { useToastManager } from '@appica/ui-react/toast'
import { useCart } from '@/lib/cart/cart-context'
import { revealFirstInvalidField } from '@/lib/form-errors'
import { errorToast } from '@/lib/toast'

/** What a code has to look like before Apply will submit it. Whether it is real is the adapter's answer. */
const CODE_PATTERN = /^[a-z0-9]{4,16}$/i

/** How long "applied" stays up. The discount row carries it after that. */
const CONFIRMATION_MS = 4000

/**
 * The discount code field an order summary carries: what is typed, the store's
 * refusal, a short-lived "applied", and the 2 cart writes. A refused code points
 * back at the field through `panel`; a failed removal, pressed on the discount
 * row rather than in the field, is toasted.
 *
 * @param hint Appended to a refusal, which is where the demo names a code that works.
 */
export function useDiscountCode(hint?: string) {
  const { updateCart } = useCart()
  const toast = useToastManager()
  const [code, setCode] = useState('')
  const [error, setError] = useState<string>()
  const [redeemed, setRedeemed] = useState<string>()
  const panel = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!redeemed) return
    const timer = setTimeout(() => setRedeemed(undefined), CONFIRMATION_MS)
    return () => clearTimeout(timer)
  }, [redeemed])

  return {
    code,
    /** Stores what was typed, clearing a refusal the shopper is now correcting. */
    changeCode: (next: string) => {
      setCode(next)
      setError(undefined)
    },
    /** Whether what was typed is shaped like a code, so Apply can wait until it is. */
    ready: CODE_PATTERN.test(code),
    error,
    /** The code just applied, for a few seconds, so the panel can confirm it. */
    redeemed,
    /** The panel the field sits in, which a refused code scrolls back into view. */
    panel,
    redeem: async () => {
      if (!CODE_PATTERN.test(code)) return

      const result = await updateCart({ discountCode: code })
      setError(result.ok ? undefined : [result.error, hint].filter(Boolean).join(' '))
      setRedeemed(result.ok ? code.toUpperCase() : undefined)
      if (result.ok) setCode('')
      else revealFirstInvalidField(panel.current)
    },
    drop: async () => {
      const result = await updateCart({ discountCode: null })
      if (result.ok) setRedeemed(undefined)
      else toast.add(errorToast('Could not remove the code', result.error))
    },
  }
}
