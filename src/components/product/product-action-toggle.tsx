'use client'

import type { ReactNode } from 'react'
import { Button, type ButtonProps } from '@appica/ui-react/button'
import { IconBurst, useIconBurst } from '@/components/icon-burst'
import { cn } from '@/lib/utils'

interface ProductActionToggleProps extends Omit<ButtonProps, 'children' | 'onClick'> {
  /** A visible label after the icon. Leave it out for an icon button, named by {@link label}. */
  children?: ReactNode
  active: boolean
  /**
   * Receives the state being moved to, so the caller can add or remove. Throw
   * from it for a change the store refused, and the control settles back where
   * it was.
   */
  onActiveChange: (next: boolean) => void | Promise<void>
  /** Shown while inactive. */
  icon: ReactNode
  /** Shown while active, usually the filled twin of {@link icon}. */
  activeIcon: ReactNode
  /** The name in both states, since `aria-pressed` already says which one it is in. */
  label: string
  /** Color applied to the active icon, e.g. `'text-error-emphasis'`. */
  activeClassName?: string
}

/**
 * A collect/uncollect toggle for the product card: wishlist, compare.
 *
 * Adding is the moment worth celebrating, so the icon fills, springs, and throws
 * a short burst of particles; removing just fades the icon back. The button
 * reports its state through `data-active`, which the card uses to keep a filled
 * toggle on screen after the pointer leaves.
 */
export function ProductActionToggle({
  active,
  onActiveChange,
  icon,
  activeIcon,
  label,
  activeClassName,
  className,
  children,
  ...props
}: ProductActionToggleProps) {
  const { bursting, burst } = useIconBurst()

  const handleClick = async () => {
    const next = !active
    try {
      await onActiveChange(next)
    } catch {
      // Whoever refused the change has already said why. Celebrating a save
      // that never happened would be worse than saying nothing.
      return
    }
    // Only adding is worth celebrating; removing just fades the icon back.
    if (next) burst()
  }

  return (
    <Button
      data-active={active || undefined}
      data-bursting={bursting || undefined}
      type="button"
      aria-pressed={active}
      aria-label={label}
      onClick={handleClick}
      className={cn('group/toggle relative', className)}
      {...props}
    >
      {/* The burst is thrown from this box's center, so it rides the icon beside a label too. */}
      <span data-icon={children ? 'start' : undefined} className="relative grid">
        <span
          className={cn(
            'grid place-items-center *:[grid-area:1/1]',
            bursting && 'animate-icon-pop motion-reduce:animate-none',
          )}
        >
          <span
            className={cn(
              'grid transition-[opacity,scale] duration-150 ease-out motion-reduce:transition-none',
              active && 'scale-75 opacity-0',
            )}
          >
            {icon}
          </span>
          <span
            className={cn(
              'grid transition-[opacity,scale] duration-150 ease-out motion-reduce:transition-none',
              activeClassName,
              active ? 'scale-100 opacity-100' : 'scale-75 opacity-0',
            )}
          >
            {activeIcon}
          </span>
        </span>

        {bursting ? <IconBurst className={activeClassName} /> : null}
      </span>
      {children}
    </Button>
  )
}
