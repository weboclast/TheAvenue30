import 'server-only'

import { readCookie, writeCookie } from '@/lib/cookies'
import type { DemoSlug } from '@/lib/demos'

/*
 * Where a looked-up order lives: 1 cookie per demo, holding the adapter's opaque
 * order token. Same arrangement as the cart and order cookies next door.
 *
 * The token is the capability: it says this visitor named the order number and
 * the email it was placed with. Nothing in the URL grants anything.
 */

const TRACKED_COOKIE_PREFIX = 'appica_tracked_order'

/** How long a lookup stays good for, in seconds: longer than a parcel takes. */
const TRACKED_MAX_AGE = 60 * 60 * 24 * 7

function trackedCookie(demo: DemoSlug): string {
  return `${TRACKED_COOKIE_PREFIX}_${demo}`
}

/** The token for the order this visitor looked up, or `null` when they looked up none. Safe to call while rendering. */
export async function readTrackedOrderToken(demo: DemoSlug): Promise<string | null> {
  return readCookie(trackedCookie(demo))
}

/** Stores the token the adapter issued. Only callable from a Server Action or Route Handler. */
export async function writeTrackedOrderToken(demo: DemoSlug, token: string): Promise<void> {
  await writeCookie(trackedCookie(demo), token, TRACKED_MAX_AGE)
}
