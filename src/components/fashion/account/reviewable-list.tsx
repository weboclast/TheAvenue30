'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Badge } from '@appica/ui-react/badge'
import { Button } from '@appica/ui-react/button'
import { useToastManager } from '@appica/ui-react/toast'
import { REWARDS } from '@/lib/commerce/programs/rewards'
import { formatPoints } from '@/lib/rewards/ledger'
import type { ReviewablePurchase } from '@/lib/reviews/reviews'
import { successToast } from '@/lib/toast'
import { cn } from '@/lib/utils'
import { ReviewDrawer } from './review-drawer'

/**
 * What the shopper has received and not written about yet, 1 row per piece,
 * and the drawer the rows open. Nothing is submitted anywhere: wire the
 * drawer's `onReviewSubmit` to your reviews backend. See `lib/reviews/AGENTS.md`.
 */
export function ReviewableList({ purchases, className }: { purchases: ReviewablePurchase[]; className?: string }) {
  const [reviewing, setReviewing] = useState<ReviewablePurchase | null>(null)
  const toast = useToastManager()

  if (purchases.length === 0) {
    return (
      <p className={cn('border-border-strong rounded-sm border border-dashed px-6 py-12 text-center', className)}>
        Nothing is waiting on a review. We ask again once your next order arrives.
      </p>
    )
  }

  return (
    <>
      <ul className={cn('divide-y border-y', className)}>
        {purchases.map(({ order, line }) => (
          <li key={`${order.number}:${line.id}`} className="flex items-center gap-4 py-5 sm:gap-6">
            {/* Hidden from assistive tech: the title beside it is the same link. */}
            <Link
              href={line.href}
              aria-hidden
              tabIndex={-1}
              className="group bg-background-muted rounded-2xs relative aspect-4/5 w-16 shrink-0 overflow-hidden sm:w-20"
            >
              <Image
                src={line.image.src}
                alt=""
                fill
                sizes="80px"
                className="object-cover transition-transform duration-700 ease-out motion-safe:group-hover:scale-[1.03] motion-reduce:transition-none"
              />
            </Link>

            <div className="flex min-w-0 flex-1 flex-col items-start gap-1.5">
              <Badge variant="outline" size="sm">
                +{formatPoints(REWARDS.reviewPoints)}
              </Badge>
              <Link
                href={line.href}
                className="text-foreground-intense outline-ring rounded-4xs line-clamp-2 focus-visible:outline-2 focus-visible:outline-offset-2"
              >
                {line.title}
              </Link>
              {line.options?.length ? (
                <p className="text-sm">
                  {line.options.map((option) => `${option.label}: ${option.value}`).join(' · ')}
                </p>
              ) : null}
            </div>

            <Button variant="outline" size="sm" className="shrink-0" onClick={() => setReviewing({ order, line })}>
              <span className="sm:hidden">Review</span>
              <span className="max-sm:hidden">Write a review</span>
            </Button>
          </li>
        ))}
      </ul>

      <ReviewDrawer
        order={reviewing?.order ?? null}
        lineId={reviewing?.line.id}
        onOpenChange={(open) => {
          if (!open) setReviewing(null)
        }}
        onReviewSubmit={() => {
          toast.add(
            successToast(
              'Thanks for the review',
              `${formatPoints(REWARDS.reviewPoints)} land on your balance once it is published.`,
            ),
          )
        }}
      />
    </>
  )
}
