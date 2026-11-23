import 'server-only'

import { cache } from 'react'
import { getSession } from '@/lib/auth'
import { readOrderToken } from '@/lib/checkout/token'
import { commerceAdapter } from '@/lib/commerce'
import type { CartLine, Order, OrderList, OrderQuery, OrderStatus } from '@/lib/commerce/types'
import type { DemoSlug } from '@/lib/demos'
import { readTrackedOrderToken } from './token'

/*
 * The orders facade: what a Server Component calls to show an order a visitor is
 * entitled to see.
 *
 *     import { getTrackedOrder } from '@/lib/orders'
 *     const order = await getTrackedOrder('electronics', 'APC-058291')
 *
 * There are 2 entitlements, and this module is the only place that knows the
 * difference. A guest holds a token, an opaque string a lookup or a checkout
 * wrote to a cookie; a signed-in shopper holds a session, and their whole order
 * history answers to it. The URL grants nothing either way.
 *
 * Looking an order up lives in `./actions.ts`, because only an action can write
 * the cookie that remembers it.
 */

/** What a guest gets from a read that answers to a session. */
const NO_ORDERS: OrderList = { orders: [], total: 0, page: 1, pageCount: 1 }

/**
 * One page of the signed-in customer's orders, newest first. A guest gets an
 * empty page rather than an error: the account area sends them to sign-in long
 * before this is read.
 *
 * The session is resolved to an email here rather than in the adapter, so a
 * backend never has to trust an address that arrived with the request.
 */
export const listAccountOrders = cache(async (demo: DemoSlug, query: OrderQuery): Promise<OrderList> => {
  const customer = await getSession()
  if (!customer) return NO_ORDERS

  return commerceAdapter.listOrders(demo, customer.email, query)
})

/**
 * The signed-in customer's whole history, or every order at 1 stage, newest
 * first; empty for a guest. The arguments stay primitive because `cache`
 * compares an object argument by identity, and every caller would build its own.
 */
export const listAllAccountOrders = cache(async (demo: DemoSlug, status?: OrderStatus): Promise<Order[]> => {
  const { orders } = await listAccountOrders(demo, { ...(status && { status }), pageSize: Number.MAX_SAFE_INTEGER })
  return orders
})

/**
 * The stages an order is still in flight in. Listed rather than "not delivered",
 * so a store that adds `canceled` does not start counting it as active.
 */
const ACTIVE_ORDER_STATUSES: readonly OrderStatus[] = ['confirmed', 'processing', 'out-for-delivery']

/**
 * How many of the customer's orders are still on their way, badged beside Orders
 * in the account navigation. `0` for a guest.
 */
export const countActiveOrders = cache(async (demo: DemoSlug): Promise<number> => {
  // The whole history: `OrderQuery` narrows to 1 stage and this spans 3. A real
  // backend answers it with `COUNT(*)` instead.
  const orders = await listAllAccountOrders(demo)

  return orders.filter((order) => ACTIVE_ORDER_STATUSES.includes(order.tracking.status)).length
})

/**
 * The order with this `number` from the signed-in customer's own history, or
 * `null`, so no screen can reach an order the list would not have offered.
 */
export const getAccountOrder = cache(async (demo: DemoSlug, number: string): Promise<Order | null> => {
  const wanted = number.trim().toUpperCase()
  // The whole history: a backend answering by number alone still has to check
  // the order belongs to the customer, which is what `listOrders` does.
  const orders = await listAllAccountOrders(demo)

  return orders.find((order) => order.number.toUpperCase() === wanted) ?? null
})

/** One line of a delivered order: a piece the customer now has. */
export interface DeliveredLine {
  order: Order
  line: CartLine
  /** When it arrived, as an ISO timestamp. */
  deliveredAt: string
}

/** Everything the signed-in customer has received, 1 entry per order line, newest order first. Empty for a guest. */
export const listDeliveredLines = cache(async (demo: DemoSlug): Promise<DeliveredLine[]> => {
  const orders = await listAllAccountOrders(demo, 'delivered')

  return orders.flatMap((order) => {
    const deliveredAt = order.tracking.steps.find((step) => step.status === 'delivered')?.at ?? order.placedAt
    return order.lines.map((line) => ({ order, line, deliveredAt }))
  })
})

/**
 * The orders this visitor holds a token for, newest first: the one they looked
 * up last and the one they placed here. What order tracking offers before it
 * asks for a number. The account history is {@link listAccountOrders}.
 */
export const getRecentOrders = cache(async (demo: DemoSlug): Promise<Order[]> => {
  const tokens = await Promise.all([readTrackedOrderToken(demo), readOrderToken(demo)])
  const orders = await Promise.all(tokens.map((token) => (token ? commerceAdapter.getOrder(demo, token) : null)))

  return orders
    .filter((order) => order !== null)
    .filter((order, index, held) => held.findIndex((other) => other.number === order.number) === index)
    .sort((a, b) => b.placedAt.localeCompare(a.placedAt))
})

/**
 * The order with this `number`, if this visitor is entitled to see it, `null`
 * otherwise. All 3 entitlements are tried: the token a lookup stored, the token
 * the checkout stored, and the signed-in customer's own history.
 *
 * The number is checked against the order the token resolves to, never trusted
 * from the URL.
 */
export const getTrackedOrder = cache(async (demo: DemoSlug, number: string): Promise<Order | null> => {
  const wanted = number.trim().toUpperCase()
  const held = (await getRecentOrders(demo)).find((order) => order.number.toUpperCase() === wanted)

  return held ?? getAccountOrder(demo, wanted)
})
