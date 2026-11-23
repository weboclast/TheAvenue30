import type { Product } from '../types'

/*
 * Related products: the alternatives a product's page offers below it.
 *
 * This is the one program with nothing to register per storefront. Every store
 * wants the row, and the rule reads only what a catalog already holds, so there
 * is no eligibility list here and nothing wired into `StorePrograms`. The
 * facade calls {@link rankRelated} the way it calls `countSharedSpecs`.
 *
 * The rule is a fallback, not the mechanism. A product carrying `relatedSlugs`
 * never reaches this file: curation wins outright, and this ranks the rest so a
 * catalog of thousands needs no authoring to fill the shelf.
 *
 * Substitutes, not companions. The shelf answers "if not this one, then what?",
 * so it ranks things that stand in for the product rather than things bought
 * alongside it. Accessories are a different row with a different question.
 */

/**
 * How alike 2 products have to be is a judgment, and these 3 weights are where
 * it lives. They are only ever compared against each other, so what matters is
 * their ratio: a shared tag is worth about a quarter of the price range, and
 * sharing a brand is worth less than either.
 */
const WEIGHTS = {
  /** Per tag both products carry. Tags are the merchandiser's own hand, so they lead. */
  sharedTag: 3,
  /** Once, for the same brand. Small, because a shelf of one brand stops reading as a choice. */
  sameBrand: 2,
  /** Scaled by how close the 2 prices are, from 0 apart to identical. */
  priceProximity: 4,
} as const

/**
 * How thin a shelf may get before the facade widens its search to the parent
 * category. The carousel shows 4 cards on a wide screen, so anything under that
 * arrives as a half-empty row.
 */
export const MIN_RELATED = 4

/**
 * `candidates` ordered by how well each stands in for `product`, closest first,
 * with `product` itself removed.
 *
 * Scores are meaningless on their own and are never shown; they exist to put the
 * list in an order. Ties keep the catalog's own order, which is a merchandised
 * one, so equally-alike products still come out newest first.
 */
export function rankRelated(product: Product, candidates: Product[]): Product[] {
  return candidates
    .filter((candidate) => candidate.slug !== product.slug)
    .map((candidate, index) => ({ candidate, index, score: scoreRelated(product, candidate) }))
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .map((entry) => entry.candidate)
}

/** How closely `candidate` stands in for `product`. Higher is more alike. */
function scoreRelated(product: Product, candidate: Product): number {
  const tags = new Set(candidate.tags)
  const sharedTags = product.tags.filter((tag) => tags.has(tag)).length
  const sameBrand = product.brand !== undefined && product.brand === candidate.brand

  return (
    WEIGHTS.sharedTag * sharedTags +
    (sameBrand ? WEIGHTS.sameBrand : 0) +
    WEIGHTS.priceProximity * priceProximity(product, candidate)
  )
}

/**
 * How close 2 prices are, from `0` for a product many times the price to `1` for
 * an identical one. Relative rather than absolute, so the same gap counts for
 * more between 2 cables than between 2 laptops.
 */
function priceProximity(product: Product, candidate: Product): number {
  const highest = Math.max(product.price.amount, candidate.price.amount)
  if (highest <= 0) return 1

  return 1 - Math.abs(product.price.amount - candidate.price.amount) / highest
}
