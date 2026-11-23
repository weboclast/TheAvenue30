import type { Product } from '../types'

/*
 * The rule a merchandising program picks its products by.
 *
 * Every program here decides coverage the same way, from data every backend
 * already has: which categories a product sits in, and what it costs. Keeping
 * that in 1 place is what lets a store add a program by writing config rather
 * than by writing a filter.
 */

/** Which products a program covers. */
export interface ProgramEligibility {
  /**
   * Categories the program covers, by `Category.id`. List the leaves you mean
   * rather than the branch above them: a category left out is not covered,
   * which is how cases, cables, mounts, and games stay out.
   */
  eligibleCategoryIds: string[]
  /**
   * Cheapest product the program covers, in major units of the catalog's
   * currency. Omit to cover an eligible category at any price.
   */
  minProductPrice?: number
}

/** Whether `product` falls inside `rule`. */
export function isEligible(product: Product, rule: ProgramEligibility): boolean {
  if (rule.minProductPrice !== undefined && product.price.amount < rule.minProductPrice) return false
  return product.categoryIds.some((id) => rule.eligibleCategoryIds.includes(id))
}
