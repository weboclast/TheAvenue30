'use client'

import { Button, type ButtonProps } from '@appica/ui-react/button'
import { Toggle, type ToggleProps } from '@appica/ui-react/toggle'
import { ToggleGroup, type ToggleGroupProps } from '@appica/ui-react/toggle-group'
import { cn } from '@/lib/utils'

/*
 * Toggle pills: a size, a fit, a catalog filter. Pressed, a pill takes the
 * primary outline and keeps its ground, rather than the fill `primary-outline`
 * presses into.
 */

interface PillGroupProps extends Omit<ToggleGroupProps, 'value' | 'defaultValue' | 'onValueChange' | 'multiple'> {
  /** The picked pill, by the `value` on its {@link PillOption}. `undefined` until one is. */
  value: string | undefined
  /** Fires with the pill just picked. Pressing the picked one again leaves it picked. */
  onValueChange: (value: string) => void
}

/** A wrapping row of pills, exactly one of them picked. Name it with `aria-label` or `aria-labelledby`. */
export function PillGroup({ value, onValueChange, className, ...props }: PillGroupProps) {
  return (
    <ToggleGroup
      value={value === undefined ? [] : [value]}
      onValueChange={([picked]) => {
        if (picked !== undefined) onValueChange(picked)
      }}
      className={cn('w-auto flex-wrap gap-1', className)}
      {...props}
    />
  )
}

interface PillOptionProps extends Omit<ToggleProps, 'render'> {
  /**
   * Height and padding, from the scale `Button` uses.
   * @default 'md'
   */
  size?: ButtonProps['size']
}

/** One pill. Inside a group it takes `value`; on its own, `pressed` and `onPressedChange`. */
export function PillOption({ size = 'md', className, ...props }: PillOptionProps) {
  return (
    <Toggle
      {...props}
      render={(toggle, state) => (
        <Button {...toggle} size={size} variant={state.pressed ? 'primary-outline' : 'outline'} />
      )}
      className={cn('data-pressed:text-primary font-mono data-pressed:before:bg-transparent', className)}
    />
  )
}
