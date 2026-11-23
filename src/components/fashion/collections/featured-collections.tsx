'use client'

import { useCallback, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { PlayerPauseFilled, PlayerPlayFilled } from '@appica/icons-react'
import { Button, buttonVariants } from '@appica/ui-react/button'
import {
  Carousel,
  type CarouselApi,
  CarouselContent,
  CarouselNext,
  CarouselPagination,
  CarouselPrev,
  CarouselSlide,
  useCarousel,
} from '@appica/ui-react/carousel'
import { CARET_ARROW, CaretSwap } from '@/components/fashion/caret-swap'
import { Eyebrow } from '@/components/fashion/eyebrow'
import type { Collection } from '@/lib/commerce/types'
import { cn } from '@/lib/utils'

/** Long enough to read a title and a line of copy, and to glance at the pieces. */
const AUTOPLAY_DELAY_MS = 7000

/** How many of the look's pieces the card shows. */
const CARD_PIECES = 4

/**
 * The frame, inset like the catalog's campaigns. Its height is fixed from `lg`,
 * each step with room for the card at that width; below that the stacked copy
 * sets it.
 */
const FRAME = 'bg-background-muted relative isolate overflow-hidden rounded-sm text-white lg:h-190 xl:h-200 2xl:h-210'

/** The width of the column everything stacks into below `lg`, which is the card's. The controls take it too. */
const STACK_WIDTH = 'w-75 max-w-full sm:w-80 md:w-100'

/** That column, centered. */
const STACK = cn(STACK_WIDTH, 'justify-self-center')

/**
 * The card's width at each frame height, and the `sizes` its photograph is
 * fetched at. Set outright rather than capped: the card sits in an `auto` grid
 * track, which sizes itself to the card, so a `w-full` here has nothing to fill.
 */
const CARD = cn(STACK, 'lg:w-115 xl:w-125')
const CARD_SIZES =
  '(min-width: 1200px) 500px, (min-width: 1024px) 460px, (min-width: 768px) 400px, (min-width: 500px) 320px, 300px'

/**
 * The collections page's opening: the featured collections, each a card of its
 * cover and the pieces worn in it, over the same photograph blurred. They
 * crossfade on a timer and step with the storefront's carets. The copy is white,
 * so a slide's copy waits for its photograph.
 */
export function FeaturedCollections({ collections }: { collections: Collection[] }) {
  const [index, setIndex] = useState(0)
  const [loaded, setLoaded] = useState<string[]>([])
  const handleSelect = useCallback((api: CarouselApi) => setIndex(api.selectedSnap()), [])
  const markLoaded = useCallback((id: string) => setLoaded((ids) => (ids.includes(id) ? ids : [...ids, id])), [])

  if (collections.length === 0) return null
  const several = collections.length > 1

  return (
    <section className="px-2">
      <Carousel
        loop
        fade
        autoplay={several && { delay: AUTOPLAY_DELAY_MS, resumeAfter: AUTOPLAY_DELAY_MS }}
        onSelect={handleSelect}
        aria-label="Featured collections"
        className={FRAME}
      >
        {/* Outside the slides: Embla's fade moves a faded slide out of view, which
            would pull the outgoing photograph from under the incoming one. */}
        <div className="absolute inset-0 -z-10">
          {collections.map((collection, position) => (
            <Backdrop
              key={collection.id}
              collection={collection}
              preload={position === 0}
              active={position === index}
              loaded={loaded.includes(collection.id)}
              onLoad={() => markLoaded(collection.id)}
            />
          ))}
        </div>
        <CarouselContent className="ms-0 h-full" viewportProps={{ className: 'h-full' }}>
          {collections.map((collection, position) => (
            <CarouselSlide key={collection.id} className="h-full ps-0">
              <Slide
                collection={collection}
                preload={position === 0}
                shown={position === index && loaded.includes(collection.id)}
              />
            </CarouselSlide>
          ))}
        </CarouselContent>
        {several ? <Controls /> : null}
      </Carousel>
    </section>
  )
}

interface BackdropProps {
  collection: Collection
  /** Set on the first collection, the page's largest paint. */
  preload: boolean
  /** Whether it is the collection on screen. */
  active: boolean
  /** Whether the photograph has decoded. */
  loaded: boolean
  /** Called once the photograph has decoded, or failed to. */
  onLoad: () => void
}

/** The cover blurred across the whole frame. Fades in over the one it replaces, which holds until covered. */
function Backdrop({ collection, preload, active, loaded, onLoad }: BackdropProps) {
  const { image, focus } = collection
  const objectPosition = focus && `${focus.x}% ${focus.y}%`

  return (
    <div
      aria-hidden
      className={cn(
        'absolute inset-0 motion-safe:transition-opacity motion-safe:duration-700 motion-safe:ease-out',
        active ? 'z-1' : 'opacity-0 motion-safe:delay-700',
      )}
    >
      <Image
        src={image.src}
        alt=""
        fill
        preload={preload}
        sizes="100vw"
        style={{ objectPosition }}
        // A failed photograph still reveals the copy.
        onLoad={onLoad}
        onError={onLoad}
        className={cn(
          'scale-110 object-cover blur-lg motion-safe:transition-opacity motion-safe:duration-700 motion-safe:ease-out',
          !loaded && 'opacity-0',
        )}
      />
      <span className="absolute inset-0 bg-black/20" />
    </div>
  )
}

/** Rises in after `--enter-delay`, and leaves faster so 2 slides' copy never overlaps. */
function reveal(shown: boolean, delay: string) {
  return cn(
    'motion-safe:transition-[opacity,translate] motion-safe:ease-out',
    shown
      ? cn(delay, 'motion-safe:delay-(--enter-delay) motion-safe:duration-500')
      : 'translate-y-2 opacity-0 motion-safe:duration-300',
  )
}

/**
 * The season and title at the start, the card in the middle, and the line of
 * copy at the end. Below `lg` they stack into one centered column.
 */
function Slide({ collection, preload, shown }: { collection: Collection; preload: boolean; shown: boolean }) {
  const { slug, title, season, description, image, focus, look } = collection
  const href = `/collections/${slug}`
  const objectPosition = focus && `${focus.x}% ${focus.y}%`

  return (
    <div className="container grid h-full content-start gap-6 pt-8 pb-22 lg:grid-cols-[1fr_auto_1fr] lg:content-normal lg:items-center lg:gap-10 lg:py-10">
      <div
        className={cn(
          'flex flex-col gap-3',
          STACK,
          'lg:w-auto lg:justify-self-stretch',
          reveal(shown, '[--enter-delay:150ms]'),
        )}
      >
        {season && <Eyebrow className="text-white/70">{season}</Eyebrow>}
        <p className="max-w-md font-mono text-3xl text-balance uppercase md:text-4xl xl:text-5xl">{title}</p>
      </div>

      <div className={cn('flex flex-col gap-2', CARD, reveal(shown, '[--enter-delay:250ms]'))}>
        <div className="bg-background-muted relative aspect-412/543 overflow-hidden rounded-sm">
          <Image
            src={image.src}
            alt={image.alt}
            fill
            preload={preload}
            sizes={CARD_SIZES}
            style={{ objectPosition }}
            className="object-cover"
          />
          {/* The photograph opens the collection too, out of the tab order: the button below already does. */}
          <Link href={href} aria-hidden tabIndex={-1} className="absolute inset-0" />
          {/* Forced light, so the tiles are the same gray on the photograph in both themes. */}
          {look.length > 0 ? (
            <ul className="light absolute inset-x-3 bottom-3 grid grid-cols-4 gap-1">
              {look.slice(0, CARD_PIECES).map((piece) => (
                <li key={piece.slug}>
                  <Link
                    href={`/product/${piece.slug}`}
                    aria-label={piece.title}
                    className="group/piece outline-ring-light bg-background-muted rounded-2xs relative block aspect-324/406 overflow-hidden focus-visible:outline-2 focus-visible:outline-offset-2"
                  >
                    <Image
                      src={piece.image.src}
                      alt=""
                      fill
                      sizes="120px"
                      className="object-cover transition-transform duration-350 ease-out motion-safe:group-hover/piece:scale-105 motion-reduce:transition-none"
                    />
                  </Link>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
        <Link
          href={href}
          data-slot="button"
          className={cn(buttonVariants({ variant: 'light', size: 'lg' }), 'group w-full')}
        >
          Explore the collection
          <CaretSwap data-icon="end" />
        </Link>
      </div>

      <p
        className={cn(
          'text-pretty',
          STACK,
          'lg:w-auto lg:max-w-60 lg:justify-self-end',
          reveal(shown, '[--enter-delay:350ms]'),
        )}
      >
        {description}
      </p>
    </div>
  )
}

/** The carets, the pause, and the bullets, along the foot of the frame. The slides leave the room. */
function Controls() {
  return (
    <div className="absolute inset-x-0 bottom-6 z-1 container lg:bottom-10">
      <div className={cn(STACK_WIDTH, 'mx-auto flex items-center justify-between gap-4 lg:w-auto')}>
        <div className="flex items-center gap-2">
          <CarouselPrev
            position="none"
            className={CARET_ARROW}
            render={<Button data-slot="button" variant="light" size="icon-md" />}
          >
            <CaretSwap direction="back" />
          </CarouselPrev>
          <CarouselNext
            position="none"
            className={CARET_ARROW}
            render={<Button data-slot="button" variant="light" size="icon-md" />}
          >
            <CaretSwap />
          </CarouselNext>
          <PlayToggle />
        </div>
        <CarouselPagination light />
      </div>
    </div>
  )
}

/** Stops the timer, and starts it again. Absent where the carousel runs none, as under reduced motion. */
function PlayToggle() {
  const { api, autoplay } = useCarousel()
  if (!autoplay) return null

  const playing = autoplay.isPlaying
  const toggle = () => {
    const plugin = api?.plugins().autoplay
    if (playing) plugin?.stop()
    else plugin?.play()
  }

  return (
    <Button variant="light" size="icon-md" aria-label={playing ? 'Pause' : 'Play'} onClick={toggle}>
      {playing ? <PlayerPauseFilled /> : <PlayerPlayFilled />}
    </Button>
  )
}
