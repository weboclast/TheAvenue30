'use client'

import { type SubmitEvent, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { Button } from '@appica/ui-react/button'
import { Field, FieldError, FieldLabel } from '@appica/ui-react/field'
import { Form } from '@appica/ui-react/form'
import { PasswordField } from '@/components/password-field'
import { AuthCardHeading } from './auth-card'
import { ForgotPasswordForm } from './forgot-password-form'
import { revealFirstInvalidField } from '@/lib/form-errors'
import { validatePassword } from '@/lib/validation'

/** Which screen of the reset journey is showing. */
type Stage = 'request' | 'sent' | 'reset' | 'done'

/**
 * The full password-reset journey on a single route: request a link, confirm
 * it was sent, choose a new password, done. In production the "reset" stage
 * is reached from the emailed link, so the demo bridges it with a button and
 * every screen stays browsable.
 */
export function PasswordResetFlow() {
  const [stage, setStage] = useState<Stage>('request')
  const [email, setEmail] = useState('')
  const title = useRef<HTMLHeadingElement>(null)
  // Set by the first step change, so the opening screen leaves focus to the page.
  const moved = useRef(false)

  const go = (next: Stage) => {
    moved.current = true
    setStage(next)
  }

  // Each step replaces the controls that held focus, so focus moves to its title.
  useEffect(() => {
    if (moved.current) title.current?.focus({ preventScroll: true })
  }, [stage])

  if (stage === 'request') {
    return (
      <>
        <AuthCardHeading
          titleRef={title}
          title="Forgot your password?"
          description="Enter the email you use for The Avenue 30 and we'll send you a link to reset your password."
        />
        <ForgotPasswordForm
          onSuccess={(submittedEmail) => {
            setEmail(submittedEmail)
            go('sent')
          }}
          footer={
            <p className="text-foreground text-center text-sm">
              Remembered your password?{' '}
              <Link href="/login" className="text-foreground-intense font-medium underline hover:no-underline">
                Sign in
              </Link>
            </p>
          }
        />
      </>
    )
  }

  if (stage === 'sent') {
    return (
      <>
        <AuthCardHeading
          titleRef={title}
          title="Check your inbox"
          description={`We've sent a password reset link to ${email}. The link expires in 30 minutes.`}
        />
        <div className="flex flex-col gap-4">
          <Button size="lg" className="w-full" onClick={() => go('reset')}>
            Open the reset link (demo)
          </Button>
          <p className="text-foreground text-center text-sm">
            Didn&apos;t get it?{' '}
            <button
              type="button"
              className="text-foreground-intense cursor-pointer font-medium underline hover:no-underline"
              onClick={() => go('request')}
            >
              Try another email
            </button>
          </p>
        </div>
      </>
    )
  }

  if (stage === 'reset') {
    return (
      <>
        <AuthCardHeading
          titleRef={title}
          title="Set a new password"
          description={`Choose a new password for ${email}.`}
        />
        <NewPasswordForm onSuccess={() => go('done')} />
      </>
    )
  }

  return (
    <>
      <AuthCardHeading
        titleRef={title}
        title="Password updated"
        description="Your password has been changed. Sign in with your new password to continue."
      />
      <Button size="lg" className="w-full" nativeButton={false} render={<Link href="/login" />}>
        Back to sign in
      </Button>
    </>
  )
}

type NewPasswordField = 'password' | 'confirmPassword'
type NewPasswordErrors = Partial<Record<NewPasswordField, string>>

function validateNewPassword(data: FormData): NewPasswordErrors {
  const password = String(data.get('password') ?? '')
  const confirmPassword = String(data.get('confirmPassword') ?? '')
  return {
    password: validatePassword(password),
    confirmPassword: !confirmPassword
      ? 'Confirm your password'
      : confirmPassword !== password
        ? 'Passwords do not match'
        : undefined,
  }
}

function NewPasswordForm({ onSuccess }: { onSuccess: () => void }) {
  const [errors, setErrors] = useState<NewPasswordErrors>({})
  /* Re-validate on keystroke only for fields already flagged invalid. */
  const revalidate = (event: React.ChangeEvent<HTMLInputElement>) => {
    const form = event.currentTarget.form
    if (!form) return
    const next = validateNewPassword(new FormData(form))
    setErrors((previous) => ({
      password: previous.password ? next.password : undefined,
      confirmPassword: previous.confirmPassword ? next.confirmPassword : undefined,
    }))
  }

  const handleSubmit = (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault()
    const next = validateNewPassword(new FormData(event.currentTarget))
    setErrors(next)
    if (next.password || next.confirmPassword) {
      revealFirstInvalidField(event.currentTarget)
      return
    }

    // Demo flow only: a real store sets the new password through its auth backend here.
    onSuccess()
  }

  return (
    <Form noValidate className="flex flex-col gap-6" onSubmit={handleSubmit}>
      <div className="flex flex-col gap-4">
        <Field name="password" invalid={Boolean(errors.password)}>
          <FieldLabel>New password</FieldLabel>
          <PasswordField
            autoComplete="new-password"
            aria-required="true"
            variant="soft"
            inputSize="lg"
            onChange={revalidate}
          />
          <FieldError match={Boolean(errors.password)}>{errors.password}</FieldError>
        </Field>
        <Field name="confirmPassword" invalid={Boolean(errors.confirmPassword)}>
          <FieldLabel>Confirm new password</FieldLabel>
          <PasswordField
            autoComplete="new-password"
            aria-required="true"
            variant="soft"
            inputSize="lg"
            onChange={revalidate}
          />
          <FieldError match={Boolean(errors.confirmPassword)}>{errors.confirmPassword}</FieldError>
        </Field>
      </div>
      <Button type="submit" size="lg" className="w-full">
        Reset password
      </Button>
    </Form>
  )
}
