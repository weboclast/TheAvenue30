import { DEMO_ADDRESS, DEMO_CUSTOMER, demoDaysAgo } from '@/lib/demo-customer'
import type { SavedAddress } from './book'

/*
 * What the sample customer has saved, for an account page that would otherwise
 * open empty on a store with no backend behind it. The default is the address
 * the sample orders shipped to, from `lib/demo-customer.ts`, so this page and
 * the order history name the same street. Delete this file with the demo
 * adapters.
 */

/** The sample book: where the orders went, and the office that takes the deliveries. */
export function demoAddresses(): SavedAddress[] {
  return [
    { ...DEMO_ADDRESS, id: 'demo-home', label: 'Home', default: true, addedAt: demoDaysAgo(412) },
    {
      id: 'demo-work',
      firstName: DEMO_CUSTOMER.firstName,
      lastName: DEMO_CUSTOMER.lastName,
      countryCode: 'US',
      city: 'New York',
      state: 'New York',
      postcode: '10012',
      line1: '88 Greene Street, Floor 3',
      phone: '+1 212 555 0142',
      label: 'Work',
      addedAt: demoDaysAgo(96),
    },
  ]
}
