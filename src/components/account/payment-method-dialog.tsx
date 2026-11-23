'use client'

import { type SubmitEvent, useState, useTransition } from 'react'
import { CircleXFilled, CreditCard } from '@appica/icons-react'
import { Alert, AlertIcon, AlertTitle } from '@appica/ui-react/alert'
import { Button } from '@appica/ui-react/button'
import { Checkbox } from '@appica/ui-react/checkbox'
import { Field, FieldDescription, FieldError, FieldLabel } from '@appica/ui-react/field'
import { Form } from '@appica/ui-react/form'
import { Input } from '@appica/ui-react/input'
import { Radio } from '@appica/ui-react/radio'
import { RadioGroup } from '@appica/ui-react/radio-group'
import { CountryField, type FieldLook } from '@/components/address-fields'
import {
  Overlay,
  OverlayBody,
  OverlayContent,
  OverlayFooter,
  OverlayHeader,
  OverlayTitle,
  useOverlayAsDialog,
} from '@/components/overlay-sheet'
import { PaymentMark, hasPaymentMark, paymentMarkSlot, paymentMethodMark } from '@/components/payment-methods'
import { useHeldWhileClosing } from '@/components/use-held-while-closing'
import type { PaymentMethodId } from '@/lib/commerce/types'
import { revealFirstInvalidField } from '@/lib/form-errors'
import { savePaymentMethodAction, updatePaymentMethodAction } from '@/lib/payments/actions'
import {
  MASK,
  MAX_NICKNAME,
  PAYMENT_METHOD_LABELS,
  type SavedPaymentMethod,
  formatExpiry,
} from '@/lib/payments/methods'
import { cn } from '@/lib/utils'
import {
  cardBrand,
  parseCardExpiry,
  validateCardCode,
  validateCardExpiry,
  validateCardNumber,
  validatePostcode,
  validateRequired,
} from '@/lib/validation'

/*
 * Everything the page can add or change, on 1 dialog: a card, a replacement for
 * one, an edit to one, and a linked wallet.
 *
 * The card number is collected here and never leaves the browser: what is
 * submitted is the scheme and the last 4 digits, which is what a payment
 * provider would have returned. **Replace these fields with your provider's
 * hosted field** the same way the checkout's `CardFields` is replaced, and the
 * actions behind them do not change.
 *
 * An edit cannot touch the number, because no vault will change it either: the
 * token is bound to the digits, so a provider's update takes an expiry and a
 * billing address and never a card number. It re-asks what a shopper
 * genuinely re-types, and a new number goes through `'replace'`, which saves the
 * new card and forgets the old one in 1 write.
 *
 * A wallet has no form at all. {@link LinkWallet} stands in for the redirect and
 * consent screen the provider owns: **replace it with PayPal's own flow**, which
 * comes back with a billing agreement and the payer's email.
 */

/** What the dialog is doing. `null` closes it. */
export type PaymentMethodFormTarget =
  | { mode: 'add' }
  | { mode: 'edit'; method: SavedPaymentMethod }
  | { mode: 'replace'; method: SavedPaymentMethod }
  | null

/** What can be added from this page, in the order the choice lists them. */
const ADDABLE: PaymentMethodId[] = ['card', 'paypal']

interface PaymentMethodDialogProps extends FieldLook {
  target: PaymentMethodFormTarget
  /** Swaps what the dialog is doing, which is how an edit becomes a replacement. `null` closes it. */
  onTargetChange: (target: PaymentMethodFormTarget) => void
  /** The set the store accepted, for the page to adopt. */
  onSaved: (methods: SavedPaymentMethod[]) => void
}

/** Adds, replaces or edits a saved method. Takes the target rather than an `open` flag, so it can stay mounted. */
export function PaymentMethodDialog({
  target,
  onTargetChange,
  onSaved,
  fieldVariant,
  flags,
}: PaymentMethodDialogProps) {
  const close = () => onTargetChange(null)
  const shown = useHeldWhileClosing(target, target !== null)

  return (
    <Overlay open={target !== null} onOpenChange={close}>
      <OverlayContent className="w-140" closeLabel="Close">
        {shown === null ? null : shown.mode === 'add' ? (
          <AddPaymentMethod onClose={close} onSaved={onSaved} fieldVariant={fieldVariant} flags={flags} />
        ) : (
          /* Keyed on what is being worked on, so opening a second card starts
             from that card's details, and turning an edit into a replacement
             starts from an empty form. */
          <PaymentMethodForm
            key={`${shown.mode}-${shown.method.id}`}
            target={shown}
            onReplace={() => onTargetChange({ mode: 'replace', method: shown.method })}
            onClose={close}
            onSaved={onSaved}
            fieldVariant={fieldVariant}
            flags={flags}
          />
        )}
      </OverlayContent>
    </Overlay>
  )
}

interface PanelProps extends FieldLook {
  onClose: () => void
  onSaved: (methods: SavedPaymentMethod[]) => void
}

/**
 * The add flow. Which kind comes first, because a wallet has nothing to fill in:
 * it is a trip to the provider and back. Holds that choice, and unmounts with
 * the dialog, so the next opening starts on a card again.
 */
function AddPaymentMethod({ onClose, onSaved, fieldVariant, flags }: PanelProps) {
  const [method, setMethod] = useState<PaymentMethodId>('card')
  const choice = <MethodChoice value={method} onValueChange={setMethod} />

  return method === 'card' ? (
    <PaymentMethodForm
      target={{ mode: 'add' }}
      choice={choice}
      onClose={onClose}
      onSaved={onSaved}
      fieldVariant={fieldVariant}
      flags={flags}
    />
  ) : (
    <LinkWallet method={method} choice={choice} onClose={onClose} onSaved={onSaved} />
  )
}

/** Which kind is being added. Apple Pay and Google Pay are absent: a device provisions those, and nothing is saved. */
function MethodChoice({
  value,
  onValueChange,
}: {
  value: PaymentMethodId
  onValueChange: (value: PaymentMethodId) => void
}) {
  return (
    <RadioGroup
      aria-label="Kind of payment method"
      value={value}
      onValueChange={(next) => onValueChange(next as PaymentMethodId)}
      className="grid gap-2 sm:grid-cols-2"
    >
      {ADDABLE.map((method) => {
        const mark = paymentMethodMark(method)

        return (
          <label
            key={method}
            data-slot="account-card"
            className={cn(
              'flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors motion-reduce:transition-none',
              method === value ? 'bg-background-muted border-transparent' : 'hover:border-border-strong',
            )}
          >
            <Radio value={method} />
            <span className="text-foreground-intense text-sm font-medium">{PAYMENT_METHOD_LABELS[method]}</span>
            {mark ? (
              <span className={cn(paymentMarkSlot(mark), 'ms-auto')}>
                <PaymentMark name={mark} />
              </span>
            ) : (
              <CreditCard className="text-foreground-muted ms-auto size-5" />
            )}
          </label>
        )
      })}
    </RadioGroup>
  )
}

interface LinkWalletProps extends PanelProps {
  /** Which wallet, so the copy and the mark name it. */
  method: PaymentMethodId
  choice: React.ReactNode
}

/**
 * Connecting a wallet: no fields, 1 button. Demo scaffolding for the redirect a
 * provider owns, which is why nothing here invents an account - a real callback
 * is what knows the payer's email, and the card reads "Connected" without one.
 */
function LinkWallet({ method, choice, onClose, onSaved }: LinkWalletProps) {
  const [pending, startTransition] = useTransition()
  const [refused, setRefused] = useState<string>()
  const label = PAYMENT_METHOD_LABELS[method]
  const mark = paymentMethodMark(method)

  const connect = () =>
    startTransition(async () => {
      setRefused(undefined)
      const result = await savePaymentMethodAction({ method })

      if (!result.ok) {
        setRefused(result.error)
        return
      }

      onSaved(result.methods)
      onClose()
    })

  return (
    <>
      <OverlayHeader>
        <OverlayTitle className="font-medium">Add payment method</OverlayTitle>
      </OverlayHeader>

      <OverlayBody className="flex flex-col gap-4 pb-1">
        {refused ? <RefusalAlert>{refused}</RefusalAlert> : null}

        {choice}

        <div
          data-slot="account-card"
          className="border-border-subtle flex flex-col items-center gap-4 rounded-xl border p-6 text-center"
        >
          {mark ? (
            <span className="flex w-24 *:h-auto *:max-w-full">
              <PaymentMark name={mark} />
            </span>
          ) : null}
          <p className="text-foreground-muted text-sm">
            You finish on {label}&apos;s own site and come back. There is nothing to fill in here, and this store never
            sees your {label} password.
          </p>
        </div>
      </OverlayBody>

      <OverlayFooter>
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="button" disabled={pending} focusableWhenDisabled onClick={connect}>
          Continue to {label}
        </Button>
      </OverlayFooter>
    </>
  )
}

/** Every field the form holds. The number and the security code are only ever asked for once. */
interface FormValues {
  number: string
  expiry: string
  code: string
  holder: string
  nickname: string
  countryCode: string
  postcode: string
  makeDefault: boolean
}

type FormErrors = Partial<Record<keyof FormValues, string>>

interface PaymentMethodFormProps extends PanelProps {
  target: NonNullable<PaymentMethodFormTarget>
  /** Sits above the fields while adding: which kind is being saved. */
  choice?: React.ReactNode
  /** Turns an edit into a replacement, for a card an issuer reissued under a new number. */
  onReplace?: () => void
}

/** The card form, in its 3 modes. Mounted only while the dialog holds a target, so the `key` above resets it. */
function PaymentMethodForm({
  target,
  choice,
  onReplace,
  onClose,
  onSaved,
  fieldVariant = 'soft',
  flags,
}: PaymentMethodFormProps) {
  const editing = target.mode === 'edit' ? target.method : undefined
  const replacing = target.mode === 'replace' ? target.method : undefined
  // What the form opens on: an edit re-shows the card, a replacement carries the
  // old one's details onto the new card the shopper is holding.
  const source = editing ?? replacing
  const card = editing?.card
  const asDialog = useOverlayAsDialog()
  const [pending, startTransition] = useTransition()

  const [values, setValues] = useState<FormValues>({
    number: '',
    expiry: card ? formatExpiry(card) : '',
    code: '',
    holder: source?.card?.holder ?? '',
    nickname: source?.nickname ?? '',
    countryCode: source?.billing?.countryCode ?? '',
    postcode: source?.billing?.postcode ?? '',
    makeDefault: Boolean(source?.default),
  })
  const [errors, setErrors] = useState<FormErrors>({})
  const [refused, setRefused] = useState<string>()

  const set = (patch: Partial<FormValues>) => setValues({ ...values, ...patch })
  const brand = cardBrand(values.number)

  const handleSubmit = (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault()

    const found = validate(values, Boolean(editing))
    setErrors(found)
    if (Object.values(found).some(Boolean)) {
      revealFirstInvalidField(event.currentTarget)
      return
    }

    const expiry = parseCardExpiry(values.expiry)
    if (!expiry) return

    const billing = { countryCode: values.countryCode, postcode: values.postcode.trim() }
    setRefused(undefined)

    startTransition(async () => {
      const result = editing
        ? await updatePaymentMethodAction(editing.id, {
            holder: values.holder,
            expiryMonth: expiry.month,
            expiryYear: expiry.year,
            // `null` is what clears a nickname the shopper emptied.
            nickname: values.nickname.trim() || null,
            billing,
            ...(values.makeDefault && { default: true }),
          })
        : await savePaymentMethodAction(
            {
              method: 'card',
              card: {
                // The provider names the scheme in a real integration; here the
                // issuer prefix does, and anything unrecognized is just a card.
                brand: brand ?? 'Card',
                last4: values.number.replace(/\D/g, '').slice(-4),
                holder: values.holder,
                expiryMonth: expiry.month,
                expiryYear: expiry.year,
              },
              nickname: values.nickname,
              billing,
              default: values.makeDefault,
            },
            replacing?.id,
          )

      if (!result.ok) {
        setRefused(result.error)
        return
      }

      onSaved(result.methods)
      onClose()
    })
  }

  return (
    <>
      <OverlayHeader>
        <OverlayTitle className="font-medium">
          {editing ? 'Edit payment method' : replacing ? 'Replace card' : 'Add payment method'}
        </OverlayTitle>
      </OverlayHeader>

      <Form noValidate onSubmit={handleSubmit} className="contents">
        <OverlayBody className="flex flex-col gap-4 pb-1">
          {refused ? <RefusalAlert>{refused}</RefusalAlert> : null}

          {choice}

          {replacing?.card ? (
            <p className="text-foreground-muted text-sm">
              Taking over from {replacing.card.brand} {MASK} {replacing.card.last4}, which is removed as soon as this
              card is saved. Its name, billing address and place in the list carry over.
            </p>
          ) : null}

          {card ? (
            <div className="flex flex-col gap-2">
              <div
                data-slot="account-card"
                className="bg-background-muted flex items-center gap-3 rounded-lg px-4 py-3.5"
              >
                {hasPaymentMark(card.brand) ? (
                  <span className={paymentMarkSlot(card.brand)}>
                    <PaymentMark name={card.brand} />
                  </span>
                ) : (
                  <CreditCard className="text-foreground-muted size-5" />
                )}
                <p className="text-foreground-intense min-w-0 truncate text-sm font-medium">
                  {card.brand} {MASK} {card.last4}
                </p>
              </div>
              <p className="text-foreground-muted text-sm">
                Card numbers cannot be changed: a new number is a new card to every payment provider. The expiry, the
                name and the billing address below are what a reissue actually changes.
              </p>
              <Button type="button" variant="outline" size="sm" onClick={onReplace} className="w-fit">
                Replace this card
              </Button>
            </div>
          ) : (
            <Field name="card-number" invalid={Boolean(errors.number)}>
              <FieldLabel>Card number</FieldLabel>
              <Input
                variant={fieldVariant}
                inputSize="lg"
                inputMode="numeric"
                autoComplete="cc-number"
                aria-required="true"
                autoFocus={asDialog}
                placeholder="XXXX XXXX XXXX XXXX"
                endSlot={
                  brand && hasPaymentMark(brand) ? (
                    <span className={paymentMarkSlot(brand)}>
                      <PaymentMark name={brand} />
                    </span>
                  ) : (
                    <CreditCard className="size-4" />
                  )
                }
                clearable
                onClear={() => set({ number: '' })}
                value={values.number}
                onChange={(event) => set({ number: event.target.value })}
              />
              <FieldDescription>
                Only the scheme and the last 4 digits are kept. Any Luhn-valid number is accepted in this demo.
              </FieldDescription>
              <FieldError match={Boolean(errors.number)}>{errors.number}</FieldError>
            </Field>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <Field name="card-expiry" invalid={Boolean(errors.expiry)}>
              <FieldLabel>Expiration date (MM/YY)</FieldLabel>
              <Input
                variant={fieldVariant}
                inputSize="lg"
                inputMode="numeric"
                autoComplete="cc-exp"
                aria-required="true"
                autoFocus={asDialog && Boolean(editing)}
                placeholder="MM/YY"
                clearable
                onClear={() => set({ expiry: '' })}
                value={values.expiry}
                onChange={(event) => set({ expiry: event.target.value })}
              />
              <FieldError match={Boolean(errors.expiry)}>{errors.expiry}</FieldError>
            </Field>

            {/* Never asked for again: a stored security code is the one thing a
                card network forbids outright. */}
            {editing ? null : (
              <Field name="card-code" invalid={Boolean(errors.code)}>
                <FieldLabel>Security code</FieldLabel>
                <Input
                  variant={fieldVariant}
                  inputSize="lg"
                  inputMode="numeric"
                  autoComplete="cc-csc"
                  aria-required="true"
                  placeholder="CVV"
                  clearable
                  onClear={() => set({ code: '' })}
                  value={values.code}
                  onChange={(event) => set({ code: event.target.value })}
                />
                <FieldError match={Boolean(errors.code)}>{errors.code}</FieldError>
              </Field>
            )}
          </div>

          <Field name="card-holder" invalid={Boolean(errors.holder)}>
            <FieldLabel>Name on card</FieldLabel>
            <Input
              variant={fieldVariant}
              inputSize="lg"
              autoComplete="cc-name"
              aria-required="true"
              placeholder="Sarah Jenkins"
              clearable
              onClear={() => set({ holder: '' })}
              value={values.holder}
              onChange={(event) => set({ holder: event.target.value })}
            />
            <FieldError match={Boolean(errors.holder)}>{errors.holder}</FieldError>
          </Field>

          <Field name="card-nickname">
            <FieldLabel>Card name (optional)</FieldLabel>
            <Input
              variant={fieldVariant}
              inputSize="lg"
              maxLength={MAX_NICKNAME}
              placeholder="Work card"
              value={values.nickname}
              onChange={(event) => set({ nickname: event.target.value })}
            />
            <FieldDescription>What to call it in this list, where 2 cards look alike.</FieldDescription>
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <CountryField
              label="Billing country"
              emptyMessage="No country by that name."
              autoComplete="billing country-name"
              value={values.countryCode}
              onValueChange={(countryCode) => set({ countryCode })}
              error={errors.countryCode}
              flags={flags}
              variant={fieldVariant}
            />

            <Field name="billing-postcode" invalid={Boolean(errors.postcode)}>
              <FieldLabel>Billing postcode</FieldLabel>
              <Input
                variant={fieldVariant}
                inputSize="lg"
                autoComplete="billing postal-code"
                aria-required="true"
                clearable
                onClear={() => set({ postcode: '' })}
                value={values.postcode}
                onChange={(event) => set({ postcode: event.target.value })}
              />
              <FieldError match={Boolean(errors.postcode)}>{errors.postcode}</FieldError>
            </Field>
          </div>

          {/* Nothing to choose on the card that already leads, and nothing to
              choose on the first one saved, which becomes the default anyway. */}
          {source?.default ? null : (
            <label className="text-foreground-intense flex w-fit items-center gap-2 text-sm select-none">
              <Checkbox
                checked={values.makeDefault}
                onCheckedChange={(checked) => set({ makeDefault: Boolean(checked) })}
              />
              Use this card by default
            </label>
          )}
        </OverlayBody>

        <OverlayFooter className="pb-0">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={pending} focusableWhenDisabled>
            {editing ? 'Save changes' : replacing ? 'Replace card' : 'Save'}
          </Button>
        </OverlayFooter>
      </Form>
    </>
  )
}

/** What the store said no to, at the top of whichever panel asked. */
function RefusalAlert({ children }: { children: React.ReactNode }) {
  return (
    <Alert variant="error" role="alert">
      <AlertIcon>
        <CircleXFilled />
      </AlertIcon>
      <AlertTitle as="div" className="text-sm font-normal">
        {children}
      </AlertTitle>
    </Alert>
  )
}

/** Delete the number and code checks with the fields they belong to. */
function validate(values: FormValues, editing: boolean): FormErrors {
  return {
    ...(editing ? {} : { number: validateCardNumber(values.number), code: validateCardCode(values.code) }),
    expiry: validateCardExpiry(values.expiry),
    holder: validateRequired(values.holder, 'Name on card'),
    countryCode: validateRequired(values.countryCode, 'Billing country'),
    postcode: validatePostcode(values.postcode),
  }
}
