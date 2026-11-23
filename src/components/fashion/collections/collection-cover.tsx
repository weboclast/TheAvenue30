import Image from 'next/image'
import { Badge } from '@appica/ui-react/badge'
import type { Collection } from '@/lib/commerce/types'

/** A collection's cover across the top of its page, captioned with its season. The heading below names it. */
export function CollectionCover({ collection }: { collection: Collection }) {
  const { image, focus, season } = collection
  const objectPosition = focus && `${focus.x}% ${focus.y}%`

  return (
    <section className="px-2">
      <figure className="bg-background-muted relative h-68 overflow-hidden rounded-sm sm:h-80 md:h-96 lg:h-114">
        <Image
          src={image.src}
          alt={image.alt}
          fill
          preload
          sizes="100vw"
          style={{ objectPosition }}
          className="object-cover"
        />
        {season && (
          <Badge
            variant="outline"
            size="lg"
            render={<figcaption />}
            className="absolute inset-s-3 bottom-3 text-[0.8125rem] tracking-wide"
          >
            {season}
          </Badge>
        )}
      </figure>
    </section>
  )
}
