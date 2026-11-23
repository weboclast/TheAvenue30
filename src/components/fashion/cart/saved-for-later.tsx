'use client'

import { ProductShelf } from '@/components/fashion/product/product-shelf'
import type { Product } from '@/lib/commerce/types'
import { useWishlist } from '@/lib/wishlist/wishlist-context'

/** Every saved product, under the bag. Read from the wishlist store, so a line moved there shows up at once. */
export function SavedForLater() {
  const { wishlists } = useWishlist()
  // A product saved to 2 lists is still 1 card.
  const saved = new Map<string, Product>(
    wishlists.flatMap((list) => list.items.map((item) => [item.product.slug, item.product] as const)),
  )

  if (saved.size === 0) return null

  return (
    <section className="pb-16 md:pb-20 xl:pb-24">
      <ProductShelf title="Your wishlist" products={[...saved.values()]} />
    </section>
  )
}
