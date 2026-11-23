import type { DemoSlug } from '@/lib/demos'
import type {
  Address,
  CheckoutInput,
  Order,
  OrderCard,
  OrderDelivery,
  OrderList,
  OrderQuery,
  OrderState,
  PaymentMethodId,
} from '../../types'
import { formatDate } from '../../format'
import { type StoredCart, buildCart, decodeCart } from './cart'
import type { DemoDataset } from './data'
import { rescheduleDays } from './delivery'
import { trackOrder } from './fulfillment'
import { listSampleOrders, lookupSampleOrder } from './order-book'

/*
 * Orders, for a demo store with nowhere to write one.
 *
 * Placing an order has nowhere to go, so the order rides in its own token
 * exactly as the cart does, and `lib/checkout` puts that in a cookie. Lines are
 * stored as what was bought and resolved against the catalog on read, the same
 * trade `./cart.ts` makes.
 *
 * The 1 place it differs: the delivery is stored already priced. An order is a
 * receipt, and re-quoting one would move a figure the shopper was charged and
 * drop a booked slot the moment its day passed. Nothing is charged from this
 * token, so a stored price is a record rather than an opening.
 *
 * A token only reaches back to an order this visitor placed. Finding one placed
 * last week takes a table to search, and `./order-book.ts` authors 9 to stand in
 * for it. Where an order has got to is `./fulfillment.ts`.
 *
 * A real backend writes the order and returns its id.
 */

/** How long an order number is, after the `APC-` the store prefixes. */
const ORDER_DIGITS = 6

/** Where "Order notes" stops, so a long note cannot push the token past the 4 KB a cookie holds. */
const MAX_NOTES = 400

/** Where a gift note stops: what fits on the card. Keep in step with `GIFT_MESSAGE_LENGTH` in the Fashion checkout form. */
const MAX_GIFT_MESSAGE = 250

/**
 * What the demo prefixes a tracking number with. Deliberately unlike the `APC-`
 * an order number wears: the 2 are different handles, and a shopper who quotes
 * the wrong one to the wrong desk gets nowhere.
 */
const TRACKING_PREFIX = 'ORD'

/** Orders per page in the account history, when a caller names no size. */
const ORDERS_PER_PAGE = 6

/** The order as its token carries it. */
export interface StoredOrder {
  number: string
  placedAt: string
  email: string
  address: Address
  payment: PaymentMethodId
  card?: OrderCard
  walletAccount?: string
  /** Priced when the order was placed, not re-quoted on read. */
  delivery: OrderDelivery
  /** The option it was placed on, by id, so a booked window can be offered the option's other days. */
  optionId?: string
  notes?: string
  giftMessage?: string
  /** What was bought, in the shape the cart token uses, minus the delivery held above. */
  cart: StoredCart
}

/**
 * Turns the cart a token addresses into an order. Throws with a message the
 * shopper reads for a cart that cannot be ordered.
 */
export function placeOrder(
  demo: DemoSlug,
  dataset: DemoDataset,
  token: string | null,
  input: CheckoutInput,
): OrderState {
  const stored = decodeCart(token)
  const cart = buildCart(demo, dataset, stored)
  if (cart.lines.length === 0) throw new Error('There is nothing in your cart to order.')

  const chosen = cart.delivery
  const option = chosen && cart.deliveryOptions?.find((candidate) => candidate.id === chosen.optionId)
  if (!option) throw new Error('Choose how you would like this order delivered.')

  const bookedDay = option.schedule?.find((day) => day.date === chosen.slot?.date)
  const bookedSlot = bookedDay?.slots.find((slot) => slot.id === chosen.slot?.slotId)

  // A collected order goes to the store: only who collects it comes from the checkout.
  const { firstName, lastName, phone } = input.shippingAddress
  const address = option.pickup
    ? { firstName, lastName, ...option.pickup.address, ...(phone && { phone }) }
    : input.shippingAddress
  // The note rides on the card that comes with the wrapping, so an unwrapped order has nowhere to print it.
  const giftMessage = stored.giftBox ? input.giftMessage?.trim().slice(0, MAX_GIFT_MESSAGE) : undefined

  const order: StoredOrder = {
    number: orderNumber(),
    placedAt: new Date().toISOString(),
    email: input.email,
    address,
    payment: input.paymentMethod,
    ...(input.card && { card: input.card }),
    delivery: {
      name: option.name,
      price: option.price,
      ...(option.arrival && { arrival: option.arrival }),
      ...(bookedDay && bookedSlot && { slot: { date: bookedDay.date, from: bookedSlot.from, to: bookedSlot.to } }),
      // A real store has neither of these at checkout: the carrier issues a
      // number when it takes the parcel, hours or days later, and an order
      // nobody carries never gets one. The demo mints it up front so the
      // confirmation shows the row it would eventually fill.
      ...(option.carrier && { carrier: option.carrier, trackingNumber: trackingNumber() }),
      ...(option.pickup && { pickup: option.pickup }),
    },
    optionId: option.id,
    ...(input.notes?.trim() && { notes: input.notes.trim().slice(0, MAX_NOTES) }),
    ...(giftMessage && { giftMessage }),
    // Dropped here because the resolved copy above is the order's answer.
    cart: { ...stored, delivery: undefined },
  }

  return { order: buildOrder(demo, dataset, order), token: encode(order) }
}

/**
 * The order a token addresses, or `null` for a visitor who has placed none.
 *
 * Nothing is invented here: `/checkout/order-confirmation` opened without ordering
 * renders its empty state, exactly as it would against a real backend.
 */
export function readOrder(demo: DemoSlug, dataset: DemoDataset, token: string | null): Order | null {
  const stored = decode(token)
  return stored && buildOrder(demo, dataset, stored)
}

/**
 * Finds an order by the number and email it was placed with, and hands back the
 * token to read it by. `null` when nothing matches.
 *
 * Searches the samples in `./order-book.ts`, for want of a table. An order the
 * visitor placed themselves is not among them and does not need to be: they
 * still hold its token, and `lib/orders` tries that first.
 */
export function lookupOrder(demo: DemoSlug, dataset: DemoDataset, number: string, email: string): OrderState | null {
  const stored = lookupSampleOrder(demo, dataset, number, email)
  return stored ? { order: buildOrder(demo, dataset, stored), token: encode(stored) } : null
}

/**
 * One page of the order book, narrowed by `query` and newest first. Filtering
 * and paging happen here because that is where a real backend does them.
 */
export function listOrders(demo: DemoSlug, dataset: DemoDataset, query: OrderQuery): OrderList {
  let orders = listSampleOrders(demo, dataset).map((stored) => buildOrder(demo, dataset, stored))

  const { status, search } = query
  if (status) orders = orders.filter((order) => order.tracking.status === status)
  if (search) orders = orders.filter((order) => matchesSearch(order, search))

  const total = orders.length
  const pageSize = query.pageSize ?? ORDERS_PER_PAGE
  const pageCount = Math.max(1, Math.ceil(total / pageSize))
  const page = Math.min(Math.max(1, query.page ?? 1), pageCount)
  const start = (page - 1) * pageSize

  return { orders: orders.slice(start, start + pageSize), total, page, pageCount }
}

/**
 * Whether an order answers what a shopper typed: its own number, the carrier's,
 * anything it holds, or when it was placed. The date is matched as the store
 * writes it, so "March" and "2026" both find an order from March 2026; a typed
 * date wants a range picker, not a text box.
 */
function matchesSearch(order: Order, search: string): boolean {
  const term = search.trim().toLowerCase()
  if (!term) return true

  const haystack = [
    order.number,
    order.delivery.trackingNumber,
    formatDate(order.placedAt),
    ...order.lines.flatMap((line) => [line.title, line.options?.map((option) => option.value).join(' ')]),
  ]

  return haystack.some((field) => field?.toLowerCase().includes(term))
}

/** Resolves a stored order against the catalog, and counts what was charged. */
function buildOrder(demo: DemoSlug, dataset: DemoDataset, stored: StoredOrder): Order {
  // The stored cart carries no delivery, so `cart.total` excludes shipping and
  // the recorded price is added back once.
  const cart = buildCart(demo, dataset, stored.cart)
  const shipping = stored.delivery.price
  const option = cart.deliveryOptions?.find((candidate) => candidate.id === stored.optionId)
  const reschedule = rescheduleDays(option, stored.delivery.slot)

  return {
    number: stored.number,
    placedAt: stored.placedAt,
    email: stored.email,
    lines: cart.lines,
    shippingAddress: stored.address,
    delivery: stored.delivery,
    tracking: {
      ...trackOrder(stored.placedAt, Boolean(stored.delivery.pickup)),
      ...(reschedule && { reschedule }),
    },
    paymentMethod: stored.payment,
    ...(stored.card && { card: stored.card }),
    ...(stored.walletAccount && { walletAccount: stored.walletAccount }),
    subtotal: cart.subtotal,
    ...(cart.services && { services: cart.services }),
    ...(cart.savings && { savings: cart.savings }),
    ...(cart.tradeInCredit && { tradeInCredit: cart.tradeInCredit }),
    ...(cart.discount && { discount: cart.discount }),
    ...(cart.rewards && { rewards: cart.rewards }),
    shipping,
    total: {
      amount: Math.round((cart.total.amount + shipping.amount) * 100) / 100,
      currencyCode: shipping.currencyCode,
    },
    ...(stored.notes && { notes: stored.notes }),
    ...(stored.giftMessage && { giftMessage: stored.giftMessage }),
  }
}

/** A number a shopper can read back over the phone. A real backend issues its own. */
function orderNumber(): string {
  return `APC-${String(Date.now() % 10 ** ORDER_DIGITS).padStart(ORDER_DIGITS, '0')}`
}

/** A carrier consignment number, in the shape a carrier hands one back. */
function trackingNumber(): string {
  const year = new Date().getFullYear()
  return `${TRACKING_PREFIX}-${year}-${String(Date.now() % 10 ** ORDER_DIGITS).padStart(ORDER_DIGITS, '0')}`
}

function encode(order: StoredOrder): string {
  return Buffer.from(JSON.stringify(order), 'utf8').toString('base64url')
}

/** Anything unreadable is no order, never a crash. */
function decode(token: string | null): StoredOrder | null {
  if (!token) return null

  try {
    const parsed: unknown = JSON.parse(Buffer.from(token, 'base64url').toString('utf8'))
    return isStoredOrder(parsed) ? parsed : null
  } catch {
    return null
  }
}

function isStoredOrder(value: unknown): value is StoredOrder {
  if (typeof value !== 'object' || value === null) return false
  const order = value as Partial<StoredOrder>
  return (
    typeof order.number === 'string' &&
    typeof order.placedAt === 'string' &&
    typeof order.email === 'string' &&
    typeof order.address === 'object' &&
    order.address !== null &&
    typeof order.delivery === 'object' &&
    order.delivery !== null &&
    typeof order.cart === 'object' &&
    Array.isArray(order.cart?.lines)
  )
}
