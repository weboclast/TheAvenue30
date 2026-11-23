import Link from 'next/link'
import { Copyright } from '@/components/copyright'
import type { DemoSlug } from '@/lib/demos'
import { legalDocuments, legalLinkLabel, legalPath } from '@/lib/legal'
import { cn } from '@/lib/utils'

interface SlimFooterProps {
  /** The storefront whose copies of the legal documents the links open. */
  demo: DemoSlug
  className?: string
}

/**
 * Minimal footer for the stripped-chrome shells (auth and checkout): copyright
 * plus the legal documents, and no store navigation. The links come from
 * `lib/legal`, so publishing another policy puts it here too. `mt-auto` keeps it
 * at the bottom of a page too short to fill the screen.
 */
export function SlimFooter({ demo, className }: SlimFooterProps) {
  return (
    <footer
      className={cn(
        'text-foreground-muted container mt-auto flex min-h-18 flex-col flex-wrap items-center justify-center gap-x-6 gap-y-1 py-4 text-sm sm:flex-row sm:justify-between',
        className,
      )}
    >
      <Copyright className="text-center sm:text-start" />
      <nav aria-label="Legal">
        <ul className="flex flex-wrap items-center justify-center gap-5">
          {legalDocuments.map((doc) => (
            <li key={doc.slug}>
              <Link
                href={legalPath(demo, doc.slug)}
                className="hover:text-foreground-emphasis transition-colors hover:underline motion-reduce:transition-none"
              >
                {legalLinkLabel(doc)}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </footer>
  )
}
