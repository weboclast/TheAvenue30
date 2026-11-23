'use client'

import { useId, useState } from 'react'
import Image from 'next/image'
import { Badge } from '@appica/ui-react/badge'
import { Button } from '@appica/ui-react/button'
import { Checkbox } from '@appica/ui-react/checkbox'
import { Drawer, DrawerBody, DrawerContent, DrawerFooter, DrawerHeader, DrawerTitle } from '@appica/ui-react/drawer'
import { Field, FieldError, FieldLabel } from '@appica/ui-react/field'
import { Form } from '@appica/ui-react/form'
import { useDirection } from '@appica/ui-react/hooks/use-direction'
import { Input } from '@appica/ui-react/input'
import { Radio } from '@appica/ui-react/radio'
import { RadioGroup } from '@appica/ui-react/radio-group'
import { Rating } from '@appica/ui-react/rating'
import { ScrollArea } from '@appica/ui-react/scroll-area'
import { Textarea } from '@appica/ui-react/textarea'
import { PillGroup, PillOption } from '@/components/fashion/pill-group'
import { FIT_ANSWERS } from '@/components/fashion/product/fit-scale'
import { MediaDropzone } from '@/components/media-dropzone'
import { useHeldWhileClosing } from '@/components/use-held-while-closing'
import { REWARDS } from '@/lib/commerce/programs/rewards'
import type { CartLine, Order, ReviewFit } from '@/lib/commerce/types'
import { formatPoints } from '@/lib/rewards/ledger'
import { MAX_REVIEW_BODY, MAX_REVIEW_TITLE, type ReviewDraft } from '@/lib/reviews/reviews'
import { useReviewDraft } from '@/lib/reviews/use-review-draft'

interface ReviewDrawerProps {
  /** The delivered order being reviewed. `null` closes the drawer. */
  order: Order | null
  /** The line under review, by its `CartLine.id`. Left out, the shopper picks from the order. */
  lineId?: string
  onOpenChange: (open: boolean) => void
  /**
   * Called with a valid review. Upload `media` and post it to your reviews
   * backend here; the drawer closes once this resolves.
   */
  onReviewSubmit?: (review: ReviewDraft) => void | Promise<void>
}

/**
 * Reviewing a piece from a delivered order. Beside the stars and the words it
 * asks how it fit, which is what makes a clothing review useful to the next
 * buyer; the size and color are the order's, so it never asks for them.
 */
export function ReviewDrawer({ order, lineId, onOpenChange, onReviewSubmit }: ReviewDrawerProps) {
  const rtl = useDirection() === 'rtl'
  const shown = useHeldWhileClosing(order, order !== null)
  const shownLine = useHeldWhileClosing(lineId, order !== null)

  return (
    <Drawer side={rtl ? 'left' : 'right'} open={order !== null} onOpenChange={onOpenChange}>
      <DrawerContent className="w-115" closeLabel="Close review">
        {/* Keyed on what is being reviewed, so a second piece opens on an empty form. */}
        {shown ? (
          <ReviewForm
            key={`${shown.number}:${shownLine ?? ''}`}
            order={shown}
            lineId={shownLine}
            onOpenChange={onOpenChange}
            onReviewSubmit={onReviewSubmit}
          />
        ) : null}
      </DrawerContent>
    </Drawer>
  )
}

function ReviewForm({ order, lineId: reviewing, onOpenChange, onReviewSubmit }: ReviewDrawerProps & { order: Order }) {
  const id = useId()
  const lines = reviewing ? order.lines.filter((line) => line.id === reviewing) : order.lines
  const [lineId, setLineId] = useState(lines[0]?.id ?? '')
  const [fit, setFit] = useState<ReviewFit>()
  const [title, setTitle] = useState('')
  const [photos, setPhotos] = useState<File[]>([])
  const [notify, setNotify] = useState(false)

  const line = lines.find((candidate) => candidate.id === lineId) ?? lines[0]

  const draft = useReviewDraft(async ({ rating, body }) => {
    await onReviewSubmit?.({
      orderNumber: order.number,
      lineId: line.id,
      rating,
      ...(title.trim() && { title: title.trim() }),
      body,
      ...(fit !== undefined && { fit }),
      media: photos,
      notifyOnReplies: notify,
    })
    onOpenChange(false)
  })

  return (
    <>
      <DrawerHeader className="pe-14">
        <DrawerTitle className="font-medium">Write a review</DrawerTitle>
      </DrawerHeader>

      <Form noValidate onSubmit={draft.submit} className="contents">
        <DrawerBody className="overflow-hidden px-0">
          <ScrollArea className="h-full" scrollbarVisibility="auto">
            <div className="flex flex-col gap-8 px-6 py-1">
              {lines.length > 1 ? (
                <div className="flex flex-col gap-3">
                  <p id={`${id}-piece`} className="text-foreground-intense font-medium">
                    Which piece are you reviewing?
                  </p>
                  <RadioGroup
                    aria-labelledby={`${id}-piece`}
                    value={lineId}
                    onValueChange={(next) => setLineId(String(next))}
                    className="flex flex-col gap-4"
                  >
                    {lines.map((candidate) => (
                      <label key={candidate.id} className="flex cursor-pointer items-center gap-4">
                        <Radio value={candidate.id} />
                        <ReviewedPiece line={candidate} />
                      </label>
                    ))}
                  </RadioGroup>
                </div>
              ) : (
                <div className="flex flex-col items-start gap-3">
                  <Badge variant="outline" size="sm">
                    +{formatPoints(REWARDS.reviewPoints)} once published
                  </Badge>
                  <ReviewedPiece line={line} />
                </div>
              )}

              <Field name="rating" invalid={Boolean(draft.errors.rating)} className="gap-2">
                <FieldLabel {...draft.ratingField.label}>Rating</FieldLabel>
                <Rating
                  {...draft.ratingField.control}
                  value={draft.rating}
                  onValueChange={draft.changeRating}
                  itemAriaLabel={(value, count) => `${value} out of ${count} stars`}
                />
                <FieldError {...draft.ratingField.error} match={Boolean(draft.errors.rating)}>
                  {draft.errors.rating}
                </FieldError>
              </Field>

              <div className="flex flex-col gap-3">
                <p id={`${id}-fit`} className="text-foreground-intense font-medium">
                  How did it fit?
                </p>
                <PillGroup
                  aria-labelledby={`${id}-fit`}
                  value={fit === undefined ? undefined : String(fit)}
                  onValueChange={(next) => setFit(Number(next) as ReviewFit)}
                >
                  {FIT_ANSWERS.map(({ value, label }) => (
                    <PillOption key={value} value={String(value)}>
                      {label}
                    </PillOption>
                  ))}
                </PillGroup>
              </div>

              <Field name="review-title">
                <FieldLabel>Title</FieldLabel>
                <Input
                  variant="outline"
                  inputSize="lg"
                  maxLength={MAX_REVIEW_TITLE}
                  placeholder="Sum it up in a few words"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                />
              </Field>

              <div className="flex flex-col gap-3">
                <Field name="review-body" invalid={Boolean(draft.errors.body)}>
                  <FieldLabel>Your review</FieldLabel>
                  <Textarea
                    variant="outline"
                    inputSize="lg"
                    rows={5}
                    maxLength={MAX_REVIEW_BODY}
                    aria-required="true"
                    placeholder="How it wears, how it washes, and who you would recommend it to"
                    value={draft.body}
                    onChange={(event) => draft.changeBody(event.target.value)}
                  />
                  <FieldError match={Boolean(draft.errors.body)}>{draft.errors.body}</FieldError>
                </Field>

                <label className="text-foreground-intense flex w-fit cursor-pointer items-center gap-2 text-sm">
                  <Checkbox checked={notify} onCheckedChange={(next) => setNotify(Boolean(next))} />
                  Email me when someone replies
                </label>
              </div>

              <Field name="review-photos" className="gap-2">
                <FieldLabel>Photos</FieldLabel>
                <MediaDropzone kind="image" files={photos} onFilesChange={setPhotos} />
              </Field>
            </div>
          </ScrollArea>
        </DrawerBody>

        <DrawerFooter className="flex-row gap-3">
          <Button type="button" variant="outline" size="lg" className="flex-1" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="submit" size="lg" className="flex-1" disabled={draft.sending} focusableWhenDisabled>
            {draft.sending ? 'Sending…' : 'Post review'}
          </Button>
        </DrawerFooter>
      </Form>
    </>
  )
}

/**
 * The piece a review is about, as it was bought. Deliberately not a link: a way
 * out is a way to lose a half-written review.
 */
function ReviewedPiece({ line }: { line: CartLine }) {
  return (
    <span className="flex min-w-0 flex-1 items-center gap-4">
      <span className="bg-background-muted rounded-2xs relative aspect-4/5 w-14 shrink-0 overflow-hidden">
        <Image src={line.image.src} alt="" fill sizes="56px" className="object-cover" />
      </span>
      <span className="flex min-w-0 flex-col gap-1">
        <span className="text-foreground-intense line-clamp-2">{line.title}</span>
        {line.options?.length ? (
          <span className="text-sm">
            {line.options.map((option) => `${option.label}: ${option.value}`).join(' · ')}
          </span>
        ) : null}
      </span>
    </span>
  )
}
