import type { Metadata } from 'next'
import { accountPath } from '@/components/account/account-paths'
import { AccountFigures } from '@/components/fashion/account/account-figures'
import { ClubBand } from '@/components/fashion/account/club-band'
import { LatestOrders } from '@/components/fashion/account/latest-orders'
import { WishlistPreview } from '@/components/fashion/account/wishlist-preview'
import { Eyebrow } from '@/components/fashion/eyebrow'
import { getSession } from '@/lib/auth'
import { listAllAccountOrders } from '@/lib/orders'
import { listReviewable } from '@/lib/reviews'
import { getRewardsBalance, listOffers } from '@/lib/rewards'
import { getWishlists } from '@/lib/wishlist'

export const metadata: Metadata = {
  title: 'Your account',
}

/**
 * Where the account opens: the orders still on their way, what the shopper holds
 * in points and offers, and what they saved.
 */
export default async function FashionAccountPage() {
  const [customer, orders, balance, offers, { purchases }, wishlists] = await Promise.all([
    getSession(),
    listAllAccountOrders('fashion'),
    getRewardsBalance('fashion'),
    listOffers('fashion', 'available'),
    listReviewable('fashion', { pageSize: Number.MAX_SAFE_INTEGER }),
    getWishlists('fashion'),
  ])
  // The account layout gates this area, so only a signed-in shopper gets here.
  if (!customer) return null

  const saved = new Set(wishlists.flatMap((list) => list.items.map((item) => item.product.slug))).size
  const rewardsHref = accountPath('fashion', 'rewards')

  return (
    <>
      <header className="flex flex-col gap-2">
        <Eyebrow>Your account</Eyebrow>
        <h1 className="text-foreground-intense text-4xl font-medium md:text-5xl">Hello, {customer.firstName}</h1>
        <p className="truncate">
          Signed in as <span className="text-foreground-intense font-medium">{customer.email}</span>
        </p>
      </header>

      <AccountFigures
        figures={[
          { value: balance.available, label: 'points to spend', href: rewardsHref },
          {
            value: offers.length,
            label: offers.length === 1 ? 'offer to use' : 'offers to use',
            href: `${rewardsHref}#offers`,
          },
          {
            value: saved,
            label: saved === 1 ? 'piece saved' : 'pieces saved',
            href: accountPath('fashion', 'wishlist'),
          },
          { value: purchases.length, label: 'waiting on a review', href: accountPath('fashion', 'reviews') },
        ]}
        className="mb-4"
      />

      <LatestOrders orders={orders} />

      <WishlistPreview className="mb-6" />

      <ClubBand />
    </>
  )
}
