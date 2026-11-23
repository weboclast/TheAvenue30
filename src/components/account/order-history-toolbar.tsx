'use client'

import { type ComponentProps, type SubmitEvent, useCallback, useEffect, useId, useState, useTransition } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Search } from '@appica/icons-react'
import { Form } from '@appica/ui-react/form'
import { Input } from '@appica/ui-react/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@appica/ui-react/select'
import { Spinner } from '@appica/ui-react/spinner'
import { accountPath } from '@/components/account/account-paths'
import type { FieldVariant } from '@/components/address-fields'
import {
  ORDER_STATUS_FILTERS,
  type OrderFilters,
  type OrderStatusFilter,
  withOrderSearch,
  withOrderStatus,
} from '@/lib/account-orders'
import { toHref } from '@/lib/catalog-filters'
import type { DemoSlug } from '@/lib/demos'
import { cn } from '@/lib/utils'

/** How long typing has to settle before the list is asked to narrow. */
const SEARCH_DEBOUNCE_MS = 300

/**
 * Silences the browser's own × inside `type="search"`, which clears the box
 * without telling React and sits beside the field's. There is no named variant
 * for the pseudo-element, so it takes an arbitrary one.
 */
const NO_NATIVE_CLEAR = '[&::-webkit-search-cancel-button]:appearance-none'

interface OrderHistoryToolbarProps {
  /** The storefront whose order history this narrows. */
  demo: DemoSlug
  filters: OrderFilters
  /** How the select and the search box are drawn. @default 'soft' */
  fieldVariant?: FieldVariant
  /** The spinner the storefront draws while something loads. @default 'circular' */
  spinnerVariant?: ComponentProps<typeof Spinner>['variant']
  className?: string
}

/**
 * The row above the order history: which stage to show, and a box to find one
 * order in. Everything it changes is a query parameter, so the list stays a
 * Server Component and a refined view is a link somebody can send themselves.
 *
 * A `Select` rather than tabs, because a store may add stages (`canceled`,
 * `refunded`) and a strip that grows past 4 wraps or scrolls.
 */
export function OrderHistoryToolbar({
  demo,
  filters,
  fieldVariant = 'soft',
  spinnerVariant,
  className,
}: OrderHistoryToolbarProps) {
  const router = useRouter()
  const params = useSearchParams()
  const labelId = useId()
  const [searching, startSearch] = useTransition()
  const pathname = accountPath(demo, 'orders')

  // The box holds what is being typed, the URL what has been asked for, so a
  // keystroke costs a render rather than a round-trip.
  const [term, setTerm] = useState(filters.search ?? '')
  const applied = filters.search ?? ''

  const navigate = (next: URLSearchParams) => router.push(toHref(pathname, next))

  /**
   * Narrows the list. `replace` rather than `push`, so a 12-letter search leaves
   * 1 history entry instead of 12, and a transition so the field stays
   * responsive and the current list holds until the next one lands.
   */
  const search = useCallback(
    (next: string) => {
      startSearch(() => {
        router.replace(toHref(pathname, withOrderSearch(new URLSearchParams(params), next)), {
          scroll: false,
        })
      })
    },
    [params, pathname, router],
  )

  useEffect(() => {
    // Nothing to ask for once the URL has caught up, which is also what stops
    // this effect's own navigation from starting another.
    if (term === applied) return

    const timer = setTimeout(() => search(term), SEARCH_DEBOUNCE_MS)
    return () => clearTimeout(timer)
  }, [term, applied, search])

  // Enter asks for it now rather than waiting out the debounce.
  const handleSubmit = (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (term !== applied) search(term)
  }

  const clear = () => {
    setTerm('')
    search('')
  }

  return (
    <div
      data-slot="order-history-toolbar"
      className={cn('flex flex-col justify-between gap-3 md:flex-row md:items-center', className)}
    >
      <div className="flex items-center gap-2">
        <span id={labelId} className="text-foreground-intense text-sm font-medium">
          Show:
        </span>
        <Select
          variant={fieldVariant}
          value={filters.status}
          onValueChange={(next) => navigate(withOrderStatus(new URLSearchParams(params), next as OrderStatusFilter))}
          items={ORDER_STATUS_FILTERS.map(({ value, label }) => ({ value, label }))}
        >
          <SelectTrigger aria-labelledby={labelId} className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {ORDER_STATUS_FILTERS.map(({ value, label }) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Form noValidate onSubmit={handleSubmit} className="md:w-72">
        <Input
          type="search"
          name="q"
          variant={fieldVariant}
          aria-label="Search your orders"
          placeholder="Item, order number or date"
          value={term}
          onChange={(event) => setTerm(event.target.value)}
          startSlot={<Search />}
          // The only sign anything is happening: the list holds its previous
          // answer until the next one lands.
          endSlot={searching && <Spinner variant={spinnerVariant} currentColor className="text-lg" />}
          clearable
          // Clearing has to reach the URL as well as the box.
          onClear={clear}
          inputProps={{ className: NO_NATIVE_CLEAR }}
        />
      </Form>
    </div>
  )
}
