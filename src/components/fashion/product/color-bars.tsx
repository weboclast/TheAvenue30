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
 * Base size for the strip, in pixels. `ColorSwatchPicker` sizes its items off
 * this, and the classes below stretch them into bars.
 */
const BAR_UNIT = 8

/**
 * The strip itself. Bars are centered on each other rather than on their shared
 * edge, so the selected one grows both ways. `*:rounded-none` squares off the
 * ring the picker moves to the selection, the one child a bar cannot reach.
 */
const STRIP = 'items-center gap-px *:rounded-none'

/**
 * 8px unselected, 12px selected, 32px tall, stacked flush into one strip.
 *
 * The button is always the selected width and the swatch inside it is what
 * narrows, so every bar takes the same 12px of pointer however thin it looks.
 * The swatch carries the transition the button used to, the selected width
 * having moved onto it.
 */
const BAR =
  'h-8 w-3 rounded-none *:h-full *:w-2 *:rounded-none aria-selected:*:w-full motion-safe:*:transition-[width] motion-safe:*:duration-250'

interface ColorBarsProps extends Omit<
  ColorSwatchPickerProps,
  'value' | 'defaultValue' | 'onValueChange' | 'shape' | 'size' | 'layout' | 'children'
> {
  colors: Pick<ProductColor, 'name' | 'hex'>[]
  /** Index of the selected color in {@link colors}. */
  value: number
  onValueChange: (index: number) => void
  /**
   * Fired when a bar is pointed at or focused, ahead of any click. The cue to
   * start fetching that color's photography so selecting it is instant.
   */
  onPreload?: (index: number) => void
  /** Names the group for assistive tech, e.g. `'Color, Oversized cable-knit sweater'`. */
  label: string
}

/**
 * The strip of color bars down the side of a product card. Selecting one swaps
 * the card's photography.
 *
 * The same `ColorSwatchPicker` the Electronics card rounds into dots, stretched
 * into a flush column of bars, so the listbox semantics and the roving tab stop
 * come from the library and only the shape is ours. It works in colors, while
 * the card works in positions, so this wrapper translates between the two.
 */
export function ColorBars({ colors, value, onValueChange, onPreload, label, className, ...props }: ColorBarsProps) {
  // Keyed on hexa, which is how the picker keys its own colors, so both sides
  // agree on what counts as the same color.
  const indexByColor = useMemo(
    () => new Map(colors.map((color, index) => [formatColor(parseColor(color.hex), 'hexa'), index])),
    [colors],
  )

  return (
    <ColorSwatchPicker
      layout="stack"
      size={BAR_UNIT}
      aria-label={label}
      value={colors[value].hex}
      onValueChange={(color) => {
        const index = indexByColor.get(formatColor(color, 'hexa'))
        if (index !== undefined) onValueChange(index)
      }}
      className={cn(STRIP, className)}
      {...props}
    >
      {colors.map((color, index) => (
        <ColorSwatchPickerItem
          key={color.name}
          color={color.hex}
          colorName={color.name}
          onPointerEnter={() => onPreload?.(index)}
          onFocus={() => onPreload?.(index)}
          className={BAR}
        />
      ))}
    </ColorSwatchPicker>
  )
}
