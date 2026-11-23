import Image from 'next/image'
import Link from 'next/link'
import { Badge } from '@appica/ui-react/badge'
import { Rating } from '@appica/ui-react/rating'
import { accountPath } from '@/components/account/account-paths'
import { fitAnswer } from '@/components/fashion/product/fit-scale'
import { formatDate } from '@/lib/commerce/format'
import { formatPoints } from '@/lib/rewards/ledger'
import type { ShopperReview } from '@/lib/reviews/reviews'
import { cn } from '@/lib/utils'

/**
 * The reviews this shopper has written, each in full: there is nothing behind a
 * row to open. One still being checked says so where the points would be.
 */
export function WrittenReviews({ reviews, className }: { reviews: ShopperReview[]; className?: string }) {
  if (reviews.length === 0) {
    return (
      <p className={cn('border-border-strong rounded-sm border border-dashed px-6 py-12 text-center', className)}>
        You have not written a review yet. They help the next shopper choose a size.
      </p>
    )
  }

  return (
    <ul className={cn('divide-y border-y', className)}>
      {reviews.map((review) => (
        <li key={review.id} className="flex gap-4 py-6 sm:gap-6">
          {/* Hidden from assistive tech: the title beside it is the same link. */}
          <Link
            href={review.line.href}
            aria-hidden
            tabIndex={-1}
            className="group bg-background-muted rounded-2xs relative aspect-4/5 w-16 shrink-0 self-start overflow-hidden sm:w-20"
          >
            <Image
              src={review.line.image.src}
              alt=""
              fill
              sizes="80px"
              className="object-cover transition-transform duration-700 ease-out motion-safe:group-hover:scale-[1.03] motion-reduce:transition-none"
            />
          </Link>

          <div className="flex min-w-0 flex-1 flex-col items-start gap-3">
            <div className="flex w-full flex-wrap items-center justify-between gap-x-4 gap-y-2">
              <Link
                href={review.line.href}
                className="text-foreground-intense outline-ring rounded-4xs line-clamp-2 focus-visible:outline-2 focus-visible:outline-offset-2"
              >
                {review.line.title}
              </Link>
              {review.points ? (
                <Badge variant="outline" size="sm">
                  +{formatPoints(review.points)}
                </Badge>
              ) : (
                <Badge variant="soft" size="sm">
                  Not published yet
                </Badge>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
              <Rating
                readOnly
                value={review.rating}
                size={14}
                className="gap-1"
                aria-label={`You rated it ${review.rating} out of 5`}
              />
              {review.fit !== undefined ? <span className="text-sm">Fit: {fitAnswer(review.fit)}</span> : null}
            </div>

            <div className="flex flex-col gap-1">
              {review.title ? <p className="text-foreground-intense font-medium">{review.title}</p> : null}
              <p className="text-pretty">{review.body}</p>
            </div>

            <p className="text-sm">
              {formatDate(review.writtenAt)},{' '}
              <Link
                href={accountPath('fashion', `orders/${review.orderNumber}`)}
                className="text-foreground-intense outline-ring rounded-4xs underline hover:no-underline focus-visible:outline-2 focus-visible:outline-offset-2"
              >
                order {review.orderNumber}
              </Link>
            </p>
          </div>
        </li>
      ))}
    </ul>
  )
}
