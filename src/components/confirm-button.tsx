'use client'

import { type ReactNode, useEffect, useRef, useState } from 'react'
import { Button, type ButtonProps } from '@appica/ui-react/button'
import { cn } from '@/lib/utils'

const CHECK_PATH = 'M4.3 12.55 L9.25 17.5 L19.7 6.5'

interface ConfirmButtonProps extends Omit<ButtonProps, 'children' | 'onClick'> {
  /** The resting icon, swapped for the check while confirming. */
  icon: ReactNode
  /** Accessible name at rest. */
  label: string
  /** Accessible name while the check is showing; also announced politely. */
  confirmedLabel: string
  /** Runs on click. The check appears only once it resolves. */
  action: () => void | Promise<void>
  /** Called instead of confirming when {@link action} throws. */
  onActionError?: (error: unknown) => void
  /** How long the check stays, in ms. */
  timeout?: number
}

/**
 * Icon button that acknowledges its own click: the icon dissolves and a check
 * draws itself in, then the icon returns. Use it for fire-and-forget actions
 * that would otherwise leave the shopper wondering whether the tap registered:
 * add to cart, wishlist, compare.
 *
 * The confirmation is presentation only. Pair it with a toast (or an optimistic
 * update) whenever the action needs a description or an undo.
 *
 * Mirrors the interaction and timing of `CopyButton` from `@appica/ui-react`,
 * which is the same gesture bound to the clipboard.
 */
export function ConfirmButton({
  icon,
  label,
  confirmedLabel,
  action,
  onActionError,
  timeout = 2000,
  className,
  ...props
}: ConfirmButtonProps) {
  const [confirmed, setConfirmed] = useState(false)
  const resetRef = useRef<ReturnType<typeof setTimeout>>(undefined)

  useEffect(() => () => clearTimeout(resetRef.current), [])

  const handleClick = async () => {
    try {
      await action()
    } catch (error) {
      onActionError?.(error)
      return
    }

    setConfirmed(true)
    clearTimeout(resetRef.current)
    resetRef.current = setTimeout(() => setConfirmed(false), timeout)
  }

  return (
    <>
      <Button
        data-confirmed={confirmed || undefined}
        aria-label={confirmed ? confirmedLabel : label}
        onClick={handleClick}
        className={cn('group/confirm', className)}
        {...props}
      >
        <span className="grid place-items-center *:[grid-area:1/1]">
          <span
            className={cn(
              'grid transition-[opacity,scale] delay-150 duration-150 ease-out group-data-confirmed/confirm:delay-0',
              'group-data-confirmed/confirm:scale-50 group-data-confirmed/confirm:opacity-0',
              'motion-reduce:transition-none',
            )}
          >
            {icon}
          </span>
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <path
              d={CHECK_PATH}
              pathLength={1}
              strokeDasharray="1 2"
              className={cn(
                '[stroke-dashoffset:1.02] group-data-confirmed/confirm:[stroke-dashoffset:0]',
                'transition-[stroke-dashoffset] duration-200 ease-in',
                'group-data-confirmed/confirm:delay-100 group-data-confirmed/confirm:duration-350 group-data-confirmed/confirm:ease-out',
                'motion-reduce:transition-none',
              )}
            />
          </svg>
        </span>
      </Button>
      {/* A sibling, not a child: a button's content is its name, never a live region. */}
      <span role="status" className="sr-only">
        {confirmed ? confirmedLabel : ''}
      </span>
    </>
  )
}
