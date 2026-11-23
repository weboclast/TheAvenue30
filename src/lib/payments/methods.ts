import type { PaymentMethodId } from '@/lib/commerce/types'
import { type CardExpiryStatus, cardExpiryStatus } from '@/lib/validation'

/*
 * What a shopper can pay with next time, and everything the storefront is
 * allowed to know about it.
 *
 * Nothing here is enough to charge with, and that is the whole design. A saved
 * card is a scheme, 4 digits, and a month, because that is what a payment
 * provider hands back precisely because it is the only part safe to keep. The
 * number itself never reaches this app: see `./AGENTS.md`.
 *
 * Safe on both sides of the network. The reads and the writes are `./index.ts`
 * and `./actions.ts`, which are not.
 */

/** The card behind a saved payment method, as a receipt would name it. */
export interface SavedCard {
  /** The scheme, spelled as it should read, e.g. `'Visa'`. */
  brand: string
  /** The last 4 digits of the number. */
  last4: string
  /** Calendar month it runs out, 1 to 12. */
  expiryMonth: number
  /** The year it runs out, 4 digits. */
  expiryYear: number
  /** The name printed on it. */
  holder: string
}

/**
 * Where a card is billed. Country and postcode only: those are the 2 an issuer
 * check actually compares, and a store that keeps the rest keeps it on the
 * addresses page instead.
 */
export interface BillingLocation {
  /** ISO 3166-1 alpha-2. */
  countryCode: string
  postcode: string
}

/** One thing a shopper can pay with, saved to their account. */
export interface SavedPaymentMethod {
  id: string
  /** Which of the store's methods this is, so the checkout can offer it. */
  method: PaymentMethodId
  /** The card, for `'card'`. Absent for a wallet. */
  card?: SavedCard
  /**
   * The wallet account, as its provider hands it back: PayPal returns the
   * payer's email. Absent for a card, and absent for a wallet whose provider
   * returns nothing worth printing. Screens mask it before showing it.
   */
  account?: string
  /** What the shopper called it, e.g. `'Work card'`. */
  nickname?: string
  /** Absent for a wallet: the provider holds the billing details for those. */
  billing?: BillingLocation
  /** Whether the checkout offers this one first. Exactly 1 saved method carries it. */
  default?: boolean
  /** When it was saved, as an ISO timestamp. */
  addedAt: string
}

/** What saving a payment method submits. The card's number is deliberately not among them. */
export interface PaymentMethodDraft {
  method: PaymentMethodId
  card?: SavedCard
  account?: string
  nickname?: string
  billing?: BillingLocation
  default?: boolean
}

/**
 * What editing one may change. Everything that identifies the card is missing on
 * purpose: a reissued number is a new card, not an edit to this one.
 *
 * `default` can only be `true`, because the way to stop a method being the
 * default is to make another one it.
 */
export interface PaymentMethodPatch {
  holder?: string
  expiryMonth?: number
  expiryYear?: number
  /** `null` clears a nickname the shopper emptied. */
  nickname?: string | null
  billing?: BillingLocation
  default?: true
}

/**
 * How each method reads on screen. A `Record` rather than a list, so adding a
 * method to {@link PaymentMethodId} fails to compile until it is named here.
 */
export const PAYMENT_METHOD_LABELS: Record<PaymentMethodId, string> = {
  card: 'Credit card',
  klarna: 'Klarna',
  paypal: 'PayPal',
  'apple-pay': 'Apple Pay',
  'google-pay': 'Google Pay',
}

/** Whether a string names a method this store takes, for a value that arrived from the browser. */
export function isPaymentMethodId(value: string): value is PaymentMethodId {
  return value in PAYMENT_METHOD_LABELS
}

/** What stands in for the digits a screen may not print. */
export const MASK = '••••'

/**
 * A wallet account, shown the way a card's digits are: enough to recognize, not
 * enough to read off somebody's screen. Fixed-width, since 1 dot per character
 * would give the address length away. Anything without an `@` is masked from its
 * second character on, covering a provider that returns a phone or a handle.
 */
export function maskAccount(account: string): string {
  const [local = '', domain] = account.split('@')
  const head = local.slice(0, 1)
  return domain ? `${head}${MASK}@${domain}` : `${head}${MASK}`
}

/** How many methods an account keeps. Also what holds the demo's cookie vault under 4 KB. */
export const MAX_SAVED_METHODS = 8

/** How long a nickname may be, so a row stays a row. */
export const MAX_NICKNAME = 24

/** How much life a saved card has left, or `'valid'` for a wallet, which does not expire. */
export function expiryStatus(method: SavedPaymentMethod, now?: Date): CardExpiryStatus {
  if (!method.card) return 'valid'
  return cardExpiryStatus({ month: method.card.expiryMonth, year: method.card.expiryYear }, now)
}

/** A saved card's expiry as the `MM/YY` printed on it. */
export function formatExpiry({ expiryMonth, expiryYear }: SavedCard): string {
  return `${String(expiryMonth).padStart(2, '0')}/${String(expiryYear).slice(-2)}`
}

/**
 * The order the page lists them in: the default first, then whatever was saved
 * most recently. Sorting happens here rather than in a query because an account
 * holds at most {@link MAX_SAVED_METHODS}.
 */
export function sortPaymentMethods(methods: SavedPaymentMethod[]): SavedPaymentMethod[] {
  return [...methods].sort((a, b) => {
    if (Boolean(a.default) !== Boolean(b.default)) return a.default ? -1 : 1
    return b.addedAt.localeCompare(a.addedAt)
  })
}
