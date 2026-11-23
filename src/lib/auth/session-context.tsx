'use client'

import { createContext, use } from 'react'
import type { Customer } from './types'

const SessionContext = createContext<Customer | null>(null)

interface SessionProviderProps {
  /** The customer resolved on the server by `getSession`, or `null` for a guest. */
  session: Customer | null
  children: React.ReactNode
}

/**
 * Publishes the server-resolved session to Client Components. Mount it once per
 * storefront, in the layout that awaits `getSession`: each shop layout does, so
 * the header, the cart's checkout gate, and every `AccountLink` read it here.
 *
 * It holds no state and refreshes nothing itself: the auth actions revalidate
 * the layout, which re-renders this with the new value.
 */
export function SessionProvider({ session, children }: SessionProviderProps) {
  return <SessionContext value={session}>{children}</SessionContext>
}

/**
 * The signed-in customer, or `null` for a guest. Server Components call
 * `getSession` from `@/lib/auth` instead.
 */
export function useSession(): Customer | null {
  return use(SessionContext)
}
