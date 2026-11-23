import { ReducedMotionProvider } from '@appica/ui-react/providers/reduced-motion-provider'
import { ThemeProvider } from '@appica/ui-react/providers/theme-provider'
import { Toaster, ToastProvider } from '@appica/ui-react/toast'
import { SkipLink } from './skip-link'
import { ThemeClassFallback } from './theme-class-fallback'

/**
 * The provider stack every root layout mounts inside its own `<body>`. Each
 * storefront owns its `<html>`, so its fonts and tokens are set before first
 * paint; what sits under them is the same everywhere and lives here once.
 *
 * The toaster is part of the stack because toasts portal to `<body>`, which puts
 * them inside whichever storefront's `<html>` rendered this.
 */
export function StoreProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider defaultTheme="light" enableSystem={false} disableTransitionOnChange>
      <SkipLink />
      <ThemeClassFallback />
      <ReducedMotionProvider>
        <ToastProvider>
          {children}
          <Toaster position="bottom-center" />
        </ToastProvider>
      </ReducedMotionProvider>
    </ThemeProvider>
  )
}
