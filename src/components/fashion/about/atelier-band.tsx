import Image from 'next/image'
import { Badge } from '@appica/ui-react/badge'

const DIR = '/demo/fashion/about'

const CAPTION = 'absolute inset-s-3 bottom-3 text-[0.8125rem] tracking-wide'

/** The 2 photographs the statement above is about: the atelier, and the hands that finish a seam. */
export function AtelierBand() {
  return (
    <section className="px-2 pb-16 md:pb-20 xl:pb-24">
      <div className="grid gap-2 md:grid-cols-3">
        <figure className="bg-background-muted relative aspect-4/3 overflow-hidden rounded-sm md:col-span-2 md:aspect-3/2">
          <Image
            src={`${DIR}/atelier.webp`}
            alt="A seamstress pinning a paper pattern to olive linen on a long cutting table, bolts of colored cloth behind her"
            fill
            preload
            sizes="(min-width: 768px) 66vw, 100vw"
            className="object-cover"
          />
          <Badge variant="outline" size="lg" render={<figcaption />} className={CAPTION}>
            The atelier, Porto
          </Badge>
        </figure>

        <figure className="bg-background-muted relative aspect-4/3 overflow-hidden rounded-sm md:aspect-3/4">
          <Image
            src={`${DIR}/detail.webp`}
            alt="Hands sewing the shoulder seam of an olive knit sweater in yellow thread"
            fill
            sizes="(min-width: 768px) 33vw, 100vw"
            className="object-cover"
          />
          <Badge variant="outline" size="lg" render={<figcaption />} className={CAPTION}>
            Finished by hand
          </Badge>
        </figure>
      </div>
    </section>
  )
}
