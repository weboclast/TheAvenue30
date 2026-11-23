import 'server-only'

import { cache } from 'react'
import { commerceAdapter } from '@/lib/commerce'
import type { Order } from '@/lib/commerce/types'
import type { DemoSlug } from '@/lib/demos'
import { readOrderToken } from './token'

/*
 * The checkout facade: what a Server Component calls to find out what a visitor
 * just ordered.
 *
 *     import { getPlacedOrder } from '@/lib/checkout'
 *     const order = await getPlacedOrder('electronics')
 *
 * The commerce adapter's order, read with the token from this visitor's cookie,
 * which makes the calling route dynamic exactly as `lib/cart` does. Placing an
 * order lives in `./actions.ts`, because only an action can write that cookie.
 */

/**
 * The order this visitor just placed, or `null` when they have none to confirm.
 *
 * `null` is an ordinary answer, not an error: anyone who opens the order
 * confirmation without ordering gets it, and the page renders its empty state.
 * The demo adapter answers it too, rather than inventing an order.
 */
export const getPlacedOrder = cache(async (demo: DemoSlug): Promise<Order | null> => {
  return commerceAdapter.getOrder(demo, await readOrderToken(demo))
})
