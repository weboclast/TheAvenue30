'use client'

import { useState } from 'react'
import { Carousel, CarouselContent, CarouselPagination, CarouselSlide } from '@appica/ui-react/carousel'
import { useMediaQuery } from '@appica/ui-react/hooks/use-media-query'
import { CampaignCell } from '@/components/fashion/catalog/campaign-cell'
import type { CampaignBanner } from '@/lib/commerce/types'
import { ACCOUNT_AS_COLUMN } from './account-nav'

/** How long each campaign holds. */
const AUTOPLAY_DELAY_MS = 5500

/** The sidebar's width at `lg` and up, which is the only width this shows at. */
const CELL_SIZES = '320px'

const CELL = 'aspect-4/5 w-full'

/**
 * The catalog's in-grid campaigns under the account's navigation, one at a time,
 * only the one on screen playing its clip. Nothing mounts below `lg`, where the
 * sidebar is hidden and an autoplaying carousel would tick for nobody.
 */
export function AccountCampaigns({ campaigns }: { campaigns: CampaignBanner[] }) {
  const asColumn = useMediaQuery(ACCOUNT_AS_COLUMN, { defaultValue: true })
  const [showing, setShowing] = useState(0)

  if (campaigns.length === 0 || !asColumn) return null

  if (campaigns.length === 1) {
    return <CampaignCell campaign={campaigns[0]} sizes={CELL_SIZES} active className={CELL} />
  }

  return (
    <Carousel
      loop
      fade
      autoplay={{ delay: AUTOPLAY_DELAY_MS, resumeAfter: AUTOPLAY_DELAY_MS }}
      onSelect={(api) => setShowing(api.selectedSnap())}
      aria-label="Campaigns"
      className="flex flex-col gap-4"
    >
      <CarouselContent>
        {campaigns.map((campaign, index) => (
          <CarouselSlide key={campaign.id}>
            <CampaignCell campaign={campaign} sizes={CELL_SIZES} active={index === showing} className={CELL} />
          </CarouselSlide>
        ))}
      </CarouselContent>

      <CarouselPagination className="justify-center" />
    </Carousel>
  )
}
