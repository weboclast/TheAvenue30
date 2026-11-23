'use client'

import { type SubmitEvent, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@appica/ui-react/button'
import { Field, FieldError, FieldLabel } from '@appica/ui-react/field'
import { Form } from '@appica/ui-react/form'
import { OTPField, OTPFieldInput } from '@appica/ui-react/otp-field'
import { revealFirstInvalidField } from '@/lib/form-errors'

const CODE_LENGTH = 6

interface VerifyOtpFormProps {
  /** Route to navigate to after a successful submit. */
  redirectTo?: string
}

/**
 * One-time code entry. Any complete code is accepted, since verification is the
 * commerce layer's to own; only the length is checked here.
 */
export function VerifyOtpForm({ redirectTo }: VerifyOtpFormProps) {
  const router = useRouter()
  const [code, setCode] = useState('')
  const [error, setError] = useState<string>()

  const handleSubmit = (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault()
    const next = code.length === CODE_LENGTH ? undefined : `Enter the ${CODE_LENGTH}-digit code`
    setError(next)
    if (next) {
      revealFirstInvalidField(event.currentTarget)
      return
    }

    // Demo flow only: a real store checks the code with its auth backend here.
    if (redirectTo) router.push(redirectTo)
  }

  return (
    <Form noValidate className="flex flex-col gap-6" onSubmit={handleSubmit}>
      <Field name="code" invalid={Boolean(error)}>
        <FieldLabel>Verification code</FieldLabel>
        <OTPField
          length={CODE_LENGTH}
          value={code}
          onValueChange={(value) => {
            setCode(value)
            setError(undefined)
          }}
          variant="soft"
          size="lg"
        >
          {Array.from({ length: CODE_LENGTH }, (_, index) => (
            <OTPFieldInput
              key={index}
              className="size-10 rounded-md sm:size-12 sm:rounded-lg"
              placeholder="•"
              aria-required="true"
              aria-invalid={Boolean(error) || undefined}
            />
          ))}
        </OTPField>
        <FieldError match={Boolean(error)}>{error}</FieldError>
      </Field>
      <div className="flex flex-col gap-4">
        <Button type="submit" size="lg" className="w-full">
          Verify code
        </Button>
        <p className="text-foreground text-center text-sm">
          Didn&apos;t receive it?{' '}
          <button
            type="button"
            className="text-foreground-intense cursor-pointer font-medium underline hover:no-underline"
            onClick={() => setCode('')}
          >
            Resend code
          </button>
        </p>
      </div>
    </Form>
  )
}
