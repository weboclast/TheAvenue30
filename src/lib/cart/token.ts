import 'server-only'

import { readCookie, writeCookie } from '@/lib/cookies'
import type { DemoSlug } from '@/lib/demos'

/*
 * Where the cart lives: 1 cookie per demo, holding the adapter's opaque cart
 * token and nothing else. Per demo because every commerce read is, so a shopper
 * browsing 2 storefronts carries 2 carts.
 *
 * A cookie rather than `localStorage` because Server Components read it: the
 * header renders the real count on the first paint instead of correcting itself
 * after hydration.
 */

const CART_COOKIE_PREFIX = 'appica_cart'
const CART_MAX_AGE = 60 * 60 * 24 * 30

function cartCookie(demo: DemoSlug): string {
  return `${CART_COOKIE_PREFIX}_${demo}`
}

/** The demo's cart token, or `null` for a visitor without a cart. Safe to call while rendering. */
export async function readCartToken(demo: DemoSlug): Promise<string | null> {
  return readCookie(cartCookie(demo))
}

/**
 * Stores a token the adapter issued, or clears the cookie when it hands back
 * `null`. Only callable from a Server Action or Route Handler.
 */
export async function writeCartToken(demo: DemoSlug, token: string | null): Promise<void> {
  await writeCookie(cartCookie(demo), token, CART_MAX_AGE)
}
