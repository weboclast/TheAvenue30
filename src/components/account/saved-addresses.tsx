'use client'

import { useId, useState, useTransition } from 'react'
import { MapPinOff, Plus } from '@appica/icons-react'
import {
  AlertDialog,
  AlertDialogClose,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@appica/ui-react/alert-dialog'
import { Badge } from '@appica/ui-react/badge'
import { Button } from '@appica/ui-react/button'
import { useToastManager } from '@appica/ui-react/toast'
import { type AddressTarget, AddressDialog } from '@/components/account/address-dialog'
import type { FieldLook } from '@/components/address-fields'
import { type AddressActionResult, forgetAddressAction } from '@/lib/addresses/actions'
import { type SavedAddress, addressLines, addressName } from '@/lib/addresses/book'
import { errorToast } from '@/lib/toast'

interface SavedAddressesProps extends FieldLook {
  /** The shopper's address book, the default first. */
  addresses: SavedAddress[]
}

/**
 * The account's delivery addresses: a card each, and the panel that adds
 * another.
 *
 * It owns the book, because every panel below it edits the same one and each
 * action hands the new one back. `lib/addresses` is the seam; nothing here knows
 * what is behind it.
 */
export function SavedAddresses({ addresses: saved, fieldVariant, flags }: SavedAddressesProps) {
  const [addresses, setAddresses] = useState(saved)
  const [target, setTarget] = useState<AddressTarget>(null)
  const [deleting, setDeleting] = useState<SavedAddress | null>(null)
  const [working, startTransition] = useTransition()
  const toast = useToastManager()
  const listHeading = useId()

  /** Runs a change and adopts what came back. A refusal is the store's answer, so it is toasted. */
  const run = (title: string, action: () => Promise<AddressActionResult>) =>
    startTransition(async () => {
      const result = await action()
      if (!result.ok) {
        toast.add(errorToast(title, result.error))
        return
      }

      setAddresses(result.addresses)
    })

  return (
    <>
      <div data-slot="account-panel" className="bg-background-muted flex flex-col gap-2 rounded-xl p-2">
        <div className="flex flex-wrap items-center gap-2 px-2 py-1">
          <h2 id={listHeading} data-slot="account-title" className="text-foreground-intense flex-1 font-medium">
            Delivery addresses
          </h2>
          <Button onClick={() => setTarget('new')}>
            <Plus data-icon="start" />
            Add address
          </Button>
        </div>

        {addresses.length === 0 ? (
          <div
            data-slot="account-panel-item"
            className="bg-background flex flex-col items-center gap-3 rounded-lg px-2 py-10 text-center"
          >
            <MapPinOff aria-hidden data-slot="account-empty-icon" className="text-foreground-muted size-8" />
            <p className="text-foreground-intense font-medium">No addresses saved yet</p>
            <p className="-mt-1 text-sm">Add the places you order to and they are ready at checkout.</p>
          </div>
        ) : (
          <ul aria-labelledby={listHeading} className="flex flex-col gap-2">
            {addresses.map((address) => (
              <li
                key={address.id}
                data-slot="account-panel-item"
                className="bg-background flex flex-wrap items-end gap-3 rounded-lg p-4"
              >
                <div className="flex min-w-50 flex-1 flex-col gap-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p data-slot="account-copy" className="text-foreground-intense text-sm font-medium">
                      {addressName(address)}
                    </p>
                    {address.label ? <Badge variant="outline">{address.label}</Badge> : null}
                    {address.default ? <Badge variant="secondary">Default</Badge> : null}
                  </div>
                  {/* `not-italic` undoes the `<address>` element's browser default. */}
                  <address data-slot="account-copy" className="text-sm not-italic">
                    {addressLines(address).map((line) => (
                      <span key={line} className="block">
                        {line}
                      </span>
                    ))}
                  </address>
                </div>

                <div className="ms-auto flex gap-1">
                  <Button variant="outline" size="sm" disabled={working} onClick={() => setTarget(address)}>
                    Edit
                  </Button>
                  <Button variant="outline" size="sm" disabled={working} onClick={() => setDeleting(address)}>
                    Delete
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <AddressDialog
        target={target}
        onOpenChange={() => setTarget(null)}
        onSaved={setAddresses}
        fieldVariant={fieldVariant}
        flags={flags}
      />

      <AlertDialog open={deleting !== null} onOpenChange={() => setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="font-medium">Delete this address?</AlertDialogTitle>
            <AlertDialogDescription>
              You can add it again whenever you like. Orders already on their way there are not affected.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            {/* The close renames the slot; this takes it back for a storefront styling buttons by it. */}
            <AlertDialogClose
              render={
                <Button data-slot="button" variant="soft">
                  Keep it
                </Button>
              }
            />
            <AlertDialogClose
              render={
                <Button
                  data-slot="button"
                  variant="destructive"
                  onClick={() => deleting && run('Could not delete that', () => forgetAddressAction(deleting.id))}
                >
                  Delete
                </Button>
              }
            />
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
