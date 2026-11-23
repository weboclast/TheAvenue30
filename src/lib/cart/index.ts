import 'server-only'

import { cache } from 'react'
import { commerceAdapter } from '@/lib/commerce'
import type { Cart } from '@/lib/commerce/types'
import type { DemoSlug } from '@/lib/demos'
import { getRewardsBalance } from '@/lib/rewards'
import { readCartToken } from './token'

/*
 * The cart facade: what a Server Component calls to find out what a visitor is
 * carrying.
 *
 *     import { getCart } from '@/lib/cart'
 *     const cart = await getCart('electronics')
 *
 * It is the commerce adapter's cart, read with the token from this visitor's
 * cookie. That cookie is why the cart lives here rather than on the `getCommerce`
 * client, whose reads are shared by every visitor. Reading it makes the calling
 * route dynamic, exactly like the session.
 *
 * Mutations live in `./actions.ts`, because a cookie can only be written from a
 * Server Action. Client Components use `useCart` (see `./cart-context.tsx`).
 */

/** What the visitor is carrying in a demo's store, empty when they carry nothing. Memoized per request. */
export const getCart = cache(async (demo: DemoSlug): Promise<Cart> => {
  const token = await readCartToken(demo)
  const { cart } = await commerceAdapter.getCart(demo, token)
  return withRewardsBalance(demo, cart)
})

/**
 * Puts the shopper's spendable points on the cart, which is the 1 figure the
 * commerce adapter cannot count: a balance belongs to the shopper, and every
 * adapter read is scoped to a storefront. Both paths into a cart run through it,
 * this facade and every mutation in `./actions.ts`, and `0` is dropped so a
 * store running no loyalty program shows no row.
 *
 * Staking points does not spend them: the ledger only moves when an order is
 * placed, so the balance already counts what the cart is holding. A backend that
 * reserves points against a cart has to add them back here.
 */
export async function withRewardsBalance(demo: DemoSlug, cart: Cart): Promise<Cart> {
  const { available } = await getRewardsBalance(demo)

  return available > 0 ? { ...cart, rewardsBalance: available } : cart
}
