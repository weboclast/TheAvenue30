'use server'

import type { Product } from '@/lib/commerce/types'
import { type DemoSlug, isDemoSlug } from '@/lib/demos'
import { getComparedProducts } from './index'
import { MAX_COMPARED } from './set'
import { readComparedSlugs, writeComparedSlugs } from './token'

/*
 * The 2 comparison mutations, as Server Actions. A cookie can only be written
 * from an action, which is why they are not on the facade.
 *
 * Each hands back the new set, slugs and products together, rather than
 * revalidating the page: the client store adopts them (see
 * `./comparison-context.tsx`), so adding a product from a catalog listing fills
 * its toggle and slides the compare bar in without re-rendering the grid
 * underneath it.
 *
 * `demo` arrives from a Client Component, so it is narrowed against the registry
 * first. An action is a public endpoint, and its arguments are whatever the
 * caller sent.
 */

/** What a comparison mutation gives back. Never throws for a refused change: a full set is an answer, not an error. */
export type ComparisonActionResult = { ok: true; slugs: string[]; products: Product[] } | { ok: false; error: string }

/** Adds a product to the set, or takes it back out. Refuses a 5th, since {@link MAX_COMPARED} is what a table holds. */
export async function setComparedAction(
  demo: DemoSlug,
  productSlug: string,
  next: boolean,
): Promise<ComparisonActionResult> {
  if (!isDemoSlug(demo)) return { ok: false, error: 'That store does not exist.' }

  const current = await readComparedSlugs(demo)
  const without = current.filter((slug) => slug !== productSlug)

  if (!next) return commit(demo, without)
  if (without.length < current.length) return commit(demo, current)
  if (current.length >= MAX_COMPARED) {
    return { ok: false, error: `You can compare ${MAX_COMPARED} products at a time. Remove one to add this.` }
  }

  return commit(demo, [...current, productSlug])
}

/** Empties the set, which is the 1 control that dismisses the compare bar outright. */
export async function clearComparisonAction(demo: DemoSlug): Promise<ComparisonActionResult> {
  if (!isDemoSlug(demo)) return { ok: false, error: 'That store does not exist.' }

  return commit(demo, [])
}

/**
 * Resolves the set and then stores it, so a caller adopts the products and the
 * slugs in one go. A read that fails leaves the cookie as the client still has it.
 */
async function commit(demo: DemoSlug, slugs: string[]): Promise<ComparisonActionResult> {
  try {
    const products = await getComparedProducts(demo, slugs)
    await writeComparedSlugs(demo, slugs)
    return { ok: true, slugs, products }
  } catch {
    return { ok: false, error: 'Your comparison could not be updated.' }
  }
}
