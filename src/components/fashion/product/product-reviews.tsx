'use client'

import { useId, useState } from 'react'
import { PencilStar } from '@appica/icons-react'
import { Button } from '@appica/ui-react/button'
import { Checkbox } from '@appica/ui-react/checkbox'
import { CheckboxGroup } from '@appica/ui-react/checkbox-group'
import {
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from '@appica/ui-react/drawer'
import { useDirection } from '@appica/ui-react/hooks/use-direction'
import { Rating } from '@appica/ui-react/rating'
import { ScrollArea } from '@appica/ui-react/scroll-area'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@appica/ui-react/select'
import { Switch } from '@appica/ui-react/switch'
import { useToastManager } from '@appica/ui-react/toast'
import { SignInDrawer } from '@/components/auth/sign-in-drawer'
import { CaretSwap } from '@/components/fashion/caret-swap'
import { FitScale } from '@/components/fashion/product/fit-scale'
import { useProductSelection } from '@/components/fashion/product/product-selection'
import { ReviewCard } from '@/components/fashion/product/review-card'
import {
  DRAWER_BODY,
  DRAWER_HEADER,
  DRAWER_SCROLL_INSET,
  ReviewDrawer,
} from '@/components/fashion/product/review-drawer'
import type { ProductReviewDraft } from '@/components/fashion/product/review-form'
import { ReviewSummary } from '@/components/fashion/product/review-summary'
import { StickyColumn } from '@/components/sticky-column'
import { InfoPopover } from '@/components/info-popover'
import { WIDE_OVERLAY_WIDTH } from '@/components/overlay-sheet'
import { useReviewBrowser } from '@/components/product/use-review-browser'
import { useLazyPanel } from '@/components/use-lazy-panel'
import {
  MIN_REFINABLE_REVIEWS,
  type ProductReviewSort,
  RATING_BUCKETS,
  REVIEW_SORT_LABELS,
} from '@/lib/commerce/review-refinement'
import type { ProductReview, ProductReviewList } from '@/lib/commerce/types'
import { successToast } from '@/lib/toast'
import { cn } from '@/lib/utils'

/** The anchor the rating above the title scrolls to. Exported so the two can't drift apart. */
export const REVIEWS_ANCHOR = 'reviews'

/** Reviews listed on the page before the rest move behind "All reviews". */
const VISIBLE_REVIEWS = 4

interface ProductReviewsProps {
  /** The product's reviews, the fit they add up to, and the assistant's read on them. */
  list: ProductReviewList
  /** Whether a shopper is signed in: "Write a review" opens the form for one, and sign-in for anyone else. */
  signedIn: boolean
  /**
   * Called with a finished review. Upload its photos and post it to the store's
   * reviews backend here. Left out, the form validates and thanks the shopper
   * without sending anything.
   */
  onReviewSubmit?: (review: ProductReviewDraft) => void | Promise<void>
  /** Wire to the store's review service. Receives the state being moved to. */
  onVoteHelpful?: (review: ProductReview, next: boolean) => void
  /** Called when a shopper rates the summary, for stores that log it. */
  onSummaryFeedback?: (helpful: boolean) => void
}

/** The review form's code, loaded after the page: it brings a media picker only a reviewer needs. */
const loadReviewForm = () => import('@/components/fashion/product/review-form').then((module) => module.ReviewForm)

/**
 * The product page's reviews: the rating, where the fit lands, and the
 * assistant's summary on one side; the reviews, refinable, on the other.
 *
 * Sorting and filtering run on the whole set in the browser, through
 * `useReviewBrowser`. A product nobody has reviewed renders nothing, and the
 * rating link above the title goes with it.
 */
export function ProductReviews({
  list,
  signedIn,
  onReviewSubmit,
  onVoteHelpful,
  onSummaryFeedback,
}: ProductReviewsProps) {
  const rtl = useDirection() === 'rtl'
  const { product } = useProductSelection()
  const [writing, setWriting] = useState(false)
  const { Panel: ReviewForm, whenLoaded: whenFormLoaded } = useLazyPanel(loadReviewForm)
  const startWriting = () => whenFormLoaded(() => setWriting(true))
  const toast = useToastManager()
  const filterId = useId()

  const { reviews, rating, fit, summary } = list
  const {
    sort,
    setSort,
    buckets,
    setBuckets,
    verifiedOnly,
    setVerifiedOnly,
    refined,
    reset,
    allOpen,
    setAllOpen,
    expanded,
    expand,
    closeExpanded,
  } = useReviewBrowser(reviews)

  const submit = async (review: ProductReviewDraft) => {
    await onReviewSubmit?.(review)
    toast.add(
      successToast('Thanks for your review', 'We publish reviews once we have read them, usually within 2 days.'),
    )
  }

  if (!reviews.length) return null

  // Built here rather than passed down from the page, where a trigger would lose its props.
  const writeButton = signedIn ? (
    <Button className="w-fit" onClick={startWriting}>
      <PencilStar data-icon="start" />
      Write a review
    </Button>
  ) : (
    <SignInDrawer
      createAccountVariant="soft"
      registerVariant="primary"
      logo={false}
      onSignedIn={startWriting}
      trigger={
        // Triggers rename the slot; this takes it back for `globals.css`.
        <Button data-slot="button" className="w-fit">
          <PencilStar data-icon="start" />
          Write a review
        </Button>
      }
    />
  )

  // A function, since the page and the drawer each render one and an id can't repeat.
  const toolbar = (where: 'page' | 'drawer') => {
    // The drawer's row reaches into the end padding only the title needs for the
    // close button, and tightens, so it holds 1 line in the panel's width.
    const compact = where === 'drawer'

    return (
      <div
        data-slot="review-toolbar"
        className={cn('flex flex-wrap items-center justify-between gap-x-6 gap-y-3 text-sm', compact && '-me-8')}
      >
        <div className={cn('flex flex-wrap items-center gap-x-6 gap-y-3', compact && 'gap-x-4')}>
          <Select
            value={sort}
            onValueChange={(next) => setSort(next as ProductReviewSort)}
            items={REVIEW_SORT_LABELS}
            alignItemWithTrigger={false}
          >
            <SelectTrigger aria-label="Sort reviews" className={compact ? 'w-38' : 'w-44'}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="whitespace-nowrap">
              {Object.entries(REVIEW_SORT_LABELS).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <label className="flex cursor-pointer items-center gap-2">
            Only verified
            <Switch checked={verifiedOnly} onCheckedChange={setVerifiedOnly} />
          </label>
        </div>

        <CheckboxGroup
          value={buckets}
          onValueChange={setBuckets}
          orientation="horizontal"
          aria-labelledby={`${filterId}-${where}`}
          className={cn('flex flex-wrap items-center gap-x-4 gap-y-2', compact && 'gap-x-3')}
        >
          <span id={`${filterId}-${where}`} className="sr-only">
            Filter by rating
          </span>
          {RATING_BUCKETS.map((bucket) => (
            <label key={bucket.value} className="flex cursor-pointer items-center gap-2">
              <Checkbox name={bucket.value} />
              <span className="flex items-center gap-1">
                {bucket.label}
                <Rating readOnly count={1} value={1} size={14} aria-label="stars" />
              </span>
            </label>
          ))}
        </CheckboxGroup>
      </div>
    )
  }

  return (
    <section
      id={REVIEWS_ANCHOR}
      data-slot="product-reviews"
      className="container scroll-mt-8 pb-16 md:pb-20 lg:scroll-mt-10 xl:pb-24"
    >
      <h2 className="sr-only">Reviews</h2>

      <div className="grid gap-10 lg:grid-cols-12 lg:gap-x-6">
        {/* Pins where a jump to the anchor lands: the header bar's 3.5rem plus the section's `scroll-mt`. */}
        <StickyColumn className="flex flex-col gap-6 lg:sticky lg:col-span-5 lg:self-start lg:pe-10 lg:[--sticky-top:6rem] xl:pe-12">
          <div className="flex flex-col gap-0.5">
            <div className="flex items-center gap-3">
              <span aria-hidden className="text-foreground-intense text-5xl font-medium">
                {rating.value}
              </span>
              <Rating readOnly value={rating.value} step={0.5} size={18} aria-label={`${rating.value} out of 5`} />
            </div>
            <p className="text-foreground-strong flex items-center gap-1 text-sm">
              Based on {rating.count} {rating.count === 1 ? 'review' : 'reviews'}
              <InfoPopover label="How reviews work">
                Anyone who bought from us can review. A check mark means we matched the review to an order, and we
                publish every rating, good or bad.
              </InfoPopover>
            </p>
          </div>

          {fit ? <FitScale fit={fit} variant="labeled" /> : null}
          {summary ? <ReviewSummary summary={summary} fit={fit} onFeedback={onSummaryFeedback} /> : null}
          {writeButton}
        </StickyColumn>

        <div className="flex min-w-0 flex-col lg:col-span-7 lg:col-start-6">
          {reviews.length >= MIN_REFINABLE_REVIEWS ? toolbar('page') : null}

          {refined.length === 0 ? (
            <NoMatches onReset={reset} className="mt-6" />
          ) : (
            <div className="divide-border flex flex-col divide-y">
              {refined.slice(0, VISIBLE_REVIEWS).map((review) => (
                <ReviewCard
                  key={review.id}
                  review={review}
                  onExpand={(next, index) => expand(next, index)}
                  onVote={onVoteHelpful}
                />
              ))}
            </div>
          )}

          {refined.length > VISIBLE_REVIEWS ? (
            <Button variant="outline" className="group mt-4 w-fit" onClick={() => setAllOpen(true)}>
              All reviews
              <CaretSwap data-icon="end" />
            </Button>
          ) : null}
        </div>
      </div>

      <Drawer side={rtl ? 'left' : 'right'} open={allOpen} onOpenChange={setAllOpen}>
        <DrawerContent className={WIDE_OVERLAY_WIDTH} closeLabel="Close reviews">
          <DrawerHeader className={DRAWER_HEADER}>
            <DrawerTitle className="font-medium">Reviews</DrawerTitle>
            <DrawerDescription className="text-base">
              All {reviews.length} reviews of the {product.title}.
            </DrawerDescription>
            {reviews.length >= MIN_REFINABLE_REVIEWS ? <div className="mt-2">{toolbar('drawer')}</div> : null}
          </DrawerHeader>

          <DrawerBody className={DRAWER_BODY}>
            <ScrollArea className="h-full" scrollbarVisibility="auto">
              <div className={cn('divide-border flex flex-col divide-y', DRAWER_SCROLL_INSET)}>
                {refined.length === 0 ? <NoMatches onReset={reset} /> : null}
                {refined.map((review) => (
                  <ReviewCard
                    key={review.id}
                    review={review}
                    onExpand={(next, index) => expand(next, index, true)}
                    onVote={onVoteHelpful}
                    className="first:pt-0"
                  />
                ))}
              </div>
            </ScrollArea>
          </DrawerBody>
        </DrawerContent>
      </Drawer>

      <ReviewDrawer
        review={expanded?.review ?? null}
        startIndex={expanded?.index ?? 0}
        onOpenChange={(open) => !open && closeExpanded()}
        onVoteHelpful={onVoteHelpful}
      />

      {ReviewForm && <ReviewForm open={writing} onOpenChange={setWriting} onSubmit={submit} />}
    </section>
  )
}

/** What the list shows when a refinement matched nothing. The reset saves hunting for the checkbox that did it. */
function NoMatches({ onReset, className }: { onReset: () => void; className?: string }) {
  return (
    <div
      className={cn(
        'border-border-strong flex flex-col items-center gap-3 rounded-sm border border-dashed px-6 py-14 text-center',
        className,
      )}
    >
      <p className="text-foreground-muted text-pretty">No reviews match these filters.</p>
      <Button variant="outline" size="sm" onClick={onReset}>
        Reset filters
      </Button>
    </div>
  )
}
