'use client'

import { Check } from '@appica/icons-react'
import { Button } from '@appica/ui-react/button'
import { Field, FieldError, FieldLabel } from '@appica/ui-react/field'
import { Form } from '@appica/ui-react/form'
import { Input } from '@appica/ui-react/input'
import { CaretSwap } from '@/components/fashion/caret-swap'
import { NEWSLETTER_CONFIRMATION, useNewsletterSignup } from '@/lib/newsletter'

/**
 * Newsletter sign-up, in the footer. Validation, the refusal, and the
 * confirmation are `useNewsletterSignup`, which is also where a real list is
 * wired up.
 */
export function NewsletterForm({ className }: { className?: string }) {
  const { error, subscribed, handleSubmit, revalidate } = useNewsletterSignup()

  return (
    <Form noValidate onSubmit={handleSubmit} className={className}>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:gap-1">
        <Field name="email" invalid={Boolean(error)} className="sm:max-w-108 sm:flex-1">
          <FieldLabel className="sr-only">Email</FieldLabel>
          <Input
            type="email"
            inputSize="lg"
            placeholder="Email"
            autoComplete="email"
            aria-required="true"
            onChange={revalidate}
          />
          <FieldError match={Boolean(error)}>{error}</FieldError>
        </Field>
        <Button type="submit" size="lg" className="group w-full sm:w-auto">
          Subscribe
          <CaretSwap data-icon="end" />
        </Button>
      </div>
      {/* Kept in the DOM even when empty so screen readers announce the
          confirmation the moment it appears. */}
      <div role="status" className="text-success-emphasis text-sm">
        {subscribed ? (
          <div className="mt-2 flex items-center gap-1.5">
            <Check aria-hidden strokeWidth={2} className="size-4" />
            {NEWSLETTER_CONFIRMATION}
          </div>
        ) : null}
      </div>
    </Form>
  )
}
