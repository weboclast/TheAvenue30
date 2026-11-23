import 'server-only'

import { headers } from 'next/headers'
import { cache } from 'react'
import { getSession, isDemoAuth } from '@/lib/auth'
import { isDemoCommerce } from '@/lib/commerce'
import { REWARDS, memberRewardPoints, rewardPoints } from '@/lib/commerce/programs/rewards'
import type { Order } from '@/lib/commerce/types'
import type { DemoSlug } from '@/lib/demos'
import { listAllAccountOrders } from '@/lib/orders'
import { writtenReviews } from '@/lib/reviews'
import { demoLedgerEntries } from './demo-ledger'
import { demoOffers } from './demo-offers'
import { type RewardsBalance, type RewardsEntry, summarizeLedger } from './ledger'
import { type Offer, type OfferStatus, offerStatus, storeToday } from './offers'
import { REFERRAL_FRIEND_DISCOUNT, REFERRAL_PATH, REFERRAL_POINTS, type Referral, referralCode } from './referral'

/*
 * The rewards facade: what a Server Component calls to show where a shopper
 * stands in the loyalty program.
 *
 *     import { getRewardsBalance } from '@/lib/rewards'
 *     const balance = await getRewardsBalance(REFERENCE_DEMO)
 *
 * Everything an order can answer is derived from the order history, because
 * every backend has one. What it cannot answer comes from the demo files beside
 * this one; see `./AGENTS.md`.
 */

/** What a guest gets. The account layout's guard means no screen ever sees it. */
const NO_BALANCE: RewardsBalance = {
  available: 0,
  pending: 0,
  asMember: 0,
  currencyCode: REWARDS.price.currencyCode,
  entries: [],
}

/**
 * Where the signed-in shopper stands: what they can spend, what is still
 * activating, and every line behind both figures.
 *
 * Points from an order activate when it is delivered. That is the one rule
 * holding the program together, and it is why a store can afford to pay out at
 * all: an order still in a van can still come back.
 */
export const getRewardsBalance = cache(async (demo: DemoSlug): Promise<RewardsBalance> => {
  const customer = await getSession()
  if (!customer) return NO_BALANCE

  const [orders, reviews] = await Promise.all([listAllAccountOrders(demo), writtenReviews(demo)])

  const entries = orders.flatMap(orderEntries)

  // A review still being checked has earned nothing yet, so it has no line here.
  for (const review of reviews) {
    if (review.points) {
      entries.push({
        id: `review-${review.id}`,
        kind: 'review',
        at: review.writtenAt,
        detail: review.line.title,
        points: review.points,
      })
    }
  }

  if (isDemoAuth) entries.push(...demoLedgerEntries())

  const earned = entries.reduce((running, entry) => running + Math.max(0, entry.points), 0)
  const membershipBonus = orders.reduce(
    (running, order) => running + memberRewardPoints(order.total) - rewardPoints(order.total),
    0,
  )

  // A store prices its points in whatever it sells in, which the history knows
  // and this module does not.
  const currencyCode = orders[0]?.total.currencyCode ?? REWARDS.price.currencyCode

  return summarizeLedger(entries, earned + membershipBonus, currencyCode)
})

/** What one order put on the account, and what it took back off where points paid for part of it. */
function orderEntries(order: Order): RewardsEntry[] {
  const entries: RewardsEntry[] = [
    {
      id: `order-${order.number}`,
      kind: 'order',
      at: order.placedAt,
      detail: `Order ${order.number}`,
      points: rewardPoints(order.total),
      pending: order.tracking.status !== 'delivered',
    },
  ]

  if (order.rewards) {
    entries.push({
      id: `redemption-${order.number}`,
      kind: 'redemption',
      at: order.placedAt,
      detail: `Order ${order.number}`,
      points: -order.rewards.points,
    })
  }

  return entries
}

/**
 * The campaigns this shopper holds at one status, newest first. Empty for a
 * guest, and empty for a storefront the sample offers were not authored against.
 *
 * The status is derived from each offer's own dates rather than filtered in a
 * backend, so a store that returns every offer it issued still gets 3 correct
 * tabs. Point this at your backend's discounts or your own promotions table,
 * scoped to the customer.
 */
export const listOffers = cache(async (demo: DemoSlug, status: OfferStatus): Promise<Offer[]> => {
  const customer = await getSession()
  if (!customer) return []

  // The sample codes are redeemed by the demo cart, so they need both demo halves.
  const offers = isDemoAuth && isDemoCommerce ? demoOffers(demo) : []

  const today = storeToday()
  return offers.filter((offer) => offerStatus(offer, today) === status)
})

/**
 * The signed-in shopper's invitation, or `null` for a guest.
 *
 * The link is absolute, since it exists to be pasted into a message, and its
 * origin comes from the request rather than from a build-time constant so a
 * store works on whatever domain it is deployed to.
 */
export const getReferral = cache(async (): Promise<Referral | null> => {
  const customer = await getSession()
  if (!customer) return null

  const code = referralCode(customer.firstName, customer.id)
  const requestHeaders = await headers()
  const host = requestHeaders.get('host') ?? 'localhost:3000'
  const protocol = requestHeaders.get('x-forwarded-proto') ?? (host.startsWith('localhost') ? 'http' : 'https')

  return {
    code,
    url: `${protocol}://${host}${REFERRAL_PATH}?ref=${code}`,
    points: REFERRAL_POINTS,
    friendDiscount: REFERRAL_FRIEND_DISCOUNT,
  }
})
