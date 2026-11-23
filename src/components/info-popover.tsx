'use client'

import { InfoCircle } from '@appica/icons-react'
import { Button } from '@appica/ui-react/button'
import { type PopoverContentProps, Popover, PopoverContent, PopoverTrigger } from '@appica/ui-react/popover'
import { cn } from '@/lib/utils'

interface InfoPopoverProps {
  /** What the figure beside it means. Keep it to a sentence or two. */
  children: React.ReactNode
  /** Accessible name for the button, since the icon carries none. */
  label: string
  side?: PopoverContentProps['side']
  align?: PopoverContentProps['align']
  className?: string
}

/**
 * The muted ⓘ beside a figure that needs a sentence of explanation, and the
 * panel it opens.
 *
 * A popover rather than a tooltip: these sit on an account page a shopper is as
 * likely to read on a phone, and a tooltip has no open state a tap can reach.
 */
export function InfoPopover({ children, label, side = 'top', align = 'center', className }: InfoPopoverProps) {
  return (
    <Popover>
      <PopoverTrigger
        render={
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={label}
            className={cn('text-foreground-muted size-5 rounded-full before:hidden', className)}
          >
            <InfoCircle className="size-4" />
          </Button>
        }
      />
      <PopoverContent side={side} align={align} className="max-w-72 text-sm">
        {children}
      </PopoverContent>
    </Popover>
  )
}
