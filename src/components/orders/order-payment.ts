import { type PaymentMarkName, hasPaymentMark, paymentMethodMark } from '@/components/payment-methods'
import type { Order } from '@/lib/commerce/types'
import { MASK, PAYMENT_METHOD_LABELS, maskAccount } from '@/lib/payments/methods'

/**
 * What paid for the order, and which one: the card and its last 4 digits, the
 * wallet and the account it charged, or the method's own name where the provider
 * hands nothing back to identify it by.
 */
export function orderPaymentLabel({ paymentMethod, card, walletAccount }: Order): string {
  if (card) return `${card.brand} ${MASK} ${card.last4}`
  if (walletAccount) return `${PAYMENT_METHOD_LABELS[paymentMethod]} ${maskAccount(walletAccount)}`
  return PAYMENT_METHOD_LABELS[paymentMethod]
}

/**
 * The mark beside {@link orderPaymentLabel}, or `undefined` where this store
 * draws none. The card's scheme wins where there is one, since that is what was
 * charged; everything else falls back to the method's own brand.
 */
export function orderPaymentMark({ paymentMethod, card }: Order): PaymentMarkName | undefined {
  if (card && hasPaymentMark(card.brand)) return card.brand
  return paymentMethodMark(paymentMethod)
}
