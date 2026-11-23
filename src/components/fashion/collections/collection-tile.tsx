import Image from 'next/image'
import Link from 'next/link'
import { Badge } from '@appica/ui-react/badge'
import type { Collection } from '@/lib/commerce/types'

/** The tile's slot widths: most of a phone in the rail, then 2 across, and half the container once it stops growing. */
const TILE_SIZES = '(min-width: 1400px) 672px, (min-width: 768px) 50vw, 90vw'

interface CollectionTileProps {
  collection: Collection
  /**
   * The cover's slot widths, for a row laid out unlike the collections grid.
   * @default TILE_SIZES
   */
  sizes?: string
}

/**
 * One collection as a tile: its cover, its season, and how many pieces are in
 * it. The whole tile is the link, and the cover eases in on hover.
 */
export function CollectionTile({ collection, sizes = TILE_SIZES }: CollectionTileProps) {
  const { slug, title, season, image, focus, slugs } = collection
  const objectPosition = focus && `${focus.x}% ${focus.y}%`

  return (
    <Link
      href={`/collections/${slug}`}
      className="group outline-ring bg-background-muted relative isolate flex aspect-9/10 flex-col justify-end gap-1 overflow-hidden rounded-sm p-4 text-white focus-visible:outline-2 focus-visible:outline-offset-2 sm:p-5 lg:p-6"
    >
      <Image
        src={image.src}
        alt=""
        fill
        sizes={sizes}
        style={{ objectPosition }}
        className="-z-20 object-cover transition-transform duration-700 ease-out motion-safe:group-hover:scale-[1.03] motion-reduce:transition-none"
      />
      <span
        aria-hidden
        className="absolute inset-x-0 bottom-0 -z-10 h-1/2 bg-linear-to-b from-transparent to-black/50"
      />
      {season && (
        <Badge
          variant="outline"
          size="lg"
          className="absolute inset-s-3 top-3 text-[0.8125rem] tracking-wide lg:inset-s-6 lg:top-6"
        >
          {season}
        </Badge>
      )}
      <span className="font-mono text-base text-balance uppercase sm:text-lg lg:text-2xl">{title}</span>
      <span className="text-sm text-white/80 lg:text-base">{slugs.length} pieces</span>
    </Link>
  )
}
