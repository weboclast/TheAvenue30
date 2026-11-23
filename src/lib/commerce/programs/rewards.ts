import type { Money, Order } from '../types'

/*
 * The loyalty program, as the screens that mention it need to agree on it: the
 * cart pitches what an order would earn, and the order confirmation reports what it
 * did. 2 copies of the rate is how those 2 numbers drift apart.
 *
 * Store policy rather than catalog content, so it lives beside the commerce
 * layer like the shipping table does. A real store reads the balance back from
 * its loyalty provider; nothing here is awarded, no points are stored, and
 * nobody is ever a member: `/account/appica-club` sells the membership without
 * selling it, and every screen quotes the base rate.
 */

/**
 * What the program pays back, what joining it costs, and what it calls itself.
 *
 * {@link REWARDS.memberRate} is drawn into the artwork beside the cart's pitch,
 * so changing that one means re-exporting `RewardsArtwork` as well.
 */
export const REWARDS = {
  /** The program's name, as it appears in copy. */
  name: 'The Avenue 30 Club',
  /** What membership costs, billed monthly. */
  price: { amount: 9.99, currencyCode: 'USD' } satisfies Money,
  /** The share of an order paid back to every shopper, as a fraction. */
  rate: 0.05,
  /** The share paid back to a member: the base rate, plus the 5% membership adds. */
  memberRate: 0.1,
  /** What 1 point is worth, in the order's own currency. */
  pointValue: 1,
  /**
   * What writing a product review pays. Flat: the store is buying the writing,
   * not the order. A point is worth {@link REWARDS.pointValue}, so read this as money
   * before raising it - most stores pay a few dollars of credit, not a rebate.
   */
  reviewPoints: 5,
} as const

/** What an order of this size earns, rounded to whole points the way a statement shows them. */
export function rewardPoints(total: Money): number {
  return Math.round((total.amount * REWARDS.rate) / REWARDS.pointValue)
}

/**
 * What the same order would have earned as a member, which is the second figure
 * every "you earned" line quotes.
 *
 * Scaled off {@link rewardPoints} rather than re-derived from the total: rounded
 * apart, the 2 land a point short of each other and the pitch quotes less than
 * the rates promise.
 */
export function memberRewardPoints(total: Money): number {
  return Math.round(rewardPoints(total) * (REWARDS.memberRate / REWARDS.rate))
}

/**
 * What membership would already have been worth across orders placed without
 * it: the points the extra rate would have added, plus the shipping it covers.
 * `null` for a shopper with no orders to count.
 *
 * Both halves are money, since a point is worth {@link REWARDS.pointValue} of
 * whatever the order was paid in.
 */
export function memberSavings(orders: Order[]): Money | null {
  const first = orders[0]
  if (!first) return null

  const amount = orders.reduce((running, order) => {
    const bonus = memberRewardPoints(order.total) - rewardPoints(order.total)
    return running + bonus * REWARDS.pointValue + order.shipping.amount
  }, 0)

  return { amount, currencyCode: first.total.currencyCode }
}
