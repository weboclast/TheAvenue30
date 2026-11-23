import 'server-only'

import { readCookie, writeCookie } from '@/lib/cookies'
import type { DemoSlug } from '@/lib/demos'

/*
 * Where a just-placed order lives: 1 cookie per demo, holding the adapter's
 * opaque order token and nothing else. Same arrangement as the cart cookie next
 * door, and for the same reason: the order confirmation is a Server Component.
 *
 * Short-lived on purpose. This is the handoff between "Pay now" and the page
 * that confirms it, not an order history: an order a shopper wants next week
 * belongs to their account, or to the guest lookup under `/order-tracking`.
 */

const ORDER_COOKIE_PREFIX = 'appica_order'

/** How long the confirmation stays reachable: long enough to refresh and come back to it. */
const ORDER_MAX_AGE = 60 * 60 * 2

function orderCookie(demo: DemoSlug): string {
  return `${ORDER_COOKIE_PREFIX}_${demo}`
}

/** The token for the order this visitor just placed, or `null` when they placed none. Safe to call while rendering. */
export async function readOrderToken(demo: DemoSlug): Promise<string | null> {
  return readCookie(orderCookie(demo))
}

/** Stores the token the adapter issued. Only callable from a Server Action or Route Handler. */
export async function writeOrderToken(demo: DemoSlug, token: string): Promise<void> {
  await writeCookie(orderCookie(demo), token, ORDER_MAX_AGE)
}
