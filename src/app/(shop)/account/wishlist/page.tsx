import type { Metadata } from 'next'
import { WishlistBoard } from '@/components/fashion/account/wishlist-board'
import { getDepartment } from '@/lib/departments'
import { readViewedWishlistId } from '@/lib/wishlist'

export const metadata: Metadata = {
  title: 'Wishlist',
}

/**
 * Everything this account has saved, 1 list at a time. The board is live client
 * state rather than a server render to narrow: it reads the same store the
 * header's heart counts, so removing a piece here empties that heart at once.
 */
export default async function FashionAccountWishlistPage() {
  const [viewedId, department] = await Promise.all([readViewedWishlistId('fashion'), getDepartment('fashion')])

  return (
    <>
      <h1 className="text-foreground-intense text-3xl font-medium md:text-4xl">Wishlist</h1>

      <WishlistBoard viewedId={viewedId} shopHref={department ? `/catalog/${department.slug}` : '/catalog'} />
    </>
  )
}
