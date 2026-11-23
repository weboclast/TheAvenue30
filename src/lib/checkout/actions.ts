'use server'

import { readCartToken, writeCartToken } from '@/lib/cart/token'
import { commerceAdapter } from '@/lib/commerce'
import type { Address, CheckoutInput, PaymentMethodId } from '@/lib/commerce/types'
import { type DemoSlug, isDemoSlug } from '@/lib/demos'
import { validateAddress, validateEmail } from '@/lib/validation'
import { writeOrderToken } from './token'

/*
 * Placing an order, as a Server Action.
 *
 * It reads the cart token, hands it to the adapter, and stores the order token
 * that comes back. What was bought is never sent from the browser: an action is
 * a public endpoint, and a request naming its own lines would name its own
 * prices. A card number is never sent either, and `CheckoutInput` has nowhere to
 * put one: only the scheme and last 4 digits the receipt names the card by.
 */

/** The methods this store takes, for narrowing whatever a client sent. Keep in step with `PaymentMethodId`. */
const PAYMENT_METHODS: PaymentMethodId[] = ['card', 'klarna', 'paypal', 'apple-pay', 'google-pay']

/** What placing an order gives back. A refused order is a return value, not an exception. */
export type PlaceOrderResult = { ok: true; orderNumber: string } | { ok: false; error: string }

/**
 * Turns a demo's cart into an order, empties the cart, and remembers the order
 * long enough for the order confirmation to read it back. The screen navigates on
 * `ok`, so a checkout that confirms some other way still can.
 */
export async function placeOrderAction(demo: DemoSlug, input: CheckoutInput): Promise<PlaceOrderResult> {
  if (!isDemoSlug(demo)) return { ok: false, error: 'That store does not exist.' }

  // Re-run here because the browser's copy is a convenience and anything can post to this function.
  const invalid = validateCheckout(input)
  if (invalid) return { ok: false, error: invalid }

  try {
    const { order, token } = await commerceAdapter.placeOrder(demo, await readCartToken(demo), sanitize(input))
    await writeOrderToken(demo, token)
    // The adapter emptied the cart; left behind, the cookie would put the paid-for lines back in the header.
    await writeCartToken(demo, null)

    return { ok: true, orderNumber: order.number }
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : 'Your order could not be placed.' }
  }
}

/** The first thing wrong with a submitted checkout, or `undefined` when it is orderable. */
function validateCheckout(input: CheckoutInput): string | undefined {
  return (
    validateEmail(input.email) ??
    validateAddress(input.shippingAddress) ??
    (PAYMENT_METHODS.includes(input.paymentMethod) ? undefined : 'Choose how you would like to pay.')
  )
}

/** Trims what a shopper typed, so the order records an address rather than their whitespace. */
function sanitize(input: CheckoutInput): CheckoutInput {
  const address = input.shippingAddress
  const trim = (value: string) => value.trim()

  const shippingAddress: Address = {
    firstName: trim(address.firstName),
    lastName: trim(address.lastName),
    countryCode: address.countryCode.trim().toUpperCase(),
    city: trim(address.city),
    ...(address.state?.trim() && { state: trim(address.state) }),
    postcode: trim(address.postcode),
    line1: trim(address.line1),
    ...(address.phone?.trim() && { phone: trim(address.phone) }),
  }

  return {
    email: trim(input.email),
    shippingAddress,
    paymentMethod: input.paymentMethod,
    ...(input.card && { card: { brand: trim(input.card.brand), last4: trim(input.card.last4) } }),
    ...(input.notes?.trim() && { notes: trim(input.notes) }),
    ...(input.giftMessage?.trim() && { giftMessage: trim(input.giftMessage) }),
    ...(input.createAccount && { createAccount: true }),
  }
}
