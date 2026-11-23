import { Suspense } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Badge } from '@appica/ui-react/badge'
import { buttonVariants } from '@appica/ui-react/button'
import { CaretSwap } from '@/components/fashion/caret-swap'
import { Eyebrow } from '@/components/fashion/eyebrow'
import { ProductCard } from '@/components/fashion/product/product-card'
import { ProductCardSkeleton } from '@/components/fashion/product/product-card-skeleton'
import { getCommerce } from '@/lib/commerce'
import { toCardProduct } from '@/lib/commerce/card-product'
import type { Collection } from '@/lib/commerce/types'
import { cn } from '@/lib/utils'

/** The pieces' slot widths: 2 across, in half the row from `lg`. */
const PIECE_SIZES = '(min-width: 1024px) 25vw, 50vw'

const PIECES = 'grid grid-cols-2 gap-x-2 gap-y-6'

/**
 * A collection's look: one photograph of its pieces worn together, beside the
 * same pieces as cards showing each on its own. Renders nothing for a collection with no `lookImage`.
 * From `lg` the photograph takes the cards' full height, so the 2 columns end
 * on the same line. The cards stream in behind the rest.
 */
export function ShopTheLook({ collection }: { collection: Collection }) {
  const { slug, title, season, look, lookImage } = collection
  if (!lookImage) return null

  const href = `/collections/${slug}`

  return (
    <section className="container flex flex-col gap-8 pb-16 md:gap-10 md:pb-20 xl:pb-24">
      <div className="flex flex-col gap-3">
        <Eyebrow>Shop the look</Eyebrow>
        <h2 className="text-foreground-intense text-3xl font-medium md:text-4xl">
          {look.length} pieces, worn together
        </h2>
        <p className="max-w-xl text-pretty">
          A look from{' '}
          <Link
            href={href}
            className="text-foreground-intense outline-ring rounded-4xs underline underline-offset-4 hover:no-underline focus-visible:outline-2 focus-visible:outline-offset-2"
          >
            {title}
          </Link>
          {season && `, the ${season} collection`}.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-2 lg:gap-x-8">
        <figure className="bg-background-muted relative aspect-2/3 overflow-hidden rounded-sm lg:aspect-auto">
          <Image
            src={lookImage.src}
            alt={lookImage.alt}
            fill
            sizes="(min-width: 1400px) 660px, (min-width: 1024px) 50vw, 100vw"
            className="object-cover"
          />
          <Badge
            variant="outline"
            size="lg"
            render={<figcaption />}
            className="absolute inset-s-3 bottom-3 text-[0.8125rem] tracking-wide"
          >
            {title}
          </Badge>
        </figure>

        <div className="flex flex-col gap-6">
          <Suspense fallback={<PiecesSkeleton count={look.length} />}>
            <Pieces slugs={look.map((piece) => piece.slug)} />
          </Suspense>
          <Link
            href={href}
            data-slot="button"
            className={cn(buttonVariants({ variant: 'outline' }), 'group self-start')}
          >
            See the whole collection
            <CaretSwap data-icon="end" />
          </Link>
        </div>
      </div>
    </section>
  )
}

async function Pieces({ slugs }: { slugs: string[] }) {
  const { products } = await getCommerce('fashion').listProducts({ slugs })

  return (
    <ul className={PIECES}>
      {products.map((product) => (
        <li key={product.id}>
          <ProductCard product={toCardProduct(product)} sizes={PIECE_SIZES} shot="packshot" />
        </li>
      ))}
    </ul>
  )
}

function PiecesSkeleton({ count }: { count: number }) {
  return (
    <div className={PIECES}>
      {Array.from({ length: count }, (_, index) => (
        <ProductCardSkeleton key={index} />
      ))}
    </div>
  )
}
