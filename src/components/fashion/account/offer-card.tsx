'use client'

import Image from 'next/image'
import Link from 'next/link'
import { CircleCheck } from '@appica/icons-react'
import { Button, buttonVariants } from '@appica/ui-react/button'
import { CopyButton } from '@appica/ui-react/copy-button'
import { accountPath } from '@/components/account/account-paths'
import { Eyebrow } from '@/components/fashion/eyebrow'
import { TEXT_ACTION } from '@/components/fashion/text-action'
import { useOfferCode } from '@/components/rewards/use-offer-code'
import { formatDate } from '@/lib/commerce/format'
import type { Offer, OfferStatus } from '@/lib/rewards/offers'
import { cn } from '@/lib/utils'

interface OfferCardProps {
  offer: Offer
  status: OfferStatus
  /** Days left, for the line above the title. `undefined` where the offer never lapses or already has. */
  expiresInDays?: number
}

/**
 * One offer as a coupon: its photograph, what it takes off, and the code. A
 * live one goes straight onto the bag, so the shopper never retypes it; a spent
 * one names the order it went on, and a lapsed one keeps its code struck through.
 */
export function OfferCard({ offer, status, expiresInDays }: OfferCardProps) {
  const { applied, changed, apply, remove, pending, error } = useOfferCode(offer.code)
  const live = status === 'available'

  return (
    <article className="flex h-full gap-4 rounded-sm border p-3 sm:gap-5">
      <div className="bg-background-muted rounded-2xs relative aspect-4/5 w-24 shrink-0 self-start overflow-hidden sm:w-28">
        <Image
          src={offer.artwork.image.src}
          alt=""
          fill
          sizes="112px"
          className={cn('object-cover', !live && 'opacity-60 grayscale')}
        />
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-3 py-1 pe-1">
        <Eyebrow className="text-xs">{validity(offer, status, expiresInDays)}</Eyebrow>
        <div className="flex flex-col gap-1">
          <h3 className="text-foreground-intense text-lg font-medium text-balance">{offer.title}</h3>
          <p className="text-sm text-pretty">{offer.terms}</p>
        </div>

        <div className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-2">
          {status === 'used' && offer.usedOn ? (
            <p className="text-sm">
              Spent on{' '}
              <Link
                href={accountPath('fashion', `orders/${offer.usedOn}`)}
                className="text-foreground-intense outline-ring rounded-4xs underline hover:no-underline focus-visible:outline-2 focus-visible:outline-offset-2"
              >
                order {offer.usedOn}
              </Link>
            </p>
          ) : (
            <span className={cn('flex h-8 items-center gap-0.5 rounded-full border ps-3', live ? 'pe-0.5' : 'pe-3')}>
              <span className={cn('text-foreground-intense font-mono text-sm', !live && 'line-through')}>
                {offer.code}
              </span>
              {live ? (
                <CopyButton
                  value={offer.code}
                  variant="ghost"
                  size="icon-sm"
                  label={`Copy ${offer.code}`}
                  copiedLabel="Code copied"
                  className="before:hidden"
                />
              ) : null}
            </span>
          )}

          {live && applied ? (
            <p className="text-foreground-intense flex items-center gap-1.5 text-sm">
              <CircleCheck aria-hidden className="size-4" />
              On your bag
              <Button
                variant="ghost"
                size="sm"
                disabled={pending}
                focusableWhenDisabled
                className={cn(TEXT_ACTION, 'ms-1')}
                onClick={() => void remove()}
              >
                Take it off
              </Button>
            </p>
          ) : null}
          {live && !applied ? (
            <Button variant="outline" size="sm" disabled={pending} focusableWhenDisabled onClick={() => void apply()}>
              Apply to bag
            </Button>
          ) : null}
          {live ? (
            <Link
              href={`/catalog/${offer.categorySlug}`}
              data-slot="button"
              className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }), TEXT_ACTION)}
            >
              Shop the edit
            </Link>
          ) : null}
        </div>

        {/* Mounted while empty so a change is announced, and out of the flow until then. */}
        <p role="alert" className={error ? 'text-error-emphasis text-sm' : 'sr-only'}>
          {error}
        </p>
        <p role="status" aria-live="polite" className="sr-only">
          {changed && (applied ? `${offer.code} applied to your bag` : `${offer.code} taken off your bag`)}
        </p>
      </div>
    </article>
  )
}

/** The line a shopper scans an offer for: how long it has, or when it ended. */
function validity(offer: Offer, status: OfferStatus, expiresInDays?: number): string {
  if (status === 'used') return `Used ${formatDate(offer.usedAt ?? '')}`
  if (status === 'expired') return `Expired ${formatDate(offer.expiresAt ?? '')}`
  if (expiresInDays === undefined) return 'No end date'
  if (expiresInDays > 30) return `Valid until ${formatDate(offer.expiresAt ?? '')}`
  return `Ends in ${expiresInDays} ${expiresInDays === 1 ? 'day' : 'days'}`
}
