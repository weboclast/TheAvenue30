import Link from 'next/link'
import { Tabs, TabsList, TabsTrigger } from '@appica/ui-react/tabs'
import { accountPath } from '@/components/account/account-paths'
import { toHref } from '@/lib/catalog-filters'
import type { DemoSlug } from '@/lib/demos'
import { OFFER_STATUSES, type OfferStatus, withOfferStatus } from '@/lib/rewards/offers'

interface OfferStatusTabsProps {
  /** The storefront whose rewards page the tabs land on. */
  demo: DemoSlug
  status: OfferStatus
  params: URLSearchParams
}

/**
 * Which offers to show: available, spent, or lapsed.
 *
 * Each tab is a link, so the section stays a Server Component that fetches 1
 * tab, a chosen tab survives a reload, and a shopper can send someone the offer
 * they are looking at. `Tabs` still owns the strip, which is what slides the
 * indicator between them; the URL is the state and nothing here holds any.
 *
 * `nativeButton={false}` is required by that: a tab is a `<button>` unless it is
 * told otherwise, and Base UI refuses to drop native button semantics silently.
 */
export function OfferStatusTabs({ demo, status, params }: OfferStatusTabsProps) {
  return (
    <Tabs value={status}>
      <TabsList aria-label="Offer status">
        {OFFER_STATUSES.map((tab) => (
          <TabsTrigger
            key={tab.value}
            value={tab.value}
            nativeButton={false}
            // `scroll={false}`: the tabs sit halfway down a long page, and
            // jumping to the top on every switch loses the row being read.
            render={
              <Link href={toHref(accountPath(demo, 'rewards'), withOfferStatus(params, tab.value))} scroll={false} />
            }
          >
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  )
}
