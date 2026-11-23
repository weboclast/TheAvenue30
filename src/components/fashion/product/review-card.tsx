'use client'

import { useState } from 'react'
import Image from 'next/image'
import { CircleCheck, ThumbUp, ThumbUpFilled } from '@appica/icons-react'
import { Badge } from '@appica/ui-react/badge'
import { Button } from '@appica/ui-react/button'
import { Rating } from '@appica/ui-react/rating'
import { fitAnswer } from '@/components/fashion/product/fit-scale'
import { IconBurst, useIconBurst } from '@/components/icon-burst'
import { formatDate } from '@/lib/commerce/format'
import type { ProductReview } from '@/lib/commerce/types'
import { cn } from '@/lib/utils'

/** The reviewer, the store's check on them, and when they wrote. */
export function ReviewByline({ review }: { review: ProductReview }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <p className="text-foreground-intense flex min-w-0 items-center gap-1.5">
        <span className="truncate">{review.author}</span>
        {review.verified ? (
          <span title="Verified purchase" className="inline-flex shrink-0">
            <CircleCheck aria-hidden className="size-4.5" />
            <span className="sr-only">, verified purchase</span>
          </span>
        ) : null}
      </p>
      <p className="text-foreground-muted shrink-0 text-sm">{formatDate(review.date)}</p>
    </div>
  )
}

/** What the reviewer bought and how it fit, the line that makes a fashion review comparable. */
export function ReviewDetails({ review, className }: { review: ProductReview; className?: string }) {
  if (!review.size && !review.color && review.fit === undefined) return null

  return (
    <dl className={cn('flex flex-wrap items-center gap-x-4.5 gap-y-1 text-sm', className)}>
      {review.size ? <Detail label="Size">{review.size}</Detail> : null}
      {review.color ? <Detail label="Color">{review.color}</Detail> : null}
      {review.fit !== undefined ? (
        <Detail label="Fit">
          <Badge variant="outline" size="sm">
            {fitAnswer(review.fit)}
          </Badge>
        </Detail>
      ) : null}
    </dl>
  )
}

function Detail({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-1.5">
      <dt>{label}:</dt>
      <dd className="text-foreground-intense font-medium">{children}</dd>
    </div>
  )
}

interface HelpfulToggleProps {
  review: ProductReview
  /** Wire to the store's review service. Receives the state being moved to. */
  onVote?: (review: ProductReview, next: boolean) => void
  className?: string
}

/**
 * "Helpful" as a toggle carrying its own tally. The count moves so a vote
 * visibly lands, but nothing persists until `onVote` is wired.
 */
export function HelpfulToggle({ review, onVote, className }: HelpfulToggleProps) {
  const [voted, setVoted] = useState(false)
  const { bursting, burst } = useIconBurst()

  const vote = () => {
    const next = !voted
    setVoted(next)
    if (next) burst()
    onVote?.(review, next)
  }

  return (
    <Button variant="outline" size="sm" aria-pressed={voted} onClick={vote} className={className}>
      <span data-icon="start" className="relative grid shrink-0">
        {voted ? <ThumbUpFilled /> : <ThumbUp />}
        {bursting ? <IconBurst /> : null}
      </span>
      Helpful ({review.helpfulCount + (voted ? 1 : 0)})
    </Button>
  )
}

interface ReviewCardProps {
  review: ProductReview
  /** Opens the review's drawer on the photo at `index`. */
  onExpand: (review: ProductReview, index: number) => void
  onVote?: (review: ProductReview, next: boolean) => void
  className?: string
}

/**
 * One review in the list, in full: who, the stars, what they said, and the
 * size, color, and fit behind it, with the first photo beside the text counting
 * the rest. Only that photo opens the drawer.
 */
export function ReviewCard({ review, onExpand, onVote, className }: ReviewCardProps) {
  return (
    <article data-slot="product-review" className={cn('flex flex-col gap-2 py-6', className)}>
      <ReviewByline review={review} />
      <Rating readOnly value={review.rating} size={14} className="gap-1" aria-label={`${review.rating} out of 5`} />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:gap-4">
        <div className="flex min-w-0 flex-1 flex-col items-start gap-1.5">
          {review.title ? <h3 className="text-foreground-intense font-medium">{review.title}</h3> : null}
          <p className="text-pretty">{review.body}</p>
        </div>

        {review.media?.length ? (
          <button
            type="button"
            onClick={() => onExpand(review, 0)}
            aria-label={
              review.media.length > 1
                ? `See ${review.author}'s ${review.media.length} photos`
                : `See ${review.author}'s photo`
            }
            className={cn(
              'bg-background-muted outline-ring rounded-4xs relative size-16 shrink-0 cursor-pointer overflow-hidden',
              'transform-gpu focus-visible:outline-2 focus-visible:outline-offset-2',
              'transition-transform duration-250 ease-out motion-reduce:transition-none',
              'active:duration-100 active:ease-in-out motion-safe:active:translate-y-px motion-safe:active:scale-[0.98]',
            )}
          >
            <Image src={review.media[0].src} alt="" fill sizes="64px" className="object-cover" />
            {review.media.length > 1 ? (
              <Badge
                variant="light"
                size="sm"
                aria-hidden
                className="pointer-events-none absolute top-1/2 left-1/2 -translate-1/2"
              >
                +{review.media.length - 1}
              </Badge>
            ) : null}
          </button>
        ) : null}
      </div>

      <div className="mt-1 flex flex-wrap items-center justify-between gap-3">
        <ReviewDetails review={review} />
        <HelpfulToggle review={review} onVote={onVote} className="ms-auto" />
      </div>
    </article>
  )
}
