'use client'

import { useMemo } from 'react'
import { formatColor, parseColor } from '@appica/ui-react/color'
import {
  ColorSwatchPicker,
  ColorSwatchPickerItem,
  type ColorSwatchPickerProps,
} from '@appica/ui-react/color-swatch-picker'
import type { ProductColor } from '@/lib/commerce/types'

/** Matches the 14px dot the card used before the picker replaced it. */
const SWATCH_SIZE = 14

/**
 * A ring that thick would swallow a dot this small, so it drops from the 3px
 * every other control gets.
 */
const SWATCH_FOCUS_RING = 'focus-visible:outline-2 focus-visible:outline-offset-1'

interface ColorSwatchesProps extends Omit<
  ColorSwatchPickerProps,
  'value' | 'defaultValue' | 'onValueChange' | 'shape' | 'size' | 'children'
> {
  colors: Pick<ProductColor, 'name' | 'hex'>[]
  /** Index of the selected color in {@link colors}. */
  value: number
  onValueChange: (index: number) => void
  /**
   * Fired when a swatch is pointed at or focused, ahead of any click. The cue to
   * start fetching that color's images so selecting it is instant.
   */
  onPreload?: (index: number) => void
  /** Names the group for assistive tech, e.g. `'Color, iPhone 17 Pro'`. */
  label: string
}

/**
 * The row of color dots on a product card. Selecting one swaps the card's image
 * set.
 *
 * `ColorSwatchPicker` supplies the listbox semantics, the roving tab stop, and
 * the ring that travels to the selected dot. It works in colors, while the card
 * works in positions, so this wrapper translates between the two.
 */
export function ColorSwatches({ colors, value, onValueChange, onPreload, label, ...props }: ColorSwatchesProps) {
  // Keyed on hexa, which is how the picker keys its own colors, so both sides
  // agree on what counts as the same color.
  const indexByColor = useMemo(
    () => new Map(colors.map((color, index) => [formatColor(parseColor(color.hex), 'hexa'), index])),
    [colors],
  )

  return (
    <ColorSwatchPicker
      shape="circle"
      size={SWATCH_SIZE}
      aria-label={label}
      value={colors[value].hex}
      onValueChange={(color) => {
        const index = indexByColor.get(formatColor(color, 'hexa'))
        if (index !== undefined) onValueChange(index)
      }}
      {...props}
    >
      {colors.map((color, index) => (
        <ColorSwatchPickerItem
          key={color.name}
          color={color.hex}
          colorName={color.name}
          onPointerEnter={() => onPreload?.(index)}
          onFocus={() => onPreload?.(index)}
          className={SWATCH_FOCUS_RING}
        />
      ))}
    </ColorSwatchPicker>
  )
}
