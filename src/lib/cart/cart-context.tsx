'use client'

import { createContext, use, useMemo, useState } from 'react'
import type { BundleChoice, Cart, CartLineInput, CartLinePatch, CartPatch } from '@/lib/commerce/types'
import type { DemoSlug } from '@/lib/demos'
import {
  type CartActionResult,
  addBundleToCartAction,
  addToCartAction,
  removeFromCartAction,
  updateCartAction,
  updateCartLineAction,
} from './actions'

/** The cart, and everything a screen can do to it. Read it with {@link useCart}. */
export interface CartStore {
  /** What the shopper is carrying, as the server last reported it. */
  cart: Cart
  /** True while any mutation is in flight, for controls that should settle before they are clicked again. */
  pending: boolean
  /**
   * How many times something has been added this session. It only counts up, so
   * chrome that reveals itself on an add can watch it from an effect. What that
   * reaction is stays with the demo, not here.
   */
  addCount: number
  /** Adds a configured product. Returns what the action said, so a screen can show a refusal. */
  addItem: (line: CartLineInput) => Promise<CartActionResult>
  /**
   * Adds every product in a "buy together" offer, by the bundle's id, with what
   * the shopper picked of each. Counts as 1 add, so the chrome reacts once
   * rather than once per product.
   */
  addBundle: (bundleId: string, choices?: BundleChoice[]) => Promise<CartActionResult>
  /**
   * Changes one line: its quantity, its protection plan, the device handed in
   * against it. Fields left out of the patch are left alone, and a quantity of
   * none is {@link removeItem} rather than `0`.
   */
  updateItem: (lineId: string, patch: CartLinePatch) => Promise<CartActionResult>
  /** Takes a line out. */
  removeItem: (lineId: string) => Promise<CartActionResult>
  /** Changes the order rather than a line in it: gift wrapping, a discount code. */
  updateCart: (patch: CartPatch) => Promise<CartActionResult>
}

const CartContext = createContext<CartStore | null>(null)

interface CartProviderProps {
  /** Which storefront's cart this is. Every mutation is scoped to it. */
  demo: DemoSlug
  /** The cart resolved on the server by `getCart`, which is what the first paint renders. */
  cart: Cart
  children: React.ReactNode
}

/**
 * Holds one storefront's cart for the Client Components under it. Mount it once
 * per tree, in the demo's own layout, above both the shop and the checkout.
 *
 * It owns no cart logic: a mutation goes to the Server Action and whatever cart
 * comes back is adopted whole, so totals stay counted where the prices are. A
 * tax rule or a volume discount then costs the storefront nothing.
 */
export function CartProvider({ demo, cart, children }: CartProviderProps) {
  const [state, setState] = useState({ cart, server: cart })
  // The server leads until the shopper touches the cart, then the store does.
  // Server renders arrive out of order: one already in flight when a mutation
  // lands carries the cart from before it, and adopting that puts a removed line
  // back. Adjusted during render rather than in an effect, so no paint shows a
  // cart that was never real.
  const [mutated, setMutated] = useState(false)
  if (!mutated && state.server !== cart) setState({ cart, server: cart })

  // Counted rather than a flag: with 2 calls in flight, the first to land must
  // not report the cart settled.
  const [inFlight, setInFlight] = useState(0)
  const [addCount, setAddCount] = useState(0)
  const pending = inFlight > 0

  // Built once per storefront, so the store below changes only when what it holds does.
  const actions = useMemo<Omit<CartStore, 'cart' | 'pending' | 'addCount'>>(() => {
    const mutate = async (run: () => Promise<CartActionResult>) => {
      setMutated(true)
      setInFlight((count) => count + 1)
      try {
        const result = await run()
        if (result.ok) setState((current) => ({ ...current, cart: result.cart }))
        return result
      } finally {
        setInFlight((count) => count - 1)
      }
    }

    return {
      addItem: async (line) => {
        const result = await mutate(() => addToCartAction(demo, line))
        if (result.ok) setAddCount((count) => count + 1)
        return result
      },
      addBundle: async (bundleId, choices) => {
        const result = await mutate(() => addBundleToCartAction(demo, bundleId, choices))
        if (result.ok) setAddCount((count) => count + 1)
        return result
      },
      updateItem: (lineId, patch) => mutate(() => updateCartLineAction(demo, lineId, patch)),
      removeItem: (lineId) => mutate(() => removeFromCartAction(demo, lineId)),
      updateCart: (patch) => mutate(() => updateCartAction(demo, patch)),
    }
  }, [demo])

  const store = useMemo<CartStore>(
    () => ({ cart: state.cart, pending, addCount, ...actions }),
    [state.cart, pending, addCount, actions],
  )

  return <CartContext value={store}>{children}</CartContext>
}

/**
 * The cart and its mutations. Server Components call `getCart` from `@/lib/cart`
 * instead. Throws outside a {@link CartProvider}, rather than handing back an
 * empty cart that swallows every add.
 */
export function useCart(): CartStore {
  const store = use(CartContext)
  if (!store) throw new Error('useCart must be used inside a <CartProvider>.')
  return store
}
