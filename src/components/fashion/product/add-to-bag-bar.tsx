'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { ShoppingBagPlus } from '@appica/icons-react'
import { Button } from '@appica/ui-react/button'
import { useMediaQuery } from '@appica/ui-react/hooks/use-media-query'
import { useProductSelection } from '@/components/fashion/product/product-selection'
import { useBuyBarHeight } from '@/components/use-buy-bar-height'
import { Price } from '@/components/price'
import { cn } from '@/lib/utils'

/** The header bar's `h-14`, which covers the top of the viewport once pinned. */
const HEADER_HEIGHT = 56

/**
 * Stretches an observer's root past one edge, so it reports which side of a
 * line an element is on. A jump (an anchor, the End key) can carry an element
 * past the screen without ever crossing it.
 */
const BEYOND = '100000px'

/** From `sm`, where the bar has room for the large button. Keep in step with `--breakpoint-sm` in `globals.css`. */
const LARGE_BUTTON = '(min-width: 31.25rem)'

/**
 * The product's add to bag, kept in reach once the buy box's own button has
 * scrolled away: the photograph, the name, the color and size chosen, and the
 * same button, disabled until a size is picked. It sits at the bottom, clear of
 * the columns pinned under the header, and leaves as the page's end comes up.
 *
 * Mount it once, at the end of the page's content: where it renders is where it stops.
 */
export function AddToBagBar() {
  const { product, color, size, sizes, media, canAddToBag, addToBag, pending, addButtonRef } = useProductSelection()
  // The bar is off screen on first paint, so the server's guess never shows.
  const largeButton = useMediaQuery(LARGE_BUTTON, { defaultValue: true })
  const [passed, setPassed] = useState(false)
  const [atEnd, setAtEnd] = useState(false)
  const endRef = useRef<HTMLDivElement>(null)
  const barRef = useRef<HTMLDivElement>(null)

  const open = passed && !atEnd

  useEffect(() => {
    const button = addButtonRef.current
    const end = endRef.current
    if (!button || !end) return

    // Passed once above the header's lower edge; reached once above the bottom one.
    const buttonObserver = new IntersectionObserver(([entry]) => setPassed(!entry.isIntersecting), {
      rootMargin: `-${HEADER_HEIGHT}px 0px ${BEYOND} 0px`,
    })
    const endObserver = new IntersectionObserver(([entry]) => setAtEnd(entry.isIntersecting), {
      rootMargin: `${BEYOND} 0px 0px 0px`,
    })
    buttonObserver.observe(button)
    endObserver.observe(end)

    return () => {
      buttonObserver.disconnect()
      endObserver.disconnect()
    }
  }, [addButtonRef])

  useBuyBarHeight(barRef, open)

  const chosen = [color?.name, size ? `Size ${size.label}` : sizes.length ? 'Pick a size' : null].filter(Boolean)

  return (
    <>
      <div ref={endRef} aria-hidden />
      <section
        aria-label={`Buy ${product.title}`}
        // Kept mounted so leaving is animated too, and out of the page while away.
        inert={!open || undefined}
        className="pointer-events-none fixed inset-x-0 bottom-0 z-30"
      >
        <div
          ref={barRef}
          data-slot="add-to-bag-bar"
          className={cn(
            'bg-background/80 border-border pointer-events-auto border-t pb-[env(safe-area-inset-bottom)] backdrop-blur-xl',
            'transition-transform duration-400 ease-[cubic-bezier(0.32,0.72,0,1)] motion-reduce:transition-none',
            open ? 'translate-y-0' : 'translate-y-full',
          )}
        >
          <div className="container flex h-18 items-center gap-3 sm:h-20 sm:gap-4">
            <div className="bg-background-muted rounded-3xs relative aspect-4/5 w-10 shrink-0 overflow-hidden sm:w-12">
              <Image src={media.image.src} alt="" fill sizes="48px" className="object-cover" />
            </div>

            <div className="flex min-w-0 flex-1 flex-col">
              <p className="text-foreground-intense truncate">{product.title}</p>
              <p className="text-foreground-muted truncate text-sm max-sm:hidden">{chosen.join(' · ')}</p>
              <Price
                money={product.price}
                scaleFraction={false}
                className="text-foreground-intense font-mono text-sm font-medium sm:hidden"
              />
            </div>

            <Price
              money={product.price}
              scaleFraction={false}
              className="text-foreground-intense font-mono font-medium max-sm:hidden"
            />
            <Button
              size={largeButton ? 'lg' : 'md'}
              disabled={pending || !canAddToBag}
              focusableWhenDisabled
              onClick={() => void addToBag()}
              className="shrink-0 sm:min-w-56"
            >
              <ShoppingBagPlus data-icon="start" />
              Add to bag
            </Button>
          </div>
        </div>
      </section>
    </>
  )
}
