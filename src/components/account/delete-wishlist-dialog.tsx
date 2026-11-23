'use client'

import {
  AlertDialog,
  AlertDialogClose,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@appica/ui-react/alert-dialog'
import { Button } from '@appica/ui-react/button'

interface DeleteWishlistDialogProps {
  /** The list's name, for the question. */
  name: string
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Deletes the list. The dialog closes as it runs. */
  onConfirm: () => void
}

/**
 * Asks before a wishlist goes, since everything saved in it goes too. Render it
 * beside the menu that opens it rather than inside, since that menu closes first.
 */
export function DeleteWishlistDialog({ name, open, onOpenChange, onConfirm }: DeleteWishlistDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="font-medium">Delete {name}?</AlertDialogTitle>
          <AlertDialogDescription>
            Everything saved in it is removed with it. Your other lists and your orders stay as they are.
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
              <Button data-slot="button" variant="destructive" onClick={onConfirm}>
                Delete wishlist
              </Button>
            }
          />
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
