'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { X } from '@appica/icons-react'
import { Button } from '@appica/ui-react/button'
import type { ProductImage } from '@/lib/commerce/types'
import { cn } from '@/lib/utils'

/** Vertical inset above and below the column, and the offset the opening scroll allows for. */
const OVERLAY_PADDING_Y = 16

interface ProductGalleryOverlayProps {
  images: ProductImage[]
  /** Index of the shot to open on, the one the gallery is showing. */
  startIndex: number
  title: string
  open: boolean
  /** Fired whenever the overlay closes, including on Escape. */
  onClose: () => void
}

/**
 * Every shot at full size, stacked in one scrolling column: what a product
 * gallery opens to zoom. It lands on the shot the shopper was looking at, so it
 * reads as a zoom rather than a new view.
 *
 * A native modal `<dialog>` supplies the focus trap, Escape to close, the top
 * layer, an inert page behind, and focus restored on close.
 */
export function ProductGalleryOverlay({ images, startIndex, title, open, onClose }: ProductGalleryOverlayProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  // The column waits for the first open, so full-size files are never fetched
  // for a shopper who does not ask, and stays after it, because unmounting on
  // close would leave an empty box to animate out. Set during render, so the
  // column is in the DOM by the time the effect below measures it.
  const [opened, setOpened] = useState(false)
  if (open && !opened) setOpened(true)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    if (!open) {
      if (dialog.open) dialog.close()
      return
    }

    if (!dialog.open) dialog.showModal()

    // The images carry their own dimensions, so the column is already the right
    // height and this offset is correct before a single file has arrived.
    const shots = dialog.querySelectorAll<HTMLElement>('[data-slot=product-gallery-overlay-shot]')
    dialog.scrollTop = shots[startIndex] ? shots[startIndex].offsetTop - OVERLAY_PADDING_Y : 0

    // A modal dialog makes the page behind it inert, but does not stop it
    // scrolling, so the overlay takes the scroll for as long as it is open.
    const { overflow } = document.documentElement.style
    document.documentElement.style.overflow = 'hidden'
    return () => {
      document.documentElement.style.overflow = overflow
    }
  }, [open, startIndex])

  return (
    <dialog
      ref={dialogRef}
      data-slot="product-gallery-overlay"
      aria-label={title}
      onClose={onClose}
      className={cn(
        'bg-background fixed inset-0 m-0 h-auto max-h-none w-auto max-w-none border-0 px-0 py-4',
        'overflow-y-auto overscroll-contain',
        // Closing animates only because `display` and `overlay` transition
        // discretely: without `transition-discrete` the element is gone before
        // the first frame. `@starting-style` supplies the "before" state on
        // open, which an element arriving from `display: none` otherwise lacks.
        'scale-98 opacity-0 blur-sm',
        'open:scale-100 open:opacity-100 open:blur-none',
        'starting:open:scale-98 starting:open:opacity-0 starting:open:blur-sm',
        'transition-[opacity,scale,filter,display,overlay] transition-discrete duration-250 ease-out',
        'motion-reduce:transition-none',
        // The dimmed page, which shows at the edges while the overlay is scaled down.
        'backdrop:bg-black/60 backdrop:opacity-0 open:backdrop:opacity-100 starting:open:backdrop:opacity-0',
        'backdrop:transition-[opacity,display,overlay] backdrop:transition-discrete backdrop:duration-250 backdrop:ease-out',
        'motion-reduce:backdrop:transition-none',
      )}
    >
      {opened ? (
        <>
          {/* Zero height, so the control pins to the top of the scroll without
              pushing the first shot down. Sticky rather than fixed: the overlay's
              own blur and scale would become the containing block and drag a
              fixed button along with the scroll. */}
          <div className="sticky top-0 z-10 flex h-0 items-start justify-end pe-4">
            <Button variant="outline" size="icon-md" aria-label="Close" onClick={() => dialogRef.current?.close()}>
              <X />
            </Button>
          </div>

          <div className="flex flex-col items-center gap-3">
            {images.map((image) => (
              <div
                key={image.src}
                data-slot="product-gallery-overlay-shot"
                className="w-full"
                // Never blown up past what the photographer supplied.
                style={{ maxWidth: image.width }}
              >
                <Image
                  src={image.src}
                  alt={image.alt}
                  width={image.width}
                  height={image.height}
                  sizes="100vw"
                  className="h-auto w-full rounded-lg sm:rounded-xl"
                />
              </div>
            ))}
          </div>
        </>
      ) : null}
    </dialog>
  )
}
