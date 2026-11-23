import type { DemoSlug } from '@/lib/demos'

/**
 * A page of a storefront's account area, or the area itself. Every demo owns its
 * account routes, so a shared section takes the demo it renders in and links
 * through here; guest tracking's equivalent is `orderTrackingPath`.
 */
export function accountPath(demo: DemoSlug, page?: string): string {
  return page ? `/account/${page}` : '/account'
}
