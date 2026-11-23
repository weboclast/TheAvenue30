'use client'

import { useState } from 'react'
import Link from 'next/link'
import { CircleXFilled } from '@appica/icons-react'
import { Alert, AlertIcon, AlertTitle } from '@appica/ui-react/alert'
import { Button } from '@appica/ui-react/button'
import { Field, FieldDescription, FieldLabel } from '@appica/ui-react/field'
import { Form } from '@appica/ui-react/form'
import { Textarea } from '@appica/ui-react/textarea'
import { type AddressFieldValues, toAddress } from '@/components/address-fields'
import { ContactDetails } from '@/components/checkout/contact-details'
import { PaymentOptions } from '@/components/checkout/payment-options'
import { useCheckoutForm } from '@/components/checkout/use-checkout-form'
import { CartGiftWrap } from '@/components/fashion/cart/cart-gift-wrap'
import { CartSummary } from '@/components/fashion/cart/cart-summary'
import { SUMMARY_ASIDE, SUMMARY_GRID, SUMMARY_MAIN } from '@/components/fashion/summary-layout'
import { Price } from '@/components/price'
import type { Customer } from '@/lib/auth'
import { useCart } from '@/lib/cart/cart-context'
import type { Address, PickupLocation } from '@/lib/commerce/types'
import { legalPath } from '@/lib/legal'
import { cn } from '@/lib/utils'
import { validateEmail } from '@/lib/validation'
import { DeliveryOptions, chosenDelivery, validateDeliveryFields } from './delivery-options'
import { SummaryDisclosure } from './summary-disclosure'

/** The sign-in drawer as the shop layout's `SignInGate` draws it. */
const FASHION_SIGN_IN = { createAccountVariant: 'soft', registerVariant: 'primary', logo: false } as const

/** What fits on the card in the box. Keep in step with `MAX_GIFT_MESSAGE` in the demo adapter's `order.ts`. */
const GIFT_MESSAGE_LENGTH = 250

interface CheckoutFormProps {
  /** The signed-in shopper, whose name and email open the form filled in. `null` for a guest. */
  customer: Customer | null
}

/**
 * The Fashion checkout: contact, delivery, and payment down the page, and the
 * bag's summary beside them, holding "Pay now". It owns the fields; whatever the
 * cart prices (delivery, wrapping, a code, points) stays a cart mutation, so the
 * total beside the form is the one charged.
 */
export function CheckoutForm({ customer }: CheckoutFormProps) {
  const { cart, pending } = useCart()
  const [notes, setNotes] = useState('')
  const [giftMessage, setGiftMessage] = useState('')
  const pickup = chosenDelivery(cart)?.pickup
  const checkout = useCheckoutForm({
    demo: 'fashion',
    customer,
    validate: (values) => ({ email: validateEmail(values.email), ...validateDeliveryFields(values, Boolean(pickup)) }),
    order: (details) => ({
      shippingAddress: pickup ? collectorAt(pickup, details) : toAddress(details),
      ...(!pickup && { notes }),
      ...(cart.giftBox?.added && { giftMessage }),
    }),
  })

  return (
    <Form
      noValidate
      onSubmit={checkout.submit}
      className={cn('container pt-2 pb-16 md:pb-20 lg:pt-6 xl:pb-24', SUMMARY_GRID)}
    >
      <div className={cn('flex flex-col gap-10', SUMMARY_MAIN)}>
        <h1 className="sr-only">Checkout</h1>

        <SummaryDisclosure className="lg:hidden" />

        <ContactDetails
          values={checkout.details}
          onChange={checkout.changeDetails}
          errors={checkout.detailErrors}
          customer={customer}
          fieldVariant="outline"
          signIn={FASHION_SIGN_IN}
        />

        <DeliveryOptions
          values={checkout.details}
          onChange={checkout.changeDetails}
          errors={checkout.detailErrors}
          notes={notes}
          onNotesChange={setNotes}
        />

        <CartGiftWrap>
          <Field name="gift-message">
            <FieldLabel>Gift note (optional)</FieldLabel>
            <Textarea
              inputSize="lg"
              rows={3}
              maxLength={GIFT_MESSAGE_LENGTH}
              clearable
              onClear={() => setGiftMessage('')}
              placeholder="Happy birthday, with love from all of us"
              value={giftMessage}
              onChange={(event) => setGiftMessage(event.target.value)}
            />
            <FieldDescription>
              Printed on a card in the box. {GIFT_MESSAGE_LENGTH - giftMessage.length} characters left.
            </FieldDescription>
          </Field>
        </CartGiftWrap>

        <PaymentOptions
          heading="Payment"
          value={checkout.payment}
          onValueChange={checkout.setPayment}
          card={checkout.card}
          onCardChange={checkout.changeCard}
          errors={checkout.cardErrors}
          ships={!pickup}
          fieldVariant="outline"
        />
      </div>

      <CartSummary
        editHref="/cart"
        action={
          <div className="flex flex-col gap-4">
            {checkout.refused ? (
              <Alert variant="error" role="alert">
                <AlertIcon>
                  <CircleXFilled />
                </AlertIcon>
                <AlertTitle as="div" className="text-sm font-normal">
                  {checkout.refused}
                </AlertTitle>
              </Alert>
            ) : null}

            <p className="text-sm">
              By paying, you agree to our{' '}
              <Link
                href={legalPath('fashion', 'terms-of-service')}
                className="text-foreground-intense font-medium underline hover:no-underline"
              >
                terms
              </Link>{' '}
              and{' '}
              <Link
                href={legalPath('fashion', 'privacy-policy')}
                className="text-foreground-intense font-medium underline hover:no-underline"
              >
                privacy policy
              </Link>
              .
            </p>

            {/* Held while the cart reprices, so the total on the button is the one charged. */}
            <Button
              type="submit"
              size="lg"
              className="w-full"
              disabled={checkout.placing || pending}
              focusableWhenDisabled
            >
              {checkout.placing ? (
                'Placing your order…'
              ) : (
                <>
                  Pay now <Price money={cart.total} scaleFraction={false} />
                </>
              )}
            </Button>
          </div>
        }
        className={cn(SUMMARY_ASIDE, 'lg:top-6')}
      />
    </Form>
  )
}

/**
 * A collected order's address: the store's, under the collector's name. The
 * adapter records its own copy of the store; this one passes the action's checks.
 */
function collectorAt(pickup: PickupLocation, details: AddressFieldValues): Address {
  return {
    ...pickup.address,
    firstName: details.firstName.trim(),
    lastName: details.lastName.trim(),
    phone: details.phone.trim(),
  }
}
