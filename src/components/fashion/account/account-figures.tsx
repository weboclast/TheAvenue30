import Link from 'next/link'
import { CaretSwap } from '@/components/fashion/caret-swap'
import { formatCount } from '@/lib/commerce/format'
import { cn } from '@/lib/utils'

/** One number the account is keeping, and the page that explains it. */
export interface AccountFigure {
  value: number
  /** What the number counts, read after it. */
  label: string
  href: string
}

/** The account at a glance: a row of numbers, each the way into its page. */
export function AccountFigures({ figures, className }: { figures: AccountFigure[]; className?: string }) {
  return (
    <ul className={cn('bg-border grid grid-cols-2 gap-px overflow-hidden rounded-sm border xl:grid-cols-4', className)}>
      {figures.map(({ value, label, href }) => (
        <li key={label} className="bg-background">
          <Link
            href={href}
            className="group outline-ring hover:bg-background-muted flex h-full flex-col gap-1 p-5 transition-colors focus-visible:outline-2 focus-visible:-outline-offset-2 motion-reduce:transition-none"
          >
            <span className="text-foreground-intense font-mono text-3xl">{formatCount(value)}</span>
            <span className="flex items-center justify-between gap-2">
              {label}
              <CaretSwap />
            </span>
          </Link>
        </li>
      ))}
    </ul>
  )
}
