import type { Money } from '@/lib/commerce/types'

/*
 * The invitation a shopper hands a friend: what it pays each of them, and the
 * link that carries it.
 *
 * Safe on both sides of the network. The read is `./index.ts`, which is not.
 */

/** What a referral pays the shopper who sent it, in points. */
export const REFERRAL_POINTS = 15

/** What it takes off the friend's first order. */
export const REFERRAL_FRIEND_DISCOUNT: Money = { amount: 15, currencyCode: 'USD' }

/** Where a referral link lands. The friend registers, and the code rides along in `ref`. */
export const REFERRAL_PATH = '/register'

/** One shopper's invitation. */
export interface Referral {
  /** The code a friend arrives with, e.g. `'SARAH-X8K'`. */
  code: string
  /** The whole link, absolute because it is pasted into a message. */
  url: string
  /** What the shopper earns once the friend orders. */
  points: number
  /** What the friend gets off that order. */
  friendDiscount: Money
}

/** Characters a code is built from. No vowels, so a generated code cannot spell anything. */
const CODE_ALPHABET = 'BCDFGHJKLMNPQRSTVWXYZ0123456789'

/** How long the half a shopper cannot guess runs. */
const CODE_LENGTH = 3

/**
 * A stable code for one customer: their given name, then a short suffix hashed
 * from their id.
 *
 * The name is what gets pasted into a message with a sentence around it, where
 * an opaque string gets ignored; the suffix is what stops 2 shoppers called
 * Sarah sharing a code. **A real loyalty backend issues the code and this
 * function goes with it**, since a derived code cannot be revoked.
 */
export function referralCode(firstName: string, id: string): string {
  let hash = 0
  for (const character of id) hash = (hash * 31 + character.charCodeAt(0)) >>> 0

  let suffix = ''
  for (let index = 0; index < CODE_LENGTH; index += 1) {
    suffix += CODE_ALPHABET[hash % CODE_ALPHABET.length]
    hash = Math.floor(hash / CODE_ALPHABET.length)
  }

  const name = firstName.replace(/[^a-z]/gi, '').toUpperCase() || 'FRIEND'
  return `${name}-${suffix}`
}
