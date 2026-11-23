import type { DemoSlug } from '@/lib/demos'

/*
 * Where guest order tracking is mounted. Every storefront owns its own route for
 * it, so this names the one the shared order sections link at; the account's
 * equivalent is `accountPath` in `components/account/account-paths.ts`.
 */

/** The public status page for one order number, in the storefront named. */
export function orderTrackingPath(demo: DemoSlug, number: string): string {
  return `/order-tracking/${number}`
}
