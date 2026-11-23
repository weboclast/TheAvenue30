import { DEMO_ADDRESS, DEMO_CARDS, DEMO_CUSTOMER, DEMO_PAYPAL_ACCOUNT, demoDaysAgo } from '@/lib/demo-customer'
import type { BillingLocation, SavedPaymentMethod } from './methods'

/*
 * What the sample customer has saved, for an account page that would otherwise
 * open empty on a store with no vault behind it. The cards are the ones the
 * sample orders were charged to, from `lib/demo-customer.ts`, so the order
 * history and this page name the same plastic. Delete this file with the demo
 * adapters.
 *
 * Expiry dates are counted from today rather than written down, so the Visa is
 * always the one about to run out and the page always shows that state.
 */

/** Where the sample cards are billed: the sample customer's home. */
const DEMO_BILLING: BillingLocation = { countryCode: DEMO_ADDRESS.countryCode, postcode: DEMO_ADDRESS.postcode }

const DEMO_HOLDER = `${DEMO_CUSTOMER.firstName} ${DEMO_CUSTOMER.lastName}`

/** A month `count` months from now, as a saved card names it. */
function expiresIn(count: number): { expiryMonth: number; expiryYear: number } {
  const month = new Date()
  month.setMonth(month.getMonth() + count)
  return { expiryMonth: month.getMonth() + 1, expiryYear: month.getFullYear() }
}

/** The sample vault: 3 cards and a linked wallet, 1 of the cards about to expire. */
export function demoSavedMethods(): SavedPaymentMethod[] {
  return [
    {
      id: 'demo-mastercard',
      method: 'card',
      card: { ...DEMO_CARDS.mastercard, holder: DEMO_HOLDER, ...expiresIn(31) },
      billing: DEMO_BILLING,
      default: true,
      addedAt: demoDaysAgo(412),
    },
    {
      id: 'demo-visa',
      method: 'card',
      card: { ...DEMO_CARDS.visa, holder: DEMO_HOLDER, ...expiresIn(1) },
      nickname: 'Work card',
      billing: DEMO_BILLING,
      addedAt: demoDaysAgo(96),
    },
    {
      id: 'demo-maestro',
      method: 'card',
      card: { ...DEMO_CARDS.maestro, holder: DEMO_HOLDER, ...expiresIn(19) },
      billing: DEMO_BILLING,
      addedAt: demoDaysAgo(28),
    },
    {
      id: 'demo-paypal',
      method: 'paypal',
      account: DEMO_PAYPAL_ACCOUNT,
      addedAt: demoDaysAgo(220),
    },
  ]
}
