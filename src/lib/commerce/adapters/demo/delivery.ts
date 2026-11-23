import type { DemoSlug } from '@/lib/demos'
import { formatMoneyRounded } from '../../format'
import type {
  CartDelivery,
  CurrencyCode,
  DeliveryCarrier,
  DeliveryDay,
  DeliveryOption,
  DeliverySlot,
  Money,
  OrderDeliverySlot,
  PickupLocation,
  Product,
} from '../../types'

/*
 * How the demo stores deliver: a shipping table per storefront, and the slots
 * their couriers can be booked into.
 *
 * Store policy rather than catalog content, so it lives with the adapter rather
 * than in a demo dataset, the way the discount codes and the gift-box price do.
 * A real adapter deletes this file and quotes its backend's shipping rates
 * instead, which is also where rates start depending on the address.
 *
 * Dates are counted from the day of the request, so the demo never offers a
 * window that has already passed.
 */

/**
 * Builds a storefront's options from its currency, what the goods come to (for a
 * free-delivery threshold), and how many days until every piece can ship.
 */
type ShippingTable = (money: (amount: number) => Money, goods: number, ready: number) => DeliveryOption[]

/** What each option adds to the order, in the currency the demo's catalog is priced in. */
const PRICES = {
  standard: 0,
  pickup: 0,
  doorstep: 8,
  inHome: 16,
} as const

/** The soonest and latest a standard order lands, counted in days from today. */
const STANDARD_ARRIVAL = { from: 3, to: 4 }

/** The same for the crew that unpacks and installs, which needs longer to schedule. */
const IN_HOME_ARRIVAL = { from: 4, to: 6 }

/** How many days ahead a courier slot can be booked. */
const SCHEDULE_DAYS = 6

/**
 * Who the demo stores hand their parcels to. One fictional carrier, and
 * deliberately without a `logo`: the screens fall back to `CarrierMark` for a
 * courier whose artwork the store does not have, which is the usual case. Swap
 * the name for whoever really carries your orders, and drop the whole const for
 * a backend that names a carrier per shipment.
 */
const GROUP_EXPRESS: DeliveryCarrier = { name: 'Group Express' }

/** The windows a courier runs, as 24-hour `HH:mm` bounds. Same set every day in the demo. */
const SLOTS: DeliverySlot[] = [
  { id: '07-08', from: '07:00', to: '08:00' },
  { id: '08-09', from: '08:00', to: '09:00' },
  { id: '14-15', from: '14:00', to: '15:00' },
  { id: '15-16', from: '15:00', to: '16:00' },
  { id: '16-17', from: '16:00', to: '17:00' },
  { id: '17-18', from: '17:00', to: '18:00' },
]

/** The table every storefront ships on unless it names its own in {@link OWN_TABLES}. */
const standardTable: ShippingTable = (money) => [
  {
    id: 'standard',
    name: 'Standard delivery',
    price: money(PRICES.standard),
    arrival: { from: day(STANDARD_ARRIVAL.from), to: day(STANDARD_ARRIVAL.to) },
    carrier: { ...GROUP_EXPRESS, note: 'Est. 2 - 4 days shipping' },
    preselected: true,
  },
  {
    id: 'pickup',
    name: 'Pickup at The Avenue 30',
    price: money(PRICES.pickup),
    description: '225 W 35th St, New York, ready from 10:00 am',
    arrival: { from: day(1) },
  },
  {
    id: 'doorstep',
    name: 'Doorstep delivery',
    price: money(PRICES.doorstep),
    description: 'Left at your door in the hour you pick',
    schedule: schedule(),
    carrier: GROUP_EXPRESS,
  },
  {
    id: 'in-home',
    name: 'In-Home delivery',
    price: money(PRICES.inHome),
    description: 'Unpacked and set up, with the packaging taken away',
    arrival: { from: day(IN_HOME_ARRIVAL.from), to: day(IN_HOME_ARRIVAL.to) },
    carrier: { ...GROUP_EXPRESS, note: 'Est. 2 - 4 days shipping' },
  },
]

/**
 * What Fashion's goods have to come to before standard delivery is free. The
 * product perks and the care FAQ promise it too: keep all 3 in step.
 */
const FASHION_FREE_DELIVERY_FROM = 150

/**
 * Where Fashion orders can be collected: the stores in `STORES`, in
 * `components/fashion/stores.tsx`. Keep the 2 in step.
 */
const FASHION_STORES: (PickupLocation & { id: string })[] = [
  {
    id: 'copenhagen',
    name: 'Copenhagen',
    address: { line1: 'Bredgade 34', city: 'København K', postcode: '1260', countryCode: 'DK' },
    hours: 'Mon to Fri, 10:00 to 18:00. Sat, 10:00 to 16:00',
    image: { src: '/demo/fashion/about/stores/copenhagen.webp', alt: '', width: 1600, height: 1200 },
  },
  {
    id: 'porto',
    name: 'Porto',
    address: { line1: 'Rua de Cedofeita 218', city: 'Porto', postcode: '4050-174', countryCode: 'PT' },
    hours: 'Mon to Sat, 10:00 to 19:00',
    image: { src: '/demo/fashion/about/stores/porto.webp', alt: '', width: 1600, height: 1200 },
  },
]

/** Fashion ships in 2 speeds, free over a threshold, or holds the order at either store. */
const fashionTable: ShippingTable = (money, goods) => [
  {
    id: 'standard',
    name: 'Standard delivery',
    price: money(goods >= FASHION_FREE_DELIVERY_FROM ? 0 : 8),
    description: `Free on orders over ${formatMoneyRounded(money(FASHION_FREE_DELIVERY_FROM))}`,
    arrival: { from: day(3), to: day(5) },
    carrier: GROUP_EXPRESS,
    preselected: true,
  },
  {
    id: 'express',
    name: 'Express delivery',
    price: money(18),
    arrival: { from: day(1), to: day(2) },
    carrier: GROUP_EXPRESS,
  },
  ...FASHION_STORES.map(({ id, ...pickup }) => ({
    id: `collect-${id}`,
    name: `Collect in ${pickup.name}`,
    price: money(0),
    arrival: { from: day(2) },
    pickup,
  })),
]

/** The storefronts with rates of their own. Keyed by demo, so a deleted one leaves a key TypeScript flags. */
const OWN_TABLES: Partial<Record<DemoSlug, ShippingTable>> = {
  fashion: fashionTable,
}

/**
 * The ways a demo store delivers, in the order to offer them, priced in the
 * cart's own currency. `goods` is what the lines come to after any discount,
 * which is what a free-delivery threshold is measured against, and `ready` is
 * {@link daysUntilReady} for the cart's products.
 */
export function deliveryOptions(
  demo: DemoSlug,
  currencyCode: CurrencyCode,
  goods: number,
  ready: number,
): DeliveryOption[] {
  const money = (amount: number): Money => ({ amount, currencyCode })
  return (OWN_TABLES[demo] ?? standardTable)(money, goods, ready)
}

/**
 * Days until every product can ship: 0 for stock on the shelf, or the last
 * pre-order's ship date. An order travels complete, so it is dated from its
 * last piece.
 */
export function daysUntilReady(products: Product[]): number {
  return products.reduce((latest, product) => {
    if (product.availability !== 'preorder' || !product.availableAt) return latest
    return Math.max(latest, Math.ceil((Date.parse(product.availableAt) - Date.now()) / 86_400_000))
  }, 0)
}

/**
 * The days after it can ship that a line lands by, for a store whose default
 * option takes longer than the standard estimate. Furniture also counts them
 * from a pre-order's ship date, as its product page does.
 */
export const LINE_ARRIVAL_DAYS: Partial<Record<DemoSlug, number>> = {}

/**
 * Narrows what a shopper chose to something this store still offers. An option
 * that no longer exists, or a slot on a day that has passed, comes back as
 * `undefined`: a cart token outlives its session by 30 days, so a stale booking
 * is ordinary.
 */
export function resolveDelivery(options: DeliveryOption[], chosen: CartDelivery | undefined): CartDelivery | undefined {
  if (!chosen) return undefined

  const option = options.find((candidate) => candidate.id === chosen.optionId)
  if (!option) return undefined
  if (!option.schedule) return { optionId: option.id }

  const bookedDay = option.schedule.find((candidate) => candidate.date === chosen.slot?.date)
  const slot = bookedDay?.slots.find((candidate) => candidate.id === chosen.slot?.slotId)
  if (!bookedDay || !slot) return undefined

  return { optionId: option.id, slot: { date: bookedDay.date, slotId: slot.id } }
}

/**
 * How many days before a booked window it stops moving. The Furniture FAQ and
 * order confirmation promise the same: keep the 3 in step.
 */
const RESCHEDULE_CUTOFF_DAYS = 2

/**
 * The days a booked window can move to: its option's schedule as it stands
 * today, past the cut-off. `undefined` once the booking is inside the cut-off,
 * or for an option that books no window.
 */
export function rescheduleDays(
  option: DeliveryOption | undefined,
  booked: OrderDeliverySlot | undefined,
): DeliveryDay[] | undefined {
  const cutoff = day(RESCHEDULE_CUTOFF_DAYS)
  if (!option?.schedule || !booked || booked.date <= cutoff) return undefined

  const days = option.schedule.filter((candidate) => candidate.date > cutoff && candidate.slots.length > 0)
  return days.length > 0 ? days : undefined
}

/** The days a courier can still be booked on, starting tomorrow. */
function schedule(): DeliveryDay[] {
  return Array.from({ length: SCHEDULE_DAYS }, (_, index) => ({ date: day(index + 1), slots: SLOTS }))
}

/** A day `offset` days from now, as `YYYY-MM-DD`. */
function day(offset: number): string {
  return new Date(Date.now() + offset * 86_400_000).toISOString().slice(0, 10)
}
