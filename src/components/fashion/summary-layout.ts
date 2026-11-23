/*
 * The grid the bag, the checkout, and the order confirmation share: the page's
 * content, and a sticky summary beside it from `lg`. 1 place, so the summary
 * holds the same column on all 3 screens.
 *
 * The gutter is the grid's gap plus the content's end margin, which reaches the
 * product page's gutters (40, 48, 64px) without narrowing the summary.
 */

/** The grid and its gap. */
export const SUMMARY_GRID = 'grid items-start gap-10 lg:grid-cols-12 lg:gap-8'

/** The content beside the summary. */
export const SUMMARY_MAIN = 'min-w-0 lg:col-span-7 lg:me-2 xl:col-span-8 xl:me-4 2xl:me-8'

/** The summary's column. Its sticky `top` is the caller's: the bag pins a header above it, the checkout does not. */
export const SUMMARY_ASIDE = 'min-w-0 lg:sticky lg:col-span-5 xl:col-span-4'
