import { REWARDS } from '@/lib/commerce/programs/rewards'
import type { Order, ReviewFit } from '@/lib/commerce/types'
import { demoDaysAgo } from '@/lib/demo-customer'
import type { DemoSlug } from '@/lib/demos'
import type { ShopperReview } from './reviews'

/*
 * The reviews the sample customer has already written, for an account page that
 * would otherwise open with an empty "My reviews" tab and every purchase still
 * waiting on one.
 *
 * Each names a line of a sample order rather than a product, because the demo
 * resolves an order's lines against whichever storefront's catalog is being
 * read: the order numbers are fixed in `commerce/adapters/demo/order-book.ts`,
 * the products behind them are not. **Keep the numbers in step with that file.**
 * The prose is product-agnostic for the same reason, and a storefront whose
 * products need other words has samples of its own.
 *
 * Dates are counted from today, so the tab always reads as a recent run of
 * writing. **Delete this file with the demo adapters.**
 */

interface Sample {
  /** The order reviewed, by its number. */
  orderNumber: string
  /** Which of that order's lines, counting from 0. Skipped where the order is shorter. */
  lineIndex: number
  rating: number
  title?: string
  body: string
  fit?: ReviewFit
  /** How long ago it was written, in days. Always after that order was delivered. */
  daysAgo: number
  /** Still being checked, so the store has not paid for it yet. */
  pending?: boolean
}

/** 4 reviews: 3 published across the history, and the newest still being read. */
const DEFAULT_SAMPLES: Sample[] = [
  {
    orderNumber: 'APC-026840',
    lineIndex: 0,
    rating: 4,
    body: 'Arrived a day early and set itself up in a couple of minutes. It does everything I hoped it would, and the build feels a step above what I paid. Half a star off for the manual, which explains none of the settings you actually want.',
    daysAgo: 6,
    pending: true,
  },
  {
    orderNumber: 'APC-023155',
    lineIndex: 1,
    rating: 5,
    body: 'I have used this every day since it arrived and it has not skipped once. Packaging was tidy, nothing rattled, and it works with everything else I own. Easily the best thing I have bought this year.',
    daysAgo: 18,
  },
  {
    orderNumber: 'APC-014728',
    lineIndex: 0,
    rating: 3,
    body: 'Good at the things it is sold on and slower than I expected at the rest. Fine if it is your second one, but I would try it in person before making it your only one.',
    daysAgo: 40,
  },
  {
    orderNumber: 'APC-019004',
    lineIndex: 0,
    rating: 5,
    body: 'Bought it to replace something twice the price and I have not missed the old one once. It has survived a summer of being carried around in a bag, which is more than the last 2 managed.',
    daysAgo: 90,
  },
]

/**
 * The storefronts with samples of their own, on the same orders and in the same
 * order as the default. Fashion's carry the headline and the fit answer its
 * review form asks for; Furniture's are written for the pieces its sample
 * orders name.
 */
const OWN_SAMPLES: Partial<Record<DemoSlug, Sample[]>> = {
  fashion: [
    {
      orderNumber: 'APC-026840',
      lineIndex: 0,
      rating: 4,
      title: 'Soft, and a touch long',
      body: 'Lovely soft fabric that has kept its shape through a few washes. It runs a little long on me at 163 cm, so I wear it tucked in or knotted at the waist. My most worn piece this month.',
      fit: 0,
      daysAgo: 6,
      pending: true,
    },
    {
      orderNumber: 'APC-023155',
      lineIndex: 1,
      rating: 5,
      title: 'Exactly as pictured',
      body: 'Bought as a gift and it went down so well I ordered another. The color is exactly as pictured, the stitching is lovely up close, and the usual size was spot on.',
      fit: 0,
      daysAgo: 18,
    },
    {
      orderNumber: 'APC-014728',
      lineIndex: 0,
      rating: 3,
      title: 'Take the next size up',
      body: 'Beautiful color and a soft, even knit, but it runs small. I am usually a small and it pulled across the shoulders, so I exchanged it for a medium, which fits well.',
      fit: -1,
      daysAgo: 40,
    },
    {
      orderNumber: 'APC-019004',
      lineIndex: 0,
      rating: 5,
      title: 'Worth every penny',
      body: 'Crisp without feeling stiff, and it softens with every wash. Roomy in the way the photos show, so I kept my usual size. Worn all summer and it still looks new.',
      fit: 0,
      daysAgo: 90,
    },
  ],
}

/** The sample customer's reviews in a storefront, joined to the order lines they were written against. */
export function demoReviews(demo: DemoSlug, orders: Order[]): ShopperReview[] {
  return (OWN_SAMPLES[demo] ?? DEFAULT_SAMPLES).flatMap((sample) => {
    const order = orders.find((candidate) => candidate.number === sample.orderNumber)
    const line = order?.lines[sample.lineIndex]
    if (!order || !line) return []

    return {
      id: `demo-review-${order.number}-${line.id}`,
      orderNumber: order.number,
      line,
      rating: sample.rating,
      ...(sample.title && { title: sample.title }),
      body: sample.body,
      ...(sample.fit !== undefined && { fit: sample.fit }),
      writtenAt: demoDaysAgo(sample.daysAgo),
      ...(!sample.pending && { points: REWARDS.reviewPoints }),
    }
  })
}
