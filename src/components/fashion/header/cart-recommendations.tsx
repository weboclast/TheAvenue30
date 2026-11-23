'use client'

import { use } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@appica/ui-react/button'
import { Carousel, CarouselContent, CarouselNext, CarouselPrev, CarouselSlide } from '@appica/ui-react/carousel'
import { CARET_ARROW, CaretSwap } from '@/components/fashion/caret-swap'
import { Price } from '@/components/price'
import type { Money, ProductImage } from '@/lib/commerce/types'

/** The most tiles the row offers. */
const MAX_TILES = 8

/** What a tile shows, trimmed from a product so the header ships a few hundred bytes of each. */
export interface RecommendedProduct {
  slug: string
  title: string
  price: Money
  image: ProductImage
}

interface CartRecommendationsProps {
  /** Best sellers by department slug, or under `''` for a store without departments. */
  recommended: Promise<Record<string, RecommendedProduct[]>>
  /** The department on screen, whose best sellers to offer. */
  department: string | undefined
  /** Product slugs already in the bag, which the row skips. */
  exclude: string[]
  /** Closes the drawer behind a tile's link. */
  onNavigate: () => void
}

/**
 * The bag drawer's "Recommended" row, 2 tiles a view. Photos are contained, not
 * cropped, so a model shot's cut edge meets the tile's. Renders nothing when empty.
 */
export function CartRecommendations({ recommended, department, exclude, onNavigate }: CartRecommendationsProps) {
  const products = (use(recommended)[department ?? ''] ?? [])
    .filter(({ slug }) => !exclude.includes(slug))
    .slice(0, MAX_TILES)

  if (products.length === 0) return null

  return (
    <Carousel align="start" slidesToScroll="auto" containScroll="trimSnaps" aria-label="Recommended">
      <div className="mb-2 flex items-center justify-between gap-4">
        <h3 className="text-foreground-intense font-mono text-lg uppercase">Recommended</h3>
        {/* Both arrows disabled means every tile fits, so they hide but keep their room. */}
        <div className="flex gap-2 not-has-enabled:invisible">
          <CarouselPrev
            position="none"
            className={CARET_ARROW}
            render={<Button data-slot="button" variant="outline" size="icon-sm" />}
          >
            <CaretSwap direction="back" />
          </CarouselPrev>
          <CarouselNext
            position="none"
            className={CARET_ARROW}
            render={<Button data-slot="button" variant="outline" size="icon-sm" />}
          >
            <CaretSwap />
          </CarouselNext>
        </div>
      </div>

      {/* `-m-1 p-1` is the slack a tile's focus ring needs inside the clipping viewport. */}
      <CarouselContent className="-ms-2 items-stretch" viewportProps={{ className: '-m-1 p-1' }}>
        {products.map((product) => (
          <CarouselSlide key={product.slug} className="basis-1/2 ps-2">
            {/* Price pinned to the bottom like the product card's, so 2 tiles' prices line up. */}
            <Link
              href={`/product/${product.slug}`}
              onClick={onNavigate}
              className="outline-ring flex h-full flex-col gap-3 rounded-sm text-sm focus-visible:outline-2 focus-visible:outline-offset-2"
            >
              <span className="bg-background-muted relative block aspect-square overflow-hidden rounded-sm">
                <Image src={product.image.src} alt="" fill sizes="208px" className="object-contain" />
              </span>
              <span className="flex flex-1 flex-col gap-0.5 px-4">
                <span className="text-foreground-intense line-clamp-2">{product.title}</span>
                <Price
                  money={product.price}
                  scaleFraction={false}
                  className="text-foreground-intense mt-auto font-mono font-medium"
                />
              </span>
            </Link>
          </CarouselSlide>
        ))}
      </CarouselContent>
    </Carousel>
  )
}
