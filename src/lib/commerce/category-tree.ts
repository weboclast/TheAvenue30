import type { Category, Product } from './types'

/*
 * Reading a category tree: the walks that turn `getCategoryTree`'s nested
 * {@link Category} nodes into the trail a breadcrumb shows and the level a
 * category row offers.
 *
 * Pure functions over data the caller already has, so a screen holding the tree
 * never makes a second read to place itself in it. Nothing here is bound to a
 * depth: the demo taxonomy is 2 levels, and a backend with 4 walks the same way.
 */

/**
 * The path from a top-level category down to `slug`, root first and the named
 * category last. Empty where the slug names nothing in the tree.
 *
 * The last entry carries its own {@link Category.children}, which is the level
 * below the one being viewed.
 */
export function categoryTrail(tree: Category[], slug: string): Category[] {
  for (const category of tree) {
    if (category.slug === slug) return [category]

    const below = category.children ? categoryTrail(category.children, slug) : []
    if (below.length > 0) return [category, ...below]
  }

  return []
}

/** Every slug in a branch, its own first. */
export function branchSlugs(category: Category): string[] {
  return [category.slug, ...(category.children ?? []).flatMap(branchSlugs)]
}

/**
 * The deepest branch `categoryIds` reaches, root first: what a product's
 * breadcrumb walks. Empty for a product whose categories are all missing from
 * the tree.
 *
 * A product lists every category it belongs to, ancestors included and in no
 * particular order, so this descends the tree rather than trusting that order.
 * Where a product sits in 2 branches at once, the first in the taxonomy's own
 * order wins: a breadcrumb has to name 1 home.
 */
export function productCategoryTrail(tree: Category[], categoryIds: string[]): Category[] {
  const trail: Category[] = []

  let level = tree
  while (level.length > 0) {
    const match = level.find((category) => categoryIds.includes(category.id))
    if (!match) break

    trail.push(match)
    level = match.children ?? []
  }

  return trail
}

/**
 * The categories a set of products sits in, each product counted at the
 * deepest level it reaches, in the taxonomy's own order. It is the way into a
 * listing that cuts across the tree, like a room.
 */
export function deepestCategories(tree: Category[], products: Pick<Product, 'categoryIds'>[]): Category[] {
  const reached = new Set(products.map((product) => productCategoryTrail(tree, product.categoryIds).at(-1)?.id))
  const walk = (level: Category[]): Category[] =>
    level.flatMap((category) => [...(reached.has(category.id) ? [category] : []), ...walk(category.children ?? [])])

  return walk(tree)
}
