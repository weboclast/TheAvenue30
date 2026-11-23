'use client'

import { type SubmitEvent, useId, useState, useTransition } from 'react'
import { CircleXFilled } from '@appica/icons-react'
import { Alert, AlertIcon, AlertTitle } from '@appica/ui-react/alert'
import { Button } from '@appica/ui-react/button'
import { Field, FieldError, FieldLabel } from '@appica/ui-react/field'
import { Form } from '@appica/ui-react/form'
import { Switch } from '@appica/ui-react/switch'
import { useToastManager } from '@appica/ui-react/toast'
import type { FieldVariant } from '@/components/address-fields'
import { PasswordField } from '@/components/password-field'
import { changePasswordAction } from '@/lib/auth/actions'
import { revealFirstInvalidField } from '@/lib/form-errors'
import { setTwoFactorAction } from '@/lib/profile/actions'
import { errorToast, successToast } from '@/lib/toast'
import { validatePassword } from '@/lib/validation'

interface AccountSecurityProps {
  /** Whether a second factor is asked for at sign-in. */
  twoFactor: boolean
  /** Whether the auth adapter can swap a password. The form is left out where it cannot. */
  canChangePassword: boolean
  /** How the password fields are drawn. @default 'soft' */
  fieldVariant?: FieldVariant
}

/**
 * The 2 things that guard an account: the password, and whether a second factor
 * is asked for.
 *
 * **The switch records a flag and nothing else.** Enrolling a second factor
 * means an authenticator secret and backup codes, which belong to the auth
 * backend: open that flow from here and call the action once it succeeds.
 */
export function AccountSecurity({ twoFactor, canChangePassword, fieldVariant = 'soft' }: AccountSecurityProps) {
  const [enabled, setEnabled] = useState(twoFactor)
  const [working, startTransition] = useTransition()
  const toast = useToastManager()
  const heading = useId()

  const toggle = (on: boolean) =>
    startTransition(async () => {
      const result = await setTwoFactorAction(on)
      if (!result.ok) {
        toast.add(errorToast('Could not change that', result.error))
        return
      }

      setEnabled(result.profile.twoFactor)
    })

  return (
    <section aria-labelledby={heading} className="flex flex-col gap-3 pt-4">
      <h2 id={heading} className="text-foreground-intense text-xl font-medium">
        Security
      </h2>

      {canChangePassword ? <ChangePassword fieldVariant={fieldVariant} /> : null}

      <label
        data-slot="account-rule"
        className="border-border-strong flex items-center justify-between gap-4 border-b border-dashed py-5 select-none"
      >
        <span className="flex min-w-0 flex-col">
          <span data-slot="account-title" className="text-foreground-intense font-medium">
            Two-factor authentication
          </span>
          <span className="text-foreground-muted text-sm">
            Ask for a code from your phone as well as your password, so a stolen password is not enough.
          </span>
        </span>
        <Switch checked={enabled} disabled={working} onCheckedChange={toggle} className="mt-1" />
      </label>
    </section>
  )
}

interface FormValues {
  current: string
  next: string
  confirm: string
}

const EMPTY: FormValues = { current: '', next: '', confirm: '' }

type FormErrors = Partial<Record<keyof FormValues, string>>

/** The checks that run before the round-trip. Whether the current password is right is the adapter's answer. */
function validate({ current, next, confirm }: FormValues): FormErrors {
  return {
    current: current ? undefined : 'Enter your current password',
    next: validatePassword(next),
    confirm: confirm === next ? undefined : 'Both passwords have to match',
  }
}

/**
 * Choosing a new password, here on the page rather than behind the reset mail in
 * `(auth)/`. The shopper is already signed in, so the current password is what
 * proves it is them, and the adapter is what compares it.
 */
function ChangePassword({ fieldVariant }: { fieldVariant: FieldVariant }) {
  const toast = useToastManager()
  const [pending, startTransition] = useTransition()

  const [values, setValues] = useState<FormValues>(EMPTY)
  const [errors, setErrors] = useState<FormErrors>({})
  const [refused, setRefused] = useState<string>()

  /* Re-validate on keystroke only once a field was flagged invalid. */
  const change = (patch: Partial<FormValues>) => {
    const merged = { ...values, ...patch }
    setValues(merged)
    setErrors((previous) => (Object.values(previous).some(Boolean) ? validate(merged) : previous))
  }

  const handleSubmit = (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault()

    const found = validate(values)
    setErrors(found)
    setRefused(undefined)
    if (Object.values(found).some(Boolean)) {
      revealFirstInvalidField(event.currentTarget)
      return
    }

    startTransition(async () => {
      const result = await changePasswordAction({ current: values.current, next: values.next })
      if (!result.ok) {
        setRefused(result.error)
        return
      }

      setValues(EMPTY)
      toast.add(successToast('Password changed', 'Use the new one next time you sign in.'))
    })
  }

  return (
    <div data-slot="account-panel" className="bg-background-muted flex flex-col gap-2 rounded-xl p-2">
      <div className="flex flex-col gap-0.5 px-2 py-1">
        <h3 data-slot="account-title" className="text-foreground-intense font-medium">
          Password
        </h3>
        <p className="text-foreground-muted text-sm">
          Change it whenever you like, and straight away if you have signed in somewhere you did not mean to.
        </p>
      </div>

      <Form
        noValidate
        onSubmit={handleSubmit}
        data-slot="account-panel-item"
        className="bg-background flex flex-col gap-4 rounded-lg p-4"
      >
        {refused ? (
          <Alert variant="error" role="alert">
            <AlertIcon>
              <CircleXFilled />
            </AlertIcon>
            <AlertTitle as="div" className="text-sm font-normal">
              {refused}
            </AlertTitle>
          </Alert>
        ) : null}

        <Field name="current" invalid={Boolean(errors.current)}>
          <FieldLabel>Current password</FieldLabel>
          <PasswordField
            autoComplete="current-password"
            aria-required="true"
            variant={fieldVariant}
            inputSize="lg"
            value={values.current}
            onChange={(event) => change({ current: event.target.value })}
          />
          <FieldError match={Boolean(errors.current)}>{errors.current}</FieldError>
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field name="next" invalid={Boolean(errors.next)}>
            <FieldLabel>New password</FieldLabel>
            <PasswordField
              autoComplete="new-password"
              aria-required="true"
              variant={fieldVariant}
              inputSize="lg"
              strength
              value={values.next}
              onChange={(event) => change({ next: event.target.value })}
            />
            <FieldError match={Boolean(errors.next)}>{errors.next}</FieldError>
          </Field>

          <Field name="confirm" invalid={Boolean(errors.confirm)}>
            <FieldLabel>Confirm new password</FieldLabel>
            <PasswordField
              autoComplete="new-password"
              aria-required="true"
              variant={fieldVariant}
              inputSize="lg"
              value={values.confirm}
              onChange={(event) => change({ confirm: event.target.value })}
            />
            <FieldError match={Boolean(errors.confirm)}>{errors.confirm}</FieldError>
          </Field>
        </div>

        <Button type="submit" disabled={pending} focusableWhenDisabled className="w-fit">
          Update password
        </Button>
      </Form>
    </div>
  )
}
