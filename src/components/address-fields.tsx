'use client'

import { useMemo } from 'react'
import {
  AECircle,
  AERounded,
  ATCircle,
  ATRounded,
  AUCircle,
  AURounded,
  BECircle,
  BERounded,
  BRCircle,
  BRRounded,
  CACircle,
  CARounded,
  CHCircle,
  CHRounded,
  CNCircle,
  CNRounded,
  DECircle,
  DERounded,
  DKCircle,
  DKRounded,
  ESCircle,
  ESRounded,
  FICircle,
  FIRounded,
  FRCircle,
  FRRounded,
  GBCircle,
  GBRounded,
  IECircle,
  IERounded,
  INCircle,
  INRounded,
  ITCircle,
  ITRounded,
  JPCircle,
  JPRounded,
  MXCircle,
  MXRounded,
  NLCircle,
  NLRounded,
  NOCircle,
  NORounded,
  NZCircle,
  NZRounded,
  PLCircle,
  PLRounded,
  PTCircle,
  PTRounded,
  SECircle,
  SERounded,
  SGCircle,
  SGRounded,
  USCircle,
  USRounded,
} from '@appica/country-flags-react'
import { Checkbox } from '@appica/ui-react/checkbox'
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from '@appica/ui-react/combobox'
import { Field, FieldDescription, FieldError, FieldLabel } from '@appica/ui-react/field'
import { Input } from '@appica/ui-react/input'
import { ScrollArea } from '@appica/ui-react/scroll-area'
import type { Address } from '@/lib/commerce/types'
import { validateEmail, validatePhone, validatePostcode, validateRequired } from '@/lib/validation'

/*
 * Where the order is going, and who to reach about it.
 *
 * The country list is demo scaffolding: a real store ships to the countries its
 * shipping zones name, so read them from your backend and drop this table. Each
 * flag is imported by name rather than through the package's dynamic
 * `CountryFlagRounded`, which would pull all 250 into the bundle, and each shape
 * has a map of its own, so a storefront bundles only the one it draws.
 */

interface CountryEntry {
  /** ISO 3166-1 alpha-2. */
  code: string
  name: string
  /** What this country calls the division above a city, for the field label. */
  division: string
}

const countries = [
  { code: 'AU', name: 'Australia', division: 'State' },
  { code: 'AT', name: 'Austria', division: 'State' },
  { code: 'BE', name: 'Belgium', division: 'Province' },
  { code: 'BR', name: 'Brazil', division: 'State' },
  { code: 'CA', name: 'Canada', division: 'Province' },
  { code: 'CN', name: 'China', division: 'Province' },
  { code: 'DK', name: 'Denmark', division: 'Region' },
  { code: 'FI', name: 'Finland', division: 'Region' },
  { code: 'FR', name: 'France', division: 'Region' },
  { code: 'DE', name: 'Germany', division: 'State' },
  { code: 'IN', name: 'India', division: 'State' },
  { code: 'IE', name: 'Ireland', division: 'County' },
  { code: 'IT', name: 'Italy', division: 'Province' },
  { code: 'JP', name: 'Japan', division: 'Prefecture' },
  { code: 'MX', name: 'Mexico', division: 'State' },
  { code: 'NL', name: 'Netherlands', division: 'Province' },
  { code: 'NZ', name: 'New Zealand', division: 'Region' },
  { code: 'NO', name: 'Norway', division: 'County' },
  { code: 'PL', name: 'Poland', division: 'Voivodeship' },
  { code: 'PT', name: 'Portugal', division: 'District' },
  { code: 'SG', name: 'Singapore', division: 'District' },
  { code: 'ES', name: 'Spain', division: 'Province' },
  { code: 'SE', name: 'Sweden', division: 'County' },
  { code: 'CH', name: 'Switzerland', division: 'Canton' },
  { code: 'AE', name: 'United Arab Emirates', division: 'Emirate' },
  { code: 'GB', name: 'United Kingdom', division: 'County' },
  { code: 'US', name: 'United States', division: 'State' },
] as const satisfies readonly CountryEntry[]

type Country = (typeof countries)[number]

/** A flag for every country in the table, in one of the package's shapes. */
export type CountryFlags = Record<Country['code'], typeof USRounded>

/** A country as the picker lists it: the table's entry, with its flag in the shape asked for. */
type CountryItem = Country & { flag: CountryFlags[Country['code']] }

/** Rounded squares: what the fields draw unless handed another set. */
const ROUNDED_FLAGS: CountryFlags = {
  AE: AERounded,
  AT: ATRounded,
  AU: AURounded,
  BE: BERounded,
  BR: BRRounded,
  CA: CARounded,
  CH: CHRounded,
  CN: CNRounded,
  DE: DERounded,
  DK: DKRounded,
  ES: ESRounded,
  FI: FIRounded,
  FR: FRRounded,
  GB: GBRounded,
  IE: IERounded,
  IN: INRounded,
  IT: ITRounded,
  JP: JPRounded,
  MX: MXRounded,
  NL: NLRounded,
  NO: NORounded,
  NZ: NZRounded,
  PL: PLRounded,
  PT: PTRounded,
  SE: SERounded,
  SG: SGRounded,
  US: USRounded,
}

/** Circles, to sit beside pill-shaped fields. */
export const CIRCLE_FLAGS: CountryFlags = {
  AE: AECircle,
  AT: ATCircle,
  AU: AUCircle,
  BE: BECircle,
  BR: BRCircle,
  CA: CACircle,
  CH: CHCircle,
  CN: CNCircle,
  DE: DECircle,
  DK: DKCircle,
  ES: ESCircle,
  FI: FICircle,
  FR: FRCircle,
  GB: GBCircle,
  IE: IECircle,
  IN: INCircle,
  IT: ITCircle,
  JP: JPCircle,
  MX: MXCircle,
  NL: NLCircle,
  NO: NOCircle,
  NZ: NZCircle,
  PL: PLCircle,
  PT: PTCircle,
  SE: SECircle,
  SG: SGCircle,
  US: USCircle,
}

/** The look of every field that shows a country or an address. */
export type FieldVariant = 'outline' | 'soft'

/** How a storefront draws a form holding a country: the input look, and the flags. */
export interface FieldLook {
  /**
   * The input look the storefront draws its forms in.
   * @default 'soft'
   */
  fieldVariant?: FieldVariant
  /**
   * The flag beside each country, in the shape the storefront draws.
   * @default ROUNDED_FLAGS
   */
  flags?: CountryFlags
}

interface CountryFieldProps {
  /** ISO 3166-1 alpha-2, or an empty string for a country not chosen yet. */
  value: string
  onValueChange: (countryCode: string) => void
  /** Message to show under the field. Leave out to render it clean. */
  error?: string
  /**
   * The label.
   * @default 'Country / Region'
   */
  label?: string
  /** What the empty list says, which is not the same question everywhere the field appears. */
  emptyMessage?: string
  /**
   * The flag beside each country, in the shape the storefront draws.
   * @default ROUNDED_FLAGS
   */
  flags?: CountryFlags
  /**
   * The input look the storefront draws its forms in.
   * @default 'soft'
   */
  variant?: FieldVariant
  /**
   * The browser's autofill hint, matched against the country names.
   * @default 'country-name'
   */
  autoComplete?: string
}

/**
 * The searchable country picker, shared by the shipping form and by the billing
 * country a saved card carries. A country added to the table needs a flag in
 * both maps, which their type enforces.
 */
export function CountryField({
  value,
  onValueChange,
  error,
  label = 'Country / Region',
  emptyMessage = "We don't ship there yet.",
  flags = ROUNDED_FLAGS,
  variant = 'soft',
  autoComplete = 'country-name',
}: CountryFieldProps) {
  const items = useMemo(() => countries.map((entry): CountryItem => ({ ...entry, flag: flags[entry.code] })), [flags])
  const country = items.find((candidate) => candidate.code === value)

  return (
    <Field name="country" invalid={Boolean(error)}>
      <FieldLabel>{label}</FieldLabel>
      <Combobox<CountryItem>
        variant={variant}
        size="lg"
        items={items}
        value={country ?? null}
        onValueChange={(next) => onValueChange(next?.code ?? '')}
        itemToStringLabel={(item) => item.name}
        // Lands on Base UI's hidden input, which matches an autofilled name to an item.
        autoComplete={autoComplete}
      >
        <ComboboxInput
          placeholder="Search countries"
          startSlot={country ? <country.flag size={20} /> : null}
          aria-required="true"
          aria-invalid={Boolean(error)}
        />
        <ComboboxContent>
          {/* The list hands its overflow to `ScrollArea`, which is the only
              part that may scroll. */}
          <ScrollArea className="max-h-64">
            <ComboboxEmpty>{emptyMessage}</ComboboxEmpty>
            <ComboboxList className="overflow-y-visible">
              {(item: CountryItem) => (
                <ComboboxItem key={item.code} value={item}>
                  <span className="flex items-center gap-2">
                    <item.flag size={20} />
                    {item.name}
                  </span>
                </ComboboxItem>
              )}
            </ComboboxList>
          </ScrollArea>
        </ComboboxContent>
      </Combobox>
      <FieldError match={Boolean(error)}>{error}</FieldError>
    </Field>
  )
}

/** What the shipping section collects, before it is mapped onto an `Address`. */
export interface AddressFieldValues {
  firstName: string
  lastName: string
  email: string
  phone: string
  countryCode: string
  city: string
  state: string
  postcode: string
  line1: string
  /** Whether a guest asked for an account once the order is placed. */
  createAccount: boolean
}

/** What is wrong with each field, as the message to show under it. */
export type AddressFieldErrors = Partial<Record<keyof AddressFieldValues, string>>

/**
 * The checks every form built on {@link AddressFields} runs, so a shopper is
 * told before the round-trip rather than after it. Whatever records the address
 * re-runs them on the server through `validateAddress` in `lib/validation.ts`:
 * this is a courtesy, never the gate. Keep the 2 in step.
 *
 * @param askEmail Whether the caller shows the email field.
 * @default true
 */
export function validateAddressFields(values: AddressFieldValues, askEmail = true): AddressFieldErrors {
  return {
    firstName: validateRequired(values.firstName, 'First name'),
    lastName: validateRequired(values.lastName, 'Last name'),
    ...(askEmail && { email: validateEmail(values.email) }),
    phone: validatePhone(values.phone),
    countryCode: validateRequired(values.countryCode, 'Country'),
    city: validateRequired(values.city, 'Town or city'),
    postcode: validatePostcode(values.postcode),
    line1: validateRequired(values.line1, 'Street address'),
  }
}

/**
 * An address in the shape the fields edit, for a form that opens on one already
 * recorded. The email is left blank: every caller that edits a recorded address
 * already has one and hides that field.
 */
export function addressFieldValues(address?: Address): AddressFieldValues {
  return {
    firstName: address?.firstName ?? '',
    lastName: address?.lastName ?? '',
    email: '',
    phone: address?.phone ?? '',
    countryCode: address?.countryCode ?? '',
    city: address?.city ?? '',
    state: address?.state ?? '',
    postcode: address?.postcode ?? '',
    line1: address?.line1 ?? '',
    createAccount: false,
  }
}

/** What was typed, in the shape the commerce layer records. An optional left empty is dropped rather than stored blank. */
export function toAddress(values: AddressFieldValues): Address {
  return {
    firstName: values.firstName.trim(),
    lastName: values.lastName.trim(),
    countryCode: values.countryCode,
    city: values.city.trim(),
    ...(values.state.trim() && { state: values.state.trim() }),
    postcode: values.postcode.trim(),
    line1: values.line1.trim(),
    ...(values.phone.trim() && { phone: values.phone.trim() }),
  }
}

interface AddressFieldsProps {
  values: AddressFieldValues
  onChange: (values: AddressFieldValues) => void
  /** Messages by field key. A key with no message renders the field clean. */
  errors: Partial<Record<keyof AddressFieldValues, string>>
  /**
   * Offers a guest an account once the order is placed. Leave it off for a
   * shopper who has one, and where the caller makes the offer elsewhere.
   * @default false
   */
  accountOffer?: boolean
  /**
   * The section heading. `null` for a caller that has already titled the form.
   * @default 'Shipping address'
   */
  heading?: string | null
  /**
   * Whether to ask for an email address. Off where the record already carries one.
   * @default true
   */
  askEmail?: boolean
  /**
   * Whether the first field claims focus on mount. Leave it off inside a bottom
   * sheet: taking focus mid-slide cancels the entrance, and the keyboard that
   * comes with it covers the fields.
   * @default false
   */
  autoFocus?: boolean
  /**
   * The input look the storefront draws its forms in.
   * @default 'soft'
   */
  fieldVariant?: FieldVariant
  /**
   * The country flags, in the shape the storefront draws.
   * @default ROUNDED_FLAGS
   */
  flags?: CountryFlags
}

/**
 * The shipping address, the contact details that go with it, and the offer to
 * turn a guest checkout into an account.
 *
 * Every field is controlled by the form above rather than read out of the DOM on
 * submit, because the same values are validated as they are typed and posted to
 * the Server Action, and 2 sources for 1 field is how they drift.
 *
 * Shared by the checkouts, the address book, and the redirect order tracking offers.
 */
export function AddressFields({
  values,
  onChange,
  errors,
  accountOffer = false,
  heading = 'Shipping address',
  askEmail = true,
  autoFocus = false,
  fieldVariant = 'soft',
  flags,
}: AddressFieldsProps) {
  const set = (patch: Partial<AddressFieldValues>) => onChange({ ...values, ...patch })
  const country = countries.find((candidate) => candidate.code === values.countryCode)

  return (
    <section className="flex flex-col gap-4">
      {heading ? <h2 className="text-foreground-intense text-2xl font-medium">{heading}</h2> : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <Field name="first-name" invalid={Boolean(errors.firstName)}>
          <FieldLabel>First name</FieldLabel>
          <Input
            variant={fieldVariant}
            inputSize="lg"
            autoComplete="given-name"
            aria-required="true"
            autoFocus={autoFocus}
            clearable
            onClear={() => set({ firstName: '' })}
            value={values.firstName}
            onChange={(event) => set({ firstName: event.target.value })}
          />
          <FieldError match={Boolean(errors.firstName)}>{errors.firstName}</FieldError>
        </Field>

        <Field name="last-name" invalid={Boolean(errors.lastName)}>
          <FieldLabel>Last name</FieldLabel>
          <Input
            variant={fieldVariant}
            inputSize="lg"
            autoComplete="family-name"
            aria-required="true"
            clearable
            onClear={() => set({ lastName: '' })}
            value={values.lastName}
            onChange={(event) => set({ lastName: event.target.value })}
          />
          <FieldError match={Boolean(errors.lastName)}>{errors.lastName}</FieldError>
        </Field>
      </div>

      {askEmail ? (
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
          <FieldError match={Boolean(errors.email)}>{errors.email}</FieldError>
        </Field>
      ) : null}

      <Field name="phone" invalid={Boolean(errors.phone)}>
        <FieldLabel>Mobile number</FieldLabel>
        <Input
          type="tel"
          variant={fieldVariant}
          inputSize="lg"
          autoComplete="tel"
          aria-required="true"
          placeholder="+1 000-000-000"
          clearable
          onClear={() => set({ phone: '' })}
          value={values.phone}
          onChange={(event) => set({ phone: event.target.value })}
        />
        <FieldDescription>We&apos;ll only use your phone number for delivery day contact.</FieldDescription>
        <FieldError match={Boolean(errors.phone)}>{errors.phone}</FieldError>
      </Field>

      <CountryField
        value={values.countryCode}
        onValueChange={(countryCode) => set({ countryCode })}
        error={errors.countryCode}
        flags={flags}
        variant={fieldVariant}
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <Field name="city" invalid={Boolean(errors.city)}>
          <FieldLabel>Town / City</FieldLabel>
          <Input
            variant={fieldVariant}
            inputSize="lg"
            autoComplete="address-level2"
            aria-required="true"
            clearable
            onClear={() => set({ city: '' })}
            value={values.city}
            onChange={(event) => set({ city: event.target.value })}
          />
          <FieldError match={Boolean(errors.city)}>{errors.city}</FieldError>
        </Field>

        <Field name="state">
          {/* Named after whatever the chosen country calls the division, since "State" is wrong in most of them. */}
          <FieldLabel>{country?.division ?? 'Region'}</FieldLabel>
          <Input
            variant={fieldVariant}
            inputSize="lg"
            autoComplete="address-level1"
            clearable
            onClear={() => set({ state: '' })}
            value={values.state}
            onChange={(event) => set({ state: event.target.value })}
          />
        </Field>

        <Field name="postcode" invalid={Boolean(errors.postcode)}>
          <FieldLabel>Postcode</FieldLabel>
          <Input
            variant={fieldVariant}
            inputSize="lg"
            autoComplete="postal-code"
            aria-required="true"
            clearable
            onClear={() => set({ postcode: '' })}
            value={values.postcode}
            onChange={(event) => set({ postcode: event.target.value })}
          />
          <FieldError match={Boolean(errors.postcode)}>{errors.postcode}</FieldError>
        </Field>
      </div>

      <Field name="line1" invalid={Boolean(errors.line1)}>
        <FieldLabel>House / apartment number and street address</FieldLabel>
        <Input
          variant={fieldVariant}
          inputSize="lg"
          autoComplete="address-line1"
          aria-required="true"
          clearable
          onClear={() => set({ line1: '' })}
          value={values.line1}
          onChange={(event) => set({ line1: event.target.value })}
        />
        <FieldError match={Boolean(errors.line1)}>{errors.line1}</FieldError>
      </Field>

      {accountOffer ? (
        <label className="text-foreground-intense flex w-fit items-center gap-2 text-sm">
          <Checkbox
            checked={values.createAccount}
            onCheckedChange={(checked) => set({ createAccount: Boolean(checked) })}
          />
          Sign up for an account after making a purchase.
        </label>
      ) : null}
    </section>
  )
}
