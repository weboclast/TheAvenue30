import type { CardProduct, CartLineInput, Product, ProductOptionValue } from './types'

/**
 * The {@link ProductOption.id} a clothing storefront files its size scale
 * under. Reserved so a card can find the scale without a screen guessing at
 * labels: an adapter selling apparel maps its own size option onto it.
 */
export const SIZE_OPTION_ID = 'size'

/**
 * The sizes a product comes in, in the order to present them, sold-out ones
 * included. Empty for anything that isn't sized, which is what keeps the scale
 * off an electronics card.
 *
 * Client-safe, like everything outside the facade: it reads a product a Server
 * Component already handed down.
 */
export function productSizes(product: Pick<Product, 'options'>): ProductOptionValue[] {
  return product.options?.find((option) => option.id === SIZE_OPTION_ID)?.values ?? []
}

/**
 * A product as a quick add buys it, with no page to choose on: the color named
 * or its first, and the first value of each option still on sale.
 */
export function defaultCartLine(
  product: Pick<CardProduct, 'slug' | 'colors' | 'options'>,
  color = product.colors?.[0]?.name,
): CartLineInput {
  const options = Object.fromEntries(
    (product.options ?? []).flatMap((option) => {
      const value = option.values.find((candidate) => candidate.available !== false)
      return value ? [[option.id, value.id] as const] : []
    }),
  )

  return {
    productSlug: product.slug,
    ...(color && { color }),
    ...(Object.keys(options).length > 0 && { options }),
  }
}
