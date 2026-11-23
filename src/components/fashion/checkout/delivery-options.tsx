'use client'

import { useState } from 'react'
import Image from 'next/image'
import { BuildingStore, Plus, TruckDelivery } from '@appica/icons-react'
import { Button, buttonVariants } from '@appica/ui-react/button'
import { Field, FieldDescription, FieldError, FieldLabel } from '@appica/ui-react/field'
import { Input } from '@appica/ui-react/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@appica/ui-react/tabs'
import { Textarea } from '@appica/ui-react/textarea'
import {
  type AddressFieldErrors,
  type AddressFieldValues,
  AddressFields,
  CIRCLE_FLAGS,
  validateAddressFields,
} from '@/components/address-fields'
import { ChoiceGroup, ChoiceOption } from '@/components/checkout/choice-group'
import { useDeliveryChoice } from '@/components/checkout/use-delivery-choice'
import { TEXT_ACTION } from '@/components/fashion/text-action'
import { Price } from '@/components/price'
import { formatCountry, formatDay, formatDayRange } from '@/lib/commerce/format'
import type { Cart, DeliveryOption, PickupLocation } from '@/lib/commerce/types'
import { cn } from '@/lib/utils'
import { validatePhone, validateRequired } from '@/lib/validation'

const TAB = '*:w-full'

/** The option the cart has chosen, or `undefined` before one is. */
export function chosenDelivery(cart: Cart): DeliveryOption | undefined {
  return cart.deliveryOptions?.find((option) => option.id === cart.delivery?.optionId)
}

/**
 * The checks behind {@link DeliveryOptions}: the whole address for an order that
 * ships, only the collector for one that does not. The email is the contact section's.
 */
export function validateDeliveryFields(values: AddressFieldValues, collecting: boolean): AddressFieldErrors {
  if (!collecting) return validateAddressFields(values, false)

  return {
    firstName: validateRequired(values.firstName, 'First name'),
    lastName: validateRequired(values.lastName, 'Last name'),
    phone: validatePhone(values.phone),
  }
}

interface DeliveryOptionsProps {
  /** Who the order is for and where it goes, which the form validates and submits with the rest. */
  values: AddressFieldValues
  onChange: (values: AddressFieldValues) => void
  errors: AddressFieldErrors
  /** The note for the courier, which only an order that ships asks for. */
  notes: string
  onNotesChange: (notes: string) => void
}

/**
 * How the order reaches the shopper: sent to an address or collected from a
 * store, then which service or which store.
 *
 * Each choice is a cart mutation, priced into the summary beside it and held
 * optimistically until the cart settles. Switching to collection books the first
 * store and switching back books the preselected service, so the fields and the
 * total always agree.
 */
export function DeliveryOptions({ values, onChange, errors, notes, onNotesChange }: DeliveryOptionsProps) {
  const { options, chosen: delivery, preselected, error, choose } = useDeliveryChoice()
  const services = options.filter((option) => !option.pickup)
  const stores = options.filter((option) => option.pickup)
  const chosen = options.find((option) => option.id === delivery?.optionId)

  const switchTo = (method: string) => {
    const option = method === 'collect' ? stores[0] : (preselected ?? services[0])
    if (option) choose(option.id)
  }

  const shipping = (
    <>
      <AddressFields
        values={values}
        onChange={onChange}
        errors={errors}
        heading={null}
        askEmail={false}
        fieldVariant="outline"
        flags={CIRCLE_FLAGS}
      />
      <DeliveryNote value={notes} onChange={onNotesChange} />

      <div className="flex flex-col gap-3 pt-2">
        <h3 className="text-foreground-intense text-lg font-medium">Shipping method</h3>
        <ChoiceGroup aria-label="Shipping method" value={chosen?.id} onValueChange={choose}>
          {services.map((option) => (
            <ChoiceOption
              key={option.id}
              value={option.id}
              label={option.name}
              description={
                <span className="flex flex-col">
                  {option.arrival ? (
                    <span>Arrives {formatDayRange(option.arrival.from, option.arrival.to)}</span>
                  ) : null}
                  {option.description ? <span className="text-foreground-muted">{option.description}</span> : null}
                </span>
              }
              aside={<Charge option={option} />}
            />
          ))}
        </ChoiceGroup>
      </div>
    </>
  )

  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-foreground-intense text-2xl font-medium">Delivery</h2>

      {stores.length > 0 ? (
        <Tabs size="lg" value={chosen?.pickup ? 'collect' : 'ship'} onValueChange={(value) => switchTo(String(value))}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="ship" className={TAB}>
              <TruckDelivery data-icon="start" />
              Ship
            </TabsTrigger>
            <TabsTrigger value="collect" className={TAB}>
              <BuildingStore data-icon="start" />
              {/* 1 span, so the trigger's flex gap stays out from between the words.
                  Below `md` the full label leaves its tab no room at the ends. */}
              <span>
                Collect<span className="max-md:hidden"> in store</span>
              </span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="ship" className="flex flex-col gap-4">
            {shipping}
          </TabsContent>

          <TabsContent value="collect" className="flex flex-col gap-4">
            <ChoiceGroup
              aria-label="Store to collect from"
              value={chosen?.pickup ? chosen.id : undefined}
              onValueChange={choose}
            >
              {stores.map(
                (option) =>
                  option.pickup && (
                    <ChoiceOption
                      key={option.id}
                      value={option.id}
                      label={option.pickup.name}
                      description={
                        <span className="flex flex-col">
                          <span>
                            {option.pickup.address.line1}, {option.pickup.address.city}
                          </span>
                          {option.arrival ? (
                            <span className="text-foreground-muted">Ready from {formatDay(option.arrival.from)}</span>
                          ) : null}
                        </span>
                      }
                      aside={<Charge option={option} />}
                    >
                      <StoreDetails pickup={option.pickup} />
                    </ChoiceOption>
                  ),
              )}
            </ChoiceGroup>

            <CollectorFields values={values} onChange={onChange} errors={errors} />
          </TabsContent>
        </Tabs>
      ) : (
        shipping
      )}

      {error ? (
        <p role="alert" className="text-error-emphasis text-sm">
          {error}
        </p>
      ) : null}
    </section>
  )
}

/** What an option adds to the order, or "Free". */
function Charge({ option }: { option: DeliveryOption }) {
  return option.price.amount === 0 ? (
    <span className="text-foreground-intense font-mono font-semibold">Free</span>
  ) : (
    <Price money={option.price} scaleFraction={false} className="text-foreground-intense font-mono font-semibold" />
  )
}

/** The chosen store, opened under its row: what it looks like, when it is open, and how to get there. */
function StoreDetails({ pickup }: { pickup: PickupLocation }) {
  const { line1, city, countryCode } = pickup.address

  return (
    <div className="flex items-start gap-4">
      {pickup.image ? (
        <div className="bg-background-muted rounded-2xs relative aspect-4/3 w-28 shrink-0 overflow-hidden">
          <Image src={pickup.image.src} alt={pickup.image.alt} fill sizes="112px" className="object-cover" />
        </div>
      ) : null}
      <div className="flex min-w-0 flex-col items-start gap-2">
        {pickup.hours ? <p>{pickup.hours}</p> : null}
        <a
          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${line1}, ${city}, ${formatCountry(countryCode)}`)}`}
          target="_blank"
          rel="noreferrer"
          data-slot="button"
          className={buttonVariants({ variant: 'ghost', size: 'sm', className: TEXT_ACTION })}
        >
          Get directions
          <span className="sr-only"> (opens in a new tab)</span>
        </a>
      </div>
    </div>
  )
}

interface CollectorFieldsProps {
  values: AddressFieldValues
  onChange: (values: AddressFieldValues) => void
  errors: AddressFieldErrors
}

/** Who picks the order up, which is all a collected order needs of the shopper. */
function CollectorFields({ values, onChange, errors }: CollectorFieldsProps) {
  const set = (patch: Partial<AddressFieldValues>) => onChange({ ...values, ...patch })

  return (
    <div className="flex flex-col gap-4 pt-2">
      <h3 className="text-foreground-intense text-lg font-medium">Who&apos;s collecting</h3>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field name="first-name" invalid={Boolean(errors.firstName)}>
          <FieldLabel>First name</FieldLabel>
          <Input
            inputSize="lg"
            autoComplete="given-name"
            aria-required="true"
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

      <Field name="phone" invalid={Boolean(errors.phone)}>
        <FieldLabel>Mobile number</FieldLabel>
        <Input
          type="tel"
          inputSize="lg"
          autoComplete="tel"
          aria-required="true"
          placeholder="+1 000-000-000"
          clearable
          onClear={() => set({ phone: '' })}
          value={values.phone}
          onChange={(event) => set({ phone: event.target.value })}
        />
        <FieldDescription>For the text saying your order is ready, and nothing else.</FieldDescription>
        <FieldError match={Boolean(errors.phone)}>{errors.phone}</FieldError>
      </Field>
    </div>
  )
}

/** The courier's note, behind a link until it is wanted, since most orders need none. */
function DeliveryNote({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const [open, setOpen] = useState(Boolean(value))

  if (!open) {
    return (
      <Button variant="ghost" size="sm" onClick={() => setOpen(true)} className={cn(TEXT_ACTION, 'self-start')}>
        <Plus data-icon="start" />
        Add a delivery note
      </Button>
    )
  }

  return (
    <Field name="notes">
      <FieldLabel>Delivery note (optional)</FieldLabel>
      <Textarea
        inputSize="lg"
        rows={3}
        autoFocus
        clearable
        onClear={() => onChange('')}
        placeholder="Leave it with the concierge"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </Field>
  )
}
