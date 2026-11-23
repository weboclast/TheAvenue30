'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { buttonVariants } from '@appica/ui-react/button'
import {
  Carousel,
  type CarouselApi,
  CarouselContent,
  CarouselPagination,
  CarouselSlide,
} from '@appica/ui-react/carousel'
import { CAMPAIGN_CTA } from '@/components/fashion/campaign-cta'
import { CaretSwap } from '@/components/fashion/caret-swap'
import { LoopingVideo } from '@/components/looping-video'
import type { CampaignBanner } from '@/lib/commerce/types'
import { cn } from '@/lib/utils'

const AUTOPLAY_DELAY_MS = 6000

/** Takes its height from the copy; the photographs stack behind it. */
const FRAME = 'bg-background-muted relative isolate overflow-hidden rounded-sm text-white'

const MEDIA = 'absolute inset-0 size-full object-cover'

/**
 * The campaigns across the top of a category listing, from `getCategoryCampaigns`.
 * 1 renders as a still; 2 or more crossfade on a timer.
 */
export function CategoryCampaign({ campaigns }: { campaigns: CampaignBanner[] }) {
  const [campaign] = campaigns
  if (!campaign) return null

  return (
    <section className="px-2">
      {campaigns.length > 1 ? <CampaignCarousel campaigns={campaigns} /> : <CampaignStill campaign={campaign} />}
    </section>
  )
}

function CampaignStill({ campaign }: { campaign: CampaignBanner }) {
  const [loaded, setLoaded] = useState(false)

  return (
    <div className={FRAME}>
      <div className="absolute inset-0 -z-10">
        <CampaignPhoto campaign={campaign} preload active loaded={loaded} onLoad={() => setLoaded(true)} />
      </div>
      <CampaignCopy campaign={campaign} shown={loaded} />
    </div>
  )
}

function CampaignCarousel({ campaigns }: { campaigns: CampaignBanner[] }) {
  const [index, setIndex] = useState(0)
  const [loaded, setLoaded] = useState<string[]>([])
  const handleSelect = useCallback((api: CarouselApi) => setIndex(api.selectedSnap()), [])
  const markLoaded = useCallback((id: string) => setLoaded((ids) => (ids.includes(id) ? ids : [...ids, id])), [])

  return (
    <Carousel
      loop
      fade
      autoplay={{ delay: AUTOPLAY_DELAY_MS, resumeAfter: AUTOPLAY_DELAY_MS }}
      onSelect={handleSelect}
      aria-label="Campaigns"
      className={FRAME}
    >
      {/* Outside the slides: Embla's fade moves a faded slide out of view, which
          would pull the outgoing photograph from under the incoming one. */}
      <div className="absolute inset-0 -z-10">
        {campaigns.map((campaign, position) => (
          <CampaignPhoto
            key={campaign.id}
            campaign={campaign}
            preload={position === 0}
            active={position === index}
            loaded={loaded.includes(campaign.id)}
            onLoad={() => markLoaded(campaign.id)}
          />
        ))}
      </div>
      <CarouselContent>
        {campaigns.map((campaign, position) => (
          <CarouselSlide key={campaign.id}>
            <CampaignCopy campaign={campaign} shown={position === index && loaded.includes(campaign.id)} />
          </CarouselSlide>
        ))}
      </CarouselContent>
      <CarouselPagination light className="absolute inset-x-0 bottom-5 justify-center sm:bottom-6" />
    </Carousel>
  )
}

interface CampaignPhotoProps {
  campaign: CampaignBanner
  /** Set on the first campaign, the page's largest paint. */
  preload: boolean
  /** Whether it is the campaign on screen. */
  active: boolean
  /** Whether the photograph has decoded. */
  loaded: boolean
  /** Called once the photograph has decoded, or failed to. */
  onLoad: () => void
}

/**
 * Blurs in once decoded, and fades in over the photograph it replaces, which
 * holds until covered. The clip loads after the photograph and plays only while active.
 */
function CampaignPhoto({ campaign, preload, active, loaded, onLoad }: CampaignPhotoProps) {
  const { image, clip, focus } = campaign
  const [playing, setPlaying] = useState(false)
  const clipRef = useRef<HTMLVideoElement>(null)
  const objectPosition = focus && `${focus.x}% ${focus.y}%`

  useEffect(() => {
    const video = clipRef.current
    if (!video) return
    if (active) video.play().catch(() => {})
    else video.pause()
  }, [active, loaded])

  return (
    <div
      aria-hidden={!active || undefined}
      className={cn(
        'absolute inset-0 motion-safe:transition-opacity motion-safe:duration-700 motion-safe:ease-out',
        active ? 'z-1' : 'opacity-0 motion-safe:delay-700',
      )}
    >
      <div
        className={cn(
          'absolute inset-0 motion-safe:transition-[opacity,filter] motion-safe:duration-700 motion-safe:ease-out',
          !loaded && 'opacity-0 blur-md',
        )}
      >
        <Image
          src={image.src}
          alt={image.alt}
          fill
          preload={preload}
          sizes="100vw"
          style={{ objectPosition }}
          // A failed photograph still reveals the copy.
          onLoad={onLoad}
          onError={onLoad}
          className={MEDIA}
        />
        {clip && loaded ? (
          <LoopingVideo
            ref={clipRef}
            src={clip}
            style={{ objectPosition }}
            onPlaying={() => setPlaying(true)}
            className={cn(MEDIA, 'motion-safe:transition-opacity motion-safe:duration-500', !playing && 'opacity-0')}
          />
        ) : null}
        <span className="absolute inset-0 bg-black/25" />
      </div>
    </div>
  )
}

/** Rises in after `--enter-delay`, and leaves faster so 2 campaigns' lines never overlap. */
function copyRow(shown: boolean) {
  return cn(
    'motion-safe:transition-[opacity,translate] motion-safe:ease-out',
    shown
      ? 'motion-safe:delay-(--enter-delay) motion-safe:duration-500'
      : 'translate-y-2 opacity-0 motion-safe:duration-300',
  )
}

/** The line and call to action, hidden until the photograph decodes, since it is white on it. */
function CampaignCopy({ campaign, shown }: { campaign: CampaignBanner; shown: boolean }) {
  const { title, href, ctaLabel = 'Explore' } = campaign

  return (
    <div className="flex h-68 items-center justify-center p-6 text-center sm:h-80 md:h-96 lg:h-114">
      <Link
        href={href}
        className="group outline-ring-light inline-flex flex-col items-center gap-2 rounded-md focus-visible:outline-2 focus-visible:outline-offset-4"
      >
        <span
          className={cn(
            copyRow(shown),
            '[--enter-delay:200ms]',
            'max-w-74 font-mono text-xl text-balance uppercase lg:text-2xl',
          )}
        >
          {title}
        </span>
        {/* A wrapper, since the button's press also sets `translate`. */}
        <span className={cn(copyRow(shown), '[--enter-delay:280ms]')}>
          <span data-slot="button" className={cn(buttonVariants({ variant: 'light' }), CAMPAIGN_CTA)}>
            {ctaLabel}
            <CaretSwap data-icon="end" />
          </span>
        </span>
      </Link>
    </div>
  )
}
