import type { DemoSlug } from '@/lib/demos'
import type { Product } from '../types'
import { type ComparisonProgram, resolveSmartComparison } from './comparison'
import { fashionPrograms } from './fashion'
import { type ProtectionProgram, resolveProtectionPlans } from './protection'
import { type TradeInProgram, resolveTradeIn } from './trade-in'

/*
 * Merchandising programs: the features a store offers by rule rather than by
 * authoring them onto every product.
 *
 * They sit above the adapter on purpose. The commerce facade applies them to
 * whatever `getProduct` returned, so any adapter inherits protection plans,
 * trade-in, and smart comparison without implementing anything, and cannot
 * forget to. An adapter that holds the real data returns it and the program
 * stays out of the way.
 *
 * Programs are deliberately not applied to catalog listings: nothing on a
 * product card reads a program's output, and resolving it for every product in
 * a page of results is work no screen would use.
 */

/** The programs one storefront runs. Every one is optional: a store can offer none. */
export interface StorePrograms {
  /** Extended warranties offered beside the buy button. */
  protection?: ProtectionProgram
  /** Credit for an old device, offered as a row on the product page. */
  tradeIn?: TradeInProgram
  /** The assistant's spec comparison, offered as a row on the product page. */
  comparison?: ComparisonProgram
  /** Starter prompts for the shopping assistant widget, offered store-wide. */
  assistant?: string[]
}

/**
 * Programs by storefront. A store built from this template keeps 1 entry, named
 * for whichever demo it kept.
 */
const programs: Partial<Record<DemoSlug, StorePrograms>> = {
  fashion: fashionPrograms,
}

/**
 * Returns `product` with its storefront's programs resolved onto it. A demo
 * that runs no programs passes straight through.
 */
export function applyPrograms(demo: DemoSlug, product: Product): Product {
  const store = programs[demo]
  if (!store) return product

  return {
    ...product,
    protectionPlans: resolveProtectionPlans(product, store.protection),
    tradeIn: resolveTradeIn(product, store.tradeIn),
    smartComparison: resolveSmartComparison(product, store.comparison),
  }
}

/** The assistant's prompts for `demo`, empty where the store runs no assistant. */
export function getAssistantPrompts(demo: DemoSlug): string[] {
  return programs[demo]?.assistant ?? []
}
