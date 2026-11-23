'use client'

import { type SubmitEvent, useState, useTransition } from 'react'
import { CircleXFilled } from '@appica/icons-react'
import { Alert, AlertIcon, AlertTitle } from '@appica/ui-react/alert'
import { Button } from '@appica/ui-react/button'
import { Form } from '@appica/ui-react/form'
import { useToastManager } from '@appica/ui-react/toast'
import {
  type AddressFieldErrors,
  type AddressFieldValues,
  type FieldLook,
  AddressFields,
  addressFieldValues,
  toAddress,
  validateAddressFields,
} from '@/components/address-fields'
import {
  Overlay,
  OverlayBody,
  OverlayContent,
  OverlayDescription,
  OverlayFooter,
  OverlayHeader,
  OverlayTitle,
} from '@/components/overlay-sheet'
import type { Order } from '@/lib/commerce/types'
import type { DemoSlug } from '@/lib/demos'
import { useHeldWhileClosing } from '@/components/use-held-while-closing'
import { revealFirstInvalidField } from '@/lib/form-errors'
import { changeShippingAddressAction } from '@/lib/orders/actions'
import { successToast } from '@/lib/toast'

interface ChangeAddressDialogProps extends FieldLook {
  demo: DemoSlug
  /** The order to reroute. `null` closes the dialog. */
  order: Order | null
  onOpenChange: (open: boolean) => void
}

/**
 * Asks for an order to go somewhere else, on the fields the checkout collected
 * it on. The store answers by email; see `changeShippingAddressAction`. No email
 * field, because the order already carries one.
 *
 * Takes the order rather than an `open` flag so it can stay mounted: a dialog
 * first rendered open skips its entrance and appears rather than fades in.
 */
export function ChangeAddressDialog({ order, onOpenChange, ...props }: ChangeAddressDialogProps) {
  const shown = useHeldWhileClosing(order, order !== null)

  return (
    <Overlay open={order !== null} onOpenChange={onOpenChange}>
      <OverlayContent className="w-160">
        {/* Keyed on the order, so opening a second one starts from that order's
            address rather than from the last one's half-edited fields. */}
        {shown ? <ChangeAddressForm key={shown.number} order={shown} onOpenChange={onOpenChange} {...props} /> : null}
      </OverlayContent>
    </Overlay>
  )
}

/**
 * The form itself, mounted only while the dialog holds an order, so its state is
 * thrown away with the panel and the `key` above is enough to reset it.
 */
function ChangeAddressForm({
  demo,
  order,
  onOpenChange,
  fieldVariant,
  flags,
}: ChangeAddressDialogProps & { order: Order }) {
  const toast = useToastManager()
  const [pending, startTransition] = useTransition()
  const [values, setValues] = useState<AddressFieldValues>(() => addressFieldValues(order.shippingAddress))
  const [errors, setErrors] = useState<AddressFieldErrors>({})
  const [refused, setRefused] = useState<string>()

  /* Re-validate on keystroke only once a field was flagged invalid. */
  const change = (next: AddressFieldValues) => {
    setValues(next)
    setErrors((previous) => (Object.keys(previous).length > 0 ? validateAddressFields(next, false) : previous))
  }

  const handleSubmit = (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault()

    const next = validateAddressFields(values, false)
    setErrors(next)
    setRefused(undefined)
    if (Object.values(next).some(Boolean)) {
      revealFirstInvalidField(event.currentTarget)
      return
    }

    startTransition(async () => {
      const result = await changeShippingAddressAction(demo, order.number, toAddress(values))
      if (!result.ok) {
        setRefused(result.error)
        return
      }

      toast.add(successToast('Address change requested', 'We will confirm by email before anything moves.'))
      onOpenChange(false)
    })
  }

  return (
    <>
      <OverlayHeader>
        <OverlayTitle className="font-medium">Change delivery address</OverlayTitle>
        <OverlayDescription>
          Tell us where order {order.number} should go instead. We will confirm by email before anything moves.
        </OverlayDescription>
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

          <AddressFields
            values={values}
            onChange={change}
            errors={errors}
            heading={null}
            askEmail={false}
            fieldVariant={fieldVariant}
            flags={flags}
          />
        </OverlayBody>

        <OverlayFooter className="pb-0">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="submit" disabled={pending} focusableWhenDisabled>
            {pending ? 'Sending…' : 'Request change'}
          </Button>
        </OverlayFooter>
      </Form>
    </>
  )
}
