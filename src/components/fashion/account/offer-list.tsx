import { OfferStatusTabs } from '@/components/account/offer-status-tabs'
import { listOffers } from '@/lib/rewards'
import { type OfferStatus, offerExpiresInDays, parseOfferStatus, storeToday } from '@/lib/rewards/offers'
import { OfferCard } from './offer-card'

/** What each tab says when it holds nothing. */
const EMPTY_COPY: Record<OfferStatus, string> = {
  available: 'No offers right now. New ones land here the day they start.',
  used: 'Nothing spent yet. An offer moves here once you check out with it.',
  expired: 'Nothing has lapsed. You are using them while they last.',
}

/**
 * The offers this account holds, one status at a time. The tab is a query
 * parameter, so this fetches only the tab being read.
 */
export async function OfferList({ params }: { params: URLSearchParams }) {
  const status = parseOfferStatus(params)
  const offers = await listOffers('fashion', status)
  const today = storeToday()

  return (
    // The Overview's "offers to use" lands here.
    <section id="offers" aria-labelledby="offers-heading" className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 id="offers-heading" className="text-foreground-intense text-2xl font-medium">
          Offers for you
        </h2>
        <OfferStatusTabs demo="fashion" status={status} params={params} />
      </div>

      {offers.length === 0 ? (
        <p className="border-border-strong rounded-sm border border-dashed px-6 py-12 text-center">
          {EMPTY_COPY[status]}
        </p>
      ) : (
        <ul className="grid gap-3 xl:grid-cols-2">
          {offers.map((offer) => (
            <li key={offer.id}>
              <OfferCard offer={offer} status={status} expiresInDays={offerExpiresInDays(offer, today)} />
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
