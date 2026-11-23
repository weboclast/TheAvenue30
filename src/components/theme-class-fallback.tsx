'use client'

import { useLayoutEffect } from 'react'
import { useTheme } from '@appica/ui-react/hooks/use-theme'

/**
 * Puts the stored theme on `<html>` when React renders the whole document in
 * the browser, as Next.js does for a 404 or an error. `ThemeProvider` relies on
 * its inline script for the first paint, and that script only runs in HTML the
 * server sent. Remove once the provider applies the stored theme itself.
 */
export function ThemeClassFallback() {
  const { resolvedTheme } = useTheme()

  useLayoutEffect(() => {
    const root = document.documentElement
    if (!resolvedTheme || root.classList.contains('light') || root.classList.contains('dark')) return
    root.classList.add(resolvedTheme)
    root.style.colorScheme = resolvedTheme
  }, [resolvedTheme])

  return null
}
