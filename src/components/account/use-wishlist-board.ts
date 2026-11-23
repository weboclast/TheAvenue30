'use client'

import { useEffect, useState, useTransition } from 'react'
import { useToastManager } from '@appica/ui-react/toast'
import type { WishlistFormTarget } from '@/components/account/wishlist-form-dialog'
import { useCart } from '@/lib/cart/cart-context'
import { defaultCartLine } from '@/lib/commerce/product-options'
import type { DemoSlug } from '@/lib/demos'
import { errorToast, infoToast } from '@/lib/toast'
import type { WishlistActionResult } from '@/lib/wishlist/actions'
import {
  VIEWED_WISHLIST_MAX_AGE,
  type WishlistSort,
  sortWishlistItems,
  viewedWishlistCookie,
} from '@/lib/wishlist/lists'
import { useWishlist } from '@/lib/wishlist/wishlist-context'

/** What a board says when picked items stayed out of the cart: a title, and why. */
interface Notice {
  title: string
  description: string
}

/**
 * Everything a wishlist page does apart from drawing it: which list is open,
 * how it is ordered, what is picked, the dialogs those open, and the writes
 * behind them. Each storefront draws its own board around it.
 *
 * `active` is `undefined` only when the shopper has no lists at all.
 */
export function useWishlistBoard(demo: DemoSlug, viewedId: string | null) {
  const { wishlists, removeItems, moveItems, updateList, deleteList } = useWishlist()
  const { addItem } = useCart()
  const toast = useToastManager()
  const [working, startWork] = useTransition()

  const [activeId, setActiveId] = useState(viewedId ?? undefined)
  const [sort, setSort] = useState<WishlistSort>('date-added')
  const [selected, setSelected] = useState<ReadonlySet<string>>(new Set())
  const [form, setForm] = useState<WishlistFormTarget>(null)
  const [deleting, setDeleting] = useState(false)

  // Falls back to the first, which is also what a just-deleted list does.
  const active = wishlists.find((list) => list.id === activeId) ?? wishlists[0]

  // Written from the browser because a preference is not worth a Server Action,
  // and read on the server so the first paint is already the right list.
  useEffect(() => {
    if (!active) return
    document.cookie = `${viewedWishlistCookie(demo)}=${active.id}; path=/; max-age=${VIEWED_WISHLIST_MAX_AGE}; samesite=lax`
  }, [active, demo])

  const items = active ? sortWishlistItems(active.items, sort) : []
  const chosen = items.filter((item) => selected.has(item.id))
  const refs = chosen.map((item) => ({ wishlistId: active?.id ?? '', itemId: item.id }))

  const showList = (id: string) => {
    setActiveId(id)
    // A selection belongs to the list it was made in.
    setSelected(new Set())
  }

  const clearSelection = () => setSelected(new Set())

  /** Runs a change, and says so when the store refuses it. */
  const run = (title: string, mutate: () => Promise<WishlistActionResult>, done?: () => void) => {
    startWork(async () => {
      const result = await mutate()
      if (!result.ok) {
        toast.add(errorToast(title, result.error))
        return
      }
      done?.()
    })
  }

  return {
    wishlists,
    active,
    /** The open list's items, in the order picked. */
    items,
    sort,
    setSort,
    /** The picked items, in list order. */
    chosen,
    allSelected: items.length > 0 && chosen.length === items.length,
    /** The lists the picked items could move to. */
    elsewhere: wishlists.filter((list) => list.id !== active?.id),
    /** True while a change is in flight; use it with `startWork` for writes of the page's own. */
    working,
    startWork,
    isSelected: (itemId: string) => selected.has(itemId),
    toggleSelected: (itemId: string, next: boolean) =>
      setSelected((current) => {
        const wanted = new Set(current)
        if (next) wanted.add(itemId)
        else wanted.delete(itemId)
        return wanted
      }),
    selectAll: (next: boolean) => setSelected(next ? new Set(items.map((item) => item.id)) : new Set()),
    clearSelection,
    showList,
    /** What the create or edit dialog is working on. */
    form,
    setForm,
    /** Whether the delete confirmation is up. */
    deleting,
    setDeleting,
    removeItem: (itemId: string) =>
      active && run('Could not remove that', () => removeItems([{ wishlistId: active.id, itemId }])),
    removeSelected: () => run('Could not remove those', () => removeItems(refs), clearSelection),
    moveSelected: (wishlistId: string) =>
      run('Could not move those', () => moveItems(refs, wishlistId), clearSelection),
    /** Points the heart at the open list. */
    saveNewItemsHere: () => active && run('Could not change that', () => updateList(active.id, { default: true })),
    deleteActive: () => active && run('Could not delete that wishlist', () => deleteList(active.id)),
    /**
     * Adds what is picked to the cart, each as a quick add buys it, skipping what
     * is sold out. What landed is the cart's to show; `notices` say what did not.
     * Sequential, since each add goes against the token the last one issued.
     */
    addSelectedToCart: (notices: { none: Notice; some: Notice }) => {
      const buyable = chosen.filter((item) => item.product.availability !== 'out-of-stock')

      startWork(async () => {
        let added = 0
        for (const { product } of buyable) {
          const result = await addItem(defaultCartLine(product))
          if (result.ok) added += 1
        }

        const notice = added === 0 ? notices.none : added < chosen.length ? notices.some : null
        if (notice) toast.add(infoToast(notice.title, notice.description))
        if (added > 0) clearSelection()
      })
    },
  }
}
