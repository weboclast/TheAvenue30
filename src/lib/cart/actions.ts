'use server'

import { commerceAdapter } from '@/lib/commerce'
import type { BundleChoice, Cart, CartLineInput, CartLinePatch, CartPatch, CartState } from '@/lib/commerce/types'
import { type DemoSlug, isDemoSlug } from '@/lib/demos'
import { getRewardsBalance } from '@/lib/rewards'
import { withRewardsBalance } from './index'
import { readCartToken, writeCartToken } from './token'

/*
 * The 5 cart mutations, as Server Actions. A cookie can only be written from an
 * action, which is why they are not on the facade.
 *
 * Each hands the new cart back rather than revalidating the page: the client
 * store adopts it (see `./cart-context.tsx`), so adding a product updates the
 * header without re-rendering the catalog underneath it.
 *
 * `demo` arrives from a Client Component, so it is narrowed against the registry
 * first. An action is a public endpoint, and its arguments are whatever the
 * caller sent.
 */

/** What a cart mutation gives back. Never throws for a refused change: a full cart is an answer, not an error. */
export type CartActionResult = { ok: true; cart: Cart } | { ok: false; error: string }

/** Adds a configured product to a demo's cart. */
export async function addToCartAction(demo: DemoSlug, line: CartLineInput): Promise<CartActionResult> {
  return mutate(demo, (token) => commerceAdapter.addCartLine(demo, token, line))
}

/**
 * Adds every product in a bundle at the bundle's price, in 1 call. The offer is
 * named, never priced: what it costs is the adapter's to say, the same way a
 * trade-in credit is. `choices` is what the shopper picked of each product.
 */
export async function addBundleToCartAction(
  demo: DemoSlug,
  bundleId: string,
  choices?: BundleChoice[],
): Promise<CartActionResult> {
  return mutate(demo, async (token) => {
    if (!commerceAdapter.addCartBundle) throw new Error('This offer is no longer available.')
    return commerceAdapter.addCartBundle(demo, token, bundleId, choices)
  })
}

/** Changes one line: how many the shopper is taking, its protection plan, the device handed in against it. */
export async function updateCartLineAction(
  demo: DemoSlug,
  lineId: string,
  patch: CartLinePatch,
): Promise<CartActionResult> {
  return mutate(demo, (token) => commerceAdapter.updateCartLine(demo, token, lineId, patch))
}

/** Takes a line out of a demo's cart. */
export async function removeFromCartAction(demo: DemoSlug, lineId: string): Promise<CartActionResult> {
  return mutate(demo, (token) => commerceAdapter.removeCartLine(demo, token, lineId))
}

/** Changes the order rather than a line in it: gift wrapping, a discount code, loyalty points. */
export async function updateCartAction(demo: DemoSlug, patch: CartPatch): Promise<CartActionResult> {
  return mutate(demo, async (token) => commerceAdapter.updateCart(demo, token, await clampPoints(demo, patch)))
}

/**
 * Caps `rewardPoints` at what this shopper actually holds. The adapter prices
 * whatever it is handed, and this is the only layer that can resolve the
 * session behind the balance, so a browser asking to stake a million points
 * stakes what it has instead of being refused.
 *
 * A patch that leaves the field out is passed through untouched, which is what
 * keeps changing the gift box from re-reading the ledger.
 */
async function clampPoints(demo: DemoSlug, patch: CartPatch): Promise<CartPatch> {
  if (patch.rewardPoints == null) return patch

  const { available } = await getRewardsBalance(demo)
  return { ...patch, rewardPoints: Math.min(Math.max(0, Math.floor(patch.rewardPoints)), available) }
}

/**
 * Read the token, hand it to the adapter, store whatever comes back. The adapter
 * writes the refusal message, since it owns the rule that refused.
 */
async function mutate(demo: DemoSlug, run: (token: string | null) => Promise<CartState>): Promise<CartActionResult> {
  if (!isDemoSlug(demo)) return { ok: false, error: 'That store does not exist.' }

  const current = await readCartToken(demo)

  try {
    const { cart, token } = await run(current)
    // Only when it moved. A backend that keeps one cart id returns it unchanged,
    // and skipping the write spares the route the re-render a cookie change costs.
    if (token !== current) await writeCartToken(demo, token)
    return { ok: true, cart: await withRewardsBalance(demo, cart) }
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : 'Your cart could not be updated.' }
  }
}
