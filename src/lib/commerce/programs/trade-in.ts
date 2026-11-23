import type {
  Money,
  Product,
  ProductTradeIn,
  TradeInBrand,
  TradeInCondition,
  TradeInModel,
  TradeInSelection,
} from '../types'
import { type ProgramEligibility, isEligible } from './eligibility'

/*
 * The store's trade-in program: which products are offered credit for an old
 * device, what that credit is worth at best, and the devices the store takes in.
 *
 * Nothing models this natively. Commerce platforms leave trade-in to an add-on
 * or a third-party quote service, so a template that needed it authored per
 * product would show an empty row the moment a buyer
 * connected a real catalog. An adapter that does hold a real quote still wins:
 * see {@link resolveTradeIn}.
 */

/** The rule a storefront offers trade-in by. Registered per storefront in `./index.ts`. */
export interface TradeInProgram extends ProgramEligibility {
  /**
   * The headline the product page leads with, 0-1: `0.7` reads as "Save up to
   * 70%". It advertises the program and does not cap a quote, which is worth
   * what the handed-in device is worth.
   */
  maxSavingsRate: number
  /** Devices the store takes in, grouped by brand and offered in this order. */
  brands: TradeInBrand[]
  /** Conditions a device is quoted in, best first. */
  conditions: TradeInCondition[]
}

/**
 * The trade-in offer for `product`'s page, or `undefined` where the store makes
 * none. An offer the adapter already resolved is never second-guessed.
 */
export function resolveTradeIn(product: Product, program: TradeInProgram | undefined): ProductTradeIn | undefined {
  if (product.tradeIn) return product.tradeIn
  if (!program || !isEligible(product, program)) return undefined

  const { maxSavingsRate, brands, conditions } = program
  return { maxSavingsRate, brands, conditions }
}

/** A priced trade-in: the device that was picked, and what the store pays for it. */
export interface TradeInQuote {
  model: TradeInModel
  condition: TradeInCondition
  credit: Money
}

/**
 * Prices `selection` against `offer`, or `undefined` when it does not name a
 * device the offer carries.
 *
 * The one place a trade-in turns into money. The product page quotes with it to
 * show a figure before anything is bought, and the adapter quotes with it again
 * when the line reaches the cart, so a request naming its own credit buys
 * nothing.
 */
export function quoteTradeIn(offer: ProductTradeIn, selection: TradeInSelection): TradeInQuote | undefined {
  const brand = offer.brands.find((candidate) => candidate.id === selection.brandId)
  const device = brand?.devices.find((candidate) => candidate.id === selection.deviceId)
  const model = device?.models.find((candidate) => candidate.id === selection.modelId)
  const condition = offer.conditions.find((candidate) => candidate.id === selection.conditionId)
  if (!model || !condition) return undefined

  return {
    model,
    condition,
    credit: { amount: Math.round(model.value.amount * condition.rate), currencyCode: model.value.currencyCode },
  }
}
