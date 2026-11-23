'use client'

import { useTransition } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { CaretDownFilled, Check } from '@appica/icons-react'
import { Badge } from '@appica/ui-react/badge'
import { Button } from '@appica/ui-react/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLinkItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@appica/ui-react/dropdown-menu'
import { ROTATING_CARET } from '@/components/fashion/caret-swap'
import { signOutAction } from '@/lib/auth/actions'
import { ACCOUNT_LINKS, ORDERS_HREF, activeAccountLink } from './account-nav'

interface AccountMenuProps {
  /** Orders still on their way, counted beside Orders. */
  activeOrders: number
  /** Where signing out lands: the department the shopper was last in. */
  home: string
  className?: string
}

/**
 * The account's pages as a menu above the page, for the widths where the
 * sidebar is hidden. The trigger names the page on screen.
 */
export function AccountMenu({ activeOrders, home, className }: AccountMenuProps) {
  const active = activeAccountLink(usePathname())
  const [signingOut, startSignOut] = useTransition()

  return (
    <nav aria-label="Account" className={className}>
      <DropdownMenu>
        <DropdownMenuTrigger
          className="group/trigger"
          render={
            // The trigger renames the slot; this takes it back for `globals.css`.
            <Button data-slot="button" variant="outline" className="w-full justify-between">
              {ACCOUNT_LINKS.find(({ href }) => href === active)?.label ?? 'Your account'}
              <CaretDownFilled data-icon="end" className={ROTATING_CARET} />
            </Button>
          }
        />
        <DropdownMenuContent className="font-mono uppercase">
          {ACCOUNT_LINKS.map(({ href, label }) => (
            // A link item stays open by default, and this menu outlives the navigation.
            <DropdownMenuLinkItem
              key={href}
              closeOnClick
              render={<Link href={href} />}
              aria-current={href === active ? 'page' : undefined}
            >
              {label}
              {href === ORDERS_HREF && activeOrders > 0 ? (
                <Badge variant="outline" size="sm">
                  {activeOrders}
                  {/* Without this the row is announced as "Orders 2". */}
                  <span className="sr-only"> on the way</span>
                </Badge>
              ) : null}
              {href === active ? (
                <Check data-icon="end" className="text-foreground-intense ms-auto me-0.5 size-[1.125em]" />
              ) : null}
            </DropdownMenuLinkItem>
          ))}

          <DropdownMenuSeparator />

          {/* An item, not a link: signing out is a write. Held open so it can say so. */}
          <DropdownMenuItem
            closeOnClick={false}
            disabled={signingOut}
            onClick={() => startSignOut(() => signOutAction(home))}
          >
            {signingOut ? 'Signing out…' : 'Log out'}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </nav>
  )
}
