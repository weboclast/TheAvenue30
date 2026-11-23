'use server'

import { commerceAdapter } from '@/lib/commerce'
import type {
  Wishlist,
  WishlistInput,
  WishlistItemInput,
  WishlistItemRef,
  WishlistPatch,
  WishlistState,
} from '@/lib/commerce/types'
import { type DemoSlug, isDemoSlug } from '@/lib/demos'
import { MAX_WISHLIST_DESCRIPTION, MAX_WISHLIST_NAME } from './lists'
import { readWishlistToken, writeWishlistToken } from './token'

/*
 * The 6 wishlist mutations, as Server Actions. A cookie can only be written from
 * an action, which is why they are not on the facade.
 *
 * Each hands the new lists back rather than revalidating the page: the client
 * store adopts them (see `./wishlist-context.tsx`), so hearting a product on a
 * catalog listing fills the heart and moves the header count without
 * re-rendering the grid underneath it.
 *
 * `demo` arrives from a Client Component, so it is narrowed against the registry
 * first. An action is a public endpoint, and its arguments are whatever the
 * caller sent.
 */

/** What a wishlist mutation gives back. Never throws for a refused change: a full set of lists is an answer, not an error. */
export type WishlistActionResult = { ok: true; wishlists: Wishlist[] } | { ok: false; error: string }

/** Opens a list. The name is the only field a shopper has to fill in. */
export async function createWishlistAction(demo: DemoSlug, input: WishlistInput): Promise<WishlistActionResult> {
  const invalid = validateList(input.name, input.description)
  if (invalid) return { ok: false, error: invalid }

  return mutate(demo, (token) => commerceAdapter.createWishlist(demo, token, input))
}

/** Renames a list, rewrites its description, or changes who it is for. */
export async function updateWishlistAction(
  demo: DemoSlug,
  id: string,
  patch: WishlistPatch,
): Promise<WishlistActionResult> {
  const invalid = validateList(patch.name, patch.description)
  if (invalid) return { ok: false, error: invalid }

  return mutate(demo, (token) => commerceAdapter.updateWishlist(demo, token, id, patch))
}

/** Deletes a list and everything saved in it. */
export async function deleteWishlistAction(demo: DemoSlug, id: string): Promise<WishlistActionResult> {
  return mutate(demo, (token) => commerceAdapter.deleteWishlist(demo, token, id))
}

/** Saves a product, into the list the input names or the first one otherwise. */
export async function saveToWishlistAction(demo: DemoSlug, input: WishlistItemInput): Promise<WishlistActionResult> {
  return mutate(demo, (token) => commerceAdapter.addWishlistItem(demo, token, input))
}

/** Takes saved products out, across as many lists as the refs name. */
export async function removeFromWishlistAction(
  demo: DemoSlug,
  items: WishlistItemRef[],
): Promise<WishlistActionResult> {
  return mutate(demo, (token) => commerceAdapter.removeWishlistItems(demo, token, items))
}

/** Moves saved products into another list. */
export async function moveWishlistItemsAction(
  demo: DemoSlug,
  items: WishlistItemRef[],
  wishlistId: string,
): Promise<WishlistActionResult> {
  return mutate(demo, (token) => commerceAdapter.moveWishlistItems(demo, token, items, wishlistId))
}

/**
 * The checks the dialog runs, so a shopper is told before the round-trip rather
 * than after it. Both copies call the same limits; the store still decides
 * whether a name is free, because only it holds the other lists.
 */
function validateList(name?: string, description?: string | null): string | undefined {
  if (name !== undefined) {
    if (!name.trim()) return 'Give your wishlist a name.'
    if (name.trim().length > MAX_WISHLIST_NAME) return `Keep the name under ${MAX_WISHLIST_NAME} characters.`
  }
  if (description && description.length > MAX_WISHLIST_DESCRIPTION) {
    return `Keep the description under ${MAX_WISHLIST_DESCRIPTION} characters.`
  }
  return undefined
}

/**
 * Read the token, hand it to the adapter, store whatever comes back. The adapter
 * writes the refusal message, since it owns the rule that refused.
 */
async function mutate(
  demo: DemoSlug,
  run: (token: string | null) => Promise<WishlistState>,
): Promise<WishlistActionResult> {
  if (!isDemoSlug(demo)) return { ok: false, error: 'That store does not exist.' }

  const current = await readWishlistToken(demo)

  try {
    const { wishlists, token } = await run(current)
    // Only when it moved, exactly as in `lib/cart`: a backend that keeps one
    // wishlist id returns it unchanged, and skipping the write spares the route
    // the re-render a cookie change costs.
    if (token !== current) await writeWishlistToken(demo, token)
    return { ok: true, wishlists }
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : 'Your wishlist could not be updated.' }
  }
}
