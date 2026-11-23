'use client'

import { type SubmitEvent, useState } from 'react'
import { Button } from '@appica/ui-react/button'
import { Field, FieldError, FieldLabel } from '@appica/ui-react/field'
import { Form } from '@appica/ui-react/form'
import { Input } from '@appica/ui-react/input'
import { revealFirstInvalidField } from '@/lib/form-errors'
import { validateEmail } from '@/lib/validation'

interface ForgotPasswordFormProps {
  /** Rendered below the submit button, e.g. a "Remembered your password?" switch. */
  footer?: React.ReactNode
  /** Called with the submitted email when the demo validation passes. */
  onSuccess?: (email: string) => void
}

/** The reset-request fields shared by the forgot-password drawer and the /forgot-password page. */
export function ForgotPasswordForm({ footer, onSuccess }: ForgotPasswordFormProps) {
  const [error, setError] = useState<string>()

  /* Re-validate on keystroke only once the field was flagged invalid. */
  const revalidate = (event: React.ChangeEvent<HTMLInputElement>) => {
    setError((previous) => (previous ? validateEmail(event.target.value) : undefined))
  }

  const handleSubmit = (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault()
    const email = String(new FormData(event.currentTarget).get('email') ?? '').trim()
    const next = validateEmail(email)
    setError(next)
    if (next) {
      revealFirstInvalidField(event.currentTarget)
      return
    }

    // Demo flow only: a real store asks its auth backend to send the reset link here.
    onSuccess?.(email)
  }

  return (
    <Form noValidate className="flex flex-col gap-6" onSubmit={handleSubmit}>
      <Field name="email" invalid={Boolean(error)}>
        <FieldLabel>Email</FieldLabel>
        <Input
          type="email"
          autoComplete="email"
          aria-required="true"
          variant="soft"
          inputSize="lg"
          onChange={revalidate}
        />
        <FieldError match={Boolean(error)}>{error}</FieldError>
      </Field>
      <div className="flex flex-col gap-4">
        <Button type="submit" size="lg" className="w-full">
          Send reset link
        </Button>
        {footer}
      </div>
    </Form>
  )
}
