import 'server-only'

import { cache } from 'react'
import { getSession, isDemoAuth } from '@/lib/auth'
import { demoProfile } from './demo-profile'
import { DEFAULT_CONTACT_METHOD, type ShopperProfile } from './profile'
import { readProfile } from './store'

/*
 * The profile facade: what a Server Component calls to show who is shopping.
 *
 *     import { getProfile } from '@/lib/profile'
 *     const profile = await getProfile()
 *
 * Editing it lives in `./actions.ts`, because only an action can write the
 * cookie standing in for a backend.
 */

/**
 * The signed-in shopper's record, or `null` for a guest, which the account
 * layout's guard means no screen ever sees.
 *
 * The email always comes from the session, because the auth backend owns the
 * address sign-in uses. Everything else comes from the store, and from the
 * sample profile while the demo auth adapter is the active one, so the page
 * opens with something on it. Connect a real backend and that stops, a new
 * account starts on its name alone, and only `./store.ts` still needs
 * replacing.
 */
export const getProfile = cache(async (): Promise<ShopperProfile | null> => {
  const customer = await getSession()
  if (!customer) return null

  const stored = await readProfile()
  const seed = stored ?? {
    firstName: customer.firstName,
    lastName: customer.lastName,
    contactMethod: DEFAULT_CONTACT_METHOD,
    interests: [],
    connections: [],
    twoFactor: false,
    ...(isDemoAuth ? demoProfile() : {}),
  }

  return { ...seed, email: customer.email }
})
