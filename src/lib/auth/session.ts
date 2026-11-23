import 'server-only'

import { readCookie, writeCookie } from '@/lib/cookies'

/*
 * Where the session lives. Only the adapter's opaque token is stored, so
 * changing backends changes what the value means and nothing else.
 *
 * A cookie rather than `localStorage` because Server Components read it: the
 * header renders signed-in on the first paint instead of flashing a guest state
 * and correcting itself after hydration.
 */

const SESSION_COOKIE = 'appica_session'
const SESSION_MAX_AGE = 60 * 60 * 24 * 30

/** The active session token, or `null` for a guest. Safe to call while rendering. */
export async function readSessionToken(): Promise<string | null> {
  return readCookie(SESSION_COOKIE)
}

/** Stores a token issued by the adapter. Only callable from a Server Action or Route Handler. */
export async function writeSessionToken(token: string): Promise<void> {
  await writeCookie(SESSION_COOKIE, token, SESSION_MAX_AGE)
}

/** Ends the session. Only callable from a Server Action or Route Handler. */
export async function clearSessionToken(): Promise<void> {
  await writeCookie(SESSION_COOKIE, null, 0)
}
