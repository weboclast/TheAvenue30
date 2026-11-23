'use client'

import { Heart } from '@appica/icons-react'
import { buttonVariants } from '@appica/ui-react/button'
import { cn } from '@/lib/utils'
import { useWishlist } from '@/lib/wishlist/wishlist-context'

/**
 * The header's link to the wishlist, counting what is saved once there is
 * anything. A plain anchor, since demo scaffolding signs the shopper in and only
 * a document load shows it; pointed at a real account route, it becomes a `Link`.
 */
export function WishlistLink({ href, className }: { href: string; className?: string }) {
  const { savedCount } = useWishlist()

  return (
    <a
      href={href}
      aria-label={
        savedCount ? `Wishlist, ${savedCount} ${savedCount === 1 ? 'product' : 'products'}` : 'Wishlist, empty'
      }
      data-slot="button"
      className={cn(buttonVariants({ variant: 'ghost', size: savedCount ? 'sm' : 'icon-sm' }), className)}
    >
      {/* No `data-icon`: the strip sets its own padding. */}
      <Heart />
      {savedCount > 0 && savedCount}
    </a>
  )
}
