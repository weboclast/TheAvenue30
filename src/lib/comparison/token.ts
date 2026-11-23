import 'server-only'

import { readCookie, writeCookie } from '@/lib/cookies'
import type { DemoSlug } from '@/lib/demos'
import { MAX_COMPARED } from './set'

/*
 * Where a comparison set lives: 1 cookie per demo, holding the slugs a shopper
 * picked, in the order they picked them. Per demo because every commerce read
 * is, the same as the cart and wishlist cookies beside it.
 *
 * Slugs rather than an adapter token, which is what makes this the 1 collection
 * in the template with no backend behind it: which 3 phones somebody is weighing
 * up is nobody's record but their own, and the products are resolved from the
 * catalog on every read. A store that wants comparison sets in its analytics
 * posts them from here; it still does not have to store them.
 *
 * A cookie rather than `localStorage` because the comparison page is a Server
 * Component: it renders the table in the first paint instead of assembling it
 * after hydration.
 */

const COMPARISON_COOKIE_PREFIX = 'appica_compare'

/** How long a set is remembered, in seconds. Far shorter than a wishlist: shopping around is a session, not a plan. */
const COMPARISON_MAX_AGE = 60 * 60 * 24 * 7

function comparisonCookie(demo: DemoSlug): string {
  return `${COMPARISON_COOKIE_PREFIX}_${demo}`
}

/**
 * The slugs this visitor is comparing, oldest first, empty for one comparing
 * nothing. Safe to call while rendering, and it reads no catalog, so a layout
 * can await it without waiting on a product query.
 *
 * A visitor can edit a cookie, so what comes back is deduplicated and capped
 * here rather than trusted: the catalog read it feeds skips whatever it can't
 * find, and the screens above count on never being handed a 9th column.
 */
export async function readComparedSlugs(demo: DemoSlug): Promise<string[]> {
  const value = await readCookie(comparisonCookie(demo))
  if (!value) return []

  return [...new Set(value.split(',').filter(Boolean))].slice(0, MAX_COMPARED)
}

/**
 * Stores the set, or clears the cookie once it is empty. Only callable from a
 * Server Action or Route Handler.
 */
export async function writeComparedSlugs(demo: DemoSlug, slugs: string[]): Promise<void> {
  await writeCookie(comparisonCookie(demo), slugs.join(','), COMPARISON_MAX_AGE)
}
