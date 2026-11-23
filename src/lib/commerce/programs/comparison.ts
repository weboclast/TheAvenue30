import type { Product, ProductSpec } from '../types'
import { type ProgramEligibility, isEligible } from './eligibility'

/*
 * Smart comparison: the assistant's offer to weigh this product against one the
 * shopper already owns.
 *
 * It only reads as an offer on something a shopper owns a previous version of,
 * so the store names those categories once here rather than flagging every
 * product. A store that runs no assistant registers no program, and the row
 * disappears with it.
 *
 * Categories are only half the rule. A comparison is a table of measured specs,
 * so a product also has to carry a `specSheet` deep enough to fill one, and the
 * devices it is offered against are its own shelf-mates that answer the same
 * specs. That is deliberate: a merchandiser adds a product to the comparison
 * set by giving it a spec sheet, never by editing a screen.
 */

/** The rule a storefront offers smart comparison by. Registered per storefront in `./index.ts`. */
export type ComparisonProgram = ProgramEligibility

/**
 * How many specs 2 devices have to answer in common before comparing them says
 * anything. A table of 1 or 2 rows reads as a coincidence rather than a verdict,
 * and the same floor decides both whether a product offers the flow at all and
 * which devices it can be pointed at.
 */
export const MIN_SHARED_SPECS = 3

/** Whether a comparison may weigh this spec, which identifier rows opt out of. */
export function isComparable(spec: ProductSpec): boolean {
  return spec.comparable !== false
}

/** How many comparable spec ids `product` and `other` both carry. */
export function countSharedSpecs(product: Product, other: Product): number {
  if (!product.specSheet || !other.specSheet) return 0

  const ids = new Set(other.specSheet.filter(isComparable).map((spec) => spec.id))
  return product.specSheet.filter((spec) => isComparable(spec) && ids.has(spec.id)).length
}

/**
 * Whether `product`'s page offers smart comparison, or `undefined` where the
 * store runs no program. A flag the adapter already set wins either way.
 */
export function resolveSmartComparison(product: Product, program: ComparisonProgram | undefined): boolean | undefined {
  if (product.smartComparison !== undefined) return product.smartComparison
  if (!program) return undefined

  return isEligible(product, program) && (product.specSheet?.filter(isComparable).length ?? 0) >= MIN_SHARED_SPECS
}
