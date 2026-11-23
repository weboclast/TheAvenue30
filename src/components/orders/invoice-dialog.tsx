'use client'

import { useRef } from 'react'
import { Printer } from '@appica/icons-react'
import { Button } from '@appica/ui-react/button'
import { InvoiceDocument } from '@/components/orders/invoice-document'
import {
  Overlay,
  OverlayBody,
  OverlayContent,
  OverlayFooter,
  OverlayHeader,
  OverlayTitle,
} from '@/components/overlay-sheet'
import type { Order } from '@/lib/commerce/types'

interface InvoiceDialogProps {
  order: Order
  open: boolean
  onOpenChange: (open: boolean) => void
}

/**
 * The invoice, on screen and on paper. Saving a PDF is the browser's job:
 * `window.print()` opens its dialog, which offers a PDF destination. Swap the
 * footer button for a link to your own file if your backend issues invoices.
 *
 * `data-print-root` is what the `@media print` block in `globals.css` prints;
 * keep the 2 in step.
 */
export function InvoiceDialog({ order, open, onOpenChange }: InvoiceDialogProps) {
  // Otherwise focus lands on the link at the foot of the invoice, and reaching
  // it scrolls the masthead away.
  const title = useRef<HTMLHeadingElement>(null)

  return (
    <Overlay open={open} onOpenChange={onOpenChange}>
      <OverlayContent className="w-150" initialFocus={title}>
        <OverlayHeader>
          <OverlayTitle ref={title} tabIndex={-1} className="font-medium outline-none">
            Invoice preview
          </OverlayTitle>
        </OverlayHeader>

        <OverlayBody>
          <div data-print-root>
            <InvoiceDocument order={order} />
          </div>
        </OverlayBody>

        <OverlayFooter>
          <Button onClick={() => window.print()}>
            <Printer data-icon="start" />
            Print or save as PDF
          </Button>
        </OverlayFooter>
      </OverlayContent>
    </Overlay>
  )
}
