import type { Address, OrderCard } from '@/lib/commerce/types'

/*
 * The sample customer: whose account the demo shows, where their orders ship,
 * and what they paid with. The demo order book, address book, saved cards, and profile
 * all read it, so every account page names the same person, street, and cards.
 *
 * **Delete this file with the last of the demo adapters.** Nothing but demo data
 * and demo scaffolding imports it.
 */

/** Their name, and the email the sample orders were placed with. */
export const DEMO_CUSTOMER = {
  firstName: 'Sarah',
  lastName: 'Jenkins',
  email: 'sarah.jenkins@example.com',
}

/** Their home: where the sample orders ship, and the default in their address book. */
export const DEMO_ADDRESS: Address = {
  firstName: DEMO_CUSTOMER.firstName,
  lastName: DEMO_CUSTOMER.lastName,
  countryCode: 'US',
  city: 'San Francisco',
  state: 'California',
  postcode: '94109',
  line1: '1280 Lombard Street, Apt 4B',
  phone: '+1 415 555 0132',
}

/** The cards the sample orders were charged to and the saved cards name. The Mastercard is the default. */
export const DEMO_CARDS = {
  mastercard: { brand: 'Mastercard', last4: '4456' },
  visa: { brand: 'Visa', last4: '1204' },
  maestro: { brand: 'Maestro', last4: '9018' },
} satisfies Record<string, OrderCard>

/** The wallet the sample orders paid from. Deliberately not their sign-in email: a shopper's wallet is their own. */
export const DEMO_PAYPAL_ACCOUNT = 's.jenkins@fastmail.com'

/**
 * The sample orders the order-tracking pages offer as a way in: 1 out for
 * delivery, 1 whose booked window can still move, and 1 delivered and still open
 * for returns.
 */
export const DEMO_ORDER_NUMBERS = {
  outForDelivery: 'APC-058291',
  movable: 'APC-047163',
  returnable: 'APC-023155',
}

/** An ISO timestamp `count` days ago, for sample records that need a date to sort by. */
export function demoDaysAgo(count: number): string {
  return new Date(Date.now() - count * 24 * 60 * 60 * 1000).toISOString()
}
