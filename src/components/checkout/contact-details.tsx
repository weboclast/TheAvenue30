'use client'

import type { ComponentProps } from 'react'
import { Checkbox } from '@appica/ui-react/checkbox'
import { Field, FieldDescription, FieldError, FieldLabel } from '@appica/ui-react/field'
import { Input } from '@appica/ui-react/input'
import type { AddressFieldErrors, AddressFieldValues, FieldVariant } from '@/components/address-fields'
import { SignInDrawer } from '@/components/auth/sign-in-drawer'
import type { Customer } from '@/lib/auth'
import { fullName } from '@/lib/auth/customer'

interface ContactDetailsProps {
  /** The checkout's details, of which this section edits the email and the account offer. */
  values: AddressFieldValues
  onChange: (values: AddressFieldValues) => void
  errors: AddressFieldErrors
  /** The signed-in shopper, or `null` for a guest, who is offered sign-in and an account. */
  customer: Customer | null
  /**
   * The input look the storefront draws its forms in.
   * @default 'soft'
   */
  fieldVariant?: FieldVariant
  /** The sign-in drawer's buttons and mark, as the storefront's `SignInGate` sets them. */
  signIn?: Pick<ComponentProps<typeof SignInDrawer>, 'createAccountVariant' | 'registerVariant' | 'logo'>
}

/**
 * Where the receipt goes, asked first. A guest can sign in from here without
 * leaving the page: the auth action revalidates the layout, and the form picks
 * the account's details up from the new `customer`.
 */
export function ContactDetails({
  values,
  onChange,
  errors,
  customer,
  fieldVariant = 'soft',
  signIn,
}: ContactDetailsProps) {
  const set = (patch: Partial<AddressFieldValues>) => onChange({ ...values, ...patch })

  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <h2 className="text-foreground-intense text-2xl font-medium">Contact</h2>
        {customer ? (
          <p>
            Signed in as{' '}
            <span className="text-foreground-intense font-medium">{fullName(customer) || customer.email}</span>
          </p>
        ) : (
          <p className="text-sm">
            Have an account?{' '}
            <SignInDrawer
              {...signIn}
              trigger={
                <button
                  type="button"
                  className="text-foreground-intense outline-ring rounded-4xs cursor-pointer underline hover:no-underline focus-visible:outline-2 focus-visible:outline-offset-2"
                >
                  Sign in
                </button>
              }
            />
          </p>
        )}
      </div>

      <Field name="email" invalid={Boolean(errors.email)}>
        <FieldLabel>Email address</FieldLabel>
        <Input
          type="email"
          variant={fieldVariant}
          inputSize="lg"
          autoComplete="email"
          aria-required="true"
          clearable
          onClear={() => set({ email: '' })}
          value={values.email}
          onChange={(event) => set({ email: event.target.value })}
        />
        <FieldDescription>For your receipt, and news of this order only.</FieldDescription>
        <FieldError match={Boolean(errors.email)}>{errors.email}</FieldError>
      </Field>

      {customer ? null : (
        <label className="text-foreground-intense flex w-fit items-center gap-2 text-sm">
          <Checkbox
            checked={values.createAccount}
            onCheckedChange={(checked) => set({ createAccount: Boolean(checked) })}
          />
          Create an account with these details after checkout
        </label>
      )}
    </section>
  )
}
