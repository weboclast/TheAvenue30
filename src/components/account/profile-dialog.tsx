'use client'

import { type SubmitEvent, useId, useState, useTransition } from 'react'
import { CircleXFilled } from '@appica/icons-react'
import { Alert, AlertIcon, AlertTitle } from '@appica/ui-react/alert'
import { Button } from '@appica/ui-react/button'
import { Checkbox } from '@appica/ui-react/checkbox'
import { CheckboxGroup } from '@appica/ui-react/checkbox-group'
import { Field, FieldDescription, FieldError, FieldLabel } from '@appica/ui-react/field'
import { Form } from '@appica/ui-react/form'
import { Input } from '@appica/ui-react/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@appica/ui-react/select'
import type { FieldVariant } from '@/components/address-fields'
import {
  Overlay,
  OverlayBody,
  OverlayContent,
  OverlayFooter,
  OverlayHeader,
  OverlayTitle,
  useOverlayAsDialog,
} from '@/components/overlay-sheet'
import { revealFirstInvalidField } from '@/lib/form-errors'
import { updateProfileAction } from '@/lib/profile/actions'
import { CONTACT_METHODS, INTERESTS, MAX_INTERESTS, type ShopperProfile } from '@/lib/profile/profile'
import { validatePhone, validateRequired } from '@/lib/validation'

/*
 * Editing the profile card, on 1 panel.
 *
 * No email field: the address a shopper signs in with is the auth backend's,
 * and changing it is a verification round-trip rather than a text box. It is
 * shown here anyway, because a panel called "Edit profile" that hides it looks
 * like it lost the field.
 */

interface ProfileDialogProps {
  open: boolean
  /** What the shopper has now, which the form opens on. */
  profile: ShopperProfile
  onOpenChange: (open: boolean) => void
  /** The profile the store accepted, for the page to adopt. */
  onSaved: (profile: ShopperProfile) => void
  /** How the fields are drawn. @default 'soft' */
  fieldVariant?: FieldVariant
}

/** Edits the shopper's own record. The form goes with the panel once it has closed, so a cancel discards what was typed. */
export function ProfileDialog({ open, profile, onOpenChange, onSaved, fieldVariant = 'soft' }: ProfileDialogProps) {
  return (
    <Overlay open={open} onOpenChange={onOpenChange}>
      <OverlayContent className="w-160" closeLabel="Close">
        <ProfileForm
          profile={profile}
          onClose={() => onOpenChange(false)}
          onSaved={onSaved}
          fieldVariant={fieldVariant}
        />
      </OverlayContent>
    </Overlay>
  )
}

/** Every field the form holds. */
interface FormValues {
  firstName: string
  lastName: string
  phone: string
  contactMethod: string
  interests: string[]
}

type FormErrors = Partial<Record<'firstName' | 'lastName' | 'phone', string>>

/** The checks that run before the round-trip. `actions.ts` runs its own on what arrives. */
function validate(values: FormValues): FormErrors {
  return {
    firstName: validateRequired(values.firstName, 'First name'),
    lastName: validateRequired(values.lastName, 'Last name'),
    // Optional, so an empty field passes and anything typed has to be a number.
    phone: values.phone.trim() ? validatePhone(values.phone) : undefined,
  }
}

interface ProfileFormProps {
  profile: ShopperProfile
  onClose: () => void
  onSaved: (profile: ShopperProfile) => void
  fieldVariant: FieldVariant
}

function ProfileForm({ profile, onClose, onSaved, fieldVariant }: ProfileFormProps) {
  const asDialog = useOverlayAsDialog()
  const [pending, startTransition] = useTransition()
  const interestsLabel = useId()

  const [values, setValues] = useState<FormValues>({
    firstName: profile.firstName,
    lastName: profile.lastName,
    phone: profile.phone ?? '',
    contactMethod: profile.contactMethod,
    interests: profile.interests,
  })
  const [errors, setErrors] = useState<FormErrors>({})
  const [refused, setRefused] = useState<string>()

  /* Re-validate on keystroke only once a field was flagged invalid. */
  const change = (next: Partial<FormValues>) => {
    const merged = { ...values, ...next }
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
      const result = await updateProfileAction({
        firstName: values.firstName,
        lastName: values.lastName,
        // `null` is what clears a number the shopper emptied.
        phone: values.phone.trim() || null,
        contactMethod: values.contactMethod,
        interests: values.interests,
      })

      if (!result.ok) {
        setRefused(result.error)
        return
      }

      onSaved(result.profile)
      onClose()
    })
  }

  const full = values.interests.length >= MAX_INTERESTS

  return (
    <>
      <OverlayHeader>
        <OverlayTitle className="font-medium">Edit profile</OverlayTitle>
      </OverlayHeader>

      <Form noValidate onSubmit={handleSubmit} className="contents">
        <OverlayBody className="flex flex-col gap-4 pb-1">
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

          <div className="grid gap-4 sm:grid-cols-2">
            <Field name="firstName" invalid={Boolean(errors.firstName)}>
              <FieldLabel>First name</FieldLabel>
              <Input
                autoComplete="given-name"
                aria-required="true"
                variant={fieldVariant}
                inputSize="lg"
                autoFocus={asDialog}
                value={values.firstName}
                onChange={(event) => change({ firstName: event.target.value })}
              />
              <FieldError match={Boolean(errors.firstName)}>{errors.firstName}</FieldError>
            </Field>

            <Field name="lastName" invalid={Boolean(errors.lastName)}>
              <FieldLabel>Last name</FieldLabel>
              <Input
                autoComplete="family-name"
                aria-required="true"
                variant={fieldVariant}
                inputSize="lg"
                value={values.lastName}
                onChange={(event) => change({ lastName: event.target.value })}
              />
              <FieldError match={Boolean(errors.lastName)}>{errors.lastName}</FieldError>
            </Field>
          </div>

          <Field name="email">
            <FieldLabel>Email address</FieldLabel>
            <Input type="email" variant={fieldVariant} inputSize="lg" disabled value={profile.email} />
            <FieldDescription>
              This is what you sign in with. Contact us to move your account to another address.
            </FieldDescription>
          </Field>

          <Field name="phone" invalid={Boolean(errors.phone)}>
            <FieldLabel>Phone number (optional)</FieldLabel>
            <Input
              type="tel"
              autoComplete="tel"
              variant={fieldVariant}
              inputSize="lg"
              placeholder="+1 415 555 0132"
              value={values.phone}
              onChange={(event) => change({ phone: event.target.value })}
            />
            <FieldError match={Boolean(errors.phone)}>{errors.phone}</FieldError>
          </Field>

          <Field name="contactMethod">
            <FieldLabel>Get in touch</FieldLabel>
            <Select
              variant={fieldVariant}
              value={values.contactMethod}
              onValueChange={(next) => change({ contactMethod: String(next) })}
              items={CONTACT_METHODS.map(({ id, label }) => ({ value: id, label }))}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CONTACT_METHODS.map(({ id, label }) => (
                  <SelectItem key={id} value={id}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FieldDescription>
              How we reach you about an order. What we send is on the notifications page.
            </FieldDescription>
          </Field>

          <CheckboxGroup
            aria-labelledby={interestsLabel}
            value={values.interests}
            onValueChange={(interests) => change({ interests })}
            className="flex flex-col gap-2"
          >
            <span id={interestsLabel} className="text-foreground-intense text-sm font-medium">
              Hobbies and interests
            </span>
            <div className="grid gap-2 sm:grid-cols-2">
              {INTERESTS.map(({ id, label }) => {
                const picked = values.interests.includes(id)

                return (
                  <label
                    key={id}
                    className="text-foreground-intense flex items-center gap-2 text-sm select-none has-disabled:opacity-50"
                  >
                    {/* Held at the cap, so the limit shows before a shopper hits it. */}
                    <Checkbox name={id} disabled={full && !picked} />
                    {label}
                  </label>
                )
              })}
            </div>
            <p className="text-foreground-muted text-sm">
              Pick up to {MAX_INTERESTS}. We use these to choose what to recommend.
            </p>
          </CheckboxGroup>
        </OverlayBody>

        <OverlayFooter className="pb-0">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={pending} focusableWhenDisabled>
            Save changes
          </Button>
        </OverlayFooter>
      </Form>
    </>
  )
}
