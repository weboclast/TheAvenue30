import 'server-only'

import { readJsonCookie, writeCookie, writeJsonCookie } from '@/lib/cookies'
import type { SavedAddress } from './book'

/*
 * Where the saved addresses are kept, which in this template is a cookie.
 *
 * **Delete this file when a real backend replaces it.** Most commerce backends
 * keep an address book on the customer, so this is the 1 file to point at it.
 * It exists because the template ships no server, exactly as the demo adapter
 * encodes a cart into its own token.
 *
 * Not scoped to a demo, unlike the cart and the wishlist: those hold products,
 * and every storefront here has its own catalog.
 *
 * `httpOnly`, because where somebody lives is no business of a script on the
 * page.
 */

const BOOK_COOKIE = 'appica_addresses'

/** How long saved addresses are remembered, in seconds. As long as the saved cards. */
const BOOK_MAX_AGE = 60 * 60 * 24 * 180

/**
 * What this account has saved, or `null` for one that has never saved anything.
 * The `null` is what lets the demo seed stand in; see `./demo-book.ts`.
 */
export async function readBook(): Promise<SavedAddress[] | null> {
  return readJsonCookie(BOOK_COOKIE, Array.isArray)
}

/** Stores the whole book. Only callable from a Server Action or Route Handler. */
export async function writeBook(addresses: SavedAddress[]): Promise<void> {
  await writeJsonCookie(BOOK_COOKIE, addresses, BOOK_MAX_AGE)
}

/** Forgets the whole book. Part of erasing an account; see `lib/profile/actions.ts`. */
export async function clearBook(): Promise<void> {
  await writeCookie(BOOK_COOKIE, null, 0)
}
