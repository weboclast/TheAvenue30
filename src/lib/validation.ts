import type { Address } from '@/lib/commerce/types'

/*
 * Field validators shared by the auth forms, the checkout, and the demo adapter.
 * Deliberately shallow: the shape of an address is worth catching before a
 * round-trip, but whether it exists is the backend's answer.
 */

/** Returns the error message for an email field, or `undefined` when it passes. */
export function validateEmail(value: string): string | undefined {
  const email = value.trim()
  if (!email) return 'Email is required'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Enter a valid email address'
  return undefined
}

/** Returns the error message for a password field, or `undefined` when it passes. */
export function validatePassword(value: string): string | undefined {
  if (value.length < 8) return 'Use at least 8 characters'
  return undefined
}

/** How a password scores, `0` for an empty field and `1` to `4` for anything typed. */
export interface PasswordStrength {
  score: 0 | 1 | 2 | 3 | 4
  /** What to show beside the meter, e.g. `'Fair'`. Empty at `0`. */
  label: string
}

const STRENGTH_LABELS = ['', 'Weak', 'Fair', 'Good', 'Strong']

/**
 * Scores a password on length and variety, for the meter on the sign-up field.
 *
 * A hint, not a rule: `validatePassword` decides what is accepted, and this
 * never contradicts it, because anything typed scores at least `1`. Swap in zxcvbn
 * if a store wants dictionary and keyboard-pattern checks; only this function
 * changes.
 */
export function passwordStrength(value: string): PasswordStrength {
  if (!value) return { score: 0, label: '' }

  const points = [
    value.length >= 8,
    value.length >= 12,
    /[a-z]/.test(value) && /[A-Z]/.test(value),
    /\d/.test(value),
    /[^\w\s]/.test(value),
  ].filter(Boolean).length

  const score = Math.min(Math.max(points, 1), 4) as 1 | 2 | 3 | 4
  return { score, label: STRENGTH_LABELS[score] }
}

/** Returns the error message for a field that must be filled in, or `undefined` when it passes. */
export function validateRequired(value: string, label: string): string | undefined {
  return value.trim() ? undefined : `${label} is required`
}

/**
 * Returns the error message for a phone number, or `undefined` when it passes.
 *
 * Counts digits rather than matching a format, because a shopper types the same
 * number as `+1 212 555 0134`, `(212) 555-0134`, or `212.555.0134`, and every
 * one of those is the number. Swap in libphonenumber-js if a store needs the
 * country's own rules; only this function changes.
 */
export function validatePhone(value: string): string | undefined {
  const digits = value.replace(/\D/g, '')
  if (!digits) return 'Mobile number is required'
  if (digits.length < 7 || digits.length > 15) return 'Enter a valid mobile number'
  return undefined
}

/**
 * Returns the error message for a postcode, or `undefined` when it passes.
 *
 * Deliberately loose: postcodes run from 3 characters to 10 and mix letters,
 * digits, spaces, and hyphens depending on the country. Whether one exists is
 * the backend's answer, and a stricter pattern here rejects real addresses.
 */
export function validatePostcode(value: string): string | undefined {
  const postcode = value.trim()
  if (!postcode) return 'Postcode is required'
  if (!/^[a-z0-9][a-z0-9 -]{1,9}$/i.test(postcode)) return 'Enter a valid postcode'
  return undefined
}

/**
 * The first thing wrong with a postal address, or `undefined`: the checks
 * `validateAddressFields` runs in the form, for every Server Action that records
 * an address. Typed loosely, since an action gets whatever was posted.
 */
export function validateAddress(address: Partial<Address>): string | undefined {
  return (
    validateRequired(address.firstName ?? '', 'First name') ??
    validateRequired(address.lastName ?? '', 'Last name') ??
    validatePhone(address.phone ?? '') ??
    (/^[A-Z]{2}$/i.test(address.countryCode ?? '') ? undefined : 'Country is required') ??
    validateRequired(address.city ?? '', 'Town or city') ??
    validatePostcode(address.postcode ?? '') ??
    validateRequired(address.line1 ?? '', 'Street address')
  )
}

/**
 * Returns the error message for a card number, or `undefined` when it passes.
 *
 * Checks the length and the Luhn checksum, which is what catches a mistyped
 * digit before a round-trip. Whether the card exists and has funds is the
 * payment provider's answer, and in a real integration this field belongs to
 * their hosted input rather than to a form you wrote.
 */
export function validateCardNumber(value: string): string | undefined {
  const digits = value.replace(/\D/g, '')
  if (!digits) return 'Card number is required'
  if (digits.length < 13 || digits.length > 19 || !passesLuhn(digits)) return 'Enter a valid card number'
  return undefined
}

/**
 * The card scheme a number belongs to, by its issuer prefix, or `undefined` for
 * a prefix no scheme below claims.
 *
 * Read for the receipt, which names the card it charged, and safe to keep beside
 * the last 4 digits. Like {@link validateCardNumber}, a real integration gets
 * this back from the payment provider instead of reading it off an input.
 */
export function cardBrand(value: string): string | undefined {
  const digits = value.replace(/\D/g, '')
  return CARD_BRANDS.find(([, prefix]) => prefix.test(digits))?.[0]
}

/** The month a card runs out, as a calendar month and a full year. */
export interface CardExpiry {
  /** 1 to 12. */
  month: number
  /** 4 digits. */
  year: number
}

/** An `MM / YY` field as the month it names, or `undefined` where it is not one. */
export function parseCardExpiry(value: string): CardExpiry | undefined {
  const match = /^(\d{2})\s*\/\s*(\d{2})$/.exec(value.trim())
  if (!match) return undefined

  const month = Number(match[1])
  return month >= 1 && month <= 12 ? { month, year: 2000 + Number(match[2]) } : undefined
}

/** How much life a card has left. `'expiring'` is the last {@link EXPIRING_MONTHS} of it. */
export type CardExpiryStatus = 'valid' | 'expiring' | 'expired'

/** How long before a card runs out the store starts saying so. */
const EXPIRING_MONTHS = 2

/**
 * Whether a card is spent, nearly spent, or good. A card is good through the
 * last day of the month it names, so every comparison here is against the first
 * day of the month after it.
 */
export function cardExpiryStatus({ month, year }: CardExpiry, now = new Date()): CardExpiryStatus {
  const expiresAt = new Date(year, month, 1)
  const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1)

  if (expiresAt <= thisMonth) return 'expired'
  return expiresAt <= new Date(now.getFullYear(), now.getMonth() + EXPIRING_MONTHS, 1) ? 'expiring' : 'valid'
}

/** Returns the error message for an `MM / YY` expiry date, or `undefined` when it passes. */
export function validateCardExpiry(value: string): string | undefined {
  if (!value.trim()) return 'Expiration date is required'

  const expiry = parseCardExpiry(value)
  if (!expiry) return 'Use MM / YY'
  if (cardExpiryStatus(expiry) === 'expired') return 'That card has expired'
  return undefined
}

/** Returns the error message for a card security code, or `undefined` when it passes. */
export function validateCardCode(value: string): string | undefined {
  const digits = value.replace(/\D/g, '')
  if (!digits) return 'Security code is required'
  // 3 digits everywhere except American Express, which prints 4.
  if (digits.length < 3 || digits.length > 4) return 'Enter the 3 or 4 digits on your card'
  return undefined
}

/**
 * Issuer prefixes, longest-reaching first so Diners Club is not read as
 * Mastercard. Enough to name the marks this store draws; a provider's own list
 * is longer.
 */
const CARD_BRANDS: [brand: string, prefix: RegExp][] = [
  ['American Express', /^3[47]/],
  ['Diners Club', /^3(?:0[0-5]|[68])/],
  ['Mastercard', /^(?:5[1-5]|2(?:2[2-9]|[3-6]|7[01]|720))/],
  ['Visa', /^4/],
]

/** The checksum every card number carries in its last digit. */
function passesLuhn(digits: string): boolean {
  let sum = 0
  let double = false

  for (let index = digits.length - 1; index >= 0; index--) {
    let digit = Number(digits[index])
    if (double) {
      digit *= 2
      if (digit > 9) digit -= 9
    }
    sum += digit
    double = !double
  }

  return sum % 10 === 0
}
