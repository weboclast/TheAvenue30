import type { OrderQuery, OrderStatus } from '@/lib/commerce/types'

/*
 * The order history's URL contract: what `/account/orders?status=…&q=…&page=…`
 * means, and the only place that knows. The page parses a request with
 * `parseOrderFilters`, the toolbar writes changes back with the `with*` helpers,
 * so there is 1 spelling of every parameter and no string building elsewhere.
 *
 * The same arrangement as `lib/catalog-filters.ts`: a refinement in the URL is
 * shareable, survives a reload, and leaves the list a Server Component rather
 * than a client-side filter over every order an account has placed.
 *
 * Safe on both sides of the network: no server-only imports, no browser globals.
 */

/** What the status filter offers, in the order it offers them. `all` is the absent parameter. */
export const ORDER_STATUS_FILTERS = [
  { value: 'all', label: 'All orders' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'processing', label: 'Processing' },
  { value: 'out-for-delivery', label: 'Out for delivery' },
  { value: 'delivered', label: 'Delivered' },
] as const satisfies readonly { value: OrderStatus | 'all'; label: string }[]

/** The status filter's value, which is an {@link OrderStatus} or the unfiltered view. */
export type OrderStatusFilter = (typeof ORDER_STATUS_FILTERS)[number]['value']

/** Every refinement the order history understands, parsed out of 1 request. */
export interface OrderFilters {
  /** The stage being shown. `'all'` is every stage, and stays out of the URL. */
  status: OrderStatusFilter
  /** Free text, matched by the commerce layer. */
  search?: string
  /** 1-based, and always at least `1`. */
  page: number
}

/** Read a request's query string as order-history refinements. */
export function parseOrderFilters(params: URLSearchParams): OrderFilters {
  return {
    status: parseStatus(params.get('status')),
    search: params.get('q')?.trim() || undefined,
    page: Math.max(1, Number(params.get('page')) || 1),
  }
}

/** Turn parsed refinements into a commerce query. */
export function toOrderQuery(filters: OrderFilters): OrderQuery {
  return {
    page: filters.page,
    ...(filters.status !== 'all' && { status: filters.status }),
    ...(filters.search && { search: filters.search }),
  }
}

/**
 * Narrow the list to 1 stage, or to `'all'`. Every `with*` helper returns a
 * fresh copy and drops `page`, which means nothing in a new result set.
 */
export function withOrderStatus(params: URLSearchParams, status: OrderStatusFilter): URLSearchParams {
  const next = reset(params)
  if (status === 'all') next.delete('status')
  else next.set('status', status)
  return next
}

/** Set or clear the search term. */
export function withOrderSearch(params: URLSearchParams, search: string): URLSearchParams {
  const next = reset(params)
  const term = search.trim()
  if (term) next.set('q', term)
  else next.delete('q')
  return next
}

/** Move to a page, keeping every refinement. The 1 helper that doesn't reset the page. */
export function withOrderPage(params: URLSearchParams, page: number): URLSearchParams {
  const next = new URLSearchParams(params)
  if (page > 1) next.set('page', String(page))
  else next.delete('page')
  return next
}

/** Whether anything is narrowing the history, which is how an empty list explains itself. */
export function hasOrderFilters(filters: OrderFilters): boolean {
  return filters.status !== 'all' || filters.search != null
}

function reset(params: URLSearchParams): URLSearchParams {
  const next = new URLSearchParams(params)
  next.delete('page')
  return next
}

/* Unknown values are ignored rather than refused, so a stale link still shows orders. */
function parseStatus(value: string | null): OrderStatusFilter {
  const match = ORDER_STATUS_FILTERS.find((filter) => filter.value === value)
  return match?.value ?? 'all'
}
