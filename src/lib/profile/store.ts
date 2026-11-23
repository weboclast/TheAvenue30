import 'server-only'

import { readJsonCookie, writeCookie, writeJsonCookie } from '@/lib/cookies'
import type { StoredProfile } from './profile'

/*
 * Where the profile is kept, which in this template is a cookie.
 *
 * **Delete this file when a real backend replaces it.** Every commerce backend
 * keeps a customer record, so this is the 1 file to point at its customer
 * update. It exists because the template ships no server, exactly as the demo
 * adapter encodes a cart into its own token.
 *
 * Not scoped to a demo, unlike the cart and the wishlist: those hold products,
 * and every storefront here has its own catalog. A shopper is a shopper on all
 * of them.
 *
 * `httpOnly`, because a shopper's phone number is no business of a script on
 * the page.
 */

const PROFILE_COOKIE = 'appica_profile'

/** How long a profile is remembered, in seconds. As long as the addresses and the saved cards. */
const PROFILE_MAX_AGE = 60 * 60 * 24 * 180

/**
 * What this account has changed, or `null` for one that has changed nothing.
 * The `null` is what lets the demo seed stand in; see `./demo-profile.ts`.
 */
export async function readProfile(): Promise<StoredProfile | null> {
  return readJsonCookie(PROFILE_COOKIE, (value) => typeof value === 'object' && value !== null)
}

/** Stores the whole profile. Only callable from a Server Action or Route Handler. */
export async function writeProfile(profile: StoredProfile): Promise<void> {
  await writeJsonCookie(PROFILE_COOKIE, profile, PROFILE_MAX_AGE)
}

/** Forgets everything this shopper filled in. Part of erasing an account; see `./actions.ts`. */
export async function clearProfile(): Promise<void> {
  await writeCookie(PROFILE_COOKIE, null, 0)
}
