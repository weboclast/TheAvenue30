import type { WishlistItem } from '@/lib/commerce/types'
import type { DemoSlug } from '@/lib/demos'

/*
 * The 1 file in this module that is safe on the client: what a wishlist screen
 * needs to draw its own controls and remember where it was, with no adapter
 * behind it.
 *
 * The limits are the same ones the action validates against, and they mirror
 * what the demo adapter enforces. Keep the 2 in step: a field that lets a
 * shopper type past what the store accepts is a refusal they could have been
 * spared.
 */

/**
 * Where the list a shopper last opened is remembered, 1 per demo like the token
 * beside it. A preference rather than a capability, so the browser writes it and
 * the wishlist page reads it to open where the shopper left off.
 */
export function viewedWishlistCookie(demo: DemoSlug): string {
  return `appica_wishlist_view_${demo}`
}

/** How long that is remembered, in seconds. */
export const VIEWED_WISHLIST_MAX_AGE = 60 * 60 * 24 * 180

/** Where a list's name stops. */
export const MAX_WISHLIST_NAME = 40

/** Where its description stops. */
export const MAX_WISHLIST_DESCRIPTION = 200

/** How a wishlist can be ordered, in the order the control offers them. */
export const WISHLIST_SORTS = [
  { value: 'date-added', label: 'By date added' },
  { value: 'price-asc', label: 'By price ascending' },
  { value: 'price-desc', label: 'By price descending' },
  { value: 'rating', label: 'By rating' },
] as const

/** The ordering a wishlist is being shown in. */
export type WishlistSort = (typeof WISHLIST_SORTS)[number]['value']

/**
 * A list's items in the order asked for, newest first by default because that
 * is the order the commerce layer keeps them in.
 *
 * Sorted here rather than by the adapter, unlike a catalog listing: a wishlist
 * arrives whole and is small enough to reorder in the browser, so changing the
 * order costs no round-trip. A backend that pages long lists would move this
 * into a query.
 */
export function sortWishlistItems(items: WishlistItem[], sort: WishlistSort): WishlistItem[] {
  if (sort === 'date-added') return items

  return [...items].sort((a, b) => {
    switch (sort) {
      case 'price-asc':
        return a.product.price.amount - b.product.price.amount
      case 'price-desc':
        return b.product.price.amount - a.product.price.amount
      case 'rating':
        return (b.product.rating?.value ?? 0) - (a.product.rating?.value ?? 0)
    }
  })
}
