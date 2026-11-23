import type { Metadata } from 'next'
import Link from 'next/link'
import { buttonVariants } from '@appica/ui-react/button'
import { accountPath } from '@/components/account/account-paths'
import { RewardsHistoryDrawer } from '@/components/account/rewards-history-drawer'
import { AppicaClubBand } from '@/components/fashion/account/appica-club-band'
import { OfferList } from '@/components/fashion/account/offer-list'
import { ReferralInvite } from '@/components/fashion/account/referral-invite'
import { ReviewableList } from '@/components/fashion/account/reviewable-list'
import { RewardsBalance } from '@/components/fashion/account/rewards-balance'
import { TEXT_ACTION } from '@/components/fashion/text-action'
import { toSearchParams } from '@/lib/catalog-filters'
import { listReviewable } from '@/lib/reviews'
import { getReferral, getRewardsBalance } from '@/lib/rewards'
import { cn } from '@/lib/utils'

export const metadata: Metadata = {
  title: 'Promos & rewards',
}

/** How many pieces the review section offers at once. Longer stops being a nudge and becomes a chore. */
const REVIEW_PROMPTS = 3

/**
 * Where the shopper stands in the loyalty program: what they hold, the
 * membership that doubles it, the offers addressed to them, and the 2 ways to
 * earn more. Points are spent at the checkout, so nothing here converts them;
 * `lib/rewards/AGENTS.md` traces that path.
 */
export default async function FashionAccountRewardsPage({ searchParams }: PageProps<'/account/rewards'>) {
  const params = toSearchParams(await searchParams)

  const [balance, referral, reviewable] = await Promise.all([
    getRewardsBalance('fashion'),
    getReferral(),
    listReviewable('fashion', { pageSize: REVIEW_PROMPTS }),
  ])

  return (
    <>
      <header className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-foreground-intense text-3xl font-medium md:text-4xl">Promos &amp; rewards</h1>
        <RewardsHistoryDrawer entries={balance.entries} pointsAs="text" />
      </header>

      <RewardsBalance balance={balance} />

      <AppicaClubBand />

      <OfferList params={params} />

      {referral ? <ReferralInvite referral={referral} /> : null}

      {reviewable.purchases.length > 0 ? (
        <section aria-labelledby="review-and-earn" className="flex flex-col gap-2">
          <div className="flex items-baseline justify-between gap-4">
            <h2 id="review-and-earn" className="text-foreground-intense text-2xl font-medium">
              Review and earn points
            </h2>
            <Link
              href={accountPath('fashion', 'reviews')}
              data-slot="button"
              className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }), TEXT_ACTION)}
            >
              All reviews
            </Link>
          </div>
          <ReviewableList purchases={reviewable.purchases} />
        </section>
      ) : null}
    </>
  )
}
