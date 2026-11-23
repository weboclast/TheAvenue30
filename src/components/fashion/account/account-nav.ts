import { accountPath } from '@/components/account/account-paths'
import { REWARDS } from '@/lib/commerce/programs/rewards'

/*
 * The Fashion account's sitemap. The sidebar draws it from `lg` and the menu
 * above the page below that, so adding a page under `fashion/(shop)/account/`
 * is 1 edit here.
 */

/** From this width up the sidebar is a column. Keep in step with the account layout's `lg`. */
export const ACCOUNT_AS_COLUMN = '(min-width: 64rem)'

/** The Overview, where the account opens. */
const ACCOUNT_HREF = accountPath('fashion')

/** Orders, named because the sidebar and the menu badge that row with a count. */
export const ORDERS_HREF = accountPath('fashion', 'orders')

/** One destination in the account area. */
export interface AccountLink {
  href: string
  label: string
}

/** Every account page, in the order it is offered. */
export const ACCOUNT_LINKS: AccountLink[] = [
  { href: ACCOUNT_HREF, label: 'Overview' },
  { href: ORDERS_HREF, label: 'Orders' },
  { href: accountPath('fashion', 'wishlist'), label: 'Wishlist' },
  { href: accountPath('fashion', 'reviews'), label: 'Reviews' },
  { href: accountPath('fashion', 'rewards'), label: 'Promos & rewards' },
  { href: accountPath('fashion', 'appica-club'), label: REWARDS.name },
  { href: accountPath('fashion', 'profile'), label: 'Profile' },
  { href: accountPath('fashion', 'settings'), label: 'Settings' },
]

/**
 * Which entry a pathname belongs to. A nested page lights its section, so an
 * order's page is still Orders; the Overview matches only itself, since every
 * page sits under it.
 */
export function activeAccountLink(pathname: string): string | undefined {
  return ACCOUNT_LINKS.find(
    ({ href }) => pathname === href || (href !== ACCOUNT_HREF && pathname.startsWith(`${href}/`)),
  )?.href
}
