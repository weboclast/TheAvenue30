'use client'

import { useTransition } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Badge } from '@appica/ui-react/badge'
import { Navigation, NavigationItem, NavigationLink, NavigationList } from '@appica/ui-react/navigation'
import { signOutAction } from '@/lib/auth/actions'
import { ACCOUNT_LINKS, ORDERS_HREF, activeAccountLink } from './account-nav'

/** Set on each link, since a `<button>` does not inherit `text-transform`. */
const LINK = 'w-full font-mono uppercase'

interface AccountNavigationProps {
  /** Orders still on their way, counted beside Orders. */
  activeOrders: number
  /** Where signing out lands: the department the shopper was last in. */
  home: string
}

/**
 * The account's pages down the sidebar, the one on screen marked, and log out
 * last. A Client Component because the current page is the one thing it cannot
 * be told, and because signing out is a write.
 */
export function AccountNavigation({ activeOrders, home }: AccountNavigationProps) {
  const pathname = usePathname()
  const [signingOut, startSignOut] = useTransition()

  return (
    <Navigation orientation="vertical" activeLink={activeAccountLink(pathname) ?? null} aria-label="Account">
      <NavigationList>
        {ACCOUNT_LINKS.map(({ href, label }) => (
          <NavigationItem key={href}>
            <NavigationLink value={href} className={LINK} render={<Link href={href} />}>
              {label}
              {href === ORDERS_HREF && activeOrders > 0 ? (
                <Badge variant="outline" size="sm" className="ms-auto">
                  {activeOrders}
                  {/* Without this the row is announced as "Orders 2". */}
                  <span className="sr-only"> on the way</span>
                </Badge>
              ) : null}
            </NavigationLink>
          </NavigationItem>
        ))}

        <NavigationItem>
          {/* A button, not a link: signing out is a write. */}
          <NavigationLink
            disabled={signingOut}
            className={LINK}
            render={<button type="button" onClick={() => startSignOut(() => signOutAction(home))} />}
          >
            {signingOut ? 'Signing out…' : 'Log out'}
          </NavigationLink>
        </NavigationItem>
      </NavigationList>
    </Navigation>
  )
}
