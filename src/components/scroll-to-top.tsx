'use client'

import { ArrowBarToUp } from '@appica/icons-react'
import { Button } from '@appica/ui-react/button'
import { useReducedMotion } from '@appica/ui-react/hooks/use-reduced-motion'

/**
 * Smooth scrolling is decided here rather than left to the `scroll-behavior`
 * rule in `globals.css`, because that rule is already inside a
 * `prefers-reduced-motion` query and `scrollTo` would override it either way.
 * `useReducedMotion` reads the OS preference *and* any
 * `ReducedMotionProvider disableAnimations` above it, so the button stays in
 * step with both.
 */
export function ScrollToTop({ className }: { className?: string }) {
  const reduce = useReducedMotion()

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-md"
      aria-label="Scroll to top"
      className={className}
      onClick={() => window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' })}
    >
      <ArrowBarToUp className="size-5" />
    </Button>
  )
}
