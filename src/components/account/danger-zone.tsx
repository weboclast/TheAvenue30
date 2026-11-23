'use client'

import { useId, useState, useTransition } from 'react'
import { Download, Trash } from '@appica/icons-react'
import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogClose,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@appica/ui-react/alert-dialog'
import { Button } from '@appica/ui-react/button'
import { Field, FieldLabel } from '@appica/ui-react/field'
import { Input } from '@appica/ui-react/input'
import { useToastManager } from '@appica/ui-react/toast'
import type { FieldVariant } from '@/components/address-fields'
import { deleteAccountAction, exportAccountDataAction } from '@/lib/profile/actions'
import { errorToast } from '@/lib/toast'
import { cn } from '@/lib/utils'

const ROW = 'flex flex-wrap items-center justify-between gap-4 py-5'

interface DangerZoneProps {
  /** The shopper's address, which closing the account asks them to type. */
  email: string
  /** How that confirmation field is drawn. @default 'soft' */
  fieldVariant?: FieldVariant
}

/**
 * The 2 things a shopper can do to the record itself: take a copy, or end it.
 * Between them they are what GDPR articles 15 and 17 ask a store to offer, so
 * this is a section most stores need rather than a flourish.
 *
 * Erasing is not undoable and the confirmation asks for the email address to be
 * typed, which is the only guard between a stray click and an emptied account.
 */
export function DangerZone({ email, fieldVariant = 'soft' }: DangerZoneProps) {
  const [closing, setClosing] = useState(false)
  const [typed, setTyped] = useState('')
  const [working, startTransition] = useTransition()
  const toast = useToastManager()
  const heading = useId()

  const download = () =>
    startTransition(async () => {
      const result = await exportAccountDataAction()
      if (!result.ok) {
        toast.add(errorToast('Could not prepare your file', result.error))
        return
      }

      // A Server Action can hand back the text but not save it, so the browser
      // writes the file from a blob the moment it arrives.
      const url = URL.createObjectURL(new Blob([result.json], { type: 'application/json' }))
      const link = document.createElement('a')
      link.href = url
      link.download = result.filename
      link.click()
      URL.revokeObjectURL(url)
    })

  /* Only ever returns on a refusal: closing an account redirects out of here. */
  const close = () =>
    startTransition(async () => {
      const result = await deleteAccountAction()
      toast.add(errorToast('Could not close your account', result.error))
    })

  return (
    <section aria-labelledby={heading} className="flex flex-col gap-3 pt-4">
      <h2 id={heading} className="text-foreground-intense text-xl font-medium">
        Danger zone
      </h2>

      <div data-slot="account-card" className="border-error flex flex-col rounded-xl border px-4">
        <div className={ROW}>
          <div className="flex min-w-0 flex-col">
            <p className="text-foreground-intense font-medium">Download your data</p>
            <p className="text-foreground-muted text-sm">
              Your profile, your addresses, and your saved payment methods, as a JSON file.
            </p>
          </div>
          <Button variant="outline" disabled={working} focusableWhenDisabled onClick={download}>
            <Download data-icon="start" />
            Download
          </Button>
        </div>

        <div data-slot="account-rule" className={cn(ROW, 'border-border-strong border-t border-dashed')}>
          <div className="flex min-w-0 flex-col">
            <p className="text-foreground-intense font-medium">Close your account</p>
            <p className="text-foreground-muted text-sm">
              Erases everything above and signs you out. This cannot be undone.
            </p>
          </div>
          <Button variant="destructive" disabled={working} onClick={() => setClosing(true)}>
            <Trash data-icon="start" />
            Close account
          </Button>
        </div>
      </div>

      <AlertDialog
        open={closing}
        onOpenChange={(open) => {
          setClosing(open)
          setTyped('')
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="font-medium">Close your account?</AlertDialogTitle>
            <AlertDialogDescription>
              Your profile, addresses, saved payment methods, and wishlists are erased. Orders you have already placed
              are kept, because a store has to keep its records.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogBody>
            <Field name="confirm">
              <FieldLabel>Type your email address to confirm</FieldLabel>
              <Input
                type="email"
                autoComplete="off"
                aria-required="true"
                variant={fieldVariant}
                inputSize="lg"
                placeholder={email}
                value={typed}
                onChange={(event) => setTyped(event.target.value)}
              />
            </Field>
          </AlertDialogBody>

          <AlertDialogFooter>
            {/* The close renames the slot; this takes it back for a storefront styling buttons by it. */}
            <AlertDialogClose
              render={
                <Button data-slot="button" variant="outline">
                  Keep my account
                </Button>
              }
            />
            {/* Not an `AlertDialogClose`: the panel stays up until the redirect. */}
            <Button
              variant="destructive"
              disabled={working || typed.trim() !== email}
              focusableWhenDisabled
              onClick={close}
            >
              Close account
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  )
}
