import type { CardProduct, CardProductMedia, Product, ProductMedia } from './types'

/**
 * A product trimmed to the fields its card reads. Call it wherever a Server
 * Component hands products to a Client Component card: a whole {@link Product}
 * type-checks there too, and ships the product page's data inside the page.
 */
export function toCardProduct({
  id,
  slug,
  title,
  specs,
  dimensions,
  options,
  price,
  compareAtPrice,
  rewardPoints,
  rating,
  badges,
  availability,
  media,
  colors,
}: Product): CardProduct {
  const lead = cardMedia(media)

  return withoutUndefined<CardProduct>({
    id,
    slug,
    title,
    specs,
    dimensions,
    options,
    price,
    compareAtPrice,
    rewardPoints,
    rating,
    badges,
    availability,
    media: lead,
    // The first color usually shares the product's media object. Sharing the trimmed one keeps it sent once.
    colors: colors?.map(({ name, hex, media: shots }) => ({
      name,
      hex,
      media: shots === media ? lead : cardMedia(shots),
    })),
  })
}

function cardMedia({ image, hoverImage, packshot }: ProductMedia): CardProductMedia {
  return withoutUndefined<CardProductMedia>({ image, hoverImage, packshot })
}

/**
 * Drops the keys holding `undefined`, which the page data would otherwise spell
 * out. Every key is required in, so a field added to `T` can't be left behind.
 */
function withoutUndefined<T extends object>(value: { [Key in keyof Required<T>]: T[Key] }): T {
  return Object.fromEntries(Object.entries(value).filter(([, field]) => field !== undefined)) as T
}
