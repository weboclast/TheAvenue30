import type { CartLine, Order, ReviewFit } from '@/lib/commerce/types'

/*
 * What a shopper has to say about what they bought: the products still waiting
 * on a review, the reviews already written, and what `/account/reviews` keeps in
 * its query string.
 *
 * Distinct from `ProductReview` in `commerce/types.ts`. That is a review as the
 * catalog publishes it, addressed to whoever loads a product page. This is a
 * review as its author sees it, which is why it carries the order behind it and
 * what the store paid for it.
 *
 * Safe on both sides of the network. The reads are `./index.ts`, which is not.
 */

/** Which half of the Reviews page is being read. */
export type ReviewTab = 'pending' | 'written'

/** The tabs, in the order the page offers them. */
export const REVIEW_TABS = [
  { value: 'pending', label: 'Ready for review' },
  { value: 'written', label: 'My reviews' },
] as const satisfies readonly { value: ReviewTab; label: string }[]

/** The query parameter the page keeps its tab in. */
const REVIEW_TAB_PARAM = 'tab'

/** The tab shown when the URL names none. */
const DEFAULT_REVIEW_TAB: ReviewTab = 'pending'

/** How a page of prompts or of reviews is ordered. */
export type ReviewSort = 'latest' | 'oldest' | 'rating-desc' | 'rating-asc'

/**
 * What each tab offers to sort by. They differ because the tabs sort different
 * things: a prompt has a purchase date and no rating, a review has both.
 */
export const REVIEW_SORTS = {
  pending: [
    { value: 'latest', label: 'Newest purchase' },
    { value: 'oldest', label: 'Oldest purchase' },
  ],
  written: [
    { value: 'latest', label: 'Newest first' },
    { value: 'oldest', label: 'Oldest first' },
    { value: 'rating-desc', label: 'Highest rated' },
    { value: 'rating-asc', label: 'Lowest rated' },
  ],
} as const satisfies Record<ReviewTab, readonly { value: ReviewSort; label: string }[]>

/** The order a tab opens in. Stays out of the URL, so the page has a clean address. */
export const DEFAULT_REVIEW_SORT: ReviewSort = 'latest'

/** Rows per page, on both tabs. */
export const REVIEWS_PAGE_SIZE = 8

/** One product a shopper has received and has not written about yet. */
export interface ReviewablePurchase {
  /** The order it arrived on, which is what lets a store verify the review. */
  order: Order
  /** The product to review, one of {@link order}'s lines. */
  line: CartLine
}

/** One review this shopper has written. */
export interface ShopperReview {
  id: string
  /** The order it was written against. */
  orderNumber: string
  /** What it is about, in the configuration it was bought in. */
  line: CartLine
  /** Stars awarded, 1-5. */
  rating: number
  /** The headline, where the storefront's form asks for one. */
  title?: string
  body: string
  /** How it fit, where the storefront asks. */
  fit?: ReviewFit
  /** When it was written, as an ISO timestamp. */
  writtenAt: string
  /**
   * What the store paid for it. Absent while the review is still being checked,
   * which is what a row reports in place of the badge.
   */
  points?: number
}

/** The shortest review a store takes, in characters. */
const MIN_REVIEW_BODY = 20

/** Where a review stops. */
export const MAX_REVIEW_BODY = 2000

/** Where a review's headline stops. */
export const MAX_REVIEW_TITLE = 80

/**
 * What a review form submits: 1 review of 1 line of a delivered order, with its
 * photos and clips as `File` objects. Uploading them is the store's call, in the
 * form's `onReviewSubmit`; see `./AGENTS.md`.
 */
export interface ReviewDraft {
  /** The order it is written against, which is what lets a store verify it. */
  orderNumber: string
  /** The line reviewed, by its `CartLine.id`. */
  lineId: string
  /** Stars awarded, 1-5. */
  rating: number
  /** The headline, where the storefront's form asks for one. */
  title?: string
  body: string
  /** How it fit, where the storefront asks. */
  fit?: ReviewFit
  /** Photos and clips, in the order they were picked. */
  media: File[]
  /** Whether the reviewer asked to hear about replies. */
  notifyOnReplies: boolean
}

/**
 * The 2 checks every review form runs before anything is sent, together, so a
 * submit flags everything wrong rather than the first thing.
 */
export function validateReview(rating: number, body: string): Partial<Record<'rating' | 'body', string>> {
  return {
    rating: rating > 0 ? undefined : 'Pick a rating',
    body: body.trim().length >= MIN_REVIEW_BODY ? undefined : `Write at least ${MIN_REVIEW_BODY} characters`,
  }
}

/** One page of the products waiting on a review. */
export interface ReviewablePage {
  tab: 'pending'
  purchases: ReviewablePurchase[]
  /** 1-based. */
  page: number
  pageCount: number
}

/** One page of the reviews this shopper has written. */
export interface WrittenReviewPage {
  tab: 'written'
  reviews: ShopperReview[]
  page: number
  pageCount: number
}

/** How either list is narrowed. Both tabs page and sort the same way. */
export interface ReviewQuery {
  sort?: ReviewSort
  /** 1-based. @default 1 */
  page?: number
  /** @default REVIEWS_PAGE_SIZE */
  pageSize?: number
}

/** Reads a request's query string as the tab to show, ignoring anything it does not offer. */
export function parseReviewTab(params: URLSearchParams): ReviewTab {
  const value = params.get(REVIEW_TAB_PARAM)
  return REVIEW_TABS.find((tab) => tab.value === value)?.value ?? DEFAULT_REVIEW_TAB
}

/**
 * Reads the sort order this tab is being shown in. An order the tab does not
 * offer falls back to the default rather than being refused, so a link carrying
 * one from the other tab still shows reviews.
 */
export function parseReviewSort(params: URLSearchParams, tab: ReviewTab): ReviewSort {
  const value = params.get('sort')
  return REVIEW_SORTS[tab].find((sort) => sort.value === value)?.value ?? DEFAULT_REVIEW_SORT
}

/** Reads the page being asked for, always at least `1`. */
export function parseReviewPage(params: URLSearchParams): number {
  return Math.max(1, Number(params.get('page')) || 1)
}

/**
 * Switches tab. The sort goes with it: the tabs offer different orders, so one
 * carried across would be a refinement the new tab never made.
 */
export function withReviewTab(params: URLSearchParams, tab: ReviewTab): URLSearchParams {
  const next = new URLSearchParams(params)
  next.delete('sort')
  next.delete('page')
  if (tab === DEFAULT_REVIEW_TAB) next.delete(REVIEW_TAB_PARAM)
  else next.set(REVIEW_TAB_PARAM, tab)
  return next
}

/** Changes the order. The default drops out of the URL instead of being spelled out. */
export function withReviewSort(params: URLSearchParams, sort: ReviewSort): URLSearchParams {
  const next = new URLSearchParams(params)
  next.delete('page')
  if (sort === DEFAULT_REVIEW_SORT) next.delete('sort')
  else next.set('sort', sort)
  return next
}

/** Moves to a page, keeping the tab and the sort. */
export function withReviewPage(params: URLSearchParams, page: number): URLSearchParams {
  const next = new URLSearchParams(params)
  if (page > 1) next.set('page', String(page))
  else next.delete('page')
  return next
}
