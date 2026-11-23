'use client'

import Image from 'next/image'
import { Button } from '@appica/ui-react/button'
import { Carousel, CarouselContent, CarouselNext, CarouselPrev, CarouselSlide } from '@appica/ui-react/carousel'
import { Drawer, DrawerBody, DrawerContent, DrawerHeader, DrawerTitle } from '@appica/ui-react/drawer'
import { useDirection } from '@appica/ui-react/hooks/use-direction'
import { Rating } from '@appica/ui-react/rating'
import { ScrollArea } from '@appica/ui-react/scroll-area'
import { CARET_ARROW, CaretSwap } from '@/components/fashion/caret-swap'
import { HelpfulToggle, ReviewByline, ReviewDetails } from '@/components/fashion/product/review-card'
import { WIDE_OVERLAY_WIDTH } from '@/components/overlay-sheet'
import { useHeldWhileClosing } from '@/components/use-held-while-closing'
import type { ProductReview, ProductReviewMedia } from '@/lib/commerce/types'
import { cn } from '@/lib/utils'

/*
 * The layout every drawer in the reviews section shares. `DrawerBody` hands its
 * padding and scrolling to a `ScrollArea`, and the inset moves onto the content
 * inside it, which keeps the scrollbar against the panel edge.
 */

/** Pinned header. The end padding clears the close button in that corner. */
export const DRAWER_HEADER = 'pe-14 md:p-8 md:pe-16 md:pb-6'

/** Pinned footer. */
export const DRAWER_FOOTER = 'md:p-8 md:pt-6'

/** The body, which owns neither the padding nor the scrolling. */
export const DRAWER_BODY = 'overflow-hidden px-0'

/** Goes on the content inside the `ScrollArea`, so the scrollbar keeps the edge. */
export const DRAWER_SCROLL_INSET = 'px-6 pb-1 md:px-8'

/** Widest a photo gets, `WIDE_OVERLAY_WIDTH` less the padding. */
const MEDIA_SIZES = '(min-width: 768px) 616px, 100vw'

/** Tallest a photo gets: the panel less its header, so the photo fits whole with the review's first line below. */
const MEDIA_MAX_HEIGHT = 'calc(100dvh - 14rem)'

interface ReviewDrawerProps {
  /** The review to show. `null` closes the panel. */
  review: ProductReview | null
  /** Which photo to open on. */
  startIndex?: number
  onOpenChange: (open: boolean) => void
  /** Wire to the store's review service. Receives the state being moved to. */
  onVoteHelpful?: (review: ProductReview, next: boolean) => void
}

/**
 * One review's photos at full size, then the words, then what it was written
 * from. Opened only from a card's photo, and owned by the section rather than
 * by each card.
 */
export function ReviewDrawer({
  review: opened,
  startIndex: openedAt = 0,
  onOpenChange,
  onVoteHelpful,
}: ReviewDrawerProps) {
  const rtl = useDirection() === 'rtl'
  const review = useHeldWhileClosing(opened, opened !== null)
  const startIndex = useHeldWhileClosing(openedAt, opened !== null)
  const media = review?.media ?? []

  return (
    <Drawer side={rtl ? 'left' : 'right'} open={opened !== null} onOpenChange={onOpenChange}>
      <DrawerContent className={WIDE_OVERLAY_WIDTH} closeLabel="Close review">
        {review ? (
          <>
            <DrawerHeader className={DRAWER_HEADER}>
              {/* The reviewer names the panel; there is no other heading. */}
              <DrawerTitle render={<ReviewByline review={review} />} />
              <Rating
                readOnly
                value={review.rating}
                size={16}
                className="gap-1"
                aria-label={`${review.rating} out of 5`}
              />
            </DrawerHeader>

            <DrawerBody className={DRAWER_BODY}>
              <ScrollArea className="h-full" scrollbarVisibility="auto">
                <div className={cn('flex flex-col gap-5', DRAWER_SCROLL_INSET)}>
                  {media.length > 1 ? (
                    // Keyed on the opening photo, since Embla reads `startSnap` once.
                    <Carousel
                      key={startIndex}
                      loop
                      autoHeight
                      startSnap={startIndex}
                      aria-label="Photos from this review"
                    >
                      <CarouselContent>
                        {media.map((item) => (
                          <CarouselSlide key={item.src}>
                            <ReviewPhoto media={item} />
                          </CarouselSlide>
                        ))}
                      </CarouselContent>
                      <CarouselPrev
                        position="outside-half"
                        className={CARET_ARROW}
                        render={<Button data-slot="button" variant="outline" size="icon-md" />}
                      >
                        <CaretSwap direction="back" />
                      </CarouselPrev>
                      <CarouselNext
                        position="outside-half"
                        className={CARET_ARROW}
                        render={<Button data-slot="button" variant="outline" size="icon-md" />}
                      >
                        <CaretSwap />
                      </CarouselNext>
                    </Carousel>
                  ) : (
                    media.map((item) => <ReviewPhoto key={item.src} media={item} />)
                  )}

                  <div className="flex flex-col gap-2">
                    {review.title ? (
                      <h3 className="text-foreground-intense text-lg font-medium">{review.title}</h3>
                    ) : null}
                    <p className="text-pretty">{review.body}</p>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <ReviewDetails review={review} />
                    <HelpfulToggle review={review} onVote={onVoteHelpful} className="ms-auto" />
                  </div>
                </div>
              </ScrollArea>
            </DrawerBody>
          </>
        ) : null}
      </DrawerContent>
    </Drawer>
  )
}

function ReviewPhoto({ media }: { media: ProductReviewMedia }) {
  return (
    <div className="flex justify-center">
      <Image
        src={media.src}
        alt={media.alt}
        width={media.width}
        height={media.height}
        sizes={MEDIA_SIZES}
        // Sized from the recorded shape: a file narrower than Next's widest source renders shrunk.
        style={{ width: `min(100%, ${MEDIA_MAX_HEIGHT} * ${media.width / media.height})` }}
        className="h-auto rounded-sm"
      />
    </div>
  )
}
