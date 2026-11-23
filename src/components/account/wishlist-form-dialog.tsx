'use client'

import { type SubmitEvent, useState, useTransition } from 'react'
import { CircleXFilled } from '@appica/icons-react'
import { Alert, AlertIcon, AlertTitle } from '@appica/ui-react/alert'
import { Button } from '@appica/ui-react/button'
import { Field, FieldError, FieldLabel } from '@appica/ui-react/field'
import { Form } from '@appica/ui-react/form'
import { Input } from '@appica/ui-react/input'
import { Textarea } from '@appica/ui-react/textarea'
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
import type { Wishlist } from '@/lib/commerce/types'
import { useHeldWhileClosing } from '@/components/use-held-while-closing'
import { revealFirstInvalidField } from '@/lib/form-errors'
import { validateRequired } from '@/lib/validation'
import { MAX_WISHLIST_DESCRIPTION, MAX_WISHLIST_NAME } from '@/lib/wishlist/lists'
import { useWishlist } from '@/lib/wishlist/wishlist-context'

/** What the dialog is doing: opening a list, or editing one. `null` closes it. */
export type WishlistFormTarget = { mode: 'create' } | { mode: 'edit'; wishlist: Wishlist } | null

interface WishlistFormDialogProps {
  target: WishlistFormTarget
  onOpenChange: (open: boolean) => void
  /**
   * The list as saved, once the store accepted it. The board switches to it,
   * which is the only way a shopper sees what they just made.
   */
  onSaved?: (wishlist: Wishlist) => void
  /** How the fields are drawn. @default 'soft' */
  fieldVariant?: FieldVariant
}

/**
 * Opens a wishlist or edits one, on the same 2 fields either way.
 *
 * Takes the target rather than an `open` flag so it can stay mounted: a dialog
 * first rendered open skips its entrance. Whether a name is free is the store's
 * answer, so a refusal comes back from the action and is shown above the fields
 * rather than guessed at here.
 */
export function WishlistFormDialog({ target, onOpenChange, onSaved, fieldVariant }: WishlistFormDialogProps) {
  const shown = useHeldWhileClosing(target, target !== null)

  return (
    <Overlay open={target !== null} onOpenChange={onOpenChange}>
      <OverlayContent className="w-120" closeLabel="Close">
        {/* Keyed on what is being edited, so opening a second list starts from
            that list's name rather than from the last one's. */}
        {shown ? (
          <WishlistForm
            key={shown.mode === 'edit' ? shown.wishlist.id : 'create'}
            target={shown}
            onOpenChange={onOpenChange}
            onSaved={onSaved}
            fieldVariant={fieldVariant}
          />
        ) : null}
      </OverlayContent>
    </Overlay>
  )
}

/** The form itself, mounted only while the dialog holds a target, so the `key` above resets it. */
function WishlistForm({
  target,
  onOpenChange,
  onSaved,
  fieldVariant = 'soft',
}: WishlistFormDialogProps & { target: NonNullable<WishlistFormTarget> }) {
  const { createList, updateList } = useWishlist()
  const [pending, startTransition] = useTransition()
  const asDialog = useOverlayAsDialog()
  const editing = target.mode === 'edit' ? target.wishlist : undefined

  const [name, setName] = useState(editing?.name ?? '')
  const [description, setDescription] = useState(editing?.description ?? '')
  const [error, setError] = useState<string>()
  const [refused, setRefused] = useState<string>()

  const handleSubmit = (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault()
    setRefused(undefined)

    const invalid = validateRequired(name, 'Wishlist name')
    setError(invalid)
    if (invalid) {
      revealFirstInvalidField(event.currentTarget)
      return
    }

    startTransition(async () => {
      // `null` on an edit is what clears a description the shopper emptied;
      // leaving it out would keep the old one.
      const result = editing
        ? await updateList(editing.id, { name, description: description.trim() || null })
        : await createList({ name, description: description.trim() || undefined })

      if (!result.ok) {
        setRefused(result.error)
        return
      }

      // A new list is found by name, which the store keeps unique.
      const saved = result.wishlists.find((list) =>
        editing ? list.id === editing.id : list.name.toLowerCase() === name.trim().toLowerCase(),
      )
      if (saved) onSaved?.(saved)
      onOpenChange(false)
    })
  }

  return (
    <>
      <OverlayHeader>
        <OverlayTitle className="font-medium">{editing ? 'Edit wishlist' : 'Create new wishlist'}</OverlayTitle>
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

          <Field name="wishlist-name" invalid={Boolean(error)}>
            <FieldLabel>Wishlist name</FieldLabel>
            {/* Not in the bottom sheet: claiming focus while it is still sliding
                cancels its entrance. Same reason `OverlayContent` withholds
                `initialFocus` there. */}
            <Input
              variant={fieldVariant}
              inputSize="lg"
              autoFocus={asDialog}
              required
              maxLength={MAX_WISHLIST_NAME}
              placeholder="Gift ideas"
              value={name}
              onChange={(event) => {
                setName(event.target.value)
                // Only once flagged, so no message on the first keystroke.
                if (error) setError(validateRequired(event.target.value, 'Wishlist name'))
              }}
            />
            <FieldError match={Boolean(error)}>{error}</FieldError>
          </Field>

          <Field name="wishlist-description">
            <FieldLabel>Description</FieldLabel>
            <Textarea
              variant={fieldVariant}
              rows={3}
              maxLength={MAX_WISHLIST_DESCRIPTION}
              placeholder="What this list is for."
              value={description}
              onChange={(event) => setDescription(event.target.value)}
            />
          </Field>
        </OverlayBody>

        <OverlayFooter className="pb-0">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="submit" disabled={pending || !name.trim()} focusableWhenDisabled>
            {editing ? 'Save changes' : 'Create wishlist'}
          </Button>
        </OverlayFooter>
      </Form>
    </>
  )
}
