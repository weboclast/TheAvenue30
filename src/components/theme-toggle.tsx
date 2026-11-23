'use client'

import type { ComponentProps } from 'react'
import { Moon, Sun } from '@appica/icons-react'
import { Button } from '@appica/ui-react/button'
import { useTheme } from '@appica/ui-react/hooks/use-theme'
import { cn } from '@/lib/utils'

interface ThemeToggleProps extends Pick<ComponentProps<typeof Button>, 'variant' | 'size'> {
  className?: string
}

/**
 * Switches between light and dark. The label and icon wait for `mounted`, since
 * the resolved theme is only known in the browser and rendering the wrong one
 * on the server would be a hydration mismatch. With no `variant` it is a ghost
 * button with its wash dropped, so hovering only warms the glyph; name a
 * variant, `ghost` included, to get that variant as it is.
 */
export function ThemeToggle({ variant, size = 'icon-sm', className }: ThemeToggleProps) {
  const { resolvedTheme, setTheme, mounted } = useTheme()
  const isDark = mounted && resolvedTheme === 'dark'

  return (
    <Button
      variant={variant ?? 'ghost'}
      size={size}
      className={cn(!variant && 'before:hidden', className)}
      aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
    >
      {isDark ? <Sun /> : <Moon />}
    </Button>
  )
}
