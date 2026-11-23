'use client'

import { Printer } from '@appica/icons-react'
import { Button } from '@appica/ui-react/button'
import { cn } from '@/lib/utils'

/**
 * Prints the element marked `data-print-root`, which on a legal page is the
 * document itself: the chrome, the sibling links, and the table of contents are
 * left off the paper by the `@media print` block in `globals.css`. Keep the 2 in
 * step.
 *
 * The browser's own dialog offers a PDF destination, so saving a copy needs no
 * code of ours.
 */
export function PrintButton({ className }: { className?: string }) {
  return (
    <Button variant="primary-outline" onClick={() => window.print()} className={cn('print:hidden', className)}>
      <Printer data-icon="start" />
      Print or save as PDF
    </Button>
  )
}
