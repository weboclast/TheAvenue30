import { formatMoneyRounded } from '@/lib/commerce/format'
import type { CategoryTag, Filter, ProductQuery, ProductSort } from '@/lib/commerce/types'

/*
 * The catalog's URL contract: what a listing's query string means, and the only
 * place that knows. Server pages parse a request with `parseCatalogFilters`;
 * the sidebar and toolbar write changes back with the `with*` helpers. Both work
 * on `URLSearchParams`, so there is one spelling of every parameter and no
 * string building anywhere else.
 *
 * Selections read as `?brand=apple,samsung&memory=256-gb&price=700-1200&page=2`.
 * The tokens are minted by the commerce adapter (see `FilterValue.value`) and are
 * never parsed here.
 *
 * Safe on both sides of the network: no server-only imports, no browser globals.
 */

/** Products per catalog page. Mirrored by the grid skeleton, so keep the two in step. */
export const CATALOG_PAGE_SIZE = 12

/**
 * Parameters the catalog spends on itself. Everything else in the query string
 * is read as a filter selection keyed by the filter's `id`, so a backend can add a
 * filter without this file changing. `price` is reserved for the range filter,
 * whose value is a `min-max` pair rather than a list of tokens.
 */
const RESERVED = ['sort', 'page', 'on-sale', 'in-stock', 'q', 'price'] as const

/** Every refinement a catalog listing understands, parsed out of one request. */
export interface AppliedFilters {
  /** Absent leaves the ordering to the backend's own default. */
  sort?: ProductSort
  /** 1-based, and always at least `1`. */
  page: number
  /** The "% BIG SALE" view. */
  onSale: boolean
  /** The "only in stock" switch. */
  inStock: boolean
  /** Free-text search. */
  search?: string
  /** Selected filter tokens, keyed by filter id. Only non-empty filters appear. */
  selected: Record<string, string[]>
  /** Price bounds in major units, from `?price=min-max`. */
  minPrice?: number
  maxPrice?: number
}

/**
 * Normalize a Server Component's `searchParams` into `URLSearchParams`, so the
 * server parses exactly what the client writes. A repeated parameter
 * (`?sort=a&sort=b`) is a malformed URL rather than a request for both, so only
 * the first value survives.
 */
export function toSearchParams(params: Record<string, string | string[] | undefined>): URLSearchParams {
  const search = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    const first = Array.isArray(value) ? value[0] : value
    if (first != null) search.set(key, first)
  }
  return search
}

/** Read a request's query string as catalog refinements. Unknown parameters become filter selections. */
export function parseCatalogFilters(params: URLSearchParams): AppliedFilters {
  const selected: Record<string, string[]> = {}
  for (const [key, value] of params) {
    if ((RESERVED as readonly string[]).includes(key)) continue
    const tokens = value.split(',').filter(Boolean)
    if (tokens.length > 0) selected[key] = tokens
  }

  const [minPrice, maxPrice] = parseRange(params.get('price'))

  return {
    sort: parseSort(params.get('sort')),
    page: Math.max(1, Number(params.get('page')) || 1),
    onSale: params.get('on-sale') === '1',
    inStock: params.get('in-stock') === '1',
    search: params.get('q') || undefined,
    selected,
    minPrice,
    maxPrice,
  }
}

/**
 * Turn parsed refinements into a commerce query. `withFilters` is on: a listing
 * always has a sidebar.
 *
 * `reserved` is how many cells of the first page go to something that is not a
 * product, which today means the category promo. Those cells come out of the
 * product count rather than being added to it, so the grid stays rectangular,
 * and every later page shifts by the same amount so nothing falls between 2
 * pages. Pair it with {@link catalogPageCount}, which counts the same cells.
 */
export function toProductQuery(filters: AppliedFilters, categorySlug?: string, reserved = 0): ProductQuery {
  return {
    page: filters.page,
    pageSize: CATALOG_PAGE_SIZE - (filters.page === 1 ? reserved : 0),
    ...(reserved > 0 && { offset: Math.max(0, (filters.page - 1) * CATALOG_PAGE_SIZE - reserved) }),
    withFilters: true,
    ...(categorySlug && { categorySlug }),
    ...(filters.sort && { sort: filters.sort }),
    ...(filters.onSale && { onSale: true }),
    ...(filters.inStock && { inStock: true }),
    ...(filters.search && { search: filters.search }),
    ...(Object.keys(filters.selected).length > 0 && { filters: filters.selected }),
    ...(filters.minPrice != null && { minPrice: filters.minPrice }),
    ...(filters.maxPrice != null && { maxPrice: filters.maxPrice }),
  }
}

/**
 * Tick or untick one filter value.
 *
 * Every `with*` helper returns a fresh copy and drops `page`, because page 7 of
 * the old result set means nothing in the new one.
 */
export function withFilterValue(
  params: URLSearchParams,
  filterId: string,
  value: string,
  on: boolean,
): URLSearchParams {
  const next = reset(params)
  const tokens = new Set(next.get(filterId)?.split(',').filter(Boolean))

  if (on) tokens.add(value)
  else tokens.delete(value)

  if (tokens.size > 0) next.set(filterId, [...tokens].join(','))
  else next.delete(filterId)

  return next
}

/** Replace one filter's whole selection, as a toggle group reports it. */
export function withFilterValues(params: URLSearchParams, filterId: string, values: string[]): URLSearchParams {
  const next = reset(params)
  if (values.length > 0) next.set(filterId, values.join(','))
  else next.delete(filterId)
  return next
}

/**
 * Set the price range, or clear it when the handles sit on the filter's own
 * bounds. Leaving a full-span range in the URL would pin the slider to today's
 * prices, so it is dropped instead.
 */
export function withPriceRange(
  params: URLSearchParams,
  range: [number, number],
  bounds: [number, number],
): URLSearchParams {
  const next = reset(params)
  const [min, max] = range

  if (min <= bounds[0] && max >= bounds[1]) next.delete('price')
  else next.set('price', `${min}-${max}`)

  return next
}

/**
 * The listing a tag chip leads to: every refinement the tag declares, and
 * nothing else. Called with no tag it gives the plain listing back, which is
 * what the active chip links to so a second click undoes it.
 *
 * A tag is a shortcut to a view rather than one more checkbox, so it replaces
 * the refinements instead of adding to them: 2 tags naming different brands
 * would otherwise combine into an empty grid. Only the parameters that say
 * *which* listing this is survive.
 */
export function withTag(params: URLSearchParams, tag?: CategoryTag): URLSearchParams {
  const next = new URLSearchParams()
  for (const key of ['sort', 'on-sale'] as const) {
    const value = params.get(key)
    if (value) next.set(key, value)
  }
  if (!tag) return next

  if (tag.search) next.set('q', tag.search)
  for (const [id, values] of Object.entries(tag.filters ?? {})) {
    if (values.length > 0) next.set(id, values.join(','))
  }
  if (tag.price) next.set('price', `${tag.price[0]}-${tag.price[1]}`)

  return next
}

/**
 * Whether a tag is the refinement the listing is currently showing, which is
 * what lights its chip. Compared against the URL the tag itself would produce,
 * so the 2 can never drift apart.
 */
export function isTagActive(params: URLSearchParams, tag: CategoryTag): boolean {
  return refinementKey(withTag(params, tag)) === refinementKey(params)
}

/** A query string's refinements, ordered and flattened so 2 can be compared. Paging is not one of them. */
function refinementKey(params: URLSearchParams): string {
  return [...params]
    .filter(([key]) => key !== 'page')
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`)
    .join('&')
}

/** Flip one of the on/off refinements (`on-sale`, `in-stock`). */
export function withFlag(params: URLSearchParams, key: 'on-sale' | 'in-stock', on: boolean): URLSearchParams {
  const next = reset(params)
  if (on) next.set(key, '1')
  else next.delete(key)
  return next
}

/** The order a listing arrives in when nothing is chosen. Stays out of the URL, so the plain listing has a clean address. */
export const CATALOG_DEFAULT_SORT: ProductSort = 'featured'

/** Change the sort order. Choosing the default drops the parameter instead of spelling it out. */
export function withSort(params: URLSearchParams, sort: ProductSort): URLSearchParams {
  const next = reset(params)
  if (sort === CATALOG_DEFAULT_SORT) next.delete('sort')
  else next.set('sort', sort)
  return next
}

/** Move to a page, keeping every refinement. The one helper that doesn't reset the page. */
export function withPage(params: URLSearchParams, page: number): URLSearchParams {
  const next = new URLSearchParams(params)
  if (page > 1) next.set('page', String(page))
  else next.delete('page')
  return next
}

/**
 * Drop every refinement, keeping the parameters that say which listing this is.
 * `on-sale` survives because it is the Deals page rather than a filter on it.
 */
export function clearFilters(params: URLSearchParams): URLSearchParams {
  const next = new URLSearchParams()
  for (const key of ['sort', 'on-sale', 'q'] as const) {
    const value = params.get(key)
    if (value) next.set(key, value)
  }
  return next
}

/** Whether anything in the sidebar is currently narrowing the listing. */
export function hasActiveFilters(filters: AppliedFilters): boolean {
  return (
    filters.inStock || filters.minPrice != null || filters.maxPrice != null || Object.keys(filters.selected).length > 0
  )
}

/** One refinement narrowing a listing: its chip label, and the query string without it. */
export interface ActiveRefinement {
  id: string
  label: string
  remove: (params: URLSearchParams) => URLSearchParams
}

/**
 * Everything narrowing a listing, in filter order. Tokens no offered filter
 * knows are skipped; {@link clearFilters} still drops them.
 */
export function activeRefinements(filters: Filter[], applied: AppliedFilters): ActiveRefinement[] {
  const active: ActiveRefinement[] = []

  if (applied.inStock) {
    active.push({ id: 'in-stock', label: 'In stock', remove: (params) => withFlag(params, 'in-stock', false) })
  }

  for (const filter of filters) {
    if (filter.kind === 'range') {
      if (applied.minPrice == null && applied.maxPrice == null) continue

      const bounds: [number, number] = [filter.min, filter.max]
      const money = (amount: number) =>
        filter.currencyCode ? formatMoneyRounded({ amount, currencyCode: filter.currencyCode }) : String(amount)

      active.push({
        id: filter.id,
        label: `${money(applied.minPrice ?? filter.min)} - ${money(applied.maxPrice ?? filter.max)}`,
        remove: (params) => withPriceRange(params, bounds, bounds),
      })
      continue
    }

    const selected = applied.selected[filter.id] ?? []
    for (const value of filter.values) {
      if (!selected.includes(value.value)) continue
      active.push({
        id: `${filter.id}:${value.value}`,
        label: value.label,
        remove: (params) => withFilterValue(params, filter.id, value.value, false),
      })
    }
  }

  return active
}

/**
 * Pages a listing needs, counting the cells its promo takes alongside the
 * products. `total` counts products only, so a listing that reserves a cell can
 * need 1 page more than the product count alone implies.
 */
export function catalogPageCount(total: number, reserved = 0): number {
  return Math.max(1, Math.ceil((total + reserved) / CATALOG_PAGE_SIZE))
}

/** Serialize for a `<Link>`: the query string with its `?`, or `''` when empty. */
export function toHref(pathname: string, params: URLSearchParams): string {
  const query = params.toString()
  return query ? `${pathname}?${query}` : pathname
}

function reset(params: URLSearchParams): URLSearchParams {
  const next = new URLSearchParams(params)
  next.delete('page')
  return next
}

function parseRange(value: string | null): [number | undefined, number | undefined] {
  if (!value) return [undefined, undefined]
  const [min, max] = value.split('-', 2).map(Number)
  return [Number.isFinite(min) ? min : undefined, Number.isFinite(max) ? max : undefined]
}

/*
 * Every sort the commerce layer accepts, as a runtime lookup. Keyed by
 * `ProductSort` so adding or dropping a value in the union stops this compiling,
 * which keeps the URL contract from falling behind the type. Unknown values are
 * ignored rather than refused, so a stale link still shows products.
 */
const SORTS: Record<ProductSort, true> = {
  featured: true,
  'best-selling': true,
  discount: true,
  'price-asc': true,
  'price-desc': true,
  newest: true,
  rating: true,
}

function parseSort(value: string | null): ProductSort | undefined {
  return value != null && Object.hasOwn(SORTS, value) ? (value as ProductSort) : undefined
}
