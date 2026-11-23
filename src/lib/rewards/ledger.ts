import { formatCount, formatMoney, formatPercent } from '@/lib/commerce/format'
import { REWARDS } from '@/lib/commerce/programs/rewards'
import type { CurrencyCode, Money } from '@/lib/commerce/types'

/*
 * What a shopper has earned, what they spent, and what they can spend next.
 *
 * `commerce/programs/rewards.ts` holds the store's policy: the rates, what a
 * point is worth, what a review pays. This holds one shopper's running total
 * against it. Nothing here re-states a rate.
 *
 * Safe on both sides of the network. The reads are `./index.ts`, which is not.
 */

/** What put points on an account, or took them off. */
export type RewardsEventKind = 'order' | 'review' | 'referral' | 'birthday' | 'redemption'

/**
 * What each kind of entry is called in the history. Centralized so a translation
 * has one place to reach, and so a row cannot name itself something the totals
 * disagree with.
 */
export const REWARDS_EVENT_LABELS: Record<RewardsEventKind, string> = {
  order: 'Points for an order',
  review: 'Points for a review',
  referral: 'Referral bonus',
  birthday: 'Birthday bonus',
  redemption: 'Redeemed on purchase',
}

/** One line of the rewards history. */
export interface RewardsEntry {
  id: string
  kind: RewardsEventKind
  /** When it landed, as an ISO timestamp. */
  at: string
  /** What it was about: an order number, a product, the friend who joined. */
  detail?: string
  /** Signed, so a ledger adds up: earned is positive, redeemed is negative. */
  points: number
  /**
   * True while the order behind it is still in flight. Pending points are shown
   * but cannot be spent, which is the one rule that keeps a store from paying
   * out on an order that is about to be returned.
   */
  pending?: boolean
}

/** A shopper's standing in the program: what they hold, and what the history came to. */
export interface RewardsBalance {
  /** Points that can be spent right now. */
  available: number
  /** Points waiting on a delivery. */
  pending: number
  /** What the same orders would have paid a member, which is the figure the pitch quotes. */
  asMember: number
  /** What the points are worth in, so a screen can price them without picking a currency. */
  currencyCode: CurrencyCode
  /** Every entry, newest first. */
  entries: RewardsEntry[]
}

/** One of the figures a balance is explained by. */
export interface BalanceFact {
  points: number
  /** What the figure is, read after it: "1,240 points available to spend". */
  label: string
  /** What it means, for the info button beside it. */
  info: string
  /** Whether it is the membership's figure, which a screen may mark with the program's brand. */
  member: boolean
}

/**
 * The 3 figures behind a balance, in the order a screen lists them. The words
 * live here so every storefront explains the program the same way.
 */
export function balanceFacts(balance: RewardsBalance): BalanceFact[] {
  return [
    {
      points: balance.available,
      label: 'available to spend',
      member: false,
      info: `Spend these at the checkout, where each one comes off your order like ${formatMoney(pointsValue(1, balance.currencyCode))}.`,
    },
    {
      points: balance.asMember,
      label: `could have with ${REWARDS.name}`,
      member: true,
      info: `What the same orders would have earned at the member rate of ${formatPercent(REWARDS.memberRate)} back, instead of the usual ${formatPercent(REWARDS.rate)}.`,
    },
    {
      points: balance.pending,
      label: 'activating on delivery',
      member: false,
      info: 'Points from an order land on your balance the day it is delivered, so anything you send back never has to be paid for twice.',
    },
  ]
}

/** What `points` are worth in `currencyCode`, at the store's own rate. */
export function pointsValue(points: number, currencyCode: CurrencyCode): Money {
  return { amount: points * REWARDS.pointValue, currencyCode }
}

/**
 * Adds a ledger up, newest first. Pending entries are totaled apart rather than
 * left out, because the page shows both figures and only one of them is
 * spendable.
 *
 * @param asMember What the same orders would have earned at the member rate.
 * @param currencyCode What the store prices in, which is what a point is worth.
 */
export function summarizeLedger(entries: RewardsEntry[], asMember: number, currencyCode: CurrencyCode): RewardsBalance {
  const total = (pending: boolean) =>
    entries.reduce((running, entry) => running + (Boolean(entry.pending) === pending ? entry.points : 0), 0)

  return {
    available: Math.max(0, total(false)),
    pending: total(true),
    asMember,
    currencyCode,
    entries: [...entries].sort((a, b) => b.at.localeCompare(a.at)),
  }
}

/**
 * A point count as it reads in copy, e.g. `"32 points"`. Singular below 2, so
 * the referral pitch and a 1-point row both read as English.
 *
 * @param locale BCP-47 locale controlling digit grouping. Defaults to `'en-US'`;
 *   wire this to the active locale once i18n lands.
 */
export function formatPoints(points: number, locale = 'en-US'): string {
  return `${formatCount(points, locale)} ${Math.abs(points) === 1 ? 'point' : 'points'}`
}

/** The same count with its sign, for the history's value column: `"+32 points"`, `"-15 points"`. */
export function formatPointsChange(points: number, locale = 'en-US'): string {
  return `${points > 0 ? '+' : ''}${formatPoints(points, locale)}`
}
