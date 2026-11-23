import type { ComponentProps } from 'react'
import { cn } from '@/lib/utils'

/**
 * The small mono label above a heading, or opening a hero. Authored in sentence
 * case and set in capitals here, so the wording survives translation.
 */
export function Eyebrow({ className, ...props }: ComponentProps<'p'>) {
  return (
    <p data-slot="eyebrow" className={cn('text-foreground-muted font-mono text-sm uppercase', className)} {...props} />
  )
}
