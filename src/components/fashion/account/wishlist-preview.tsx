'use client'

import Link from 'next/link'
import { buttonVariants } from '@appica/ui-react/button'
import { accountPath } from '@/components/account/account-paths'
import { ProductCard } from '@/components/fashion/product/product-card'
import { TEXT_ACTION } from '@/components/fashion/text-action'
import type { Product } from '@/lib/commerce/types'
import { cn } from '@/lib/utils'
import { useWishlist } from '@/lib/wishlist/wishlist-context'

/** How many saved pieces the Overview shows: a row from `md`, 2 on a phone. */
const PREVIEW = 4

/** 2 columns on phones, 4 once the account's column is wide enough. */
const CARD_SIZES = '(min-width: 768px) 20vw, 50vw'

/**
 * The newest saves, as the catalog's own cards, with the way to the rest. Read
 * from the wishlist store, so it matches the header's heart. Renders nothing
 * while nothing is saved.
 */
export function WishlistPreview({ className }: { className?: string }) {
  const { wishlists, savedCount } = useWishlist()
  // A product saved to 2 lists is still 1 card.
  const saved = new Map<string, Product>(
    wishlists.flatMap((list) => list.items.map((item) => [item.product.slug, item.product] as const)),
  )

  if (saved.size === 0) return null

  return (
    <section aria-labelledby="wishlist-preview" className={cn('flex flex-col gap-5', className)}>
      <div className="flex items-baseline justify-between gap-4">
        <h2 id="wishlist-preview" className="text-foreground-intense text-2xl font-medium">
          Your wishlist
        </h2>
        <Link
          href={accountPath('fashion', 'wishlist')}
          data-slot="button"
          className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }), TEXT_ACTION)}
        >
          View all {savedCount}
        </Link>
      </div>

      <ul className="grid grid-cols-2 gap-x-2 gap-y-8 md:grid-cols-4">
        {[...saved.values()].slice(0, PREVIEW).map((product) => (
          <li key={product.id} className="flex">
            <ProductCard product={product} sizes={CARD_SIZES} className="w-full" />
          </li>
        ))}
      </ul>
    </section>
  )
}
