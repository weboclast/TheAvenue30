'use client'

import { createContext, use } from 'react'
import { X } from '@appica/icons-react'
import { buttonVariants } from '@appica/ui-react/button'
import {
  Dialog,
  DialogClose,
  type DialogContentProps,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@appica/ui-react/dialog'
import {
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@appica/ui-react/drawer'
import { useMediaQuery } from '@appica/ui-react/hooks/use-media-query'
import { ScrollArea } from '@appica/ui-react/scroll-area'
import { cn } from '@/lib/utils'

/*
 * A centered dialog on a desktop, a bottom sheet on a phone. Dialog and Drawer
 * have the same parts, so this is a mapping rather than a component.
 *
 * A drawer that stays a drawer at every width is not this: use `Drawer` with the
 * side it belongs on.
 */

/** From this width up the overlay is a dialog. Below it, a sheet from the bottom edge. */
const OVERLAY_AS_DIALOG = '(min-width: 48rem)'

/**
 * How wide the store's roomy surfaces are: the trade-in and smart-comparison
 * dialogs, and the drawers holding a product's reviews, the assistant's read on
 * them, and an order's details. Shared so opening any of them reads as the same
 * surface, and exported from here because it applies to a plain `Drawer` too.
 */
export const WIDE_OVERLAY_WIDTH = 'w-170'

const OverlayModeContext = createContext(true)

/**
 * A dialog with its × on the page: narrow enough to leave the corner free, and
 * without what would make the popup the box a `fixed` child is placed in (a
 * transform, a `scale` entrance, a backdrop filter). It enters with a fade alone.
 */
const PAGE_CLOSE_POPUP = cn(
  'max-w-[calc(100%-8rem)]',
  'transform-none backdrop-blur-none data-starting-style:motion-safe:scale-none data-ending-style:motion-safe:scale-none',
)

interface OverlayProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  children: React.ReactNode
}

/** The overlay root. Crossing the breakpoint swaps the subtree, so its state lives above this. */
export function Overlay({ open, onOpenChange, children }: OverlayProps) {
  const asDialog = useMediaQuery(OVERLAY_AS_DIALOG, { defaultValue: true })

  return (
    <OverlayModeContext value={asDialog}>
      {asDialog ? (
        <Dialog open={open} onOpenChange={onOpenChange}>
          {children}
        </Dialog>
      ) : (
        <Drawer side="bottom" open={open} onOpenChange={onOpenChange}>
          {children}
        </Drawer>
      )}
    </OverlayModeContext>
  )
}

/**
 * Whether the surrounding {@link Overlay} is drawn as a dialog rather than as a
 * bottom sheet. Read it where a child has to behave differently in the 2: a form
 * autofocusing its first field is the case this exists for, since claiming focus
 * while the sheet is still sliding cancels its entrance, and the keyboard that
 * comes with it covers the fields.
 */
export function useOverlayAsDialog(): boolean {
  return use(OverlayModeContext)
}

/** Loose on purpose: each part forwards to the element its Dialog or Drawer counterpart renders. */
type OverlayPartProps = React.ComponentProps<'div'>

/** The element that opens the overlay. */
export function OverlayTrigger({ render }: { render: React.ReactElement }) {
  return use(OverlayModeContext) ? <DialogTrigger render={render} /> : <DrawerTrigger render={render} />
}

interface OverlayContentProps {
  children: React.ReactNode
  /** Sizing for the dialog. A bottom sheet spans the viewport, so it is ignored there. */
  className?: string
  /** Sizing for the sheet, which otherwise takes the height of its content. Ignored by the dialog. */
  sheetClassName?: string
  /** What the dialog focuses on open. Ignored by the sheet, which focuses its own panel. */
  initialFocus?: DialogContentProps['initialFocus']
  /** Accessible label for the × button. */
  closeLabel?: string
  /**
   * Puts the dialog's × in the page's top corner, on the backdrop, rather than
   * on the panel. Ignored by the sheet, which covers the page.
   * @default false
   */
  closeOnPage?: boolean
  /**
   * Draws the sheet's ×. Turned off, the sheet closes with a swipe down or
   * Escape. Ignored by the dialog.
   * @default true
   */
  sheetCloseButton?: boolean
}

/**
 * The panel, with its backdrop and close button. `initialFocus` is withheld from
 * the sheet: claiming focus mid-slide cancels the transition, and the sheet
 * snaps in and wobbles.
 */
export function OverlayContent({
  className,
  sheetClassName,
  initialFocus,
  closeLabel,
  closeOnPage = false,
  sheetCloseButton = true,
  children,
}: OverlayContentProps) {
  return use(OverlayModeContext) ? (
    <DialogContent
      className={cn(closeOnPage && PAGE_CLOSE_POPUP, className)}
      initialFocus={initialFocus}
      closeLabel={closeLabel}
      closeButton={!closeOnPage}
    >
      {children}
      {/* Inside the popup, so it stays in the focus trap. */}
      {closeOnPage ? (
        <DialogClose
          aria-label={closeLabel ?? 'Close'}
          data-slot="dialog-close-button"
          className={cn(buttonVariants({ variant: 'outline', size: 'icon-md' }), 'fixed inset-e-6 top-6')}
        >
          <X />
        </DialogClose>
      ) : null}
    </DialogContent>
  ) : (
    <DrawerContent className={sheetClassName} closeLabel={closeLabel} closeButton={sheetCloseButton}>
      {children}
    </DrawerContent>
  )
}

/** Groups {@link OverlayTitle} and {@link OverlayDescription}. Stays pinned while the body scrolls. */
export function OverlayHeader(props: OverlayPartProps) {
  return use(OverlayModeContext) ? <DialogHeader {...props} /> : <DrawerHeader {...props} />
}

/** The heading that labels the panel. Every overlay needs one. */
export function OverlayTitle(props: OverlayPartProps) {
  return use(OverlayModeContext) ? <DialogTitle {...props} /> : <DrawerTitle {...props} />
}

/** The line under the title, which also describes the panel to a screen reader. */
export function OverlayDescription(props: OverlayPartProps) {
  return use(OverlayModeContext) ? <DialogDescription {...props} /> : <DrawerDescription {...props} />
}

/**
 * The main region, scrolling between the pinned header and footer.
 *
 * A sheet keeps `DrawerBody` around the `ScrollArea`: it is what separates a
 * scroll from the swipe that dismisses, and without it the sheet snaps open
 * instead of sliding. Same nesting as the cart and sign-in drawers.
 */
export function OverlayBody({ className, children }: OverlayPartProps) {
  const content = (
    <ScrollArea className="min-h-0 flex-1" scrollbarVisibility="auto">
      <div className={cn('px-6', className)}>{children}</div>
    </ScrollArea>
  )

  // A column rather than the `h-full` the side drawers use: a sheet is sized by
  // its content, so a percentage height has nothing definite to resolve against.
  return use(OverlayModeContext) ? (
    content
  ) : (
    <DrawerBody className="flex flex-col overflow-hidden px-0">{content}</DrawerBody>
  )
}

/** The actions along the bottom. Stays pinned while the body scrolls. */
export function OverlayFooter(props: OverlayPartProps) {
  return use(OverlayModeContext) ? <DialogFooter {...props} /> : <DrawerFooter {...props} />
}
