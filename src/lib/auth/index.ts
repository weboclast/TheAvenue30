import 'server-only'

import { cache } from 'react'
import { redirect } from 'next/navigation'
import { authAdapter } from './config'
import { readSessionToken } from './session'
import type { Customer } from './types'

/*
 * The auth facade: what Server Components call to find out who is shopping.
 *
 *     import { getSession } from '@/lib/auth'
 *     const customer = await getSession()
 *
 * Mutations live in `./actions.ts` as Server Actions, because a cookie can only
 * be written from one. Client Components read the same customer through
 * `useSession` (see `./session-context.tsx`) rather than calling this.
 *
 * Reading it makes the calling route dynamic, so put the part that depends on
 * it behind a `<Suspense>` boundary and the rest of the page still prerenders.
 */

/**
 * Whether the active adapter can swap a shopper's password, so a screen offers
 * the control or leaves it out. `false` where sign-in belongs to somebody else,
 * which is the case for SSO and passwordless backends.
 */
export function canChangePassword(): boolean {
  return typeof authAdapter.changePassword === 'function'
}

/** The signed-in customer, or `null` for a guest. Memoized per request. */
export const getSession = cache(async (): Promise<Customer | null> => {
  const token = await readSessionToken()
  if (!token) return null
  return authAdapter.getCustomer(token)
})

/**
 * The signed-in customer, or a redirect to sign-in that comes back to `next`.
 * Call it from the layout of an area that requires an account, so a page added
 * to that area later is guarded without anyone remembering to guard it.
 */
export async function requireSession(next: string): Promise<Customer> {
  const customer = await getSession()
  if (!customer) redirect(`/login?next=${encodeURIComponent(safeNextPath(next))}`)
  return customer
}

/** Where sign-in lands when nothing safe was asked for: the reference demo's account. */
export const DEFAULT_NEXT_PATH = '/account'

/**
 * Narrows a `next` parameter to a path on this site, falling back to the
 * reference demo's account. Anything arriving from a query string reaches a
 * `redirect()` eventually, and without this an attacker chooses the destination.
 */
export function safeNextPath(next: string | undefined | null): string {
  if (!next?.startsWith('/')) return DEFAULT_NEXT_PATH
  // `//evil.com` and `/\evil.com` are protocol-relative, so browsers leave the site.
  if (next.startsWith('//') || next.startsWith('/\\')) return DEFAULT_NEXT_PATH
  return next
}

export { isDemoAuth } from './config'
export type { Credentials, Customer, PasswordChange, Registration, Session } from './types'
