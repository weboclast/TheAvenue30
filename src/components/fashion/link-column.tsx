import Link from 'next/link'
import { CaretRightFilled } from '@appica/icons-react'
import { Navigation, NavigationItem, NavigationLink, NavigationList } from '@appica/ui-react/navigation'
import { AccountLink } from '@/components/auth/sign-in-gate'
import { cn } from '@/lib/utils'

/** One entry in a link column. */
export interface NavLink {
  label: string
  href: string
  /** Leads into the account area, so a guest gets the sign-in drawer. */
  account?: boolean
  /** Loads the whole document, for a route the client router cannot follow. */
  reload?: boolean
}

/** A titled group of links, drawn the same way wherever the store lists a few pages. */
export interface NavColumn {
  heading: string
  links: NavLink[]
}

/** The heading over a column, and over any list set beside one. */
export const COLUMN_HEADING = 'text-foreground-subtle font-mono text-sm uppercase'

interface LinkListProps {
  links: NavLink[]
  /** Names the navigation, since a screen reader lists them by name. */
  label: string
  /** Called on every link, for a panel that closes behind it. */
  onNavigate?: () => void
}

/**
 * The links of a column: a vertical navigation whose caret slides in on hover.
 * Starts 6px into the margin, which is the room the resting caret keeps.
 */
export function LinkList({ links, label, onNavigate }: LinkListProps) {
  return (
    <Navigation orientation="vertical" variant="indicator" size="lg" aria-label={label} className="-ms-1.5">
      <NavigationList>
        {links.map(({ label, href, account, reload }) => (
          <NavigationItem key={label}>
            {/* The modifier is repeated: a bare `py-1` loses to the variant's own. */}
            <NavigationLink
              render={account ? <AccountLink href={href} /> : reload ? <a href={href} /> : <Link href={href} />}
              indicator={<CaretRightFilled />}
              onClick={onNavigate}
              className="data-[orientation=vertical]:py-1.25"
            >
              {label}
            </NavigationLink>
          </NavigationItem>
        ))}
      </NavigationList>
    </Navigation>
  )
}

interface LinkColumnProps {
  column: NavColumn
  /** Called on every link, for a panel that closes behind it. */
  onNavigate?: () => void
  className?: string
}

/** A {@link NavColumn} under its heading: the footer's columns, and the same block in the search dialog and the mega-menus. */
export function LinkColumn({ column, onNavigate, className }: LinkColumnProps) {
  return (
    <div className={cn('flex flex-col gap-3', className)}>
      <h3 className={COLUMN_HEADING}>{column.heading}</h3>
      <LinkList links={column.links} label={column.heading} onNavigate={onNavigate} />
    </div>
  )
}
