import type { DemoSlug } from '@/lib/demos'
import { applyPrograms } from '../../programs'
import { REWARDS } from '../../programs/rewards'
import { quoteTradeIn } from '../../programs/trade-in'
import type {
  BundleChoice,
  Cart,
  CartDelivery,
  CartDiscount,
  CartGiftBox,
  CartLine,
  CartLineInput,
  CartLineOption,
  CartLinePatch,
  CartLineTradeIn,
  CartPatch,
  CartRewards,
  CartState,
  CurrencyCode,
  Money,
  Product,
  TradeInSelection,
} from '../../types'
import { findOffer, resolveOffer } from './bundles'
import type { DemoDataset } from './data'
import { LINE_ARRIVAL_DAYS, daysUntilReady, deliveryOptions, resolveDelivery } from './delivery'

/*
 * The demo cart: the one part of the demo adapter that is state rather than a
 * fixture.
 *
 * It has nowhere to keep that state. A cart in module scope would be shared by
 * every visitor the server is handling, so the whole cart rides in the token
 * instead: what was added and what was chosen alongside it, as base64url JSON,
 * which `lib/cart` puts in a cookie. Titles, prices, plans, and quotes are
 * resolved out of the catalog on every call, so nothing a shopper is carrying
 * can go stale, and nothing a shopper could edit decides what anything costs.
 *
 * A real backend keeps the cart and issues an id for it. Its token is that id,
 * and this file is the first one its adapter deletes.
 */

/**
 * How many distinct lines fit. The cookie holding the token is capped at 4 KB by
 * every browser, and this keeps the encoded cart well inside it.
 */
const MAX_LINES = 25

/** How many of one configuration a shopper can carry, standing in for stock the demo data doesn't track. */
const MAX_QUANTITY = 99

/** What gift wrapping costs, in the currency the demo's catalog is priced in. */
const GIFT_BOX_PRICE = 5

/** How soon the store delivers something it has on the shelf. A real adapter quotes this from its carrier rates. */
const DELIVERY_DAYS = 3

/** What a code takes off: a share of the subtotal, or a flat amount in the cart's currency. */
type DiscountRule = { rate: number; amount?: never } | { amount: number; rate?: never }

/**
 * The codes this store honors. Demo scaffolding: every real backend runs its own
 * promotions, so an adapter that has them redeems the code there and deletes
 * this table with the rest of the file.
 *
 * The last 4 are the offers each storefront's rewards page hands out. **Keep
 * them in step with `demoOffers()` in `lib/rewards/demo-offers.ts`**, or that
 * page offers a code this cart refuses.
 */
const DISCOUNT_CODES: Record<string, DiscountRule> = {
  APPICA10: { rate: 0.1 },
  WELCOME5: { rate: 0.05 },
  // Named by the promo in `components/furniture/header/header.tsx`.
  COZY15: { rate: 0.15 },
  SPRING10: { rate: 0.1 },
  UPGRADE50: { amount: 50 },
  SUMMER15: { rate: 0.15 },
  KNITS20: { rate: 0.2 },
}

/**
 * One line as the token carries it: what was chosen, never what it costs. Prices
 * are resolved from the dataset on read, which is what keeps a repriced product
 * from being sold at yesterday's price, and a hand-edited cookie from naming its
 * own trade-in credit.
 */
interface StoredLine {
  slug: string
  quantity: number
  /** The chosen finish, by the name the product's color carries. */
  color?: string
  /** Chosen option values, by option id. */
  options?: Record<string, string>
  /** The chosen protection plan, by plan id. */
  plan?: string
  /** The bundle this line was added as part of, by offer id. Absent for a line bought on its own. */
  bundle?: string
  /** The device handed in against this line. */
  tradeIn?: TradeInSelection
}

/** The cart as the token carries it: its lines, and the choices that belong to the order rather than to a line. */
export interface StoredCart {
  lines: StoredLine[]
  giftBox?: boolean
  discountCode?: string
  /** Loyalty points staked on the order, already clamped to the shopper's balance by `lib/cart`. */
  rewardPoints?: number
  /** How it is being delivered. Narrowed against the shipping table on every read, never trusted for a price. */
  delivery?: CartDelivery
}

/** The cart a token addresses. An unreadable token is treated as no cart, never as an error. */
export function readCart(demo: DemoSlug, dataset: DemoDataset, token: string | null): CartState {
  return { cart: buildCart(demo, dataset, decodeCart(token)), token }
}

/**
 * Adds a configured product, merging into the line that already holds the same
 * configuration. Throws with a message the shopper sees when the cart is full or
 * the product cannot be bought.
 */
export function addCartLine(
  demo: DemoSlug,
  dataset: DemoDataset,
  token: string | null,
  input: CartLineInput,
): CartState {
  const product = dataset.products.find((candidate) => candidate.slug === input.productSlug)
  if (!product) throw new Error('That product is no longer available.')
  if (product.availability === 'out-of-stock') throw new Error(`${product.title} is out of stock.`)

  const added: StoredLine = {
    slug: product.slug,
    quantity: Math.max(1, Math.trunc(input.quantity ?? 1)),
    ...(input.color && { color: input.color }),
    ...(input.options && Object.keys(input.options).length > 0 && { options: input.options }),
    ...(input.protectionPlanId && { plan: input.protectionPlanId }),
    ...(input.tradeIn && { tradeIn: input.tradeIn }),
  }

  const stored = decodeCart(token)
  const match = stored.lines.find((line) => storedLineId(line) === storedLineId(added))

  if (match) {
    match.quantity = Math.min(match.quantity + added.quantity, MAX_QUANTITY)
    // The add-ons are not part of a line's identity, so a second add carries its
    // own choices onto the line it merged into. Leaving them behind would drop a
    // plan the shopper just paid attention to.
    if (added.plan) match.plan = added.plan
    if (added.tradeIn) match.tradeIn = added.tradeIn
  } else {
    if (stored.lines.length >= MAX_LINES) throw new Error(`A cart holds ${MAX_LINES} products at a time.`)
    stored.lines.push(added)
  }

  return settle(demo, dataset, stored)
}

/**
 * Adds every product in a bundle, at the bundle's own price. All or nothing: an
 * offer the store can no longer sell as a set throws before anything is added,
 * so a refusal never leaves half a bundle behind.
 *
 * A bundled line is kept apart from the same product bought on its own (see
 * {@link storedLineId}), and adding the same offer twice raises both its lines
 * together.
 */
export function addCartBundle(
  demo: DemoSlug,
  dataset: DemoDataset,
  token: string | null,
  bundleId: string,
  choices: BundleChoice[] = [],
): CartState {
  const offer = findOffer(dataset, bundleId)
  const resolved = offer && resolveOffer(offer, dataset.products)
  if (!offer || !resolved) throw new Error('That bundle is no longer available.')

  const stored = decodeCart(token)

  for (const [index, item] of resolved.items.entries()) {
    const { color = item.color, options } = choices[index] ?? {}
    const added: StoredLine = {
      slug: item.product.slug,
      quantity: 1,
      ...(color && { color }),
      ...(options && Object.keys(options).length > 0 && { options }),
      bundle: offer.id,
    }
    const match = stored.lines.find((line) => storedLineId(line) === storedLineId(added))

    if (match) {
      match.quantity = Math.min(match.quantity + 1, MAX_QUANTITY)
    } else {
      if (stored.lines.length >= MAX_LINES) throw new Error(`A cart holds ${MAX_LINES} products at a time.`)
      stored.lines.push(added)
    }
  }

  return settle(demo, dataset, stored)
}

/** Applies a patch to one line. A field the patch leaves out is left where it was. */
export function updateCartLine(
  demo: DemoSlug,
  dataset: DemoDataset,
  token: string | null,
  lineId: string,
  patch: CartLinePatch,
): CartState {
  const stored = decodeCart(token)
  const line = stored.lines.find((candidate) => storedLineId(candidate) === lineId)

  if (line) {
    if (patch.quantity !== undefined) {
      line.quantity = Math.min(Math.max(1, Math.trunc(patch.quantity)), MAX_QUANTITY)
    }
    if (patch.protectionPlanId !== undefined) {
      line.plan = patch.protectionPlanId ?? undefined
    }
    if (patch.tradeIn !== undefined) {
      line.tradeIn = patch.tradeIn ?? undefined
    }
  }

  return settle(demo, dataset, stored)
}

/** Takes a line out. A line that is already gone is not an error: the cart ends up the way the shopper asked. */
export function removeCartLine(demo: DemoSlug, dataset: DemoDataset, token: string | null, lineId: string): CartState {
  const stored = decodeCart(token)
  stored.lines = stored.lines.filter((line) => storedLineId(line) !== lineId)

  return settle(demo, dataset, stored)
}

/** Applies a patch to the cart itself. Throws for a discount code the store does not honor. */
export function updateCart(demo: DemoSlug, dataset: DemoDataset, token: string | null, patch: CartPatch): CartState {
  const stored = decodeCart(token)

  if (patch.giftBox !== undefined) stored.giftBox = patch.giftBox || undefined

  if (patch.discountCode !== undefined) {
    const code = patch.discountCode?.trim().toUpperCase()
    if (code && !(code in DISCOUNT_CODES)) throw new Error(`${code} is not a code this store accepts.`)
    stored.discountCode = code || undefined
  }

  // Clamped against the balance in `lib/cart/actions.ts`, which is the only
  // caller that can resolve the session behind it. Rounded down here so a hand-
  // edited token cannot stake half a point.
  if (patch.rewardPoints !== undefined) {
    stored.rewardPoints = Math.max(0, Math.floor(patch.rewardPoints ?? 0)) || undefined
  }

  if (patch.delivery !== undefined) {
    const chosen = patch.delivery ?? undefined
    // Quoted against the cart as patched so far, so a code redeemed above moves a free-delivery threshold.
    const delivery = resolveDelivery(buildCart(demo, dataset, stored).deliveryOptions ?? [], chosen)
    if (chosen && !delivery) throw new Error('That delivery slot is no longer available.')
    stored.delivery = delivery
  }

  return settle(demo, dataset, stored)
}

/**
 * Re-encodes a mutated cart. An emptied one has nothing left to address, so it
 * gives up its token, and the choices that belonged to the order go with it.
 */
function settle(demo: DemoSlug, dataset: DemoDataset, stored: StoredCart): CartState {
  pruneBundles(dataset, stored)
  return { cart: buildCart(demo, dataset, stored), token: stored.lines.length > 0 ? encodeCart(stored) : null }
}

/**
 * Which bundles the cart still holds whole. Taking 1 product out is giving the
 * offer up, so what is left of it prices at the catalog's rate.
 */
function intactBundles(dataset: DemoDataset, stored: StoredCart): Set<string> {
  const intact = new Set<string>()

  for (const offer of dataset.bundles ?? []) {
    const held = new Set(stored.lines.filter((line) => line.bundle === offer.id).map((line) => line.slug))
    if (offer.items.every((item) => held.has(item.slug))) intact.add(offer.id)
  }

  return intact
}

/**
 * Drops the tag from the lines of a bundle that is no longer whole, and folds
 * each into the identical untagged line where there is one.
 *
 * They have already lost the bundle's price, which {@link intactBundles}
 * decides. This is what keeps the cart from showing the same product twice, at
 * the same price, on 2 rows.
 */
function pruneBundles(dataset: DemoDataset, stored: StoredCart): void {
  const intact = intactBundles(dataset, stored)
  if (stored.lines.every((line) => !line.bundle || intact.has(line.bundle))) return

  const merged: StoredLine[] = []
  for (const line of stored.lines) {
    if (line.bundle && !intact.has(line.bundle)) delete line.bundle

    const match = merged.find((candidate) => storedLineId(candidate) === storedLineId(line))
    if (match) match.quantity = Math.min(match.quantity + line.quantity, MAX_QUANTITY)
    else merged.push(line)
  }

  stored.lines = merged
}

/**
 * The id a line is addressed by: its product and everything configured on it.
 * Two adds of one configuration produce the same id and merge; the same phone in
 * 2 colors produces 2, and they don't.
 *
 * The bundle is part of it, so a product bought inside an offer and the same one
 * bought on its own stay 2 lines. They are priced differently, and merging them
 * would sell the second at the bundle's rate.
 *
 * The plan and the trade-in are left out on purpose. Both are changed on the
 * line after the fact, so folding them in would make every change open a second
 * line and lose the handle the screen was holding.
 */
function storedLineId(line: StoredLine): string {
  const options = Object.entries(line.options ?? {})
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([id, value]) => `${id}=${value}`)

  return [line.slug, line.color ?? '', ...options, line.bundle ?? ''].join('|')
}

/**
 * What each bundled line costs and which offer it came from, keyed by the line's
 * own id. Only the bundles the cart still holds whole are in here, so taking the
 * phone out puts the case back to what the catalog charges for it.
 */
function bundlePricing(dataset: DemoDataset, stored: StoredCart): Map<string, { title: string; amount: number }> {
  const pricing = new Map<string, { title: string; amount: number }>()
  const intact = intactBundles(dataset, stored)

  for (const offer of dataset.bundles ?? []) {
    if (!intact.has(offer.id)) continue

    const resolved = resolveOffer(offer, dataset.products)
    if (!resolved) continue

    for (const { product, amount } of resolved.items) {
      // Every line, since the same offer added in 2 colors holds the product twice.
      for (const line of stored.lines) {
        if (line.bundle === offer.id && line.slug === product.slug) {
          pricing.set(storedLineId(line), { title: offer.title, amount })
        }
      }
    }
  }

  return pricing
}

/** Resolves a stored cart against the catalog, and counts what it comes to. */
export function buildCart(demo: DemoSlug, dataset: DemoDataset, stored: StoredCart): Cart {
  const bundled = bundlePricing(dataset, stored)
  const products = stored.lines.flatMap((line) => {
    const product = dataset.products.find((candidate) => candidate.slug === line.slug)
    return product ? [{ line, product }] : []
  })
  const lines = products.map(({ line, product }) => buildLine(demo, product, line, bundled.get(storedLineId(line))))

  const currencyCode = cartCurrency(dataset, stored)
  const money = (amount: number): Money => ({ amount: Math.round(amount * 100) / 100, currencyCode })

  const subtotal = sum(lines, (line) => line.lineTotal.amount)
  const savings = sum(lines, (line) => (line.compareAtTotal?.amount ?? line.lineTotal.amount) - line.lineTotal.amount)
  const tradeInCredit = sum(lines, (line) => line.tradeIn?.credit.amount ?? 0)

  // A plan covers a device, so a line carrying 3 of them is quoted for 3.
  const plans = sum(lines, (line) => (line.protectionPlan?.price.amount ?? 0) * line.quantity)
  const giftBox: CartGiftBox | undefined =
    lines.length > 0 ? { price: money(GIFT_BOX_PRICE), added: stored.giftBox ?? false } : undefined
  const services = plans + (giftBox?.added ? giftBox.price.amount : 0)

  const rule = stored.discountCode ? DISCOUNT_CODES[stored.discountCode] : undefined
  const discountAmount = rule ? Math.min(rule.amount ?? subtotal * rule.rate, subtotal) : 0
  const discount: CartDiscount | undefined =
    stored.discountCode && rule ? { code: stored.discountCode, amount: money(discountAmount) } : undefined

  // Re-narrowed rather than trusted from the token, so a shipping table edited
  // since the cookie was written cannot sell yesterday's rate.
  const ready = daysUntilReady(products.map(({ product }) => product))
  const options = lines.length > 0 ? deliveryOptions(demo, currencyCode, subtotal - discountAmount, ready) : undefined
  const delivery = options && resolveDelivery(options, stored.delivery)
  const shipping = delivery && options?.find((option) => option.id === delivery.optionId)?.price

  // Points pay for what the order still owes after everything else, so a
  // shopper spends only what the order can absorb and keeps the rest. Shipping
  // is deliberately outside that: points buy goods, not carriage.
  const payable = Math.max(0, subtotal + services - tradeInCredit - discountAmount)
  const points = Math.min(stored.rewardPoints ?? 0, Math.floor(payable / REWARDS.pointValue))
  const rewards: CartRewards | undefined =
    points > 0 ? { points, credit: money(points * REWARDS.pointValue) } : undefined

  return {
    id: `cart-${demo}`,
    lines,
    totalQuantity: lines.reduce((total, line) => total + line.quantity, 0),
    subtotal: money(subtotal),
    ...(services > 0 && { services: money(services) }),
    ...(savings > 0 && { savings: money(savings) }),
    ...(tradeInCredit > 0 && { tradeInCredit: money(tradeInCredit) }),
    ...(giftBox && { giftBox }),
    ...(discount && { discount }),
    ...(rewards && { rewards }),
    ...(options && { deliveryOptions: options }),
    ...(delivery && { delivery }),
    ...(shipping && { shipping }),
    // `payable` is floored at zero, so a generous trade-in pays the difference
    // back at checkout rather than turning the order into a refund.
    total: money(payable + (shipping?.amount ?? 0) - (rewards?.credit.amount ?? 0)),
  }
}

/** What a cart is priced in, falling back to the catalog so an empty cart still quotes shipping. */
function cartCurrency(dataset: DemoDataset, stored: StoredCart): CurrencyCode {
  const first = stored.lines[0] && dataset.products.find((product) => product.slug === stored.lines[0]?.slug)
  return first?.price.currencyCode ?? dataset.products[0]?.price.currencyCode ?? 'USD'
}

/** `bundle` is the offer's name and this line's share of its price, for a line bought inside one. */
function buildLine(
  demo: DemoSlug,
  catalogProduct: Product,
  stored: StoredLine,
  bundle?: { title: string; amount: number },
): CartLine {
  // The cart shows what the product page offered, so the line is built from the
  // product with its merchandising programs on it rather than from the raw
  // catalog row. An adapter whose backend holds real warranty and trade-in data
  // returns it on the product and skips this.
  const product = applyPrograms(demo, catalogProduct)

  const color = product.colors?.find((candidate) => candidate.name === stored.color)
  const options: CartLineOption[] = []
  if (color) options.push({ label: 'Color', value: color.name })

  // Priced the way the product page prices it, and walked in the product's own
  // option order so the line reads the way that page did. A bundled line starts
  // from its share of the offer instead, and the options are added on top either
  // way.
  let unitAmount = bundle?.amount ?? product.price.amount
  for (const option of product.options ?? []) {
    const value = option.values.find((candidate) => candidate.id === stored.options?.[option.id])
    if (!value) continue
    unitAmount += value.priceDelta?.amount ?? 0
    options.push({ label: option.label, value: value.label })
  }

  const money = (amount: number): Money => ({ amount, currencyCode: product.price.currencyCode })
  // What the same configuration costs outside the bundle. The saving follows it,
  // so an upgraded model shows what the same upgrade would have cost before the
  // sale, and a bundled line strikes through the price it would have paid alone.
  const listAmount = unitAmount - (bundle ? bundle.amount - product.price.amount : 0)
  const markdown = product.compareAtPrice ? product.compareAtPrice.amount - product.price.amount : 0
  // Only where there is really something to strike: a bundle leaves its hero at
  // the catalog price, and $1,099 crossed out beside $1,099 reads as a bug.
  const compareAtAmount = listAmount + markdown > unitAmount ? listAmount + markdown : undefined

  const packshot = (color?.media ?? product.media).packshot
  const arrives = deliveryEstimate(demo, product)
  const protectionPlan = product.protectionPlans?.find((plan) => plan.id === stored.plan)
  const tradeIn = stored.tradeIn && product.tradeIn ? quoteTradeIn(product.tradeIn, stored.tradeIn) : undefined
  const lineTradeIn: CartLineTradeIn | undefined =
    tradeIn && stored.tradeIn
      ? {
          selection: stored.tradeIn,
          model: tradeIn.model.label,
          condition: tradeIn.condition.label,
          credit: tradeIn.credit,
        }
      : undefined

  return {
    id: storedLineId(stored),
    productId: product.id,
    productSlug: product.slug,
    title: product.title,
    image: color?.media.image ?? product.media.image,
    ...(packshot && { packshot }),
    ...(options.length > 0 && { options }),
    unitPrice: money(unitAmount),
    quantity: stored.quantity,
    lineTotal: money(unitAmount * stored.quantity),
    ...(compareAtAmount != null && { compareAtTotal: money(compareAtAmount * stored.quantity) }),
    ...(bundle && { bundle: bundle.title }),
    ...(arrives && { deliveryEstimate: arrives }),
    ...(product.protectionPlans && { protectionPlans: product.protectionPlans }),
    ...(protectionPlan && { protectionPlan }),
    ...(product.tradeIn && { tradeInOffer: product.tradeIn }),
    ...(lineTradeIn && { tradeIn: lineTradeIn }),
    href: `/product/${product.slug}`,
  }
}

/** When a line is expected, as `YYYY-MM-DD`. Nothing is promised for something the store does not have. */
function deliveryEstimate(demo: DemoSlug, product: Product): string | undefined {
  if (product.availability === 'out-of-stock') return undefined

  const days = LINE_ARRIVAL_DAYS[demo]
  // A pre-order arrives when it exists, which the catalog already dates.
  if (product.availability === 'preorder') {
    return days && product.availableAt ? daysAfter(Date.parse(product.availableAt), days) : product.availableAt
  }
  return daysAfter(Date.now(), days ?? DELIVERY_DAYS)
}

function daysAfter(start: number, days: number): string {
  return new Date(start + days * 86_400_000).toISOString().slice(0, 10)
}

function sum(lines: CartLine[], amount: (line: CartLine) => number): number {
  return lines.reduce((total, line) => total + amount(line), 0)
}

function encodeCart(stored: StoredCart): string {
  return Buffer.from(JSON.stringify(stored), 'utf8').toString('base64url')
}

/** Anything unreadable (a hand-edited cookie, an older token) is an empty cart, never a crash. */
export function decodeCart(token: string | null): StoredCart {
  if (!token) return { lines: [] }

  try {
    const parsed: unknown = JSON.parse(Buffer.from(token, 'base64url').toString('utf8'))
    // Tokens minted before the cart carried anything of its own held the lines
    // alone, so a cookie from that version still reads back as a cart.
    const cart: Partial<StoredCart> = Array.isArray(parsed) ? { lines: parsed } : (parsed as Partial<StoredCart>)
    if (!Array.isArray(cart?.lines)) return { lines: [] }

    return {
      lines: cart.lines.filter(isStoredLine).slice(0, MAX_LINES),
      ...(typeof cart.giftBox === 'boolean' && { giftBox: cart.giftBox }),
      ...(typeof cart.discountCode === 'string' && { discountCode: cart.discountCode }),
      ...(typeof cart.rewardPoints === 'number' && cart.rewardPoints > 0 && { rewardPoints: cart.rewardPoints }),
      // Shape-checked only; `resolveDelivery` decides whether it still exists.
      ...(isStoredDelivery(cart.delivery) && { delivery: cart.delivery }),
    }
  } catch {
    return { lines: [] }
  }
}

function isStoredDelivery(value: unknown): value is CartDelivery {
  if (typeof value !== 'object' || value === null) return false
  const delivery = value as Partial<CartDelivery>
  if (typeof delivery.optionId !== 'string') return false
  if (delivery.slot === undefined) return true
  return typeof delivery.slot?.date === 'string' && typeof delivery.slot?.slotId === 'string'
}

function isStoredLine(value: unknown): value is StoredLine {
  if (typeof value !== 'object' || value === null) return false
  const line = value as Partial<StoredLine>
  return typeof line.slug === 'string' && typeof line.quantity === 'number' && line.quantity > 0
}
