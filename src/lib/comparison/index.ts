import 'server-only'

import { cache } from 'react'
import { getCommerce } from '@/lib/commerce'
import type { Product } from '@/lib/commerce/types'
import type { DemoSlug } from '@/lib/demos'
import { readComparedSlugs } from './token'

/*
 * The comparison facade: what a Server Component calls to find out what a
 * visitor is weighing up.
 *
 *     import { getComparedProducts, getComparedSlugs } from '@/lib/comparison'
 *     const slugs = await getComparedSlugs('electronics')
 *     const products = await getComparedProducts('electronics', slugs)
 *
 * The 2 are separate because they cost different things. Reading the cookie
 * touches no catalog, so a layout can await it and hand the toggles their state
 * in the first paint; resolving the products is a catalog query, so a layout
 * passes that promise on unawaited and lets the bar stream in behind it. See
 * `./comparison-context.tsx`, which is what does the awaiting.
 *
 * Mutations live in `./actions.ts`, because a cookie can only be written from a
 * Server Action. Client Components use `useComparison`.
 */

/**
 * The slugs this visitor is comparing, oldest first. Empty for one comparing
 * nothing. Memoized per request, and free: it reads the cookie and nothing else.
 */
export const getComparedSlugs = cache(readComparedSlugs)

/**
 * The products behind those slugs, in the order they were picked, resolved
 * against the catalog on every read so a set opened yesterday shows today's
 * price and today's stock. Slugs the catalog no longer holds are dropped, which
 * shortens the set rather than emptying it.
 */
export async function getComparedProducts(demo: DemoSlug, slugs: string[]): Promise<Product[]> {
  if (slugs.length === 0) return []

  const { products } = await getCommerce(demo).listProducts({ slugs })
  return products
}
