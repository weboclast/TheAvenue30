'use client'

import type { ReactNode } from 'react'
import Link from 'next/link'
import { Button } from '@appica/ui-react/button'
import { Carousel, CarouselContent, CarouselNext, CarouselPrev, CarouselSlide } from '@appica/ui-react/carousel'
import { CARET_ARROW, CaretSwap } from '@/components/fashion/caret-swap'
import { ProductCard } from '@/components/fashion/product/product-card'
import { ProductCardSkeleton } from '@/components/fashion/product/product-card-skeleton'
import type { CardProduct } from '@/lib/commerce/types'
import { cn } from '@/lib/utils'

/*
 * A titled carousel of product cards. It brings no section chrome, so the
 * caller owns the `<section>` and its spacing, and never wraps it in
 * `container`: the row bleeds past the gutter below `md` and sits inside it
 * from `md`, so a container fights it at both ends.
 *
 * A client file, so the arrows' `render` buttons keep the slot `globals.css`
 * rounds them by.
 */

/** Placeholders in the skeleton: the most cards a view shows, 4 from `lg`, where none peeks in. */
const PLACEHOLDERS = 4

/** 4 cards a view on wide screens, down to one and a half on phones. Keep {@link PLACEHOLDERS} in step. */
const SLIDE_CLASSES = 'basis-2/3 ps-2 sm:basis-2/5 md:basis-1/3 lg:basis-1/4'

/** The artwork's slot width at each of those, so the card fetches its size. */
const CARD_SIZES = '(min-width: 1024px) 25vw, (min-width: 768px) 33vw, (min-width: 500px) 40vw, 67vw'

/**
 * The gap `container` leaves beside its content, which the heading and the
 * bleed both lay out against. Mirrors `container` in `globals.css`, the way the
 * Electronics shelf does.
 */
const ROOT_CLASSES =
  '[--shelf-gutter:1rem] sm:[--shelf-gutter:calc(2.5%_+_1rem)] 2xl:[--shelf-gutter:calc((100%_-_84.5rem)_/_2_+_1rem)]'

/**
 * The bleed: the padded end keeps showing what scrolls into it while the start
 * cuts clean, 1 card gap inside the gutter. From `md` the row sits in the
 * container. `-my-2 py-2` is the slack a focus ring needs.
 */
const VIEWPORT_CLASSES =
  'ms-[calc(var(--shelf-gutter)_-_0.5rem)] -my-2 py-2 ps-2 pe-[var(--shelf-gutter)] md:me-[calc(var(--shelf-gutter)_-_0.5rem)] md:pe-2'

/** Beside an aside from `lg`: 2 cards a view, in a row that ends at its column. */
const ASIDE_SLIDE_CLASSES = cn(SLIDE_CLASSES, 'lg:basis-1/2')
const ASIDE_VIEWPORT_CLASSES = cn(VIEWPORT_CLASSES, 'lg:-mx-2')

interface ProductShelfProps {
  /** Names the shelf, in the heading and to assistive tech. */
  title: string
  /** The full listing the row starts, which makes the heading a link to it. */
  href?: string
  /** Trimmed with `toCardProduct` on the server, and already ordered: the shelf never re-ranks them. */
  products: CardProduct[]
  /** Set beside the row from `lg`, which then takes the other half, and above it below. Fills the row's height. */
  aside?: ReactNode
}

/** A titled row of garments that scrolls sideways, stepped with the storefront's carets. */
export function ProductShelf({ title, href, products, aside }: ProductShelfProps) {
  return (
    <Carousel align="start" slidesToScroll="auto" containScroll="trimSnaps" aria-label={title} className={ROOT_CLASSES}>
      <ShelfHeader title={title} href={href}>
        <CarouselPrev
          position="none"
          className={CARET_ARROW}
          render={<Button data-slot="button" variant="outline" size="icon-md" />}
        >
          <CaretSwap direction="back" />
        </CarouselPrev>
        <CarouselNext
          position="none"
          className={CARET_ARROW}
          render={<Button data-slot="button" variant="outline" size="icon-md" />}
        >
          <CaretSwap />
        </CarouselNext>
      </ShelfHeader>

      <ShelfBody aside={aside}>
        <CarouselContent
          className="-ms-2 items-stretch"
          viewportProps={{ className: aside ? ASIDE_VIEWPORT_CLASSES : VIEWPORT_CLASSES }}
        >
          {products.map((product) => (
            <CarouselSlide key={product.id} className={aside ? ASIDE_SLIDE_CLASSES : SLIDE_CLASSES}>
              <ProductCard product={product} sizes={CARD_SIZES} className="h-full" />
            </CarouselSlide>
          ))}
        </CarouselContent>
      </ShelfBody>
    </Carousel>
  )
}

/** The shell a shelf streams into: the same heading and controls, and a row of card-shaped boxes. */
export function ProductShelfSkeleton({ title, href, aside }: Pick<ProductShelfProps, 'title' | 'href' | 'aside'>) {
  return (
    // Stands in for the carousel's root, which is where `--shelf-gutter` lives.
    <div className={ROOT_CLASSES}>
      <ShelfHeader title={title} href={href}>
        <Button variant="outline" size="icon-md" disabled aria-hidden>
          <CaretSwap direction="back" />
        </Button>
        <Button variant="outline" size="icon-md" disabled aria-hidden>
          <CaretSwap />
        </Button>
      </ShelfHeader>

      <ShelfBody aside={aside}>
        <div className={cn(aside ? ASIDE_VIEWPORT_CLASSES : VIEWPORT_CLASSES, 'overflow-hidden')}>
          <div className="-ms-2 flex">
            {Array.from({ length: PLACEHOLDERS }, (_, index) => (
              <div key={index} className={cn('shrink-0 grow-0', aside ? ASIDE_SLIDE_CLASSES : SLIDE_CLASSES)}>
                <ProductCardSkeleton />
              </div>
            ))}
          </div>
        </div>
      </ShelfBody>
    </div>
  )
}

/** The row alone, or beside its aside. */
function ShelfBody({ aside, children }: Pick<ProductShelfProps, 'aside'> & { children: ReactNode }) {
  if (!aside) return children

  return (
    <div className="flex flex-col gap-2 lg:grid lg:grid-cols-2 lg:px-(--shelf-gutter)">
      <div className="px-(--shelf-gutter) lg:px-0">{aside}</div>
      {children}
    </div>
  )
}

function ShelfHeader({ title, href, children }: Pick<ProductShelfProps, 'title' | 'href'> & { children: ReactNode }) {
  return (
    // `px-(--shelf-gutter)` lines the heading up with the first card below it.
    <div className="mb-4 flex items-center justify-between gap-6 px-(--shelf-gutter)">
      <h2 className="text-foreground-intense font-mono text-lg uppercase">
        {href ? (
          <Link
            href={href}
            className="group outline-ring rounded-4xs inline-flex items-center gap-2 focus-visible:outline-2 focus-visible:outline-offset-2"
          >
            {title}
            <CaretSwap />
          </Link>
        ) : (
          title
        )}
      </h2>
      {/* Both arrows disabled means every card fits, so they hide but keep their room. */}
      <div className="flex shrink-0 items-center gap-2 not-has-enabled:invisible">{children}</div>
    </div>
  )
}
