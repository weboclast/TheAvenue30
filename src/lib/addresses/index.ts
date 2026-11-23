import 'server-only'

import { cache } from 'react'
import { getSession, isDemoAuth } from '@/lib/auth'
import { type SavedAddress, sortAddresses } from './book'
import { demoAddresses } from './demo-book'
import { readBook } from './store'

/*
 * The addresses facade: what a Server Component calls to show where this
 * shopper's orders go.
 *
 *     import { listSavedAddresses } from '@/lib/addresses'
 *     const addresses = await listSavedAddresses()
 *
 * Saving and deleting one lives in `./actions.ts`, because only an action can
 * write the cookie standing in for a backend.
 */

/**
 * The signed-in shopper's address book, the default first. Empty for a guest,
 * which the account layout's guard means no screen ever sees.
 *
 * A shopper who has never saved anything gets the sample book while the demo
 * auth adapter is the active one, so the page opens with something on it.
 * Connect a real backend and that stops, empty stays empty, and only
 * `./store.ts` still needs replacing.
 */
export const listSavedAddresses = cache(async (): Promise<SavedAddress[]> => {
  const customer = await getSession()
  if (!customer) return []

  const saved = await readBook()
  return sortAddresses(saved ?? (isDemoAuth ? demoAddresses() : []))
})
