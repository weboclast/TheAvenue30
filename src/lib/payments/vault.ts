import 'server-only'

import { readJsonCookie, writeCookie, writeJsonCookie } from '@/lib/cookies'
import type { SavedPaymentMethod } from './methods'

/*
 * Where the saved methods are kept, which in this template is a cookie.
 *
 * **Delete this file when a real vault replaces it.** A payment provider is the
 * vault in any store that takes money, and keeps saved methods against the
 * customer. This exists because the template ships no server, exactly as the
 * demo adapter encodes a cart into its own token for want of anywhere to keep
 * one.
 *
 * Not scoped to a demo, unlike the cart and the wishlist. Those hold products,
 * and every storefront here has its own catalog; a card belongs to the shopper
 * and travels with them.
 *
 * Nothing secret is in it either way, because {@link SavedPaymentMethod} holds
 * nothing a thief could charge. It is `httpOnly` regardless: a shopper's billing
 * postcode is no business of a script on the page.
 */

const VAULT_COOKIE = 'appica_payment_methods'

/** How long saved methods are remembered, in seconds. As long as the wishlist: both outlive a session. */
const VAULT_MAX_AGE = 60 * 60 * 24 * 180

/**
 * What this account has saved, or `null` for one that has never saved anything.
 * The `null` is what lets the demo seed stand in; see `./demo-vault.ts`.
 */
export async function readVault(): Promise<SavedPaymentMethod[] | null> {
  return readJsonCookie(VAULT_COOKIE, Array.isArray)
}

/** Stores the whole set. Only callable from a Server Action or Route Handler. */
export async function writeVault(methods: SavedPaymentMethod[]): Promise<void> {
  await writeJsonCookie(VAULT_COOKIE, methods, VAULT_MAX_AGE)
}

/** Forgets every saved method. Part of erasing an account; see `lib/profile/actions.ts`. */
export async function clearVault(): Promise<void> {
  await writeCookie(VAULT_COOKIE, null, 0)
}
