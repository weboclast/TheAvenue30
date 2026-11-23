'use client'

import { createContext, use, useCallback, useMemo, useState } from 'react'
import type { Wishlist, WishlistInput, WishlistItemRef, WishlistPatch } from '@/lib/commerce/types'
import type { DemoSlug } from '@/lib/demos'
import {
  type WishlistActionResult,
  createWishlistAction,
  deleteWishlistAction,
  moveWishlistItemsAction,
  removeFromWishlistAction,
  saveToWishlistAction,
  updateWishlistAction,
} from './actions'

/** A shopper's wishlists, and everything a screen can do to them. Read it with {@link useWishlist}. */
export interface WishlistStore {
  /** Every list, as the server last reported them. Empty for a visitor who has saved nothing. */
  wishlists: Wishlist[]
  /** True while any mutation is in flight, for controls that should settle before they are clicked again. */
  pending: boolean
  /** How many distinct products are saved, whichever list holds them. The number on the header's heart. */
  savedCount: number
  /** Whether a product is saved in any list, which is what fills a heart. */
  saved: (productSlug: string) => boolean
  /**
   * Saves a product or takes it back out. Saving puts it in the first list, and
   * opens one for a shopper who has none; unsaving takes it out of every list
   * holding it, because that is what an emptied heart claims.
   */
  setSaved: (productSlug: string, next: boolean) => Promise<WishlistActionResult>
  /** Takes items out, across as many lists as the refs name. */
  removeItems: (items: WishlistItemRef[]) => Promise<WishlistActionResult>
  /** Moves items into another list. */
  moveItems: (items: WishlistItemRef[], wishlistId: string) => Promise<WishlistActionResult>
  /** Opens a list. */
  createList: (input: WishlistInput) => Promise<WishlistActionResult>
  /** Renames a list, rewrites its description, or changes who it is for. Fields left out are left alone. */
  updateList: (id: string, patch: WishlistPatch) => Promise<WishlistActionResult>
  /** Deletes a list and everything saved in it. */
  deleteList: (id: string) => Promise<WishlistActionResult>
}

const WishlistContext = createContext<WishlistStore | null>(null)

interface WishlistProviderProps {
  /** Which storefront's wishlists these are. Every mutation is scoped to it. */
  demo: DemoSlug
  /** The lists resolved on the server by `getWishlists`, which is what the first paint renders. */
  wishlists: Wishlist[]
  children: React.ReactNode
}

/**
 * Holds one storefront's wishlists for the Client Components under it. Mount it
 * once per tree, in the demo's own layout, beside the cart provider it is
 * modeled on.
 *
 * It owns no wishlist logic: a mutation goes to the Server Action and whatever
 * comes back is adopted whole, so a heart anywhere on the page and the count in
 * the header can never disagree about what is saved.
 */
export function WishlistProvider({ demo, wishlists, children }: WishlistProviderProps) {
  const [state, setState] = useState({ wishlists, server: wishlists })
  // The server leads until the shopper saves something, then the store does. The
  // same arrangement as `CartProvider`, and for the same reason: a server render
  // already in flight when a mutation lands carries the lists from before it,
  // and adopting that would put a removed product back.
  const [mutated, setMutated] = useState(false)
  if (!mutated && state.server !== wishlists) setState({ wishlists, server: wishlists })

  // Counted rather than a flag: with 2 calls in flight, the first to land must
  // not report the lists settled.
  const [inFlight, setInFlight] = useState(0)
  const pending = inFlight > 0

  const mutate = useCallback(async (run: () => Promise<WishlistActionResult>) => {
    setMutated(true)
    setInFlight((count) => count + 1)
    try {
      const result = await run()
      if (result.ok) setState((current) => ({ ...current, wishlists: result.wishlists }))
      return result
    } finally {
      setInFlight((count) => count - 1)
    }
  }, [])

  const store = useMemo<WishlistStore>(() => {
    const savedSlugs = new Set(state.wishlists.flatMap((list) => list.items.map((item) => item.product.slug)))

    return {
      wishlists: state.wishlists,
      pending,
      savedCount: savedSlugs.size,
      saved: (productSlug) => savedSlugs.has(productSlug),
      setSaved: (productSlug, next) => {
        if (next) return mutate(() => saveToWishlistAction(demo, { productSlug }))

        const held = state.wishlists.flatMap((list) =>
          list.items
            .filter((item) => item.product.slug === productSlug)
            .map((item) => ({ wishlistId: list.id, itemId: item.id })),
        )
        return mutate(() => removeFromWishlistAction(demo, held))
      },
      removeItems: (items) => mutate(() => removeFromWishlistAction(demo, items)),
      moveItems: (items, wishlistId) => mutate(() => moveWishlistItemsAction(demo, items, wishlistId)),
      createList: (input) => mutate(() => createWishlistAction(demo, input)),
      updateList: (id, patch) => mutate(() => updateWishlistAction(demo, id, patch)),
      deleteList: (id) => mutate(() => deleteWishlistAction(demo, id)),
    }
  }, [demo, state.wishlists, pending, mutate])

  return <WishlistContext value={store}>{children}</WishlistContext>
}

/**
 * A shopper's wishlists and their mutations. Server Components call
 * `getWishlists` from `@/lib/wishlist` instead. Throws outside a
 * {@link WishlistProvider}, rather than handing back empty lists that swallow
 * every save.
 */
export function useWishlist(): WishlistStore {
  const store = use(WishlistContext)
  if (!store) throw new Error('useWishlist must be used inside a <WishlistProvider>.')
  return store
}
