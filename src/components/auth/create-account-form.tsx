'use client'

import { type ComponentProps, type SubmitEvent, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { CircleXFilled } from '@appica/icons-react'
import { Alert, AlertIcon, AlertTitle } from '@appica/ui-react/alert'
import { Button } from '@appica/ui-react/button'
import { Checkbox } from '@appica/ui-react/checkbox'
import { Field, FieldDescription, FieldError, FieldLabel } from '@appica/ui-react/field'
import { Form } from '@appica/ui-react/form'
import { Input } from '@appica/ui-react/input'
import { PasswordField } from '@/components/password-field'
import { registerAction } from '@/lib/auth/actions'
import { revealFirstInvalidField } from '@/lib/form-errors'
import { validateEmail, validatePassword } from '@/lib/validation'

const interests = [
  'Smartphones & Wearables',
  'Laptops & Computing',
  'Gaming & VR',
  'Smart Home & IoT',
  'Audio & Headphones',
  'Cameras & Drones',
]

type CreateAccountField = 'email' | 'firstName' | 'lastName' | 'password' | 'confirmPassword'
type CreateAccountErrors = Partial<Record<CreateAccountField, string>>

function validateCreateAccount(data: FormData): CreateAccountErrors {
  const password = String(data.get('password') ?? '')
  const confirmPassword = String(data.get('confirmPassword') ?? '')
  return {
    email: validateEmail(String(data.get('email') ?? '')),
    firstName: String(data.get('firstName') ?? '').trim() ? undefined : 'First name is required',
    lastName: String(data.get('lastName') ?? '').trim() ? undefined : 'Last name is required',
    password: validatePassword(password),
    confirmPassword: !confirmPassword
      ? 'Confirm your password'
      : confirmPassword !== password
        ? 'Passwords do not match'
        : undefined,
  }
}

interface CreateAccountFormProps {
  /** Rendered below the submit button, e.g. an "Already have an account?" switch. */
  footer?: React.ReactNode
  /** Called once the backend has created the account and signed it in. */
  onSuccess?: () => void
  /** Route to navigate to after a successful registration. */
  redirectTo?: string
  /** The submit button's variant. @default 'secondary' */
  submitVariant?: ComponentProps<typeof Button>['variant']
}

/** The registration fields and actions shared by the create-account drawer and the /register page. */
export function CreateAccountForm({
  footer,
  onSuccess,
  redirectTo,
  submitVariant = 'secondary',
}: CreateAccountFormProps) {
  const router = useRouter()
  const [errors, setErrors] = useState<CreateAccountErrors>({})
  const [rejected, setRejected] = useState<string>()
  const [pending, startRegister] = useTransition()

  /* Re-validate on keystroke only for fields already flagged invalid. */
  const revalidate = (event: React.ChangeEvent<HTMLInputElement>) => {
    const form = event.currentTarget.form
    if (!form) return
    const next = validateCreateAccount(new FormData(form))
    setErrors((previous) => ({
      email: previous.email ? next.email : undefined,
      firstName: previous.firstName ? next.firstName : undefined,
      lastName: previous.lastName ? next.lastName : undefined,
      password: previous.password ? next.password : undefined,
      confirmPassword: previous.confirmPassword ? next.confirmPassword : undefined,
    }))
  }

  const handleSubmit = (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const next = validateCreateAccount(formData)
    setErrors(next)
    if (Object.values(next).some(Boolean)) {
      revealFirstInvalidField(event.currentTarget)
      return
    }

    setRejected(undefined)
    startRegister(async () => {
      const result = await registerAction(formData)
      if (!result.ok) {
        setRejected(result.error)
        return
      }
      onSuccess?.()
      if (redirectTo) router.push(redirectTo)
    })
  }

  const textField = (field: 'email' | 'firstName' | 'lastName', label: string, autoComplete: string, type?: string) => (
    <Field name={field} invalid={Boolean(errors[field])}>
      <FieldLabel>{label}</FieldLabel>
      <Input
        type={type}
        autoComplete={autoComplete}
        aria-required="true"
        variant="soft"
        inputSize="lg"
        onChange={revalidate}
      />
      <FieldError match={Boolean(errors[field])}>{errors[field]}</FieldError>
    </Field>
  )

  return (
    <Form noValidate className="flex flex-col gap-8" onSubmit={handleSubmit}>
      <div className="flex flex-col gap-4">
        {textField('email', 'Email', 'email', 'email')}
        {textField('firstName', 'First name', 'given-name')}
        {textField('lastName', 'Last name', 'family-name')}
        <Field name="password" invalid={Boolean(errors.password)}>
          <FieldLabel>Password</FieldLabel>
          <PasswordField
            autoComplete="new-password"
            aria-required="true"
            variant="soft"
            inputSize="lg"
            strength
            onChange={revalidate}
          />
          <FieldError match={Boolean(errors.password)}>{errors.password}</FieldError>
          <FieldDescription className="text-foreground-subtle">
            At least 8 characters to enhance its security
          </FieldDescription>
        </Field>
        <Field name="confirmPassword" invalid={Boolean(errors.confirmPassword)}>
          <FieldLabel>Confirm password</FieldLabel>
          <PasswordField
            autoComplete="new-password"
            aria-required="true"
            variant="soft"
            inputSize="lg"
            onChange={revalidate}
          />
          <FieldError match={Boolean(errors.confirmPassword)}>{errors.confirmPassword}</FieldError>
        </Field>
        <fieldset>
          <legend data-slot="field-label" className="text-foreground-intense mb-2 text-sm font-medium">
            What&apos;s the best way to reach you?
          </legend>
          <div className="flex flex-col gap-2">
            <label className="text-foreground flex w-fit items-center gap-2 text-sm">
              <Checkbox defaultChecked />
              By email
            </label>
            <label className="text-foreground flex w-fit items-center gap-2 text-sm">
              <Checkbox />
              By SMS
            </label>
          </div>
        </fieldset>
        <fieldset>
          <legend data-slot="field-label" className="text-foreground-intense mb-2 text-sm font-medium">
            What are you into? Tell us more!
          </legend>
          <div className="flex flex-col gap-2">
            {interests.map((interest) => (
              <label key={interest} className="text-foreground flex w-fit items-center gap-2 text-sm">
                <Checkbox />
                {interest}
              </label>
            ))}
          </div>
        </fieldset>
      </div>
      <div className="flex flex-col gap-4">
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
        <Button
          type="submit"
          variant={submitVariant}
          size="lg"
          className="w-full"
          disabled={pending}
          focusableWhenDisabled
        >
          {pending ? 'Creating account…' : 'Create account'}
        </Button>
        {footer}
      </div>
    </Form>
  )
}
