'use client'

import { type SubmitEvent, useState, useTransition } from 'react'
import { CircleXFilled } from '@appica/icons-react'
import { Alert, AlertIcon, AlertTitle } from '@appica/ui-react/alert'
import { Button } from '@appica/ui-react/button'
import { Checkbox } from '@appica/ui-react/checkbox'
import { Field, FieldDescription, FieldLabel } from '@appica/ui-react/field'
import { Form } from '@appica/ui-react/form'
import { Input } from '@appica/ui-react/input'
import {
  type AddressFieldErrors,
  type AddressFieldValues,
  AddressFields,
  type FieldLook,
  addressFieldValues,
  toAddress,
  validateAddressFields,
} from '@/components/address-fields'
import {
  Overlay,
  OverlayBody,
  OverlayContent,
  OverlayFooter,
  OverlayHeader,
  OverlayTitle,
  useOverlayAsDialog,
} from '@/components/overlay-sheet'
import { useHeldWhileClosing } from '@/components/use-held-while-closing'
import { saveAddressAction, updateAddressAction } from '@/lib/addresses/actions'
import { MAX_LABEL, type SavedAddress } from '@/lib/addresses/book'
import { revealFirstInvalidField } from '@/lib/form-errors'

/*
 * Adding an address and editing one, on 1 panel: the checkout's own fields, plus
 * the 2 things only an account asks for, what to call it and whether to deliver
 * here by default.
 *
 * No email field. The checkout asks a guest where to send the confirmation; an
 * account already answers that.
 */

/** What the dialog is working on: `'new'` for one being added, `null` closes it. */
export type AddressTarget = SavedAddress | 'new' | null

interface AddressDialogProps extends FieldLook {
  target: AddressTarget
  onOpenChange: (open: boolean) => void
  /** The book the store accepted, for the page to adopt. */
  onSaved: (addresses: SavedAddress[]) => void
}

/** Adds or edits a saved address. Takes the target rather than an `open` flag, so it can stay mounted. */
export function AddressDialog({ target, onOpenChange, onSaved, fieldVariant, flags }: AddressDialogProps) {
  const shown = useHeldWhileClosing(target, target !== null)

  return (
    <Overlay open={target !== null} onOpenChange={onOpenChange}>
      <OverlayContent className="w-160" closeLabel="Close">
        {/* Keyed on what is being worked on, so opening a second address starts
            from that address rather than from the last one's half-edited fields. */}
        {shown ? (
          <AddressForm
            key={shown === 'new' ? 'new' : shown.id}
            target={shown}
            onClose={() => onOpenChange(false)}
            onSaved={onSaved}
            fieldVariant={fieldVariant}
            flags={flags}
          />
        ) : null}
      </OverlayContent>
    </Overlay>
  )
}

interface AddressFormProps extends FieldLook {
  target: NonNullable<AddressTarget>
  onClose: () => void
  onSaved: (addresses: SavedAddress[]) => void
}

/** The form itself, mounted only while the dialog holds a target, so the `key` above resets it. */
function AddressForm({ target, onClose, onSaved, fieldVariant = 'soft', flags }: AddressFormProps) {
  const editing = target === 'new' ? undefined : target
  const asDialog = useOverlayAsDialog()
  const [pending, startTransition] = useTransition()

  const [values, setValues] = useState<AddressFieldValues>(() => addressFieldValues(editing))
  const [label, setLabel] = useState(editing?.label ?? '')
  const [makeDefault, setMakeDefault] = useState(Boolean(editing?.default))
  const [errors, setErrors] = useState<AddressFieldErrors>({})
  const [refused, setRefused] = useState<string>()

  /* Re-validate on keystroke only once a field was flagged invalid. */
  const change = (next: AddressFieldValues) => {
    setValues(next)
    setErrors((previous) => (Object.keys(previous).length > 0 ? validateAddressFields(next, false) : previous))
  }

  const handleSubmit = (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault()

    const found = validateAddressFields(values, false)
    setErrors(found)
    setRefused(undefined)
    if (Object.values(found).some(Boolean)) {
      revealFirstInvalidField(event.currentTarget)
      return
    }

    startTransition(async () => {
      const result = editing
        ? await updateAddressAction(editing.id, {
            ...toAddress(values),
            // `null` is what clears a label the shopper emptied.
            label: label.trim() || null,
            ...(makeDefault && { default: true }),
          })
        : await saveAddressAction({ ...toAddress(values), label: label.trim(), default: makeDefault })

      if (!result.ok) {
        setRefused(result.error)
        return
      }

      onSaved(result.addresses)
      onClose()
    })
  }

  return (
    <>
      <OverlayHeader>
        <OverlayTitle className="font-medium">{editing ? 'Edit address' : 'Add address'}</OverlayTitle>
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
            autoFocus={asDialog}
            fieldVariant={fieldVariant}
            flags={flags}
          />

          <Field name="address-label">
            <FieldLabel>Address name (optional)</FieldLabel>
            <Input
              variant={fieldVariant}
              inputSize="lg"
              maxLength={MAX_LABEL}
              placeholder="Home"
              value={label}
              onChange={(event) => setLabel(event.target.value)}
            />
            <FieldDescription>What to call it in this list, where 2 addresses look alike.</FieldDescription>
          </Field>

          {/* Nothing to choose on the address that already leads, and nothing to
              choose on the first one saved, which becomes the default anyway. */}
          {editing?.default ? null : (
            <label className="text-foreground-intense flex w-fit items-center gap-2 text-sm select-none">
              <Checkbox checked={makeDefault} onCheckedChange={(checked) => setMakeDefault(Boolean(checked))} />
              Deliver here by default
            </label>
          )}
        </OverlayBody>

        <OverlayFooter className="pb-0">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={pending} focusableWhenDisabled>
            {editing ? 'Save changes' : 'Save address'}
          </Button>
        </OverlayFooter>
      </Form>
    </>
  )
}
