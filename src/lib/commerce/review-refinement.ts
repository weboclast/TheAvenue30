import type { ProductReview } from './types'

/*
 * Sorting and filtering a product's reviews in the browser. Every storefront's
 * reviews section offers the same refinements over the same data, so they are
 * decided here once and the screens only draw the controls. Client-safe.
 */

/** Sort orders, in the order offered. Keyed by {@link ProductReviewSort}, so a new one needs a label to compile. */
export const REVIEW_SORT_LABELS = {
  recent: 'Most recent',
  helpful: 'Most helpful',
  'rating-desc': 'Highest rated',
  'rating-asc': 'Lowest rated',
} as const

export type ProductReviewSort = keyof typeof REVIEW_SORT_LABELS

const SORTERS: Record<ProductReviewSort, (a: ProductReview, b: ProductReview) => number> = {
  recent: (a, b) => b.date.localeCompare(a.date),
  helpful: (a, b) => b.helpfulCount - a.helpfulCount,
  'rating-desc': (a, b) => b.rating - a.rating,
  'rating-asc': (a, b) => a.rating - b.rating,
}

/**
 * Star buckets the filter offers. The bottom 2 share a bucket: a lone 1-star
 * checkbox usually just empties the list, and nobody hunting for the bad reviews
 * cares which of the two it was.
 */
export const RATING_BUCKETS: { value: string; label: string; stars: number[] }[] = [
  { value: '5', label: '5', stars: [5] },
  { value: '4', label: '4', stars: [4] },
  { value: '3', label: '3', stars: [3] },
  { value: '2-1', label: '2-1', stars: [2, 1] },
]

/** Below this many reviews there is nothing worth sorting or filtering, so the toolbar stays out. */
export const MIN_REFINABLE_REVIEWS = 4

/** What a shopper has narrowed the reviews to. */
export interface ReviewRefinement {
  sort: ProductReviewSort
  /** Picked {@link RATING_BUCKETS}, by value. None picked means every rating. */
  buckets: string[]
  verifiedOnly: boolean
}

/** The reviews a refinement leaves, in its order. */
export function refineReviews(reviews: ProductReview[], { sort, buckets, verifiedOnly }: ReviewRefinement) {
  const stars = new Set(RATING_BUCKETS.filter((bucket) => buckets.includes(bucket.value)).flatMap((b) => b.stars))
  return reviews
    .filter((review) => (stars.size === 0 || stars.has(review.rating)) && (!verifiedOnly || review.verified))
    .sort(SORTERS[sort])
}
