import { cn } from '@/lib/utils'

/**
 * The template's one copyright line, shared by every demo footer and by the
 * stripped-chrome shells, so the wording can never drift between them. Rewrite
 * the sentence here once and every screen follows.
 *
 * Styling is left to the caller: everything inherits from `className`.
 *
 * The year is read at render time. On a statically rendered page that means the
 * build date, so a deployment that outlives a new year picks the change up on
 * its next build. No client-side clock, and no hydration mismatch.
 */
export function Copyright({ className }: { className?: string }) {
  return (
    <p data-slot="copyright" className={cn('text-pretty', className)}>
      © {new Date().getFullYear()} The Avenue 30. A multipurpose eCommerce template.
    </p>
  )
}
