'use client'

import {
  type CSSProperties,
  type ReactNode,
  type RefObject,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Button, buttonVariants } from '@appica/ui-react/button'
import {
  Carousel,
  type CarouselApi,
  CarouselContent,
  CarouselNext,
  CarouselPrev,
  CarouselSlide,
  useCarousel,
} from '@appica/ui-react/carousel'
import { CARET_ARROW, CaretSwap } from '@/components/fashion/caret-swap'
import { Eyebrow } from '@/components/fashion/eyebrow'
import type { HeroCampaign } from '@/lib/commerce/types'
import { cn } from '@/lib/utils'

/** How long a campaign holds, which is also how long its title takes to fill. */
const AUTOPLAY_DELAY_MS = 7000

/** Call to action when a campaign names none. */
const DEFAULT_CTA = 'Shop now'

/**
 * Where the cut-out stands from `lg`: its height as a multiple of the frame's,
 * its top edge, and its middle's distance from the start of the text column,
 * the edge `--cutout-gutter` mirrors from `container` in `globals.css`. Every
 * scale keeps the foot below the frame. Tuned on the widest canvas, the flowers,
 * to clear the copy and cover the next title.
 *
 * `--cutout-x` is that middle, held back before a figure's far side (82% across
 * the canvas) runs more than 1.5rem past the frame's edge.
 */
const CUTOUT_PLACEMENT = cn(
  'lg:[--cutout-gutter:calc(2.5cqw+1rem)] 2xl:[--cutout-gutter:calc((100cqw-84.5rem)/2+1rem)]',
  'lg:[--cutout-scale:1] lg:[--cutout-top:0] lg:[--cutout-center:46rem]',
  'xl:[--cutout-scale:1.1] xl:[--cutout-top:-2cqh] xl:[--cutout-center:54.5rem]',
  '2xl:[--cutout-scale:1.2] 2xl:[--cutout-top:-4cqh] 2xl:[--cutout-center:64rem]',
  'lg:[--cutout-x:min(var(--cutout-gutter)+var(--cutout-center),100cqw-var(--cutout-scale)*42cqh+1.5rem)]',
)

/**
 * The frame. From `lg` its height is fixed and it is a size container, which
 * the cut-out measures itself against; below that the copy stacks over the
 * cut-out and sets the height.
 */
const FRAME = cn(
  'relative isolate flex flex-col overflow-hidden rounded-sm text-white',
  'lg:h-160 lg:justify-center lg:[container-type:size] xl:h-200 2xl:h-210',
  CUTOUT_PLACEMENT,
)

/**
 * The column the copy stacks into, set in the title's mono so `ch` is its
 * character: 11 wide, which is what breaks every title onto 2 lines. The titles
 * beside it sit `--title-stride` apart, a column and a gap.
 */
const COLUMN = cn(
  'mx-auto w-[11ch] font-mono [--title-stride:11.6ch] lg:mx-0',
  'text-[length:clamp(2.25rem,12vw,3rem)] lg:text-7xl xl:text-8xl 2xl:text-9xl',
)

/** Moves a title `--offset` strides from the column. */
const STRIDE_OFFSET =
  'translate-x-[calc(var(--offset)*var(--title-stride))] rtl:translate-x-[calc(var(--offset)*var(--title-stride)*-1)]'

/**
 * The title row's entrance on load: in from a stride away, the way a step brings
 * each title, on the titles' `duration-800 ease-in-out`. The row plays it, since
 * it never remounts; a title mounts each time it comes in range.
 */
const TRACK_ENTRANCE = cn(
  'motion-safe:animate-glide-in [--glide-blur:0px] [--glide-duration:800ms] [--glide-ease:var(--ease-in-out)]',
  '[--glide-distance:var(--title-stride)] rtl:[--glide-distance:calc(var(--title-stride)*-1)]',
)

/**
 * The cut-out's box while it stands under the copy, a little taller than the
 * canvas's 13:10 on a phone, which crops the sides rather than shrinking the
 * subject. The spacer holding its room in the stack shares the ratio.
 */
const STACKED_CUTOUT = 'aspect-[10/9] md:aspect-[13/10]'

/** From `lg` the canvas is sized off the frame's height, at its 13:10 ratio. */
const CUTOUT_BOX = cn(
  'absolute inset-x-0 bottom-0',
  STACKED_CUTOUT,
  'lg:inset-auto lg:aspect-auto',
  'lg:top-(--cutout-top) lg:h-[calc(var(--cutout-scale)*100cqh)] lg:w-[calc(var(--cutout-scale)*130cqh)]',
  'lg:start-[calc(var(--cutout-x)-var(--cutout-scale)*65cqh)]',
)

/** The box's width at each frame height and `--cutout-scale`, so keep it in step with both. Phones crop to 117%. */
const CUTOUT_SIZES =
  '(min-width: 87.5rem) 1310px, (min-width: 75rem) 1144px, (min-width: 64rem) 832px, (min-width: 48rem) 100vw, 117vw'

/*
 * Everything changes at once. The cut-outs fade in 300ms, so no title moves far
 * behind one still half faded, and come into focus as they slide, on the
 * titles' own 800ms curve over a fraction of their distance: they land together
 * at different speeds, which reads as depth. The copy slides too, shorter still.
 *
 * Each layer plays its entrance as a keyframe on load and as a transition after,
 * at the same pace, so the first paint moves like every slide after it. Keep
 * each `--*-duration` equal to its `duration-*`.
 */

/** The cut-out's fade, on its box. */
const CUTOUT_FADE =
  'motion-safe:animate-focus-in [--focus-blur:0px] [--focus-duration:300ms] motion-safe:transition-opacity motion-safe:ease-out'

/**
 * Its focus and slide, on the image, matching the titles' `duration-800
 * ease-in-out`: in from the end side, out toward the start. Keep
 * `--glide-distance` equal to the translations in {@link Cutout}.
 */
const CUTOUT_GLIDE = cn(
  'motion-safe:animate-glide-in [--glide-opacity:1] [--glide-blur:var(--blur-md)] [--glide-duration:800ms]',
  '[--glide-ease:var(--ease-in-out)] [--glide-distance:5rem] lg:[--glide-distance:8rem]',
  'rtl:[--glide-distance:-5rem] rtl:lg:[--glide-distance:-8rem]',
  'motion-safe:transition-[filter,translate] motion-safe:duration-800 motion-safe:ease-in-out',
)

/** Mounted titles each side of the one on screen: the neighbors, and the next ones in to slide after them. */
const TRACK_REACH = 2

/** `value` modulo `count`, never negative. */
const wrap = (value: number, count: number) => ((value % count) + count) % count

/**
 * How far slide `index` sits from `selected` round the loop, taking the short
 * way. A tie goes forward, so a slide 2 away out of 4 waits ahead.
 */
function loopOffset(index: number, selected: number, count: number) {
  const back = Math.ceil(count / 2) - 1
  return wrap(index - selected + back, count) - back
}

/**
 * The selected index as a position that counts on past the last campaign rather
 * than wrapping, so the titles keep moving the same way round the loop.
 */
function useLoopPosition(selected: number, count: number) {
  const [state, setState] = useState({ selected, position: selected })
  if (state.selected !== selected) {
    setState({ selected, position: state.position + loopOffset(selected, state.selected, count) })
  }
  return state.position
}

/**
 * The home's opening campaigns. Each title slides along a row of its neighbors
 * and fills with white over the timer, so it doubles as the progress bar.
 *
 * The cut-outs lie over the titles, so a neighbor passes behind the model, and
 * under the copy. A swipe or a drag anywhere outside the controls steps like the
 * arrows do, and every step restarts the timer rather than stopping it. Only
 * keyboard focus inside holds it.
 */
export function HeroSlider({ campaigns }: { campaigns: HeroCampaign[] }) {
  const [selected, setSelected] = useState(0)
  const handleSelect = useCallback((api: CarouselApi) => setSelected(api.selectedSnap()), [])
  // The other cut-outs wait for the first, so nothing competes with the page's largest paint.
  const [firstLoaded, setFirstLoaded] = useState(false)

  return (
    <section className="px-2 pb-2">
      <Carousel
        loop
        fade
        autoplay={campaigns.length > 1 && { delay: AUTOPLAY_DELAY_MS, pauseOnHover: false, defaultInteraction: false }}
        onSelect={handleSelect}
        aria-label="Featured collections"
        className={FRAME}
      >
        {campaigns.map((campaign, index) => (
          <Ground key={campaign.id} background={campaign.background} active={index === selected} />
        ))}

        <CarouselContent className="ms-0 h-full" viewportProps={{ className: 'absolute inset-0 z-1' }}>
          {campaigns.map((campaign, index) => (
            // The fade writes each slide's opacity inline, which only an important rule
            // outranks. Its opacity lags; the cut-out fades itself instead.
            <CarouselSlide key={campaign.id} className="relative h-full ps-0 opacity-100!">
              <Cutout
                campaign={campaign}
                offset={loopOffset(index, selected, campaigns.length)}
                first={index === 0}
                pictured={firstLoaded || index === 0 || index === selected}
                onLoad={index === 0 ? () => setFirstLoaded(true) : undefined}
              />
            </CarouselSlide>
          ))}
        </CarouselContent>

        <div className="container pt-10 sm:pt-14 lg:py-12">
          <div className={COLUMN}>
            <TitleTrack campaigns={campaigns} selected={selected} />
            <Copy campaigns={campaigns} selected={selected} />
          </div>
        </div>
        <div aria-hidden className={cn(STACKED_CUTOUT, 'lg:hidden')} />
      </Carousel>
    </section>
  )
}

/** One campaign's ground. The arriving one fades in on top while the one it replaces holds until covered. */
function Ground({ background, active }: { background: string; active: boolean }) {
  return (
    <div
      aria-hidden
      style={{ background }}
      className={cn(
        'absolute inset-0 motion-safe:transition-opacity motion-safe:duration-500 motion-safe:ease-out',
        active ? '-z-9' : '-z-10 opacity-0 motion-safe:delay-500',
      )}
    />
  )
}

interface CutoutProps {
  campaign: HeroCampaign
  /** Slides from the one on screen, from {@link loopOffset}. Sets the side it waits on. */
  offset: number
  /** Set on the first campaign, the page's largest paint. */
  first: boolean
  /** Whether its image is mounted yet. */
  pictured: boolean
  /** Called once the image has loaded. */
  onLoad?: () => void
}

/**
 * A campaign's cut-out on the frame's foot: centered while stacked, at the end
 * from `lg`. The box fades, quickly, and the image inside comes into focus as it
 * slides, at the titles' pace.
 */
function Cutout({ campaign, offset, first, pictured, onLoad }: CutoutProps) {
  const { image } = campaign

  return (
    <div
      className={cn(
        CUTOUT_BOX,
        CUTOUT_FADE,
        offset === 0 ? 'motion-safe:duration-300' : 'opacity-0 motion-safe:duration-150',
      )}
    >
      {pictured && (
        <Image
          src={image.src}
          alt={image.alt}
          fill
          preload={first}
          sizes={CUTOUT_SIZES}
          onLoad={onLoad}
          className={cn(
            'object-cover object-bottom',
            CUTOUT_GLIDE,
            offset !== 0 && 'blur-md',
            offset < 0 && '-translate-x-20 lg:-translate-x-32 rtl:translate-x-20 rtl:lg:translate-x-32',
            offset > 0 && 'translate-x-20 lg:translate-x-32 rtl:-translate-x-20 rtl:lg:-translate-x-32',
          )}
        />
      )}
    </div>
  )
}

/**
 * The row of titles. Each one is keyed by its position round the loop, so a
 * step slides the same elements along rather than swapping their text.
 */
function TitleTrack({ campaigns, selected }: { campaigns: HeroCampaign[]; selected: number }) {
  const count = campaigns.length
  const position = useLoopPosition(selected, count)

  // With 2 campaigns the other one only shows ahead, and with 1 there is no neighbor.
  const before = count > 2 ? 1 : 0
  const after = count > 1 ? 1 : 0
  const positions = Array.from({ length: TRACK_REACH * 2 + 1 }, (_, step) => position - TRACK_REACH + step)

  return (
    <div className={cn('grid', TRACK_ENTRANCE)}>
      {positions.map((at) => {
        const offset = at - position
        return (
          <TrackTitle
            key={at}
            campaign={campaigns[wrap(at, count)]}
            offset={offset}
            shown={offset >= -before && offset <= after}
          />
        )
      })}
    </div>
  )
}

interface TrackTitleProps {
  campaign: HeroCampaign
  /** Strides from the column. `0` is the campaign on screen. */
  offset: number
  /** Whether it is in view, as the campaign on screen or a neighbor. */
  shown: boolean
}

/** A campaign's eyebrow and title, dimmed beside the one on screen. */
function TrackTitle({ campaign, offset, shown }: TrackTitleProps) {
  const current = offset === 0
  const titleRef = useRef<HTMLParagraphElement>(null)
  const lineWidth = useTextWidth(titleRef)

  return (
    <div
      aria-hidden={!current || undefined}
      style={{ '--offset': offset } as CSSProperties}
      className={cn(
        'col-start-1 row-start-1',
        STRIDE_OFFSET,
        'motion-safe:transition-[translate,opacity] motion-safe:duration-800 motion-safe:ease-in-out',
        // A phone's column leaves only a sliver of each neighbor in the frame.
        !current && 'max-sm:opacity-0',
        !shown && 'opacity-0',
      )}
    >
      <Eyebrow
        className={cn(
          'flex items-center gap-2 motion-safe:transition-colors motion-safe:duration-800',
          current ? 'text-white/70' : 'text-white/40',
        )}
      >
        <span className="size-3 rounded-full bg-current" />
        {campaign.eyebrow}
      </Eyebrow>
      <p ref={titleRef} className="relative mt-6 leading-none text-white/40 uppercase md:mt-8 lg:mt-9">
        {campaign.title}
        <TitleFill current={current} width={lineWidth}>
          {campaign.title}
        </TitleFill>
      </p>
    </div>
  )
}

/**
 * The width of an element's longest line of text, read off its first child, so
 * a wipe across it ends with the words rather than with the box.
 */
function useTextWidth(ref: RefObject<HTMLElement | null>) {
  const [width, setWidth] = useState<number>()

  useLayoutEffect(() => {
    const element = ref.current
    const text = element?.firstChild
    if (!element || !text) return

    const range = document.createRange()
    range.selectNode(text)
    // The box resizes with the font, at a breakpoint or once the face loads.
    const observer = new ResizeObserver(() => setWidth(range.getBoundingClientRect().width))
    observer.observe(element)
    return () => observer.disconnect()
  }, [ref])

  return width
}

interface TitleFillProps {
  /** Whether its title is the one on screen. */
  current: boolean
  /** The title's longest line, which the fill covers exactly. The whole column until measured. */
  width?: number
  children: ReactNode
}

/**
 * The title in white over its dimmed copy, wiped on across the timer, or whole
 * while the timer is stopped or there is none. Leaving, it fades out as it
 * slides away.
 */
function TitleFill({ current, width, children }: TitleFillProps) {
  const { autoplay } = useCarousel()
  const counting = current && !!autoplay?.isPlaying

  return (
    <span
      aria-hidden
      // A pixel over the line it covers, so rounding never wraps it differently from the title under it.
      style={width ? { width: Math.ceil(width) + 1 } : undefined}
      className={cn(
        'absolute inset-y-0 inset-s-0 w-full text-white motion-safe:transition-opacity motion-safe:duration-500',
        !current && 'opacity-0',
      )}
    >
      {/* Remounted with each fresh timer, so the wipe sets off again with it. */}
      <Wipe key={current ? autoplay?.cycleId : 'idle'} counting={counting} duration={AUTOPLAY_DELAY_MS}>
        {children}
      </Wipe>
    </span>
  )
}

interface WipeProps {
  /** Whether to wipe on from empty, or show whole. */
  counting: boolean
  /** How long the wipe takes, in milliseconds. */
  duration: number
  children: ReactNode
}

/** Its text wiped on from the start edge after mounting. Remounting is what restarts it. */
function Wipe({ counting, duration, children }: WipeProps) {
  const [armed, setArmed] = useState(false)

  // 2 frames, so the empty state is painted before the wipe sets off from it.
  useEffect(() => {
    let second = 0
    const first = requestAnimationFrame(() => {
      second = requestAnimationFrame(() => setArmed(true))
    })
    return () => {
      cancelAnimationFrame(first)
      cancelAnimationFrame(second)
    }
  }, [])

  return (
    <span
      style={counting ? { transitionDuration: `${duration}ms` } : undefined}
      className={cn(
        'block motion-safe:transition-[clip-path]',
        counting ? 'ease-linear' : 'duration-500 ease-out',
        // The 2 insets are a mirrored pair: the wipe sets off from the start edge.
        counting && !armed && '[clip-path:inset(0_100%_0_0)] rtl:[clip-path:inset(0_0_0_100%)]',
        counting && armed && '[clip-path:inset(0)]',
        // Apart from the wipe's own end, so a wipe cut short finishes in this
        // short run rather than the timer's.
        !counting && '[clip-path:inset(-1px)]',
      )}
    >
      {children}
    </span>
  )
}

/** The copy's entrance, in from the end side out of a blur. `--glide-distance` matches {@link reveal}'s `translate-x-18`. */
const COPY_GLIDE = cn(
  'motion-safe:animate-glide-in [--glide-blur:var(--blur-sm)] [--glide-duration:600ms]',
  '[--glide-distance:4.5rem] rtl:[--glide-distance:-4.5rem]',
)

/**
 * Slides in from the end side out of a blur a beat after the cut-out, and leaves
 * toward the start faster, so 2 campaigns' copy never overlaps. `offset` is from
 * {@link loopOffset}.
 */
function reveal(offset: number) {
  return cn(
    COPY_GLIDE,
    '[--enter-delay:100ms] motion-safe:transition-[opacity,filter,translate] motion-safe:ease-out',
    offset === 0 && 'motion-safe:delay-(--enter-delay) motion-safe:duration-600',
    offset !== 0 && 'opacity-0 blur-sm motion-safe:duration-200',
    offset < 0 && '-translate-x-18 rtl:translate-x-18',
    offset > 0 && 'translate-x-18 rtl:-translate-x-18',
  )
}

/**
 * The campaign's line of copy, its call to action, and the arrows. Over the
 * cut-outs, and see-through to a drag everywhere but the controls.
 */
function Copy({ campaigns, selected }: { campaigns: HeroCampaign[]; selected: number }) {
  const campaign = campaigns[selected]
  const label = campaign.ctaLabel ?? DEFAULT_CTA

  return (
    <div className="pointer-events-none relative z-2 mt-6 font-sans text-base md:mt-8">
      {/* Stacked in 1 cell, so the longest sets the height and the controls never move. */}
      <div className="grid">
        {campaigns.map((entry, index) => {
          const offset = loopOffset(index, selected, campaigns.length)
          return (
            <p
              key={entry.id}
              aria-hidden={offset !== 0 || undefined}
              className={cn('col-start-1 row-start-1 max-w-91 text-pretty', reveal(offset))}
            >
              {entry.description}
            </p>
          )
        })}
      </div>

      {/* Plays its entrance on load only: the controls stay as the campaigns change. */}
      <div
        className={cn(
          'mt-6 flex items-center gap-3 *:pointer-events-auto md:mt-8',
          COPY_GLIDE,
          '[--enter-delay:200ms]',
        )}
      >
        <Link
          href={campaign.href}
          data-slot="button"
          className={cn(buttonVariants({ variant: 'primary', size: 'lg' }), 'dark')}
        >
          {label}
          <span className="sr-only">: {campaign.title}</span>
        </Link>
        {campaigns.length > 1 ? <Arrows /> : null}
      </div>
    </div>
  )
}

/** Previous and next, in the light style that reads on any ground. */
function Arrows() {
  return (
    <div className="flex gap-1">
      <CarouselPrev
        position="none"
        className={CARET_ARROW}
        render={<Button data-slot="button" variant="light" size="icon-lg" />}
      >
        <CaretSwap direction="back" />
      </CarouselPrev>
      <CarouselNext
        position="none"
        className={CARET_ARROW}
        render={<Button data-slot="button" variant="light" size="icon-lg" />}
      >
        <CaretSwap />
      </CarouselNext>
    </div>
  )
}
