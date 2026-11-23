'use client'

import { type ComponentProps, type SubmitEvent, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { AlertTriangleFilled } from '@appica/icons-react'
import { Alert, AlertDescription, AlertIcon, AlertTitle } from '@appica/ui-react/alert'
import { Button } from '@appica/ui-react/button'
import { Field, FieldError, FieldLabel } from '@appica/ui-react/field'
import { Form } from '@appica/ui-react/form'
import { Input } from '@appica/ui-react/input'
import { Spinner } from '@appica/ui-react/spinner'
import type { FieldVariant } from '@/components/address-fields'
import { revealFirstInvalidField } from '@/lib/form-errors'
import { trackOrderAction } from '@/lib/orders/actions'
import type { DemoSlug } from '@/lib/demos'
import { cn } from '@/lib/utils'
import { validateEmail, validateRequired } from '@/lib/validation'
import { orderTrackingPath } from './order-paths'

interface TrackOrderFormProps {
  /** The storefront the order was placed in. */
  demo: DemoSlug
  /** Prefills the order number, e.g. from a link in the shipping email. */
  defaultNumber?: string
  /** Prefills the email the order was placed with. */
  defaultEmail?: string
  /**
   * The input look the storefront draws its forms in.
   * @default 'soft'
   */
  fieldVariant?: FieldVariant
  /**
   * The spinner the storefront draws while something loads.
   * @default 'circular'
   */
  spinnerVariant?: ComponentProps<typeof Spinner>['variant']
  className?: string
}

/**
 * Guest order lookup. The email is not politeness: order numbers run in sequence
 * and the screen behind this shows an address, a phone number, and what somebody
 * bought. See `lib/orders/AGENTS.md`.
 *
 * Navigates on success rather than rendering the order, so a shopper has a URL
 * to come back to.
 */
export function TrackOrderForm({
  demo,
  defaultNumber,
  defaultEmail,
  fieldVariant = 'soft',
  spinnerVariant,
  className,
}: TrackOrderFormProps) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [errors, setErrors] = useState<{ number?: string; email?: string }>({})
  const [failure, setFailure] = useState<string>()

  // Only once a field has been flagged. Without this the form deadlocks: `Form`
  // refuses to submit while a field is marked invalid, and submitting is what
  // would have cleared the mark.
  const revalidate = (field: 'number' | 'email', value: string) => {
    setErrors((previous) => {
      if (!previous[field]) return previous
      return { ...previous, [field]: check(field, value) }
    })
  }

  const handleSubmit = (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    const number = String(data.get('order-number') ?? '').trim()
    const email = String(data.get('email') ?? '').trim()

    // Again in the action, because a Server Action is a public endpoint.
    const next = { number: check('number', number), email: check('email', email) }
    setErrors(next)
    setFailure(undefined)
    if (next.number || next.email) {
      revealFirstInvalidField(event.currentTarget)
      return
    }

    startTransition(async () => {
      const result = await trackOrderAction(demo, number, email)
      if (!result.ok) {
        setFailure(result.error)
        return
      }
      router.push(orderTrackingPath(demo, result.number))
    })
  }

  return (
    <Form noValidate className={cn('flex w-full flex-col gap-5 text-start', className)} onSubmit={handleSubmit}>
      {failure ? (
        <Alert variant="error" role="alert">
          <AlertIcon>
            <AlertTriangleFilled />
          </AlertIcon>
          {/* A lone description sits in the grid row below the icon. */}
          <AlertTitle as="div">Order not found</AlertTitle>
          <AlertDescription>{failure}</AlertDescription>
        </Alert>
      ) : null}

      <Field name="order-number" invalid={Boolean(errors.number)}>
        <FieldLabel>Order number</FieldLabel>
        <Input
          variant={fieldVariant}
          inputSize="lg"
          placeholder="e.g. APC-058291"
          autoComplete="off"
          aria-required="true"
          defaultValue={defaultNumber}
          onChange={(event) => revalidate('number', event.target.value)}
        />
        <FieldError match={Boolean(errors.number)}>{errors.number}</FieldError>
      </Field>

      <Field name="email" invalid={Boolean(errors.email)}>
        <FieldLabel>Email address</FieldLabel>
        <Input
          type="email"
          variant={fieldVariant}
          inputSize="lg"
          autoComplete="email"
          aria-required="true"
          defaultValue={defaultEmail}
          onChange={(event) => revalidate('email', event.target.value)}
        />
        <FieldError match={Boolean(errors.email)}>{errors.email}</FieldError>
      </Field>

      <Button type="submit" size="lg" className="w-full" disabled={pending} focusableWhenDisabled>
        {pending ? <Spinner variant={spinnerVariant} currentColor data-icon="start" className="text-[1.2em]" /> : null}
        Check status
      </Button>
    </Form>
  )
}

/** What is wrong with one field, or `undefined`. The action runs the same 2 checks. */
function check(field: 'number' | 'email', value: string): string | undefined {
  return field === 'number' ? validateRequired(value, 'Order number') : validateEmail(value)
}
