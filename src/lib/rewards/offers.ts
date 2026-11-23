import type { ProductImage } from '@/lib/commerce/types'

/*
 * The campaigns a shopper personally holds: a code, what it takes off, and what
 * it applies to.
 *
 * Distinct from the promos in `commerce/`. Those are merchandising, addressed
 * to whoever loads the page. An offer here is addressed to one account, so only
 * this shopper can see whether it is still live, already spent, or lapsed.
 *
 * Safe on both sides of the network. The reads are `./index.ts`, which is not.
 */

/** Where an offer stands, derived from the offer rather than stored on it. */
export type OfferStatus = 'available' | 'used' | 'expired'

/** The tabs the offers section shows, in the order it offers them. */
export const OFFER_STATUSES = [
  { value: 'available', label: 'Available' },
  { value: 'used', label: 'Used' },
  { value: 'expired', label: 'Expired' },
] as const satisfies readonly { value: OfferStatus; label: string }[]

/** The query parameter the offers section keeps its tab in. */
const OFFERS_PARAM = 'offers'

/** The tab shown when the URL names none. */
const DEFAULT_OFFER_STATUS: OfferStatus = 'available'

/**
 * The artwork behind an offer: a cut-out over a painted background, or a
 * photograph that fills its frame and needs none.
 */
export interface OfferArtwork {
  image: ProductImage
  /** CSS background for the light theme, behind a cut-out. */
  light?: string
  /** The same background, muted for the dark one. */
  dark?: string
}

/** One campaign this account holds. */
export interface Offer {
  id: string
  /** The code, as the store spells it. This is what the checkout redeems. */
  code: string
  title: string
  /** The small print: what it applies to, and what it does not. */
  terms: string
  artwork: OfferArtwork
  /**
   * The catalog it applies to, by {@link Category.slug}. The offer's panel lists
   * a few of those products, and "View all" links to that listing.
   */
  categorySlug: string
  /** The day it lapses, as `YYYY-MM-DD`. Absent for an offer that runs until it is used. */
  expiresAt?: string
  /** The day it was spent, as `YYYY-MM-DD`. Absent until it is. */
  usedAt?: string
  /** The order it was spent on, for a shopper working out where a discount went. */
  usedOn?: string
}

/**
 * Where an offer stands today. Derived rather than stored, so an offer cannot
 * carry a status its own dates contradict.
 *
 * @param today `YYYY-MM-DD` in the store's own zone, so a server and a browser
 *   agree on which day it is. See {@link storeToday}.
 */
export function offerStatus(offer: Offer, today: string): OfferStatus {
  if (offer.usedAt) return 'used'
  if (offer.expiresAt && offer.expiresAt < today) return 'expired'
  return 'available'
}

/** Days until an offer lapses, or `undefined` where it never does or already has. */
export function offerExpiresInDays(offer: Offer, today: string): number | undefined {
  if (!offer.expiresAt || offer.expiresAt < today) return undefined
  return Math.round((Date.parse(offer.expiresAt) - Date.parse(today)) / 86_400_000)
}

/** Today as `YYYY-MM-DD` in UTC, which is the zone every date in this template is read in. */
export function storeToday(): string {
  return new Date().toISOString().slice(0, 10)
}

/** Reads a request's query string as the tab to show, ignoring anything it does not offer. */
export function parseOfferStatus(params: URLSearchParams): OfferStatus {
  const value = params.get(OFFERS_PARAM)
  return OFFER_STATUSES.find((status) => status.value === value)?.value ?? DEFAULT_OFFER_STATUS
}

/**
 * Switches the tab, on a fresh copy. The default drops out of the URL rather
 * than being spelled out, so the page's own address is the one it opens on.
 */
export function withOfferStatus(params: URLSearchParams, status: OfferStatus): URLSearchParams {
  const next = new URLSearchParams(params)
  if (status === DEFAULT_OFFER_STATUS) next.delete(OFFERS_PARAM)
  else next.set(OFFERS_PARAM, status)
  return next
}
