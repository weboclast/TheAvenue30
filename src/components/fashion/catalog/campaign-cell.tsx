'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { LoopingVideo } from '@/components/looping-video'
import type { CampaignBanner } from '@/lib/commerce/types'
import { cn } from '@/lib/utils'

/** The catalog grid's slot widths, the same ones the product cards beside it are fetched at. */
const CELL_SIZES = '(min-width: 1200px) 25vw, (min-width: 768px) 33vw, 50vw'

const MEDIA = 'absolute inset-0 size-full object-cover'

interface CampaignCellProps {
  campaign: CampaignBanner
  /**
   * The `sizes` the photograph is fetched at, for a cell outside the catalog grid.
   * @default the grid's slot widths
   */
  sizes?: string
  /**
   * Whether the clip plays, for a carousel showing 1 cell at a time. Left out,
   * it plays once the cell nears the viewport.
   */
  active?: boolean
  className?: string
}

/**
 * A campaign in a cell of the catalog grid, as tall as the tallest card in its
 * row. The whole cell is the link, and its photograph eases in on hover. A clip
 * is fetched once the cell nears the viewport and fades in over the photograph,
 * which is its first frame.
 */
export function CampaignCell({ campaign, sizes = CELL_SIZES, active, className }: CampaignCellProps) {
  const { title, image, clip, focus, href } = campaign
  const cellRef = useRef<HTMLAnchorElement>(null)
  const [near, setNear] = useState(false)
  const [playing, setPlaying] = useState(false)
  const objectPosition = focus && `${focus.x}% ${focus.y}%`
  const plays = Boolean(clip) && (active ?? near)

  // A clip taken off screen starts over from its still when it comes back.
  if (!plays && playing) setPlaying(false)

  useEffect(() => {
    const cell = cellRef.current
    if (!clip || active !== undefined || !cell) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        setNear(true)
        observer.disconnect()
      },
      { rootMargin: '50% 0px' },
    )
    observer.observe(cell)
    return () => observer.disconnect()
  }, [clip, active])

  return (
    <Link
      ref={cellRef}
      href={href}
      className={cn(
        'group outline-ring rounded-2xs bg-background-muted relative isolate flex flex-col justify-end overflow-hidden p-4 text-center text-white',
        'focus-visible:outline-2 focus-visible:outline-offset-2',
        className,
      )}
    >
      <div className="absolute inset-0 -z-20 transition-transform duration-700 ease-out motion-safe:group-hover:scale-[1.03] motion-reduce:transition-none">
        <Image src={image.src} alt="" fill sizes={sizes} style={{ objectPosition }} className="object-cover" />
        {clip && plays ? (
          <LoopingVideo
            src={clip}
            style={{ objectPosition }}
            onPlaying={() => setPlaying(true)}
            className={cn(MEDIA, 'transition-opacity duration-500', !playing && 'opacity-0')}
          />
        ) : null}
      </div>
      <span
        aria-hidden
        className="absolute inset-x-0 bottom-0 -z-10 h-1/2 bg-linear-to-b from-transparent to-black/50"
      />
      <span className="font-mono text-sm text-balance uppercase sm:text-base lg:text-lg">{title}</span>
    </Link>
  )
}
