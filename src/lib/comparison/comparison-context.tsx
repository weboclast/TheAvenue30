'use client'

import { createContext, use, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { Product } from '@/lib/commerce/types'
import type { DemoSlug } from '@/lib/demos'
import { type ComparisonActionResult, clearComparisonAction, setComparedAction } from './actions'
import { MAX_COMPARED } from './set'

/**
 * A refused change, waiting to be shown. A fresh object every time, even for the
 * same message, so a screen keyed off it replays its nudge on a repeat.
 */
export interface ComparisonNotice {
  message: string
}

/** How long a refusal stands before the surface showing it goes back to the set. */
const NOTICE_MS = 3000

/** What a shopper is weighing up, and everything a screen can do to it. Read it with {@link useComparison}. */
export interface ComparisonStore {
  /** The slugs in the set, oldest first, as the server last reported them. */
  slugs: string[]
  /** True while a mutation is in flight, for controls that should settle before they are clicked again. */
  pending: boolean
  /** Whether the set is full, which is what a card's compare toggle offers as a reason it refused. */
  full: boolean
  /**
   * The last refused change, or `null`. It lives here rather than in the screen
   * that hit it, because the control that refuses is usually a toggle on a
   * product card and the surface that reports it is the compare bar.
   */
  notice: ComparisonNotice | null
  /** Whether a product is in the set, which is what fills a compare toggle. */
  compared: (productSlug: string) => boolean
  /** Adds a product or takes it back out. Refuses a {@link MAX_COMPARED}th + 1. */
  setCompared: (productSlug: string, next: boolean) => Promise<ComparisonActionResult>
  /** Empties the set. */
  clear: () => Promise<ComparisonActionResult>
}

/** What the provider holds. `products` stays unresolved until the layout's catalog read lands. */
interface ComparisonState {
  slugs: string[]
  products: Product[] | Promise<Product[]>
}

const ComparisonContext = createContext<(ComparisonStore & ComparisonState) | null>(null)

interface ComparisonProviderProps {
  /** Which storefront's comparison set this is. Every mutation is scoped to it. */
  demo: DemoSlug
  /** The slugs read off the cookie by `getComparedSlugs`, which is what fills the toggles in the first paint. */
  slugs: string[]
  /**
   * The products behind them, passed **unawaited**: resolving them is a catalog
   * query, and a layout that waits for it holds up every page's shell for a
   * shopper who happens to be comparing something.
   */
  products: Promise<Product[]>
  children: React.ReactNode
}

/**
 * Holds one storefront's comparison set for the Client Components under it.
 * Mount it once per tree, in the demo's own layout, beside the cart and wishlist
 * providers it is modeled on.
 *
 * It owns no comparison logic: a mutation goes to the Server Action and whatever
 * comes back is adopted whole, so a toggle on a card, the count in the compare
 * bar, and the table on the comparison page can never disagree about what is in
 * the set.
 */
export function ComparisonProvider({ demo, slugs, products, children }: ComparisonProviderProps) {
  const [state, setState] = useState<ComparisonState & { server: string[] }>({ slugs, products, server: slugs })
  // The server leads until the shopper picks something, then the store does. The
  // same arrangement as `CartProvider`, and for the same reason: a server render
  // already in flight when a mutation lands carries the set from before it, and
  // adopting that would put a removed product back.
  const [mutated, setMutated] = useState(false)
  if (!mutated && state.server !== slugs) setState({ slugs, products, server: slugs })

  // Counted rather than a flag: with 2 calls in flight, the first to land must
  // not report the set settled.
  const [inFlight, setInFlight] = useState(0)
  const pending = inFlight > 0

  const [notice, setNotice] = useState<ComparisonNotice | null>(null)
  const noticeTimer = useRef<ReturnType<typeof setTimeout>>(undefined)
  useEffect(() => () => clearTimeout(noticeTimer.current), [])

  const mutate = useCallback(async (run: () => Promise<ComparisonActionResult>) => {
    setMutated(true)
    setInFlight((count) => count + 1)
    try {
      const result = await run()
      if (result.ok) {
        setState((current) => ({ ...current, slugs: result.slugs, products: result.products }))
      } else {
        clearTimeout(noticeTimer.current)
        setNotice({ message: result.error })
        noticeTimer.current = setTimeout(() => setNotice(null), NOTICE_MS)
      }
      return result
    } finally {
      setInFlight((count) => count - 1)
    }
  }, [])

  const store = useMemo(
    () => ({
      ...state,
      pending,
      full: state.slugs.length >= MAX_COMPARED,
      notice,
      compared: (productSlug: string) => state.slugs.includes(productSlug),
      setCompared: (productSlug: string, next: boolean) => mutate(() => setComparedAction(demo, productSlug, next)),
      clear: () => mutate(() => clearComparisonAction(demo)),
    }),
    [demo, state, pending, notice, mutate],
  )

  return <ComparisonContext value={store}>{children}</ComparisonContext>
}

/**
 * The comparison set and its mutations. Server Components call
 * `getComparedSlugs` from `@/lib/comparison` instead. Throws outside a
 * {@link ComparisonProvider}, rather than handing back an empty set that
 * swallows every pick.
 */
export function useComparison(): ComparisonStore {
  const store = use(ComparisonContext)
  if (!store) throw new Error('useComparison must be used inside a <ComparisonProvider>.')
  return store
}

/**
 * The products in the set, for the screens that draw them rather than count
 * them. It suspends while the layout's catalog read is still in flight, so call
 * it inside a `<Suspense>`; {@link useComparison} never does, which is what
 * keeps a product card's toggle out of that boundary.
 */
export function useComparedProducts(): Product[] {
  const store = use(ComparisonContext)
  if (!store) throw new Error('useComparedProducts must be used inside a <ComparisonProvider>.')
  return store.products instanceof Promise ? use(store.products) : store.products
}
