import type { Product, ProductProtectionPlan } from '../types'
import { type ProgramEligibility, isEligible } from './eligibility'

/*
 * The store's extended-warranty program: which products are offered a plan, and
 * what those plans cost.
 *
 * Plans are a rule, not a field on a product. Commerce backends have no native
 * protection-plan field: warranties are sold as separate products, through an
 * add-on, or by a third-party warranty provider. A template that needed one
 * authored per product would show an empty section the moment a buyer connected a real
 * catalog. This program prices every eligible product from data every backend
 * already has, its price and its categories, so the section survives the swap.
 *
 * An adapter that does know better still wins: see {@link resolveProtectionPlans}.
 */

/** One term offered by a {@link ProtectionProgram}, priced as a share of the product. */
export interface ProtectionTier {
  /** Becomes the plan's `id`. Keep it stable: the cart references the chosen plan by it. */
  id: string
  /** Shown beside the radio, e.g. `'2-year plan'`. */
  label: string
  /** How long it covers, in years from delivery. Keep in step with {@link label}. */
  years: number
  /** Share of the product's price this term costs. `0.12` is 12%. */
  rate: number
}

/**
 * The rule a storefront prices its warranties by. Registered per storefront in
 * `./index.ts`, and edited there rather than in any component.
 */
export interface ProtectionProgram extends ProgramEligibility {
  /**
   * Cheapest product that gets an offer at all. Required here: nobody sells a
   * warranty on a $19 cable.
   */
  minProductPrice: number
  /** Floor for a single plan's price, once {@link ProtectionTier.rate} is applied. */
  minPlanPrice: number
  /** Terms in the order they are presented. */
  tiers: ProtectionTier[]
}

/** Round a derived price up to the next `.99`, and never below the program's floor. */
function planPrice(amount: number, minimum: number): number {
  return Math.max(minimum, Math.ceil(amount) - 0.01)
}

/**
 * The plans to offer on `product`'s page, or `undefined` where the store sells
 * none for it.
 *
 * Plans the adapter already resolved win outright, so a backend holding real
 * warranty data (a custom product field, a quote from a warranty provider) is
 * never second-guessed. The program only fills the gap, which is what lets an adapter
 * ship this section without implementing anything.
 */
export function resolveProtectionPlans(
  product: Product,
  program: ProtectionProgram | undefined,
): ProductProtectionPlan[] | undefined {
  if (product.protectionPlans) return product.protectionPlans
  if (!program || !isEligible(product, program)) return undefined

  return program.tiers.map((tier) => ({
    id: tier.id,
    label: tier.label,
    years: tier.years,
    price: { ...product.price, amount: planPrice(product.price.amount * tier.rate, program.minPlanPrice) },
  }))
}
