import type { ReviewFit } from './types'

/**
 * Every point on the fit scale, small to large, the order a scale and a form
 * present them in.
 */
export const FIT_POINTS: ReviewFit[] = [-2, -1, 0, 1, 2]

/** How far the mean fit can sit from `0` and still read as true to size. */
const TRUE_TO_SIZE_BAND = 0.5

/**
 * Which way a product's fit leans, from the mean of its answers: `-1` runs
 * small, `0` true to size, `1` runs large. The review summary words its sizing
 * advice on the same cut, so the 2 never disagree. Client-safe.
 */
export function fitLean(average: number): -1 | 0 | 1 {
  if (average <= -TRUE_TO_SIZE_BAND) return -1
  if (average >= TRUE_TO_SIZE_BAND) return 1
  return 0
}
