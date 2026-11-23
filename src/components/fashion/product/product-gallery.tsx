'use client'

import { type PointerEvent, type Ref, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import Image from 'next/image'
import { Plus } from '@appica/icons-react'
import { useMediaQuery } from '@appica/ui-react/hooks/use-media-query'
import { RAIL_BLEED } from '@/components/card-rail'
import { ProductFlag } from '@/components/fashion/product/product-flag'
import { useProductSelection } from '@/components/fashion/product/product-selection'
import { ProductGalleryOverlay } from '@/components/product/product-gallery-overlay'
import type { ProductMedia } from '@/lib/commerce/types'
import { cn } from '@/lib/utils'

/**
 * How the photographs lay out from `lg` up: `stack` is 1 column down the middle
 * of the page, `grid` goes 2 across from `xl`. Below `lg` both are a rail that
 * swipes sideways, so the buy box is never 5 photographs down on a phone.
 */
const LAYOUTS = {
  stack: {
    root: 'lg:grid-cols-1',
    sizes: '(min-width: 1200px) 34vw, (min-width: 1024px) 50vw, (min-width: 768px) 47vw, 90vw',
  },
  grid: {
    root: 'lg:grid-cols-1 xl:grid-cols-2',
    sizes: '(min-width: 1200px) 32vw, (min-width: 1024px) 46vw, (min-width: 768px) 47vw, 90vw',
  },
}

/** A device that points rather than taps, which gets the glass zoom cursor in place of its own. */
const FINE_POINTER = '(hover: hover) and (pointer: fine)'

/** Fashion's hover on a photograph, the same slow push-in as the campaign tiles. */
const PUSH_IN = 'transition-transform duration-700 ease-out motion-safe:group-hover:scale-[1.03]'

/** The model caption's glass, which the zoom cursor wears too. Each sets its own blur. */
const GLASS = 'border-background bg-background/60 text-foreground-intense border'

/** Every shot a color has, lead first. */
function shotsOf(media: ProductMedia) {
  return [media.image, ...(media.hoverImage ? [media.hoverImage] : []), ...media.gallery]
}

/**
 * The model line from the spec sheet, as a caption: "Is 179 cm tall and wears
 * size S" becomes "The model is 179 cm tall and wears **size S**".
 */
function ModelCaption({ line }: { line: string }) {
  const [lead, size] = line.split(/(size \S+)$/)

  return (
    <p
      className={cn(
        GLASS,
        'pointer-events-none absolute inset-x-2 bottom-2 rounded-sm px-4 py-3 text-center text-sm backdrop-blur-lg sm:px-6',
      )}
    >
      The model {lead.charAt(0).toLowerCase() + lead.slice(1)}
      {size ? <span className="font-semibold">{size}</span> : null}
    </p>
  )
}

/**
 * The zoom cursor: the caption's glass as a disc around a plus, forced light so
 * it stays the same over a dark theme's photographs. Portalled to the body,
 * where no transformed ancestor can offset a fixed element.
 */
function ZoomCursor({ ref, shown }: { ref: Ref<HTMLDivElement>; shown: boolean }) {
  return createPortal(
    <div
      ref={ref}
      aria-hidden
      className={cn(
        'light pointer-events-none fixed top-0 left-0 z-40 grid size-14 place-items-center rounded-full',
        GLASS,
        'backdrop-blur-sm transition-[opacity,scale] duration-200 ease-out motion-reduce:transition-none',
        shown ? 'opacity-100' : 'scale-75 opacity-0',
      )}
    >
      <Plus className="size-6" />
    </div>,
    document.body,
  )
}

interface ProductGalleryProps {
  layout: keyof typeof LAYOUTS
  className?: string
}

/**
 * The chosen color's photographs, each opening the set at full size in the
 * shared overlay. The first carries the flag and who is wearing it. An odd count
 * in the grid ends on a shot spanning both columns, letterboxed rather than
 * cropped, so the grid has no hole.
 */
export function ProductGallery({ layout, className }: ProductGalleryProps) {
  const { product, color, colorIndex, media } = useProductSelection()
  const [zoomed, setZoomed] = useState<number | null>(null)
  const finePointer = useMediaQuery(FINE_POINTER)
  const cursorRef = useRef<HTMLDivElement>(null)
  const [overShot, setOverShot] = useState(false)

  // Moved on the element itself, since a render per pointer move would trail the pointer.
  const track = (event: PointerEvent<HTMLButtonElement>) => {
    if (event.pointerType !== 'mouse') return
    cursorRef.current?.style.setProperty('translate', `calc(${event.clientX}px - 50%) calc(${event.clientY}px - 50%)`)
    setOverShot(true)
  }

  const shots = shotsOf(media)
  const title = color ? `${product.title}, ${color.name}` : product.title
  // The line describes whoever wears the first color.
  const model = colorIndex === 0 ? product.specSheet?.find((spec) => spec.id === 'model')?.value : undefined
  const spanLast = layout === 'grid' && shots.length % 2 === 1

  return (
    <>
      <div
        role="group"
        aria-label={title}
        data-slot="product-gallery"
        className={cn(
          RAIL_BLEED,
          'snap-x snap-mandatory scroll-px-4 sm:scroll-px-[calc((100%+2rem)/38+1rem)]',
          'lg:m-0 lg:grid lg:snap-none lg:overflow-visible lg:p-0',
          LAYOUTS[layout].root,
          className,
        )}
      >
        {shots.map((shot, index) => {
          const wide = spanLast && index === shots.length - 1

          return (
            <div
              key={shot.src}
              className={cn(
                'group bg-background-muted relative isolate aspect-4/5 w-9/10 shrink-0 snap-start overflow-hidden rounded-sm md:w-[47%] lg:w-auto',
                wide && 'xl:col-span-2 xl:aspect-8/5',
              )}
            >
              <button
                type="button"
                aria-label={`Zoom in on view ${index + 1} of ${shots.length}`}
                onClick={() => {
                  setOverShot(false)
                  setZoomed(index)
                }}
                onPointerEnter={track}
                onPointerMove={track}
                onPointerLeave={() => setOverShot(false)}
                className={cn(
                  'outline-ring absolute inset-0 rounded-[inherit] -outline-offset-2 focus-visible:outline-2',
                  finePointer ? 'cursor-none' : 'cursor-zoom-in',
                )}
              >
                <Image
                  src={shot.src}
                  alt={shot.alt}
                  fill
                  sizes={wide ? '64vw' : LAYOUTS[layout].sizes}
                  preload={index === 0}
                  className={cn('object-cover', wide && 'xl:object-contain', PUSH_IN)}
                />
              </button>
              {index === 0 ? (
                <>
                  {/* The card's size on a phone; from `sm`, where the photo outgrows a card, `md`'s height and padding. */}
                  <ProductFlag
                    badges={product.badges}
                    size="sm"
                    className="pointer-events-none absolute inset-s-2 top-2 sm:h-6 sm:px-2.5"
                  />
                  {model ? <ModelCaption line={model} /> : null}
                </>
              ) : null}
            </div>
          )
        })}
      </div>

      {finePointer ? <ZoomCursor ref={cursorRef} shown={overShot} /> : null}

      <ProductGalleryOverlay
        images={shots}
        startIndex={zoomed ?? 0}
        title={title}
        open={zoomed !== null}
        onClose={() => setZoomed(null)}
      />
    </>
  )
}
