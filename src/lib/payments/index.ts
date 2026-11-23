import 'server-only'

import { cache } from 'react'
import { getSession, isDemoAuth } from '@/lib/auth'
import { demoSavedMethods } from './demo-vault'
import { type SavedPaymentMethod, sortPaymentMethods } from './methods'
import { readVault } from './vault'

/*
 * The payments facade: what a Server Component calls to show what a shopper can
 * pay with.
 *
 *     import { listSavedPaymentMethods } from '@/lib/payments'
 *     const methods = await listSavedPaymentMethods()
 *
 * Saving and forgetting a method lives in `./actions.ts`, because only an action
 * can write the cookie standing in for a vault.
 */

/**
 * What the signed-in shopper can pay with, the default first. Empty for a guest,
 * which the account layout's guard means no screen ever sees.
 *
 * A shopper who has never saved anything gets the sample vault while the demo
 * auth adapter is the active one, so the page opens with something on it.
 * Connect a real backend and that stops, empty stays empty, and only
 * `./vault.ts` still needs replacing.
 */
export const listSavedPaymentMethods = cache(async (): Promise<SavedPaymentMethod[]> => {
  const customer = await getSession()
  if (!customer) return []

  const saved = await readVault()
  return sortPaymentMethods(saved ?? (isDemoAuth ? demoSavedMethods() : []))
})
