'use client'

import { type ChangeEvent, type SubmitEvent, useEffect, useRef, useState } from 'react'
import { BellCheck, BellRinging } from '@appica/icons-react'
import { Button } from '@appica/ui-react/button'
import { Field, FieldError, FieldLabel } from '@appica/ui-react/field'
import { Form } from '@appica/ui-react/form'
import { Input } from '@appica/ui-react/input'
import type { FieldVariant } from '@/components/address-fields'
import { revealFirstInvalidField } from '@/lib/form-errors'
import { validateEmail } from '@/lib/validation'
import type { Product } from '@/lib/commerce/types'
import { cn } from '@/lib/utils'

interface ProductStockAlertProps {
  product: Product
  /** Wire to the store's back-in-stock list. Rejecting leaves the form open with its address intact. */
  onSubscribe?: (product: Product, email: string) => void | Promise<void>
  /**
   * The email field's variant, to match the store's other forms.
   * @default 'outline'
   */
  fieldVariant?: FieldVariant
  className?: string
}

/**
 * What stands in for the buy buttons while a product is out of stock: a
 * back-in-stock alert.
 *
 * A disabled "add to cart" tells a shopper the trip was wasted and leaves them
 * nothing to do, which is the one thing an unbuyable page must not do. Asking
 * for an address turns the visit into a lead the store can close later, and it
 * is the pattern every major retailer settled on.
 *
 * Signing up retires the form for good rather than clearing it after a moment:
 * an alert is 1 commitment per product, and an input offered back invites a
 * shopper to sign up twice. The heading and its line carry the outcome, so
 * they live in a `role="status"` that is mounted from the start and only
 * changes what it says.
 *
 * The expected date, when the store has one, is on the line above rather than
 * repeated here.
 */
export function ProductStockAlert({ product, onSubscribe, fieldVariant, className }: ProductStockAlertProps) {
  const [error, setError] = useState<string>()
  const [subscribedTo, setSubscribedTo] = useState<string>()
  const heading = useRef<HTMLHeadingElement>(null)

  // The form, and the button that held focus, are gone once the address is in.
  useEffect(() => {
    if (subscribedTo) heading.current?.focus({ preventScroll: true })
  }, [subscribedTo])

  const revalidate = (event: ChangeEvent<HTMLInputElement>) => {
    setError((previous) => (previous ? validateEmail(event.target.value) : undefined))
  }

  const handleSubmit = async (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault()
    const email = String(new FormData(event.currentTarget).get('email') ?? '').trim()
    const message = validateEmail(email)

    setError(message)
    if (message) {
      revealFirstInvalidField(event.currentTarget)
      return
    }

    await onSubscribe?.(product, email)
    setSubscribedTo(email)
  }

  return (
    <section
      data-slot="product-stock-alert"
      className={cn('bg-background-muted flex flex-col gap-3 rounded-lg p-5', className)}
    >
      <div role="status" className="flex flex-col gap-1.5">
        <h2
          ref={heading}
          tabIndex={-1}
          className="text-foreground-intense flex items-center gap-3 font-medium outline-none"
        >
          {subscribedTo ? (
            <BellCheck className="text-success-emphasis size-5.5" />
          ) : (
            <BellRinging className="text-foreground-intense size-5.5" />
          )}
          {subscribedTo ? 'You’re on the list' : 'Email me when it’s back'}
        </h2>
        <p className="text-foreground text-sm">
          {subscribedTo ? (
            <>
              We will email <span className="text-foreground-intense font-medium">{subscribedTo}</span> the moment this
              is back in stock.
            </>
          ) : (
            'One message, sent the moment this is back in stock. Nothing else.'
          )}
        </p>
      </div>

      {subscribedTo ? null : (
        <Form noValidate onSubmit={handleSubmit} className="flex items-start gap-2">
          <Field name="email" invalid={Boolean(error)} className="flex-1">
            <FieldLabel className="sr-only">Email</FieldLabel>
            <Input
              type="email"
              variant={fieldVariant}
              inputSize="lg"
              placeholder="Your email"
              autoComplete="email"
              aria-required="true"
              onChange={revalidate}
              className="bg-background"
            />
            <FieldError match={Boolean(error)}>{error}</FieldError>
          </Field>
          <Button type="submit" size="lg" className="shrink-0">
            Notify me
          </Button>
        </Form>
      )}
    </section>
  )
}
