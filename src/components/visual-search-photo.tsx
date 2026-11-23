'use client'

import type { CSSProperties } from 'react'
import Image from 'next/image'
import type { VisualMatch } from '@/lib/commerce/types'
import type { SearchPhoto } from '@/lib/visual-search/use-visual-search'
import { cn } from '@/lib/utils'

/** How far apart the dots spring in, so the eye follows them in order. */
const DOT_STAGGER_MS = 90

interface VisualSearchPhotoProps {
  photo: SearchPhoto
  /** Those with a point get a dot. */
  matches: VisualMatch[]
  /** Index into `matches` of the one on show. */
  selected: number
  onSelect: (index: number) => void
  /** Whether a search is reading it, which passes a band of light down it. */
  reading?: boolean
  /** The photo's `sizes`, for the optimizer. A shopper's own photo is shown as it is. */
  sizes: string
  className?: string
}

/**
 * A searched photo, whole inside its frame whatever its shape, with a dot on
 * each piece found. A dot shows that piece's matches; out of the tab order,
 * since the labeled control beside the photo does the same.
 *
 * A demo restyles it through `data-slot`: `visual-search-photo` is the frame,
 * carrying `data-reading`; `visual-search-dot` is 1 dot, carrying `data-selected`.
 */
export function VisualSearchPhoto({
  photo,
  matches,
  selected,
  onSelect,
  reading = false,
  sizes,
  className,
}: VisualSearchPhotoProps) {
  return (
    <div
      data-slot="visual-search-photo"
      data-reading={reading || undefined}
      className={cn('[container-type:size] grid place-items-center', className)}
    >
      {/* The photo's own box, as wide as the frame allows at its ratio, so a dot lands where its piece is. */}
      <div
        style={{ '--photo-ratio': photo.width / photo.height } as CSSProperties}
        className="relative aspect-(--photo-ratio) w-[min(100cqw,100cqh*var(--photo-ratio))] overflow-hidden rounded-[inherit]"
      >
        {photo.src.startsWith('blob:') ? (
          // Not `next/image`: the optimizer cannot fetch a blob URL from this browser.
          // eslint-disable-next-line @next/next/no-img-element
          <img src={photo.src} alt={photo.alt} className="size-full object-cover" />
        ) : (
          <Image src={photo.src} alt={photo.alt} fill sizes={sizes} className="object-cover" />
        )}

        {reading ? (
          <span
            aria-hidden
            className="motion-safe:animate-scan absolute inset-x-0 top-0 h-1/3 bg-linear-to-b from-white/0 via-white/35 to-white/0 motion-reduce:hidden"
          />
        ) : null}

        {matches.map(({ label, point }, index) =>
          point ? (
            <button
              key={`${label}-${index}`}
              type="button"
              tabIndex={-1}
              data-slot="visual-search-dot"
              data-selected={index === selected || undefined}
              aria-label={`Show matches for ${label}`}
              aria-pressed={index === selected}
              onClick={() => onSelect(index)}
              style={
                {
                  left: `${point.x}%`,
                  top: `${point.y}%`,
                  '--enter-delay': `${index * DOT_STAGGER_MS}ms`,
                } as CSSProperties
              }
              className={cn(
                'group/dot absolute flex size-8 -translate-1/2 cursor-pointer items-center justify-center rounded-full',
                'motion-safe:animate-pop-in',
              )}
            >
              <span
                className={cn(
                  'relative flex size-7 items-center justify-center rounded-full bg-white shadow-md',
                  'ease-spring transition-[scale] duration-300 motion-reduce:transition-none',
                  index === selected ? 'scale-110' : 'scale-75 group-hover/dot:scale-90',
                )}
              >
                {index === selected ? (
                  <span className="absolute inset-0 rounded-full bg-white/60 [animation-duration:2.4s] motion-safe:animate-ping" />
                ) : null}
                <span className="relative size-2.5 rounded-full bg-black" />
              </span>
            </button>
          ) : null,
        )}
      </div>
    </div>
  )
}
