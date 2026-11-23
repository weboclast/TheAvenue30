import 'server-only'

import { readCookie, writeCookie } from '@/lib/cookies'
import type { DemoSlug } from '@/lib/demos'
import { viewedWishlistCookie } from './lists'

/*
 * Where a shopper's wishlists live: 1 cookie per demo, holding the adapter's
 * opaque wishlist token and nothing else. The same arrangement as the cart
 * cookie next door, and per demo for the same reason: every commerce read is.
 *
 * A cookie rather than an account record because saving something must work
 * before signing in. A guest who hearts 3 products still holds them after they
 * register, since the cookie outlives the sign-in, which is the merge a real
 * store has to write code for.
 *
 * A second cookie beside it remembers which list the shopper had open. That one
 * is a preference, not a capability: the browser writes it (see `WishlistBoard`)
 * and nothing trusts it.
 */

const WISHLIST_COOKIE_PREFIX = 'appica_wishlist'

/** How long saved products are remembered, in seconds. Longer than a cart: a wishlist is the slow list. */
const WISHLIST_MAX_AGE = 60 * 60 * 24 * 180

function wishlistCookie(demo: DemoSlug): string {
  return `${WISHLIST_COOKIE_PREFIX}_${demo}`
}

/** The demo's wishlist token, or `null` for a visitor who has saved nothing. Safe to call while rendering. */
export async function readWishlistToken(demo: DemoSlug): Promise<string | null> {
  return readCookie(wishlistCookie(demo))
}

/**
 * Stores a token the adapter issued, or clears the cookie when it hands back
 * `null`. Only callable from a Server Action or Route Handler.
 */
export async function writeWishlistToken(demo: DemoSlug, token: string | null): Promise<void> {
  await writeCookie(wishlistCookie(demo), token, WISHLIST_MAX_AGE)
}

/**
 * The list this visitor last had open, or `null`. Read while rendering the
 * wishlist page, so its first paint is already the right list; a list that has
 * since been deleted is the screen's problem, not this function's.
 */
export async function readViewedWishlistId(demo: DemoSlug): Promise<string | null> {
  return readCookie(viewedWishlistCookie(demo))
}
