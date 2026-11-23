'use client'

import { CreditCard, InfoSquareRounded, Lock } from '@appica/icons-react'
import { Badge } from '@appica/ui-react/badge'
import { Button } from '@appica/ui-react/button'
import { Checkbox } from '@appica/ui-react/checkbox'
import { Field, FieldError, FieldLabel } from '@appica/ui-react/field'
import { Input } from '@appica/ui-react/input'
import { Popover, PopoverContent, PopoverTrigger } from '@appica/ui-react/popover'
import { ChoiceGroup, ChoiceOption } from '@/components/checkout/choice-group'
import { type PaymentMarkName, PaymentMark, isWideMark } from '@/components/payment-methods'
import type { OrderCard, PaymentMethodId } from '@/lib/commerce/types'
import { PAYMENT_METHOD_LABELS } from '@/lib/payments/methods'
import { cn } from '@/lib/utils'
import { cardBrand, validateCardCode, validateCardExpiry, validateCardNumber, validateRequired } from '@/lib/validation'

/*
 * How the shopper pays, the same section in every storefront's checkout.
 *
 * The card fields are a placeholder, and the one part of this checkout you must
 * replace. They are validated but never submitted: `placeOrderAction` sends the
 * chosen method and nothing else. Real card details belong to the payment
 * provider's own hosted field, which is what keeps the card number off your
 * server and the store out of PCI scope. Drop that field in place of `CardFields` and delete
 * `validateCard` and `cardOnReceipt` with it.
 *
 * The other methods select and no more: each is a redirect or a provider-owned
 * sheet in a real store.
 */

/**
 * Handed to whoever is trying the template out when a card number is refused.
 * **Delete this with the card fields.** Any Luhn-valid number passes; this is one
 * that is easy to type.
 */
const DEMO_CARD = '4242 4242 4242 4242'

/** What marks each method wears here, and what it adds to the name in `PAYMENT_METHOD_LABELS`. */
const methods: { id: PaymentMethodId; note?: string; marks: PaymentMarkName[] }[] = [
  { id: 'card', marks: ['Visa', 'Mastercard', 'American Express', 'Diners Club'] },
  { id: 'klarna', note: 'Flexible payments', marks: ['Klarna'] },
  { id: 'paypal', marks: ['PayPal'] },
  { id: 'apple-pay', marks: ['Apple Pay'] },
  { id: 'google-pay', marks: ['Google Pay'] },
]

/** The card fields, as this section holds them. See the note above before keeping them. */
export interface CardFieldValues {
  number: string
  expiry: string
  code: string
  name: string
  /** Whether the card is billed to the shipping address, which is the common case. */
  sameBillingAddress: boolean
}

/** Messages for the card fields, by the key each one carries in {@link CardFieldValues}. */
export type CardFieldErrors = Partial<Record<keyof CardFieldValues, string>>

interface PaymentOptionsProps {
  value: PaymentMethodId
  onValueChange: (value: PaymentMethodId) => void
  card: CardFieldValues
  onCardChange: (card: CardFieldValues) => void
  errors: CardFieldErrors
  /**
   * Whether the order goes to an address the card can be billed to. Off for an
   * order collected in store, which drops the offer to bill it there.
   * @default true
   */
  ships?: boolean
  /**
   * The section heading, worded like the checkout's others.
   * @default 'Payment options'
   */
  heading?: string
  /**
   * The input look the storefront draws its forms in.
   * @default 'soft'
   */
  fieldVariant?: 'outline' | 'soft'
}

/** The payment section of the checkout: which method, and whatever that method needs. */
export function PaymentOptions({
  value,
  onValueChange,
  card,
  onCardChange,
  errors,
  ships = true,
  heading = 'Payment options',
  fieldVariant = 'soft',
}: PaymentOptionsProps) {
  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-foreground-intense text-2xl font-medium">{heading}</h2>
        <Badge variant="outline" size="lg">
          <Lock aria-hidden className="size-3.5" />
          Payment 100% secure
        </Badge>
      </div>

      <ChoiceGroup
        aria-label="Payment options"
        value={value}
        onValueChange={(next) => onValueChange(next as PaymentMethodId)}
      >
        {methods.map((method) => (
          <ChoiceOption
            key={method.id}
            value={method.id}
            label={PAYMENT_METHOD_LABELS[method.id]}
            description={method.note}
            aside={<PaymentMarks names={method.marks} monochrome={method.id !== value} />}
          >
            {method.id === 'card' ? (
              <CardFields
                values={card}
                errors={errors}
                onChange={onCardChange}
                billingOffer={ships}
                fieldVariant={fieldVariant}
              />
            ) : null}
          </ChoiceOption>
        ))}
      </ChoiceGroup>
    </section>
  )
}

/** The card checks a checkout runs before submitting. Delete this with the card fields. */
export function validateCard(values: CardFieldValues): CardFieldErrors {
  const number = validateCardNumber(values.number)

  return {
    // The demo hint only helps someone who typed a number, not someone who typed none.
    number: number && values.number.trim() ? `${number}. Try ${DEMO_CARD} in this demo.` : number,
    expiry: validateCardExpiry(values.expiry),
    code: validateCardCode(values.code),
    name: validateRequired(values.name, 'Card name'),
  }
}

/**
 * What a receipt may name the card by: its scheme and last 4 digits, never the
 * number. With a real provider's field, this comes back from them.
 */
export function cardOnReceipt(values: CardFieldValues): OrderCard {
  return { brand: cardBrand(values.number) ?? 'Card', last4: values.number.replace(/\D/g, '').slice(-4) }
}

interface CardFieldsProps {
  values: CardFieldValues
  errors: CardFieldErrors
  onChange: (card: CardFieldValues) => void
  /** Offers to bill the card to the shipping address. */
  billingOffer: boolean
  fieldVariant: 'outline' | 'soft'
}

/** Demo scaffolding. Replace with your payment provider's hosted field. */
function CardFields({ values, errors, onChange, billingOffer, fieldVariant }: CardFieldsProps) {
  const set = (patch: Partial<CardFieldValues>) => onChange({ ...values, ...patch })

  return (
    <div className="flex flex-col gap-4">
      <Field name="card-number" invalid={Boolean(errors.number)}>
        <FieldLabel>Card number</FieldLabel>
        <Input
          variant={fieldVariant}
          inputMode="numeric"
          autoComplete="cc-number"
          aria-required="true"
          placeholder="XXXX XXXX XXXX XXXX"
          endSlot={<CreditCard className="size-4" />}
          clearable
          onClear={() => set({ number: '' })}
          value={values.number}
          onChange={(event) => set({ number: event.target.value })}
        />
        <FieldError match={Boolean(errors.number)}>{errors.number}</FieldError>
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field name="card-expiry" invalid={Boolean(errors.expiry)}>
          <FieldLabel>Expiration date (MM / YY)</FieldLabel>
          <Input
            variant={fieldVariant}
            inputMode="numeric"
            autoComplete="cc-exp"
            aria-required="true"
            placeholder="MM / YY"
            clearable
            onClear={() => set({ expiry: '' })}
            value={values.expiry}
            onChange={(event) => set({ expiry: event.target.value })}
          />
          <FieldError match={Boolean(errors.expiry)}>{errors.expiry}</FieldError>
        </Field>

        <Field name="card-code" invalid={Boolean(errors.code)}>
          <FieldLabel>Security code</FieldLabel>
          <Input
            variant={fieldVariant}
            inputMode="numeric"
            autoComplete="cc-csc"
            aria-required="true"
            placeholder="CVV"
            endSlot={<SecurityCodeHint />}
            clearable
            onClear={() => set({ code: '' })}
            value={values.code}
            onChange={(event) => set({ code: event.target.value })}
          />
          <FieldError match={Boolean(errors.code)}>{errors.code}</FieldError>
        </Field>
      </div>

      <Field name="card-name" invalid={Boolean(errors.name)}>
        <FieldLabel>Card name</FieldLabel>
        <Input
          variant={fieldVariant}
          autoComplete="cc-name"
          aria-required="true"
          placeholder="Name on card"
          clearable
          onClear={() => set({ name: '' })}
          value={values.name}
          onChange={(event) => set({ name: event.target.value })}
        />
        <FieldError match={Boolean(errors.name)}>{errors.name}</FieldError>
      </Field>

      {billingOffer ? (
        <label className="text-foreground-intense flex w-fit items-center gap-2 text-sm">
          <Checkbox
            checked={values.sameBillingAddress}
            onCheckedChange={(checked) => set({ sameBillingAddress: Boolean(checked) })}
          />
          Use shipping address as billing address
        </label>
      ) : null}
    </div>
  )
}

/** Where to find a security code, since it is the card field shoppers most often get wrong. */
function SecurityCodeHint() {
  return (
    <Popover>
      <PopoverTrigger
        render={
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="-me-1.5"
            aria-label="Where to find your security code"
          >
            <InfoSquareRounded className="size-4" />
          </Button>
        }
      />
      <PopoverContent className="w-64 text-sm">
        The last 3 digits on the signature strip on the back of your card. American Express prints 4 instead, on the
        front above the card number.
      </PopoverContent>
    </Popover>
  )
}

/**
 * The marks beside a method's name. The chosen option wears them in their brand
 * colors and the rest stay flat, so the answer reads at a glance. Hidden from
 * screen readers: the option's label already says what it is.
 */
function PaymentMarks({ names, monochrome }: { names: PaymentMarkName[]; monochrome: boolean }) {
  return (
    <span aria-hidden className="text-foreground-muted flex items-center gap-2">
      {names.map((name) => (
        <span
          key={name}
          // A mark drawn wider than its slot scales into it rather than being
          // squeezed: `h-auto` is what lets the width it loses come off the
          // height too.
          className={cn('flex justify-center *:h-auto *:max-w-full', isWideMark(name) ? 'w-9.5' : 'w-7')}
        >
          <PaymentMark name={name} monochrome={monochrome} />
        </span>
      ))}
    </span>
  )
}
