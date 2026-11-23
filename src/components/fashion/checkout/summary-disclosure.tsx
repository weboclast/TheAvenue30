'use client'

import { ChevronDown } from '@appica/icons-react'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@appica/ui-react/collapsible'
import { Price } from '@/components/price'
import { useCart } from '@/lib/cart/cart-context'
import { cn } from '@/lib/utils'
import { SummaryLines } from './summary-lines'

/**
 * The order at the top of a narrow checkout: its total at a glance, its lines on
 * a tap. From `lg` the summary beside the form lists them instead, so hide this there.
 */
export function SummaryDisclosure({ className }: { className?: string }) {
  const { cart } = useCart()

  return (
    <Collapsible className={cn('bg-background-muted rounded-sm', className)}>
      <CollapsibleTrigger className="group flex w-full items-center justify-between gap-4 rounded-sm px-4 py-3 focus-visible:outline-2 focus-visible:outline-offset-2">
        <span className="text-foreground-intense flex items-center gap-2 font-medium">
          Order summary <span className="text-foreground-subtle font-normal">({cart.totalQuantity})</span>
          <ChevronDown
            aria-hidden
            className="size-4 transition-transform duration-300 group-data-panel-open:rotate-180 motion-reduce:transition-none"
          />
        </span>
        <Price money={cart.total} scaleFraction={false} className="text-foreground-intense font-mono font-semibold" />
      </CollapsibleTrigger>
      <CollapsibleContent>
        <SummaryLines lines={cart.lines} className="px-4 pt-1 pb-4" />
      </CollapsibleContent>
    </Collapsible>
  )
}
