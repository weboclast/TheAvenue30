'use client'

import { useId, useState } from 'react'
import Image from 'next/image'
import { Button } from '@appica/ui-react/button'
import { Drawer, DrawerBody, DrawerContent, DrawerFooter, DrawerHeader, DrawerTitle } from '@appica/ui-react/drawer'
import { Field, FieldError, FieldLabel } from '@appica/ui-react/field'
import { Form } from '@appica/ui-react/form'
import { useDirection } from '@appica/ui-react/hooks/use-direction'
import { Input } from '@appica/ui-react/input'
import { Rating } from '@appica/ui-react/rating'
import { ScrollArea } from '@appica/ui-react/scroll-area'
import { Textarea } from '@appica/ui-react/textarea'
import { PillGroup, PillOption } from '@/components/fashion/pill-group'
import { ColorSquares } from '@/components/fashion/product/color-squares'
import { FIT_ANSWERS } from '@/components/fashion/product/fit-scale'
import { useProductSelection } from '@/components/fashion/product/product-selection'
import { MediaDropzone } from '@/components/media-dropzone'
import type { ReviewFit } from '@/lib/commerce/types'
import { MAX_REVIEW_BODY, MAX_REVIEW_TITLE } from '@/lib/reviews/reviews'
import { useReviewDraft } from '@/lib/reviews/use-review-draft'

/**
 * What the form submits: 1 review of the product on the page, with its photos
 * as `File` objects. Uploading them is the store's call, in the section's
 * `onReviewSubmit`.
 */
export interface ProductReviewDraft {
  /** The product reviewed, by slug. */
  productSlug: string
  /** Stars awarded, 1-5. */
  rating: number
  title: string
  body: string
  /** The color bought, by name. */
  color?: string
  /** The size bought, as labeled. */
  size?: string
  /** How it fit, -2 to 2. Left out when the reviewer skipped the question. */
  fit?: ReviewFit
  media: File[]
}

interface ReviewFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /**
   * Called with a valid review. Upload `media` and post it to the store's
   * reviews backend here; the drawer closes once this resolves.
   */
  onSubmit: (review: ProductReviewDraft) => void | Promise<void>
}

/**
 * Writing a review from the product page, for a shopper who is signed in. Next
 * to the stars and the words, it asks the 3 things that make a fashion review
 * useful to the next buyer: the size bought, the color, and how it fit.
 */
export function ReviewForm({ open, onOpenChange, onSubmit }: ReviewFormProps) {
  const rtl = useDirection() === 'rtl'

  return (
    <Drawer side={rtl ? 'left' : 'right'} open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="md:w-125" closeLabel="Close review form">
        {/* Mounted with the panel, so a closed form starts empty next time. */}
        <ReviewFields onOpenChange={onOpenChange} onSubmit={onSubmit} />
      </DrawerContent>
    </Drawer>
  )
}

function ReviewFields({ onOpenChange, onSubmit }: Omit<ReviewFormProps, 'open'>) {
  const { product, colorIndex: shownColor, sizes } = useProductSelection()
  const colors = product.colors ?? []
  const [fit, setFit] = useState<ReviewFit>()
  const [sizeId, setSizeId] = useState<string>()
  // Opens on the color the page is showing, the likeliest one bought.
  const [colorIndex, setColorIndex] = useState(shownColor)
  const [title, setTitle] = useState('')
  const [photos, setPhotos] = useState<File[]>([])
  const id = useId()

  const draft = useReviewDraft(async ({ rating, body }) => {
    await onSubmit({
      productSlug: product.slug,
      rating,
      title: title.trim(),
      body,
      color: colors[colorIndex]?.name,
      size: sizes.find((size) => size.id === sizeId)?.label,
      fit,
      media: photos,
    })
    onOpenChange(false)
  })

  return (
    <>
      <DrawerHeader className="pe-14">
        <DrawerTitle className="font-medium">Write a review</DrawerTitle>
        {/* Not a link: a way out is a way to lose a half-written review. */}
        <div className="mt-2 flex items-center gap-3">
          <div className="bg-background-muted rounded-3xs relative aspect-4/5 w-12 shrink-0 overflow-hidden">
            <Image src={product.media.image.src} alt="" fill sizes="48px" className="object-cover" />
          </div>
          <p className="text-foreground-intense">{product.title}</p>
        </div>
      </DrawerHeader>

      <Form noValidate onSubmit={draft.submit} className="contents">
        <DrawerBody className="overflow-hidden px-0">
          <ScrollArea className="h-full" scrollbarVisibility="auto">
            <div className="flex flex-col gap-6 px-6 pb-1">
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

              <div className="flex flex-col gap-2">
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

              {sizes.length ? (
                <div className="flex flex-col gap-2">
                  <p id={`${id}-size`} className="text-foreground-intense font-medium">
                    Size you bought
                  </p>
                  <PillGroup aria-labelledby={`${id}-size`} value={sizeId} onValueChange={setSizeId}>
                    {sizes.map((size) => (
                      <PillOption key={size.id} value={size.id} className="min-w-10">
                        {size.label}
                      </PillOption>
                    ))}
                  </PillGroup>
                </div>
              ) : null}

              {colors.length > 1 ? (
                <div className="flex flex-col gap-2">
                  <p id={`${id}-color`} className="text-foreground-intense font-medium">
                    Color: <span className="ms-1 font-normal">{colors[colorIndex].name}</span>
                  </p>
                  <ColorSquares
                    aria-labelledby={`${id}-color`}
                    colors={colors}
                    value={colorIndex}
                    onValueChange={setColorIndex}
                  />
                </div>
              ) : null}

              <Field name="review-title">
                <FieldLabel>Title</FieldLabel>
                <Input
                  variant="soft"
                  inputSize="lg"
                  maxLength={MAX_REVIEW_TITLE}
                  placeholder="Sum it up in a few words"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                />
              </Field>

              <Field name="review-body" invalid={Boolean(draft.errors.body)}>
                <FieldLabel>Your review</FieldLabel>
                <Textarea
                  variant="soft"
                  inputSize="lg"
                  rows={5}
                  maxLength={MAX_REVIEW_BODY}
                  aria-required="true"
                  placeholder="How it wears, how it washes, and who you would recommend it to…"
                  value={draft.body}
                  onChange={(event) => draft.changeBody(event.target.value)}
                />
                <FieldError match={Boolean(draft.errors.body)}>{draft.errors.body}</FieldError>
              </Field>

              <Field name="review-photos" className="gap-2">
                <FieldLabel>Photos</FieldLabel>
                <MediaDropzone kind="image" files={photos} onFilesChange={setPhotos} />
              </Field>
            </div>
          </ScrollArea>
        </DrawerBody>

        <DrawerFooter className="flex-row gap-3 pb-0">
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
