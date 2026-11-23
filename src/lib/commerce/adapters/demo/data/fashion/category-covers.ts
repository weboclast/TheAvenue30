import type { Category, ProductImage } from '@/lib/commerce/types'
import { fashionProducts } from './products'

/** One shot of a product, by its color and its number in that color's folder. */
interface CoverShot {
  product: string
  color: string
  shot: number
}

/**
 * The shot that represents each category: the piece alone, never on a model,
 * which reads as a person at tile size. Pick a color that holds on light and
 * dark grounds. A category left out carries no artwork.
 */
const covers: Record<string, CoverShot> = {
  'cat-women': { product: 'oversized-cable-knit-sweater', color: 'Navy', shot: 6 },
  'cat-womens-dresses': { product: 'tiered-maxi-dress', color: 'Terracotta', shot: 3 },
  'cat-womens-tops': { product: 'breton-stripe-top', color: 'Navy Stripe', shot: 3 },
  'cat-womens-sweaters': { product: 'oversized-cable-knit-sweater', color: 'Powder Blue', shot: 6 },
  'cat-womens-trousers': { product: 'tie-waist-linen-trousers', color: 'Olive', shot: 3 },
  'cat-womens-shoes': { product: 'woven-leather-sandals', color: 'Tan', shot: 1 },
  'cat-womens-accessories': { product: 'canvas-tote-bag', color: 'Moss', shot: 1 },
  'cat-men': { product: 'striped-knit-polo', color: 'Burgundy Stripe', shot: 3 },
  'cat-mens-tops': { product: 'striped-knit-polo', color: 'Burgundy Stripe', shot: 3 },
  'cat-mens-shirts': { product: 'oxford-button-down-shirt', color: 'Light Blue', shot: 3 },
  'cat-mens-sweaters': { product: 'merino-crew-neck-sweater', color: 'Camel', shot: 2 },
  'cat-mens-jackets': { product: 'cotton-field-jacket', color: 'Olive', shot: 4 },
  'cat-mens-trousers': { product: 'cotton-chino-shorts', color: 'Sage', shot: 3 },
  'cat-mens-shoes': { product: 'leather-derby-shoes', color: 'Cognac', shot: 1 },
}

/** A category's cover, captioned as the category rather than the product. */
export function fashionCategoryCover(category: Category): ProductImage | undefined {
  const cover = covers[category.id]
  if (!cover) return undefined

  const media = fashionProducts
    .find((product) => product.slug === cover.product)
    ?.colors?.find((color) => color.name === cover.color)?.media
  const image = media && [media.image, media.hoverImage, ...media.gallery][cover.shot - 1]
  return image && { ...image, alt: category.name }
}
