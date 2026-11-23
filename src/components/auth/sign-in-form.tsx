'use client'

import { type SubmitEvent, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { CircleXFilled } from '@appica/icons-react'
import { Alert, AlertIcon, AlertTitle } from '@appica/ui-react/alert'
import { Button } from '@appica/ui-react/button'
import { Checkbox } from '@appica/ui-react/checkbox'
import { Field, FieldError, FieldLabel } from '@appica/ui-react/field'
import { Form } from '@appica/ui-react/form'
import { Input } from '@appica/ui-react/input'
import { PasswordField } from '@/components/password-field'
import { signInAction } from '@/lib/auth/actions'
import { revealFirstInvalidField } from '@/lib/form-errors'
import { validateEmail } from '@/lib/validation'
import { SocialSignInButtons } from './social-sign-in-buttons'

type SignInField = 'email' | 'password'
type SignInErrors = Partial<Record<SignInField, string>>

function validateSignIn(data: FormData): SignInErrors {
  return {
    email: validateEmail(String(data.get('email') ?? '')),
    password: String(data.get('password') ?? '') ? undefined : 'Password is required',
  }
}

interface SignInFormProps {
  /** Rendered at the end of the password label row: a link or drawer-switch button. */
  forgotPasswordSlot?: React.ReactNode
  /** Called once the backend has signed the shopper in. */
  onSuccess?: () => void
  /** Route to navigate to after a successful sign-in. */
  redirectTo?: string
}

/** The sign-in fields and actions shared by the sign-in drawer and the /login page. */
export function SignInForm({ forgotPasswordSlot, onSuccess, redirectTo }: SignInFormProps) {
  const router = useRouter()
  const [errors, setErrors] = useState<SignInErrors>({})
  const [rejected, setRejected] = useState<string>()
  const [pending, startSignIn] = useTransition()

  /* Re-validate on keystroke only for fields already flagged invalid. */
  const revalidate = (event: React.ChangeEvent<HTMLInputElement>) => {
    const form = event.currentTarget.form
    if (!form) return
    const next = validateSignIn(new FormData(form))
    setErrors((previous) => ({
      email: previous.email ? next.email : undefined,
      password: previous.password ? next.password : undefined,
    }))
  }

  const handleSubmit = (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const next = validateSignIn(formData)
    setErrors(next)
    if (next.email || next.password) {
      revealFirstInvalidField(event.currentTarget)
      return
    }

    setRejected(undefined)
    startSignIn(async () => {
      const result = await signInAction(formData)
      if (!result.ok) {
        setRejected(result.error)
        return
      }
      onSuccess?.()
      if (redirectTo) router.push(redirectTo)
    })
  }

  return (
    <Form noValidate className="flex flex-col gap-4" onSubmit={handleSubmit}>
      <Field name="email" invalid={Boolean(errors.email)}>
        <FieldLabel>Email</FieldLabel>
        <Input
          type="email"
          autoComplete="email"
          aria-required="true"
          variant="soft"
          inputSize="lg"
          onChange={revalidate}
        />
        <FieldError match={Boolean(errors.email)}>{errors.email}</FieldError>
      </Field>
      <Field name="password" invalid={Boolean(errors.password)}>
        <div className="mb-1.5 flex items-center justify-between">
          <FieldLabel className="mb-0">Password</FieldLabel>
          {forgotPasswordSlot}
        </div>
        <PasswordField
          autoComplete="current-password"
          aria-required="true"
          variant="soft"
          inputSize="lg"
          onChange={revalidate}
        />
        <FieldError match={Boolean(errors.password)}>{errors.password}</FieldError>
      </Field>
      <label className="text-foreground-intense flex w-fit items-center gap-2 text-sm">
        <Checkbox defaultChecked />
        Stay signed in
      </label>
      {rejected ? (
        <Alert variant="error" role="alert">
          <AlertIcon>
            <CircleXFilled />
          </AlertIcon>
          <AlertTitle as="div" className="text-sm font-normal">
            {rejected}
          </AlertTitle>
        </Alert>
      ) : null}
      <div className="flex flex-col gap-3">
        <Button type="submit" size="lg" className="w-full" disabled={pending} focusableWhenDisabled>
          {pending ? 'Signing in…' : 'Sign in'}
        </Button>
        <p className="text-foreground text-center text-sm">or continue with</p>
        <SocialSignInButtons />
      </div>
    </Form>
  )
}
