'use client'

import { type SubmitEvent, useState } from 'react'
import { revealFirstInvalidField } from '@/lib/form-errors'
import { validateEmail } from '@/lib/validation'

/*
 * What every newsletter form in the template does, minus how it looks. Each
 * storefront draws its own sign-up and they all validate, refuse, and confirm
 * alike.
 *
 * The submit goes nowhere: replace the branch marked below with a Server Action
 * calling your email provider, and every storefront picks it up.
 */

/** The confirmation every storefront shows, so the promise can't drift between them. */
export const NEWSLETTER_CONFIRMATION = 'Thanks for subscribing! Check your inbox to confirm.'

/** What {@link useNewsletterSignup} hands a form. */
export interface NewsletterSignup {
  /** The message on the email field, `undefined` while it passes. */
  error?: string
  /** Whether this form has taken an address. Stays true until the next failed submit. */
  subscribed: boolean
  /** Goes on the `<Form>`. The form needs a field named `email`. */
  handleSubmit: (event: SubmitEvent<HTMLFormElement>) => void
  /** Goes on the email `<Input>`. */
  revalidate: (event: React.ChangeEvent<HTMLInputElement>) => void
}

/**
 * State and validation for a newsletter sign-up, so a storefront's form is
 * markup and nothing else. A valid address resets the form and confirms; an
 * invalid one flags the field and `revealFirstInvalidField` points at it.
 */
export function useNewsletterSignup(): NewsletterSignup {
  const [error, setError] = useState<string>()
  const [subscribed, setSubscribed] = useState(false)

  /* Only once the field has been flagged, so the message clears as soon as the
     address is valid instead of lingering until the next submit. */
  const revalidate = (event: React.ChangeEvent<HTMLInputElement>) => {
    setError((previous) => (previous ? validateEmail(event.target.value) : undefined))
  }

  const handleSubmit = (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = event.currentTarget
    const message = validateEmail(String(new FormData(form).get('email') ?? ''))

    setError(message)
    setSubscribed(!message)
    if (message) {
      revealFirstInvalidField(form)
      return
    }

    // Where a real list is joined.
    form.reset()
  }

  return { error, subscribed, handleSubmit, revalidate }
}
