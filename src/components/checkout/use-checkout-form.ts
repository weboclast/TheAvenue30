'use client'

import { type SubmitEvent, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { type AddressFieldErrors, type AddressFieldValues, validateAddressFields } from '@/components/address-fields'
import {
  type CardFieldErrors,
  type CardFieldValues,
  cardOnReceipt,
  validateCard,
} from '@/components/checkout/payment-options'
import type { Customer } from '@/lib/auth'
import { placeOrderAction } from '@/lib/checkout/actions'
import type { CheckoutInput, PaymentMethodId } from '@/lib/commerce/types'
import type { DemoSlug } from '@/lib/demos'
import { hasError, keepFlagged, revealFirstInvalidField } from '@/lib/form-errors'

const EMPTY_CARD: CardFieldValues = { number: '', expiry: '', code: '', name: '', sameBillingAddress: true }

interface CheckoutFormOptions {
  demo: DemoSlug
  /** The signed-in shopper, whose account fills the contact fields, including one who signs in halfway through. */
  customer: Customer | null
  /** What the order records from the fields beyond the email: where it goes, and any notes. */
  order: (details: AddressFieldValues) => Pick<CheckoutInput, 'shippingAddress' | 'notes' | 'giftMessage'>
  /**
   * What is wrong with the contact and address fields.
   * @default every address field and the email
   */
  validate?: (details: AddressFieldValues) => AddressFieldErrors
}

/**
 * What every checkout shares: the contact and address fields, the payment
 * method and card, their errors, and the submit that checks them all, places
 * the order, and lands on the confirmation. Each checkout lays its sections out
 * around it and adds its own fields through `order`.
 */
export function useCheckoutForm({ demo, customer, order, validate = validateAddressFields }: CheckoutFormOptions) {
  const router = useRouter()
  const [details, setDetails] = useState<AddressFieldValues>({
    firstName: customer?.firstName ?? '',
    lastName: customer?.lastName ?? '',
    email: customer?.email ?? '',
    phone: '',
    countryCode: 'US',
    city: '',
    state: '',
    postcode: '',
    line1: '',
    createAccount: false,
  })
  const [payment, setPayment] = useState<PaymentMethodId>('card')
  const [card, setCard] = useState(EMPTY_CARD)
  const [detailErrors, setDetailErrors] = useState<AddressFieldErrors>({})
  const [cardErrors, setCardErrors] = useState<CardFieldErrors>({})
  const [refused, setRefused] = useState<string>()
  const [placing, startPlacing] = useTransition()

  // Signing in halfway through brings a new `customer`, whose account fills
  // whatever the shopper has not typed yet.
  const [shopper, setShopper] = useState(customer?.email)
  if (customer && customer.email !== shopper) {
    setShopper(customer.email)
    setDetails((current) => ({
      ...current,
      firstName: current.firstName || customer.firstName,
      lastName: current.lastName || customer.lastName,
      email: current.email || customer.email,
      createAccount: false,
    }))
  }

  const submit = (event: SubmitEvent<HTMLFormElement>) => {
    // A submit from a sign-in drawer's own form, which React routes up through its portal.
    if (event.target !== event.currentTarget) return
    event.preventDefault()

    const nextDetails = validate(details)
    // Only the method that has fields: a shopper paying with PayPal has no card to get wrong.
    const nextCard = payment === 'card' ? validateCard(card) : {}
    setDetailErrors(nextDetails)
    setCardErrors(nextCard)
    if (hasError(nextDetails) || hasError(nextCard)) {
      revealFirstInvalidField(event.currentTarget)
      return
    }

    setRefused(undefined)
    startPlacing(async () => {
      const result = await placeOrderAction(demo, {
        email: details.email,
        ...order(details),
        paymentMethod: payment,
        ...(payment === 'card' && { card: cardOnReceipt(card) }),
        createAccount: details.createAccount,
      })

      if (!result.ok) {
        setRefused(result.error)
        return
      }

      router.push('/checkout/order-confirmation')
    })
  }

  return {
    details,
    /** Stores what was typed, re-checking only the fields already flagged. */
    changeDetails: (values: AddressFieldValues) => {
      setDetails(values)
      setDetailErrors((previous) => (hasError(previous) ? keepFlagged(previous, validate(values)) : previous))
    },
    detailErrors,
    payment,
    setPayment,
    card,
    /** The same for the card fields. */
    changeCard: (values: CardFieldValues) => {
      setCard(values)
      setCardErrors((previous) => (hasError(previous) ? keepFlagged(previous, validateCard(values)) : previous))
    },
    cardErrors,
    /** Why the store refused the last attempt, for the screen to show beside Pay now. */
    refused,
    placing,
    submit,
  }
}
