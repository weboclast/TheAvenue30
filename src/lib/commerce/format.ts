import type { Money, OrderDelivery, ProductDimensions } from './types'

/**
 * Format a {@link Money} value for display, e.g. `{ amount: 1299, currencyCode: 'USD' }`
 * → `"$1,299.00"`. Safe to call from both Server and Client Components, since it is
 * pure and holds no server-only imports.
 *
 * Cents are always shown, including on whole amounts, which is what shoppers
 * expect of a price tag. To set the fraction in smaller type, render
 * {@link Price} instead of interpolating this string.
 *
 * @param locale BCP-47 locale controlling grouping and symbol placement.
 *   Defaults to `'en-US'`; wire this to the active locale once i18n lands.
 */
export function formatMoney(money: Money, locale = 'en-US'): string {
  return moneyFormatter(money.currencyCode, locale).format(money.amount)
}

/**
 * The same formatting, split at the decimal separator: `"$1,299"` and `".00"`.
 *
 * The split comes from `formatToParts` rather than from cutting the string, so
 * it survives locales that use a comma for the decimal, place the symbol after
 * the number, or group digits differently. Concatenating the two halves always
 * reproduces {@link formatMoney} exactly.
 */
export function formatMoneyParts(money: Money, locale = 'en-US'): { whole: string; fraction: string } {
  const parts = moneyFormatter(money.currencyCode, locale).formatToParts(money.amount)
  const decimal = parts.findIndex((part) => part.type === 'decimal')
  if (decimal === -1) return { whole: parts.map((part) => part.value).join(''), fraction: '' }

  const join = (from: number, to?: number) =>
    parts
      .slice(from, to)
      .map((part) => part.value)
      .join('')

  return { whole: join(0, decimal), fraction: join(decimal) }
}

/**
 * The same value with the cents dropped, e.g. `"$1,299"`.
 *
 * For the places a price is a bound rather than a price tag: filter chips, the
 * ends of a range, a "from $X" headline. Never use it on something being bought.
 */
export function formatMoneyRounded(money: Money, locale = 'en-US'): string {
  return moneyFormatter(money.currencyCode, locale, 0).format(money.amount)
}

/** A currency's symbol in the locale, e.g. `"$"` for `'USD'`. */
export function currencySymbol(currencyCode: Money['currencyCode'], locale = 'en-US'): string {
  const parts = moneyFormatter(currencyCode, locale).formatToParts(0)
  return parts.find((part) => part.type === 'currency')?.value ?? currencyCode
}

/**
 * Format a `YYYY-MM-DD` date for display, e.g. `"Mar 14, 2026"`. Safe on both
 * sides of the client boundary: the value is read as UTC and formatted in UTC,
 * so a server and a browser in different zones produce the same day.
 *
 * @param locale BCP-47 locale controlling month names and field order.
 *   Defaults to `'en-US'`; wire this to the active locale once i18n lands.
 */
export function formatDate(date: string, locale = 'en-US'): string {
  return dateFormatter(locale).format(new Date(date))
}

/**
 * A delivery window as one line, e.g. `"May 22, 2026 - May 23, 2026"`. A window
 * that names a single day, or the same day twice, formats as that day alone.
 *
 * Joined with a plain hyphen rather than `Intl.DateTimeFormat.formatRange`,
 * which spells a range with an en dash the house style does not use.
 */
export function formatDateRange(from: string, to?: string, locale = 'en-US'): string {
  const start = formatDate(from, locale)
  if (!to || to === from) return start
  return `${start} - ${formatDate(to, locale)}`
}

/**
 * A `YYYY-MM-DD` date without its year, e.g. `"May 26"`, for the day chips a
 * shopper books a delivery slot on. The year is dropped because the chips only
 * ever offer the days ahead, where it would be noise.
 */
export function formatDay(date: string, locale = 'en-US'): string {
  return dayFormatter(locale).format(new Date(date))
}

/** A `YYYY-MM-DD` date's day of the week, e.g. `"Thu"`, to head the day chips {@link formatDay} labels. */
export function formatWeekday(date: string, locale = 'en-US'): string {
  return weekdayFormatter(locale).format(new Date(date))
}

/** {@link formatDateRange} without the year, e.g. `"May 22 - May 23"`, for the days ahead a checkout quotes. */
export function formatDayRange(from: string, to?: string, locale = 'en-US'): string {
  const start = formatDay(from, locale)
  if (!to || to === from) return start
  return `${start} - ${formatDay(to, locale)}`
}

/**
 * A booked window from 24-hour `HH:mm` bounds, e.g. `"08:00 am - 09:00 am"`.
 *
 * The day period is lowercased through the locale, which is what English
 * typography wants beside a time and a no-op where it is written in a script
 * without case. Formatted in UTC, so the hours a store published are the hours a
 * shopper reads wherever they are.
 */
export function formatTimeRange(from: string, to: string, locale = 'en-US'): string {
  return `${formatTime(from, locale)} - ${formatTime(to, locale)}`
}

/**
 * ICU versions disagree on the space before a day period: newer builds emit a
 * narrow no-break space, older ones a plain one. Node and the browser can be on
 * either side of that, and a time rendered on both hydrates as a mismatch, so
 * every non-breaking variant is normalized to a plain space.
 */
const NARROW_SPACES = /[\u202f\u00a0]/g

function formatTime(time: string, locale: string): string {
  return formatClock(new Date(`1970-01-01T${time}:00Z`), locale)
}

function formatClock(at: Date, locale: string): string {
  return timeFormatter(locale)
    .formatToParts(at)
    .map((part) => (part.type === 'dayPeriod' ? part.value.toLocaleLowerCase(locale) : part.value))
    .join('')
    .replace(NARROW_SPACES, ' ')
}

/**
 * A moment as day and time, e.g. `"May 20, 02:04 pm"`, for the stamps down an
 * order's tracker. Read in UTC like every other date here, so a stamp rendered
 * on the server and rehydrated in the browser agrees with itself.
 */
export function formatDateTime(timestamp: string, locale = 'en-US'): string {
  const at = new Date(timestamp)
  return `${dayFormatter(locale).format(at)}, ${formatClock(at, locale)}`
}

/**
 * When a placed order lands, as one line: the courier window it was booked into,
 * the range it was quoted, or a promise to follow up where the store committed
 * to neither. Shared by the order confirmation and order tracking.
 */
export function formatOrderArrival(delivery: OrderDelivery, locale = 'en-US'): string {
  if (delivery.slot) {
    return `${formatDay(delivery.slot.date, locale)}, ${formatTimeRange(delivery.slot.from, delivery.slot.to, locale)}`
  }
  if (delivery.arrival) return formatDateRange(delivery.arrival.from, delivery.arrival.to, locale)
  return 'We will confirm by email'
}

/**
 * An ISO 3166-1 alpha-2 code as the country's name, e.g. `'US'` → `"United
 * States"`. Read through `Intl`, so a store adds a shipping country without
 * anyone translating it, and an unknown code reads back as itself.
 */
export function formatCountry(countryCode: string, locale = 'en-US'): string {
  return countryFormatter(locale).of(countryCode.toUpperCase()) ?? countryCode
}

/** A count with the locale's digit grouping, e.g. `1,240`. */
export function formatCount(count: number, locale = 'en-US'): string {
  return countFormatter(locale).format(count)
}

/**
 * Share of a whole as a percentage, e.g. `0.7` → `"70%"`. For the headline
 * figures a merchandising program prices in rates: trade-in credit, a discount.
 */
export function formatPercent(rate: number, locale = 'en-US'): string {
  return percentFormatter(locale).format(rate)
}

/**
 * A piece's overall size, e.g. `"W 84 × D 80 × H 79 cm"`: width, depth, then
 * height, the order furniture is listed in, with the unit named once. A round
 * piece gives its diameter instead, `"Ø 110 × H 75 cm"`. No-break spaces keep
 * each figure with its letter, so a narrow column wraps between them.
 */
export function formatDimensions({ width, depth, height, unit, round }: ProductDimensions, locale = 'en-US'): string {
  const number = lengthFormatter(locale)
  const unitParts = unitFormatter(unit, locale).formatToParts(height)
  const symbol = unitParts.find((part) => part.type === 'unit')?.value ?? unit
  const tall = `H ${number.format(height)} ${symbol}`
  const figures = round
    ? [`Ø ${number.format(width)}`, tall]
    : [`W ${number.format(width)}`, `D ${number.format(depth)}`, tall]
  return figures.map((figure) => figure.replaceAll(' ', '\u00a0')).join(' × ')
}

/** One measurement with its unit, e.g. `"68 cm"`, held on 1 line. */
export function formatLength(value: number, unit: ProductDimensions['unit'], locale = 'en-US'): string {
  return unitFormatter(unit, locale).format(value).replaceAll(' ', ' ')
}

/**
 * `Intl.NumberFormat` is expensive to construct and immutable once built, so the
 * handful this storefront needs are made once and reused.
 */
const formatters = new Map<string, Intl.NumberFormat>()

function moneyFormatter(currency: Money['currencyCode'], locale: string, fractionDigits?: number): Intl.NumberFormat {
  const key = `${locale}:${currency}:${fractionDigits ?? ''}`
  let formatter = formatters.get(key)
  if (!formatter) {
    formatter = new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      ...(fractionDigits != null && { minimumFractionDigits: fractionDigits, maximumFractionDigits: fractionDigits }),
    })
    formatters.set(key, formatter)
  }
  return formatter
}

const dateFormatters = new Map<string, Intl.DateTimeFormat>()

function dateFormatter(locale: string): Intl.DateTimeFormat {
  const key = `${locale}:date`
  let formatter = dateFormatters.get(key)
  if (!formatter) {
    formatter = new Intl.DateTimeFormat(locale, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      timeZone: 'UTC',
    })
    dateFormatters.set(key, formatter)
  }
  return formatter
}

function dayFormatter(locale: string): Intl.DateTimeFormat {
  const key = `${locale}:day`
  let formatter = dateFormatters.get(key)
  if (!formatter) {
    formatter = new Intl.DateTimeFormat(locale, { month: 'short', day: 'numeric', timeZone: 'UTC' })
    dateFormatters.set(key, formatter)
  }
  return formatter
}

function weekdayFormatter(locale: string): Intl.DateTimeFormat {
  const key = `${locale}:weekday`
  let formatter = dateFormatters.get(key)
  if (!formatter) {
    formatter = new Intl.DateTimeFormat(locale, { weekday: 'short', timeZone: 'UTC' })
    dateFormatters.set(key, formatter)
  }
  return formatter
}

function timeFormatter(locale: string): Intl.DateTimeFormat {
  const key = `${locale}:time`
  let formatter = dateFormatters.get(key)
  if (!formatter) {
    formatter = new Intl.DateTimeFormat(locale, {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
      timeZone: 'UTC',
    })
    dateFormatters.set(key, formatter)
  }
  return formatter
}

const countryFormatters = new Map<string, Intl.DisplayNames>()

function countryFormatter(locale: string): Intl.DisplayNames {
  let formatter = countryFormatters.get(locale)
  if (!formatter) {
    formatter = new Intl.DisplayNames(locale, { type: 'region' })
    countryFormatters.set(locale, formatter)
  }
  return formatter
}

function countFormatter(locale: string): Intl.NumberFormat {
  const key = `${locale}:count`
  let formatter = formatters.get(key)
  if (!formatter) {
    formatter = new Intl.NumberFormat(locale)
    formatters.set(key, formatter)
  }
  return formatter
}

function percentFormatter(locale: string): Intl.NumberFormat {
  const key = `${locale}:percent`
  let formatter = formatters.get(key)
  if (!formatter) {
    formatter = new Intl.NumberFormat(locale, { style: 'percent', maximumFractionDigits: 0 })
    formatters.set(key, formatter)
  }
  return formatter
}

function lengthFormatter(locale: string): Intl.NumberFormat {
  const key = `${locale}:length`
  let formatter = formatters.get(key)
  if (!formatter) {
    formatter = new Intl.NumberFormat(locale, { maximumFractionDigits: 1 })
    formatters.set(key, formatter)
  }
  return formatter
}

function unitFormatter(unit: ProductDimensions['unit'], locale: string): Intl.NumberFormat {
  const key = `${locale}:${unit}`
  let formatter = formatters.get(key)
  if (!formatter) {
    formatter = new Intl.NumberFormat(locale, {
      style: 'unit',
      unit: unit === 'cm' ? 'centimeter' : 'inch',
      unitDisplay: 'short',
    })
    formatters.set(key, formatter)
  }
  return formatter
}
