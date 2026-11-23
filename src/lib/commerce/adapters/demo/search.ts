import type { Category, Product } from '../../types'

/*
 * The demo adapter's search: how a typed fragment is scored against the
 * catalog, and where the suggested terms come from.
 *
 * Substring matching, ranked. No stemming, no typo tolerance, no synonyms: a
 * real store gets those from its backend or search service, and a demo that
 * searched better than the backend replacing it would set the wrong
 * expectation. Ranking is here because an unranked substring match puts a phone
 * case above the phone.
 */

/** Where a match landed, best first. A product scores its strongest field only. */
const FIELD_SCORES = {
  titlePrefix: 6,
  titleWord: 5,
  title: 4,
  brandPrefix: 4,
  brand: 3,
  tagPrefix: 3,
  tag: 2,
  category: 1.5,
  description: 1,
} as const

/**
 * Ranked products matching `term`, best first. Unmatched products are dropped.
 *
 * `categories` is the demo's flat taxonomy, so "tablets" finds what is filed
 * under Tablets even where no product says the word. Every backend the template
 * targets indexes its collections this way, and without it the panel could
 * suggest a department that opens an empty listing.
 */
export function searchProducts(products: Product[], term: string, categories: Category[] = []): Product[] {
  const needle = term.trim().toLowerCase()
  if (!needle) return []

  const matched = new Set(
    categories.filter((category) => category.name.toLowerCase().includes(needle)).map((category) => category.id),
  )

  return products
    .map((product) => ({ product, score: scoreProduct(product, needle, matched) }))
    .filter((entry) => entry.score > 0)
    .sort(
      (a, b) =>
        b.score - a.score ||
        (b.product.unitsSold ?? 0) - (a.product.unitsSold ?? 0) ||
        a.product.title.localeCompare(b.product.title),
    )
    .map((entry) => entry.product)
}

/**
 * Terms to offer beside the results, harvested from the tags, brands, and
 * category names of what is being searched, so every one of them has products
 * behind it. Ranked by how well the fragment lands and then by how much of the
 * catalog the term reaches.
 */
export function suggestTerms(products: Product[], categories: Category[], term: string, limit: number): string[] {
  const needle = term.trim().toLowerCase()
  if (!needle) return []

  // Keyed lowercase so "iPhone" and "iphone" are 1 suggestion, while the value
  // keeps the casing the catalog authored.
  const reach = new Map<string, { label: string; count: number }>()

  const add = (label: string | undefined, weight: number) => {
    if (!label) return
    const key = label.toLowerCase()
    if (!key.includes(needle)) return

    const entry = reach.get(key)
    if (entry) entry.count += weight
    else reach.set(key, { label, count: weight })
  }

  for (const product of products) {
    add(product.brand, 1)
    for (const tag of product.tags) add(tag, 1)
  }

  // Categories rank above a tag of the same reach: a department is a broader
  // answer to a half-typed word than a badge on 3 products.
  for (const category of categories) add(category.name, products.length)

  return [...reach.entries()]
    .sort(
      ([aKey, a], [bKey, b]) =>
        Number(bKey.startsWith(needle)) - Number(aKey.startsWith(needle)) ||
        b.count - a.count ||
        a.label.localeCompare(b.label),
    )
    .slice(0, limit)
    .map(([, entry]) => entry.label)
}

/** How well 1 product answers the fragment, on its strongest field. `0` means no match. */
function scoreProduct(product: Product, needle: string, matchedCategories: Set<string>): number {
  const title = product.title.toLowerCase()
  if (title.startsWith(needle)) return FIELD_SCORES.titlePrefix
  if (title.split(/\s+/).some((word) => word.startsWith(needle))) return FIELD_SCORES.titleWord
  if (title.includes(needle)) return FIELD_SCORES.title

  const brand = product.brand?.toLowerCase()
  if (brand?.startsWith(needle)) return FIELD_SCORES.brandPrefix
  if (brand?.includes(needle)) return FIELD_SCORES.brand

  const tags = product.tags.map((tag) => tag.toLowerCase())
  if (tags.some((tag) => tag.startsWith(needle))) return FIELD_SCORES.tagPrefix
  if (tags.some((tag) => tag.includes(needle))) return FIELD_SCORES.tag

  if (product.categoryIds.some((id) => matchedCategories.has(id))) return FIELD_SCORES.category
  if (product.description.toLowerCase().includes(needle)) return FIELD_SCORES.description

  return 0
}
