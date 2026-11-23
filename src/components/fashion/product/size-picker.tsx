'use client'

import { PillGroup, PillOption } from '@/components/fashion/pill-group'
import type { ProductOptionValue } from '@/lib/commerce/types'
import { cn } from '@/lib/utils'

interface SizePickerProps {
  sizes: ProductOptionValue[]
  /** The picked size, by id. */
  value: string | undefined
  onValueChange: (id: string) => void
  /** The id of the line naming the choice, which labels the row. */
  labelledBy: string
  className?: string
}

/**
 * The size run as a row of pills. Sold-out sizes stay, struck through and
 * disabled, because a missing size reads as "not made in mine".
 */
export function SizePicker({ sizes, value, onValueChange, labelledBy, className }: SizePickerProps) {
  return (
    <PillGroup value={value} onValueChange={onValueChange} aria-labelledby={labelledBy} className={className}>
      {sizes.map((size) => {
        const soldOut = size.available === false
        return (
          <PillOption
            key={size.id}
            value={size.id}
            disabled={soldOut}
            className={cn('min-w-12', soldOut && 'line-through')}
          >
            {size.label}
            {soldOut ? <span className="sr-only">, sold out</span> : null}
          </PillOption>
        )
      })}
    </PillGroup>
  )
}
