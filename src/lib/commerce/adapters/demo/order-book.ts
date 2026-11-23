import { DEMO_ADDRESS, DEMO_CARDS, DEMO_CUSTOMER, DEMO_ORDER_NUMBERS, DEMO_PAYPAL_ACCOUNT } from '@/lib/demo-customer'
import type { DemoSlug } from '@/lib/demos'
import type {
  CurrencyCode,
  DeliveryOption,
  DeliverySlot,
  OrderCard,
  OrderDelivery,
  PaymentMethodId,
  Product,
} from '../../types'
import { applyPrograms } from '../../programs'
import type { DemoDataset } from './data'
import { deliveryOptions } from './delivery'
import type { StoredOrder } from './order'

/*
 * The orders the guest lookup can find, for a store that keeps no order book.
 * `./order.ts` only reaches an order the visitor placed this session, and
 * `/order-tracking` exists to find older ones. So the demo authors 9: every
 * stage the tracker draws, every action the sidebar offers, and enough history
 * for the account's order list to page.
 *
 * Lines are named by category and resolved against the catalog, so a demo
 * added tomorrow gets its own.
 *
 * **Delete this file with the demo adapter.** A real backend has an order table,
 * and `lookupOrder` becomes a query against it.
 */

interface Sample {
  number: string
  /** How long ago it was placed. This is what puts it in a stage: see `./fulfillment.ts`. */
  hoursAgo: number
  /** 1 product from each, in order. Categories a demo does not have are skipped. */
  categories: string[]
  /**
   * Products named outright, per storefront, where its categories would only
   * repeat the pieces another sample holds. Wins over {@link categories}.
   */
  products?: Partial<Record<DemoSlug, string[]>>
  /** How many lines to take off the top of the catalog where none of the categories match. */
  lines: number
  /** Where that fallback window starts, so the samples do not all hold the same thing. */
  from: number
  /** Put a protection plan on the first line. */
  plan?: boolean
  /**
   * How it travelled, by kind rather than id, since each storefront's table in
   * `./delivery.ts` names its own options. See {@link chooseOption}.
   */
  option: 'standard' | 'booked' | 'collected'
  /**
   * How it was paid for. Omitted, it is charged to the sample Mastercard, so only a
   * sample that exists to show another method names one.
   */
  payment?: PaymentMethodId
  /** The card charged, for a sample showing a second brand. Ignored unless {@link payment} is a card. */
  card?: OrderCard
}

/**
 * The 9 orders, in stage order rather than date order: every stage the tracker
 * draws, delivered orders inside their return window and past it, line counts
 * from 1 to 4, and 4 card brands and methods between them. {@link listSampleOrders} sorts them by
 * date, which puts 6 on the account's first page and 3 on its second.
 *
 * The first is the one `/order-tracking` names, and holds the 3 products the
 * demo cart is filled with, so the tracker, the cart, and the receipt match.
 * Each lists Electronics' categories, then Fashion's, then Furniture's.
 */
const SAMPLES: Sample[] = [
  // Out for delivery, into a booked courier window where the store books them.
  // The screen the design is drawn against.
  {
    number: DEMO_ORDER_NUMBERS.outForDelivery,
    hoursAgo: 90,
    categories: [
      'smartphones',
      'headphones',
      'vr-ar',
      'womens-sweaters',
      'womens-trousers',
      'womens-shoes',
      'armchairs',
      'lamps',
      'coffee-tables',
    ],
    lines: 3,
    from: 0,
    plan: true,
    option: 'booked',
  },
  // Still being packed.
  {
    number: 'APC-041730',
    hoursAgo: 26,
    categories: ['laptops', 'monitors', 'mens-shirts', 'mens-trousers', 'dining-tables', 'dining-chairs'],
    lines: 2,
    from: 3,
    option: 'standard',
  },
  // Still being packed, into a booked window far enough off to move.
  {
    number: DEMO_ORDER_NUMBERS.movable,
    hoursAgo: 30,
    categories: ['televisions', 'tv-mounts', 'sofas', 'pendants'],
    lines: 2,
    from: 15,
    option: 'booked',
  },
  // Waiting on the warehouse, collected rather than shipped, paid with PayPal.
  {
    number: 'APC-036402',
    hoursAgo: 4,
    categories: ['consoles', 'controllers', 'womens-dresses', 'womens-accessories', 'beds', 'drawers'],
    lines: 2,
    from: 5,
    option: 'collected',
    payment: 'paypal',
  },
  // Out with a courier on the standard service, so the tracker runs without a
  // booked slot. On Maestro, Mastercard's artwork in other colors.
  {
    number: 'APC-029517',
    hoursAgo: 74,
    categories: ['smartwatches', 'mens-jackets', 'lounge-chairs'],
    lines: 1,
    from: 7,
    option: 'standard',
    card: DEMO_CARDS.maestro,
  },
  // Delivered 3 weeks ago, so a return can still be opened against it. Several
  // lines, because picking what goes back is the point of that form.
  {
    number: DEMO_ORDER_NUMBERS.returnable,
    hoursAgo: 21 * 24,
    categories: [
      'speakers-soundbars',
      'e-readers',
      'streaming-media',
      'mens-sweaters',
      'mens-tops',
      'mens-shoes',
      'sideboards',
      'shelving',
      'wardrobes',
    ],
    lines: 3,
    from: 8,
    option: 'standard',
  },
  // Delivered last week and still returnable, on a second card brand.
  {
    number: 'APC-026840',
    hoursAgo: 9 * 24,
    categories: ['earbuds', 'chargers-cables', 'womens-tops'],
    lines: 2,
    from: 11,
    option: 'standard',
    card: DEMO_CARDS.visa,
  },
  // Delivered in the spring, past the return window, which is the state an order
  // spends most of its life in.
  {
    number: 'APC-019004',
    hoursAgo: 96 * 24,
    categories: ['digital-cameras', 'drones', 'lenses-accessories', 'action-cameras'],
    lines: 4,
    from: 9,
    plan: true,
    option: 'standard',
  },
  // Paid without a card, so the receipt names a method rather than 4 digits.
  {
    number: 'APC-014728',
    hoursAgo: 45 * 24,
    categories: ['tablets'],
    lines: 1,
    from: 13,
    option: 'standard',
    payment: 'paypal',
  },
]

/** How many days after checkout a booked sample's window falls. */
const BOOKED_AFTER_DAYS = 5

const HOUR = 3_600_000
const DAY = 24 * HOUR

/**
 * Every sample order, newest first, for the account history to page through.
 *
 * The email is ignored on purpose: the demo auth adapter signs in whoever asks,
 * so answering only for the sample customer's email would hand an empty history to
 * anybody who typed their own address. A real backend queries its order table by
 * the customer and shows nobody else's.
 */
export function listSampleOrders(demo: DemoSlug, dataset: DemoDataset): StoredOrder[] {
  // `SAMPLES` is arranged by the stage each one demonstrates; a history reads by date.
  return SAMPLES.map((sample) => buildSample(demo, dataset, sample)).sort((a, b) =>
    b.placedAt.localeCompare(a.placedAt),
  )
}

/**
 * The sample order matching both a number and the email it was placed with, or
 * `undefined`. Both are compared leniently, because a shopper pastes an order
 * number out of an email with whatever case and spacing it arrived in.
 */
export function lookupSampleOrder(
  demo: DemoSlug,
  dataset: DemoDataset,
  number: string,
  email: string,
): StoredOrder | undefined {
  if (email.trim().toLowerCase() !== DEMO_CUSTOMER.email) return undefined

  const wanted = number.trim().toUpperCase()
  const sample = SAMPLES.find((candidate) => candidate.number === wanted)
  return sample && buildSample(demo, dataset, sample)
}

function buildSample(demo: DemoSlug, dataset: DemoDataset, sample: Sample): StoredOrder {
  const placed = Date.now() - sample.hoursAgo * HOUR
  const products = pick(demo, dataset, sample)
  const currencyCode: CurrencyCode = products[0]?.price.currencyCode ?? 'USD'
  const goods = products.reduce((total, product) => total + product.price.amount, 0)
  const option = chooseOption(deliveryOptions(demo, currencyCode, goods, 0), sample.option)
  const travel = delivery(option, sample, placed, currencyCode)
  const { firstName, lastName, phone } = DEMO_ADDRESS

  const payment = sample.payment ?? 'card'
  const card = payment === 'card' ? (sample.card ?? DEMO_CARDS.mastercard) : undefined
  // Only PayPal hands one back. A real adapter reads it off its provider.
  const walletAccount = payment === 'paypal' ? DEMO_PAYPAL_ACCOUNT : undefined

  return {
    number: sample.number,
    placedAt: new Date(placed).toISOString(),
    email: DEMO_CUSTOMER.email,
    // Addressed to the store under the collector's name, as `./order.ts` records a collected order.
    address: travel.pickup ? { firstName, lastName, ...travel.pickup.address, phone } : DEMO_ADDRESS,
    payment,
    ...(card && { card }),
    ...(walletAccount && { walletAccount }),
    delivery: travel,
    ...(option && { optionId: option.id }),
    cart: {
      lines: products.map((product, index) => {
        const options = configureOptions(product)
        return {
          slug: product.slug,
          quantity: 1,
          ...(product.colors?.[0] && { color: product.colors[0].name }),
          ...(options && { options }),
          // On the first line only, so the receipt shows its "Services and
          // options" row without every order reading as a hard upsell.
          ...(sample.plan && index === 0 && product.protectionPlans?.[0] && { plan: product.protectionPlans[0].id }),
        }
      }),
    },
  }
}

/**
 * The in-stock products a sample names for this storefront, else 1 from each of
 * its categories, or a slice off the top of the catalog where the demo has none
 * of them. In stock, as the demo cart is filled, so the first sample holds the
 * same products.
 *
 * The fallback is what makes this work for a storefront nobody has curated:
 * taxonomies do not carry across demos, so Fashion resolves none of the
 * Electronics categories and gets 6 different orders anyway. A category that
 * matches nothing is skipped rather than fatal.
 */
function pick(demo: DemoSlug, dataset: DemoDataset, sample: Sample): Product[] {
  const pool = dataset.products.filter((product) => product.availability === 'in-stock')
  if (pool.length === 0) return []

  const named = sample.products?.[demo]?.flatMap((slug) => pool.find((product) => product.slug === slug) ?? []) ?? []
  if (named.length === 0) {
    for (const slug of sample.categories) {
      const category = dataset.categories.find((candidate) => candidate.slug === slug)
      const found = category && pool.find((product) => product.categoryIds.includes(category.id))
      if (found && !named.includes(found)) named.push(found)
    }
  }

  const picked =
    named.length > 0
      ? named
      : Array.from({ length: sample.lines }, (_, index) => pool[(sample.from + index) % pool.length])

  // Programs on, for the same reason `buildLine` turns them on: a plan id read
  // off a raw catalog row would name a plan the cart cannot resolve.
  return picked.map((product) => applyPrograms(demo, product))
}

/**
 * The first value of every option still on sale, so a line reads as something a
 * shopper configured, and the first sample matches the demo cart.
 */
function configureOptions(product: Product): Record<string, string> | undefined {
  const chosen = Object.fromEntries(
    (product.options ?? []).flatMap((option) => {
      const value = option.values.find((candidate) => candidate.available !== false)
      return value ? [[option.id, value.id] as const] : []
    }),
  )
  return Object.keys(chosen).length > 0 ? chosen : undefined
}

/**
 * How a sample order travels. Name, price, and carrier come from the store's own
 * shipping table, but the dates are counted from when the order was placed:
 * `deliveryOptions` quotes what is bookable now, and a receipt from last week is
 * a record of what was.
 */
function delivery(
  option: DeliveryOption | undefined,
  sample: Sample,
  placed: number,
  currencyCode: CurrencyCode,
): OrderDelivery {
  const day = (offset: number) => new Date(placed + offset * DAY).toISOString().slice(0, 10)
  // A collected order is ready from a day; a courier quotes a window.
  const arrival = option?.pickup ? { from: day(3) } : { from: day(3), to: day(4) }
  const booked = bookedWindow(option)

  return {
    name: option?.name ?? 'Standard delivery',
    price: option?.price ?? { amount: 0, currencyCode },
    ...(option?.carrier && { carrier: option.carrier }),
    ...(option?.pickup && { pickup: option.pickup }),
    ...(booked ? { slot: { date: day(BOOKED_AFTER_DAYS), from: booked.from, to: booked.to } } : { arrival }),
    // Minted from the order number rather than the clock, so the number quoted
    // to support is the same one on every reload. A carrier issues the real
    // thing when it takes the parcel, and never for an order it is not carrying.
    ...(option?.carrier && {
      trackingNumber: `ORD-${new Date(placed).getFullYear()}-${sample.number.split('-')[1]}`,
    }),
  }
}

/** The first afternoon window an option books, so a booked sample lands in one its checkout offers. */
function bookedWindow(option: DeliveryOption | undefined): DeliverySlot | undefined {
  const slots = option?.schedule?.[0]?.slots ?? []
  return slots.find((slot) => slot.from >= '12:00') ?? slots[0]
}

/**
 * The option in a storefront's own table that carries a sample of this kind,
 * or the preselected one where the table has none: Fashion books no courier slots.
 */
function chooseOption(options: DeliveryOption[], kind: Sample['option']): DeliveryOption | undefined {
  const preselected = options.find((option) => option.preselected)
  if (kind === 'booked') return options.find((option) => option.schedule) ?? preselected
  // The standard table's `pickup` names no store, so it is found by its id.
  if (kind === 'collected') return options.find((option) => option.pickup || option.id === 'pickup') ?? preselected
  return preselected
}
