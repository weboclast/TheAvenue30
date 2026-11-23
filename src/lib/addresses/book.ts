import { formatCountry } from '@/lib/commerce/format'
import type { Address } from '@/lib/commerce/types'

/*
 * The address book: where a shopper's orders go, and what an account adds to a
 * plain {@link Address} to keep several of them.
 *
 * Safe on both sides of the network. The reads and the writes are `./index.ts`
 * and `./actions.ts`, which are not.
 */

/** One address saved to an account. */
export interface SavedAddress extends Address {
  id: string
  /** What the shopper called it, e.g. `'Home'`. */
  label?: string
  /** Whether the checkout offers this one first. Exactly 1 saved address carries it. */
  default?: boolean
  /** When it was saved, as an ISO timestamp. */
  addedAt: string
}

/** What saving an address submits. */
export interface AddressDraft extends Address {
  label?: string
  default?: boolean
}

/**
 * What editing one may change, which is every field on it: nothing in an address
 * is bound to a token the way a saved card's digits are.
 *
 * `default` can only be `true`, because the way to stop an address being the
 * default is to make another one it.
 */
export interface AddressPatch extends Partial<Address> {
  /** `null` clears a label the shopper emptied. */
  label?: string | null
  default?: true
}

/** How many addresses an account keeps. Also what holds the demo's cookie under 4 KB. */
export const MAX_SAVED_ADDRESSES = 8

/** How long a label may be, so a card's heading stays 1 line. */
export const MAX_LABEL = 24

/** Who the parcel is addressed to. */
export function addressName({ firstName, lastName }: Address): string {
  return `${firstName} ${lastName}`.trim()
}

/** The postal block under the name, 1 string per line. */
export function addressLines(address: Address): string[] {
  const locality = [address.city, address.state].filter(Boolean).join(', ')

  return [
    address.line1,
    `${locality} ${address.postcode}`.trim(),
    formatCountry(address.countryCode),
    ...(address.phone ? [address.phone] : []),
  ]
}

/**
 * The order the page lists them in: the default first, then whatever was saved
 * most recently. Sorting happens here rather than in a query because an account
 * holds at most {@link MAX_SAVED_ADDRESSES}.
 */
export function sortAddresses(addresses: SavedAddress[]): SavedAddress[] {
  return [...addresses].sort((a, b) => {
    if (Boolean(a.default) !== Boolean(b.default)) return a.default ? -1 : 1
    return b.addedAt.localeCompare(a.addedAt)
  })
}
