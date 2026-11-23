import type { Bundle, Money, Product } from '../../types'
import type { BundleOffer, BundleOfferItem, DemoDataset } from './data'

/*
 * The demo's "buy together" offers, and the one rule that prices them.
 *
 * A real backend sells a bundle as a product of its own and quotes it, so its
 * adapter reads a price rather than working one out. The demo has no such
 * product, so it resolves the offer against the catalog on every call, the way
 * `./cart.ts` resolves a cart: nothing a shopper is carrying can go stale, and
 * nothing they could edit decides what anything costs.
 */

/** An offer priced against the catalog: its products, and what each costs inside the set. */
export interface ResolvedOffer {
  items: { product: Product; color?: string; amount: number }[]
  /** What the set costs together. */
  total: number
  /** What the same products cost bought separately. */
  compareAt: number
}

/**
 * `offer` against `products`, or `null` where it can no longer be sold as a set:
 * a product has left the catalog, or one of them is out of stock. Dropping the
 * whole offer is the point, since half a bundle is not the bundle.
 *
 * Each item is priced from its own rate, so the set costs what its parts come to
 * and a companion's discount can never come off the product beside it. That is
 * also what a refund, a tax rate, and a partial return each need a line to be.
 */
export function resolveOffer(offer: BundleOffer, products: Product[]): ResolvedOffer | null {
  const picked = offer.items.map((item) => ({
    item,
    product: products.find((candidate) => candidate.slug === item.slug),
  }))
  if (picked.some(({ product }) => !product || product.availability === 'out-of-stock')) return null

  const items = (picked as { item: BundleOfferItem; product: Product }[]).map(({ item, product }) => ({
    product,
    ...(item.color && { color: item.color }),
    // Clamped, so a rate somebody fat-fingered past 1 gives the product away
    // rather than paying the shopper to take it.
    amount: round(product.price.amount * (1 - Math.min(Math.max(item.discount ?? 0, 0), 1))),
  }))

  return {
    items,
    total: round(items.reduce((sum, item) => sum + item.amount, 0)),
    compareAt: round(items.reduce((sum, { product }) => sum + product.price.amount, 0)),
  }
}

/** Every offer `dataset` holds, resolved against `products` and priced. Ones that no longer sell are left out. */
export function readBundles(dataset: DemoDataset, products: Product[]): Bundle[] {
  return (dataset.bundles ?? []).flatMap((offer) => {
    const resolved = resolveOffer(offer, products)
    if (!resolved) return []

    const money = (amount: number): Money => ({ amount, currencyCode: resolved.items[0].product.price.currencyCode })

    return [
      {
        id: offer.id,
        title: offer.title,
        items: resolved.items.map(({ product, color }) => ({ product, ...(color && { color }) })),
        price: money(resolved.total),
        compareAtPrice: money(resolved.compareAt),
      },
    ]
  })
}

/** The offer `id` names, or `undefined` where the store no longer runs it. */
export function findOffer(dataset: DemoDataset, id: string): BundleOffer | undefined {
  return dataset.bundles?.find((offer) => offer.id === id)
}

function round(amount: number): number {
  return Math.round(amount * 100) / 100
}
