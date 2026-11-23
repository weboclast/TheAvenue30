import 'server-only'

import { cache } from 'react'
import { getSession, isDemoAuth } from '@/lib/auth'
import type { DemoSlug } from '@/lib/demos'
import { listAllAccountOrders } from '@/lib/orders'
import { demoReviews } from './demo-reviews'
import {
  DEFAULT_REVIEW_SORT,
  REVIEWS_PAGE_SIZE,
  type ReviewQuery,
  type ReviewSort,
  type ReviewablePage,
  type ReviewablePurchase,
  type ShopperReview,
  type WrittenReviewPage,
} from './reviews'

/*
 * The reviews facade: what a Server Component calls to show what a shopper has
 * written, and what they have bought and not written about yet.
 *
 *     import { listReviewable } from '@/lib/reviews'
 *     const { purchases } = await listReviewable(REFERENCE_DEMO)
 *
 * A prompt is derived from the order history, because every backend has one. The
 * reviews themselves come from the demo file beside this one; see `./AGENTS.md`.
 */

/** A page holding nothing, which is what a guest gets. */
const EMPTY_PAGE = { page: 1, pageCount: 1 } as const

/**
 * What this shopper has received and not yet written about, 1 entry per product
 * rather than per order. Empty for a guest, which the account layout's guard
 * means no screen ever sees.
 *
 * Only delivered orders are offered: a store cannot pay for a review of
 * something that has not arrived, and it is the same rule that holds an order's
 * points back until then.
 */
export const listReviewable = cache(async (demo: DemoSlug, query: ReviewQuery = {}): Promise<ReviewablePage> => {
  const customer = await getSession()
  if (!customer) return { tab: 'pending', purchases: [], ...EMPTY_PAGE }

  const [orders, written] = await Promise.all([listAllAccountOrders(demo, 'delivered'), writtenReviews(demo)])

  const reviewed = new Set(written.map((review) => reviewKey(review.orderNumber, review.line.id)))
  const purchases = orders
    .flatMap((order) => order.lines.map((line) => ({ order, line })))
    .filter((purchase) => !reviewed.has(reviewKey(purchase.order.number, purchase.line.id)))

  const { items, ...paging } = paginate(sortPurchases(purchases, query.sort), query)
  return { tab: 'pending', purchases: items, ...paging }
})

/**
 * The reviews this shopper has written, newest first. Empty for a guest, and
 * empty for a storefront the sample reviews were not authored against.
 *
 * Point this at your reviews platform or your own table, scoped to the
 * customer. The order behind each one is what the store
 * verifies it with, which is why a review carries the line it was written
 * against rather than only a product.
 */
export const listWrittenReviews = cache(async (demo: DemoSlug, query: ReviewQuery = {}): Promise<WrittenReviewPage> => {
  const written = await writtenReviews(demo)
  const { items, ...paging } = paginate(sortReviews(written, query.sort), query)
  return { tab: 'written', reviews: items, ...paging }
})

/**
 * Every review this shopper has written, unpaginated. Shared by the 2 reads
 * above and by the rewards ledger, which pays for each of them.
 */
export const writtenReviews = cache(async (demo: DemoSlug): Promise<ShopperReview[]> => {
  const customer = await getSession()
  if (!customer || !isDemoAuth) return []

  return demoReviews(demo, await listAllAccountOrders(demo, 'delivered'))
})

/** The handle a review and the purchase behind it share. */
function reviewKey(orderNumber: string, lineId: string): string {
  return `${orderNumber}:${lineId}`
}

/** When an order reached the shopper, which is what a prompt is dated by. */
function deliveredAt({ order }: ReviewablePurchase): string {
  return order.tracking.steps.find((step) => step.status === 'delivered')?.at ?? order.placedAt
}

function sortPurchases(purchases: ReviewablePurchase[], sort: ReviewSort = DEFAULT_REVIEW_SORT): ReviewablePurchase[] {
  const newest = (a: ReviewablePurchase, b: ReviewablePurchase) => deliveredAt(b).localeCompare(deliveredAt(a))
  return [...purchases].sort(sort === 'oldest' ? (a, b) => newest(b, a) : newest)
}

/** Ratings tie often, so a second key keeps 2 reviews of the same score in date order. */
function sortReviews(reviews: ShopperReview[], sort: ReviewSort = DEFAULT_REVIEW_SORT): ShopperReview[] {
  const byDate = (a: ShopperReview, b: ShopperReview) => b.writtenAt.localeCompare(a.writtenAt)

  return [...reviews].sort((a, b) => {
    if (sort === 'oldest') return byDate(b, a)
    if (sort === 'rating-desc') return b.rating - a.rating || byDate(a, b)
    if (sort === 'rating-asc') return a.rating - b.rating || byDate(a, b)
    return byDate(a, b)
  })
}

/** One page out of a sorted list, and how many pages it came from. A page past the end clamps to the last. */
function paginate<T>(
  all: T[],
  { page = 1, pageSize = REVIEWS_PAGE_SIZE }: ReviewQuery,
): { items: T[]; page: number; pageCount: number } {
  const pageCount = Math.max(1, Math.ceil(all.length / pageSize))
  const current = Math.min(Math.max(1, page), pageCount)

  return { items: all.slice((current - 1) * pageSize, current * pageSize), page: current, pageCount }
}
