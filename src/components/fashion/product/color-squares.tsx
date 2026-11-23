'use client'

import { useMemo } from 'react'
import { formatColor, parseColor } from '@appica/ui-react/color'
import {
  ColorSwatchPicker,
  ColorSwatchPickerItem,
  type ColorSwatchPickerProps,
} from '@appica/ui-react/color-swatch-picker'
import type { ProductColor } from '@/lib/commerce/types'
import { cn } from '@/lib/utils'

/**
 * Every square keeps the selected size and only its swatch shrinks, so the ring
 * the picker slides over lands on the edge of a full square, and each one is
 * the same 32px target.
 */
const SQUARE =
  'rounded-none *:size-full *:rounded-none *:scale-75 aria-selected:*:scale-100 motion-safe:*:transition-[scale] motion-safe:*:duration-250'

interface ColorSquaresProps extends Omit<
  ColorSwatchPickerProps,
  'value' | 'defaultValue' | 'onValueChange' | 'shape' | 'size' | 'layout' | 'children'
> {
  colors: ProductColor[]
  /** Index of the selected color in {@link colors}. */
  value: number
  onValueChange: (index: number) => void
}

/**
 * The product page's color picker: a row of squares, the selected one full
 * size and ringed. The card's `ColorBars` is the same picker in another shape,
 * and keys colors the same way, by hexa.
 */
export function ColorSquares({ colors, value, onValueChange, className, ...props }: ColorSquaresProps) {
  const indexByColor = useMemo(
    () => new Map(colors.map((color, index) => [formatColor(parseColor(color.hex), 'hexa'), index])),
    [colors],
  )

  return (
    <ColorSwatchPicker
      size={32}
      value={colors[value].hex}
      onValueChange={(color) => {
        const index = indexByColor.get(formatColor(color, 'hexa'))
        if (index !== undefined) onValueChange(index)
      }}
      // Squares off the ring, the one child an item's classes cannot reach.
      className={cn('gap-0.5 *:rounded-none', className)}
      {...props}
    >
      {colors.map((color) => (
        <ColorSwatchPickerItem key={color.name} color={color.hex} colorName={color.name} className={SQUARE} />
      ))}
    </ColorSwatchPicker>
  )
}
