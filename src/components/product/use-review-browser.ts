'use client'

import { useState } from 'react'
import { type ProductReviewSort, refineReviews } from '@/lib/commerce/review-refinement'
import type { ProductReview } from '@/lib/commerce/types'

/**
 * What a product's reviews section shares: the sort and filters over the whole
 * set, run in the browser, and which review the photo drawer has open. A review
 * opened from the "All reviews" panel lands back there when it closes.
 */
export function useReviewBrowser(reviews: ProductReview[]) {
  const [sort, setSort] = useState<ProductReviewSort>('recent')
  const [buckets, setBuckets] = useState<string[]>([])
  const [verifiedOnly, setVerifiedOnly] = useState(false)
  const [expanded, setExpanded] = useState<{ review: ProductReview; index: number } | null>(null)
  const [allOpen, setAllOpen] = useState(false)
  // The "All reviews" panel closes while a review is open: stacking the 2 would trap focus twice over.
  const [returnToAll, setReturnToAll] = useState(false)

  return {
    sort,
    setSort,
    /** The star ratings shown, by `RATING_BUCKETS` value. Empty shows every rating. */
    buckets,
    setBuckets,
    verifiedOnly,
    setVerifiedOnly,
    /** The reviews as the sort and the filters leave them. */
    refined: refineReviews(reviews, { sort, buckets, verifiedOnly }),
    /** Clears the filters, keeping the sort. */
    reset: () => {
      setBuckets([])
      setVerifiedOnly(false)
    },
    /** Whether the "All reviews" panel is open. */
    allOpen,
    setAllOpen,
    /** The review the photo drawer shows, and the photo it opened on. */
    expanded,
    expand: (review: ProductReview, index: number, fromList = false) => {
      setReturnToAll(fromList)
      if (fromList) setAllOpen(false)
      setExpanded({ review, index })
    },
    closeExpanded: () => {
      setExpanded(null)
      if (returnToAll) setAllOpen(true)
      setReturnToAll(false)
    },
  }
}
