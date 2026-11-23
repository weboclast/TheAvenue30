import 'server-only'

import { cache } from 'react'
import { commerceAdapter } from '@/lib/commerce'
import type { Wishlist } from '@/lib/commerce/types'
import type { DemoSlug } from '@/lib/demos'
import { readWishlistToken } from './token'

export { readViewedWishlistId } from './token'

/*
 * The wishlist facade: what a Server Component calls to find out what a visitor
 * has saved.
 *
 *     import { getWishlists } from '@/lib/wishlist'
 *     const wishlists = await getWishlists('electronics')
 *
 * They are the commerce adapter's lists, read with the token from this visitor's
 * cookie, exactly as the cart is. Reading it makes the calling route dynamic.
 *
 * Mutations live in `./actions.ts`, because a cookie can only be written from a
 * Server Action. Client Components use `useWishlist` (see
 * `./wishlist-context.tsx`), which is what the heart on a product card calls.
 */

/**
 * Every list this visitor holds, in the order to present them, each with its
 * products resolved against the catalog. Empty for a visitor who has saved
 * nothing. Memoized per request.
 *
 * The first list is the one a heart saves into, so a screen offering "save to a
 * list" reads that order rather than inventing its own.
 */
export const getWishlists = cache(async (demo: DemoSlug): Promise<Wishlist[]> => {
  const token = await readWishlistToken(demo)
  const { wishlists } = await commerceAdapter.getWishlists(demo, token)
  return wishlists
})
