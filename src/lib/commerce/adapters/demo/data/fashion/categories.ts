import type { Category } from '@/lib/commerce/types'

/*
 * Fashion taxonomy: 2 departments, each holding the garment types it sells, one
 * level deep, 6 under each. Authored as a flat list with
 * `parentId` links; the adapter assembles the tree.
 *
 * Every top-level entry is a department, offered in the order listed; the first
 * is the default. Adding one, say Kids, is all the header, drawer, footer, and
 * `/<slug>` need. Its slug must not match a storefront route like `about`.
 *
 * Slugs carry the department (`womens-sweaters`, not `sweaters`) because a slug
 * is a URL segment and `catalog/[category]` is a single one. Both departments
 * sell sweaters, and 2 categories cannot answer to the same address.
 *
 * Going a level deeper (Sweaters → Cardigans) is a change to this file alone:
 * `parentId` nests as far as a store needs, and the adapter's tree walk,
 * `categoryIdWithDescendants`, and `categoryTrail` are all written against
 * depth rather than against 2 levels. The 1 place that stops at 2 is the
 * mega-menu in `./menu.ts`, which needs a decision about how to show a 3rd.
 *
 * No images: category cards reuse a representative product's image, picked in
 * `./category-covers.ts`, so the taxonomy stays pure structure.
 */

const cat = (slug: string, name: string, parentId: string | null): Category => ({
  id: `cat-${slug}`,
  slug,
  name,
  parentId,
})

/** The flat taxonomy. The adapter assembles the tree from the `parentId` links. */
export const fashionCategories: Category[] = [
  // 1. Women
  cat('women', 'Women', null),
  cat('womens-dresses', 'Dresses', 'cat-women'),
  cat('womens-tops', 'Tops & Tees', 'cat-women'),
  cat('womens-sweaters', 'Sweaters', 'cat-women'),
  cat('womens-trousers', 'Trousers & Skirts', 'cat-women'),
  cat('womens-shoes', 'Shoes', 'cat-women'),
  cat('womens-accessories', 'Accessories', 'cat-women'),

  // 2. Men
  cat('men', 'Men', null),
  cat('mens-tops', 'T-Shirts & Polos', 'cat-men'),
  cat('mens-shirts', 'Shirts', 'cat-men'),
  cat('mens-sweaters', 'Sweaters', 'cat-men'),
  cat('mens-jackets', 'Jackets & Suits', 'cat-men'),
  cat('mens-trousers', 'Trousers & Shorts', 'cat-men'),
  cat('mens-shoes', 'Shoes', 'cat-men'),
]

/** Department slugs, in order: every top-level category above. */
export const fashionDepartments = fashionCategories.flatMap((category) =>
  category.parentId === null ? [category.slug] : [],
)
