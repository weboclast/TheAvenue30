import type { Category, Product } from '../types'

/*
 * Companions: the pieces a product's page offers as going with it, where
 * `related.ts` offers what could stand in for it. A companion shares a
 * collection with the product, a room or a look, and comes from another branch
 * of the catalog: one from its own branch is an alternative, not a partner.
 */

/**
 * `candidates` without the product's own top-level category, dealt 1 category
 * at a time, so a shelf of them reads as a room rather than a row of lamps.
 * Each category keeps the order it arrived in.
 */
export function rankCompanions(product: Product, candidates: Product[], tree: Category[]): Product[] {
  const branchOf = (item: Product) => tree.find((category) => item.categoryIds.includes(category.id))?.id
  const own = branchOf(product)

  const branches = new Map<string | undefined, Product[]>()
  for (const candidate of candidates) {
    const branch = branchOf(candidate)
    if (candidate.slug === product.slug || branch === own) continue
    branches.set(branch, [...(branches.get(branch) ?? []), candidate])
  }

  const queues = [...branches.values()]
  const longest = Math.max(0, ...queues.map((queue) => queue.length))
  return Array.from({ length: longest }, (_, round) => queues.flatMap((queue) => queue[round] ?? [])).flat()
}
