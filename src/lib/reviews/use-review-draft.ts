'use client'

import { type SubmitEvent, useId, useState } from 'react'
import { revealFirstInvalidField } from '@/lib/form-errors'
import { validateReview } from './reviews'

/**
 * What every review form shares: the stars, the words, what is wrong with them,
 * and a submit that checks both before `send` runs. A form keeps its own extras
 * (photos, fit, the color bought), adds them in `send`, and closes itself there.
 */
export function useReviewDraft(send: (review: { rating: number; body: string }) => void | Promise<void>) {
  const [rating, setRating] = useState(0)
  const [body, setBody] = useState('')
  const [errors, setErrors] = useState<ReturnType<typeof validateReview>>({})
  const [sending, setSending] = useState(false)
  const ratingId = useId()

  return {
    rating,
    body,
    errors,
    /** True while `send` runs, so the submit button cannot be pressed twice. */
    sending,
    /**
     * Names and describes the stars, which `Field` does only for a control of its
     * own: spread `label` on the `FieldLabel`, `error` on the `FieldError`, and
     * `control` on `Rating`.
     */
    ratingField: {
      label: { id: `${ratingId}-label` },
      error: { id: `${ratingId}-error` },
      control: {
        'aria-labelledby': `${ratingId}-label`,
        'aria-describedby': errors.rating ? `${ratingId}-error` : undefined,
        'aria-invalid': errors.rating ? true : undefined,
        'aria-required': true,
      },
    },
    changeRating: (next: number) => {
      setRating(next)
      setErrors((previous) => ({ ...previous, rating: undefined }))
    },
    changeBody: (next: string) => {
      setBody(next)
      // Only once flagged, so no message on the first keystroke.
      if (errors.body) setErrors((previous) => ({ ...previous, body: validateReview(rating, next).body }))
    },
    submit: async (event: SubmitEvent<HTMLFormElement>) => {
      event.preventDefault()

      const next = validateReview(rating, body)
      setErrors(next)
      if (next.rating || next.body) {
        revealFirstInvalidField(event.currentTarget)
        return
      }

      setSending(true)
      try {
        await send({ rating, body: body.trim() })
      } finally {
        setSending(false)
      }
    },
  }
}
