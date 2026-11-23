'use client'

import { useState } from 'react'
import { Eye, EyeOff } from '@appica/icons-react'
import { Button } from '@appica/ui-react/button'
import { Input, type InputProps } from '@appica/ui-react/input'
import { type PasswordStrength, passwordStrength } from '@/lib/validation'
import { cn } from '@/lib/utils'

/** Every `Input` prop except `type` and `endSlot`, which the toggle owns. */
export interface PasswordFieldProps extends Omit<InputProps, 'type' | 'endSlot'> {
  /**
   * Show a strength meter below the field once something is typed. For choosing
   * a password, not for entering a known one, so sign-in leaves it off.
   */
  strength?: boolean
}

/**
 * Password input with a visibility toggle, and optionally a strength meter.
 * Accepts every `Input` prop except `type` and `endSlot`, which the toggle owns.
 *
 * Works uncontrolled, which is how the auth forms use it: the typed value is
 * tracked here only to score it, and a `value` prop still wins where one is
 * passed.
 */
export function PasswordField({ inputSize, strength = false, onChange, value, ...props }: PasswordFieldProps) {
  const [show, setShow] = useState(false)
  const [typed, setTyped] = useState('')

  const current = typeof value === 'string' ? value : typed

  const input = (
    <Input
      type={show ? 'text' : 'password'}
      inputSize={inputSize}
      value={value}
      onChange={(event) => {
        if (strength) setTyped(event.target.value)
        onChange?.(event)
      }}
      endSlot={
        <Button
          type="button"
          className={inputSize === 'lg' ? '-me-2' : '-me-1.5'}
          variant="ghost"
          size={inputSize === 'lg' ? 'icon-md' : 'icon-sm'}
          aria-label="Show password"
          aria-pressed={show}
          onClick={() => setShow((visible) => !visible)}
        >
          {show ? <EyeOff /> : <Eye />}
        </Button>
      }
      {...props}
    />
  )

  if (!strength) return input

  return (
    <div className="flex flex-col">
      {input}
      <StrengthMeter strength={passwordStrength(current)} />
    </div>
  )
}

/** Fill color per score. Two middles share one, because the bar count already separates them. */
const SCORE_COLORS = ['', 'bg-error-emphasis', 'bg-warning-emphasis', 'bg-warning-emphasis', 'bg-success-emphasis']

/**
 * The meter, collapsed to nothing until there is a score. Expands on
 * `grid-template-rows` behind `motion-safe`, the way `FieldError` does, so the 2
 * messages under a field enter alike and neither animates under reduced motion.
 */
function StrengthMeter({ strength }: { strength: PasswordStrength }) {
  const open = strength.score > 0

  return (
    <div
      className={cn(
        'grid motion-safe:transition-[grid-template-rows] motion-safe:duration-200 motion-safe:ease-out',
        open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
      )}
    >
      <div
        className={cn(
          'min-h-0 overflow-hidden motion-safe:transition-opacity motion-safe:duration-200 motion-safe:ease-out',
          open ? 'opacity-100' : 'opacity-0',
        )}
      >
        <div className="flex items-center gap-2 pt-2">
          <div className="flex flex-1 gap-1" aria-hidden>
            {[1, 2, 3, 4].map((step) => (
              <span
                key={step}
                className={cn(
                  'h-1 flex-1 rounded-full motion-safe:transition-colors motion-safe:duration-200',
                  step <= strength.score ? SCORE_COLORS[strength.score] : 'bg-border',
                )}
              />
            ))}
          </div>
          {/* Announced only when the level changes, since that is the only time the text does. */}
          <p role="status" className="text-foreground-muted w-12 shrink-0 text-end text-xs">
            {strength.label}
          </p>
        </div>
      </div>
    </div>
  )
}
