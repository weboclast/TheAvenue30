import { demoDaysAgo } from '@/lib/demo-customer'
import { REFERRAL_POINTS } from './referral'
import type { RewardsEntry } from './ledger'

/*
 * The entries the sample customer's history holds that neither their orders nor
 * their reviews can supply: a friend who joined, and a birthday.
 *
 * `./index.ts` derives the rest from the order history and from `lib/reviews`,
 * because every backend has both. These 2 exist because the template has no
 * referral table and no date of birth, and a history showing only order points
 * would teach the wrong shape.
 *
 * Dates are counted from today, so the drawer always opens on a plausible run of
 * activity. **Delete this file with the demo adapters.**
 */

/** What the store puts on an account on a shopper's birthday. A round credit, like every store's. */
const BIRTHDAY_POINTS = 10

/** The 2 sample entries, newest first. Summed with the derived ones by `getRewardsBalance`. */
export function demoLedgerEntries(): RewardsEntry[] {
  return [
    {
      id: 'demo-referral',
      kind: 'referral',
      at: demoDaysAgo(40),
      detail: 'Alex made their first purchase',
      points: REFERRAL_POINTS,
    },
    {
      id: 'demo-birthday',
      kind: 'birthday',
      at: demoDaysAgo(120),
      detail: 'Happy birthday from Appica!',
      points: BIRTHDAY_POINTS,
    },
  ]
}
