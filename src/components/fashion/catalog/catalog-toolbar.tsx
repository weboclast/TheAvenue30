'use client'

import { useEffect, useRef } from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@appica/ui-react/select'
import { CATALOG_DEFAULT_SORT, parseCatalogFilters, withSort } from '@/lib/catalog-filters'
import type { Filter, ProductSort } from '@/lib/commerce/types'
import { useCatalogFilters } from '@/components/catalog/catalog-filters-context'
import { FilterDrawer } from './filter-drawer'

/** Sort orders offered, in order. The demo has too few ratings for the rest. */
const SORT_LABELS: Partial<Record<ProductSort, string>> = {
  featured: 'Recommended',
  newest: 'Newest',
  'best-selling': 'Best selling',
  discount: 'Biggest discount',
  'price-asc': 'Price, low to high',
  'price-desc': 'Price, high to low',
}

interface CatalogToolbarProps {
  /** Products the refinements leave. */
  total: number
  /** Refinements on offer. Without any, there is no filter button. */
  filters: Filter[]
}

/** The filter button, the product count, and the sort order, on a bar that pins along with the header. */
export function CatalogToolbar({ total, filters }: CatalogToolbarProps) {
  const { params, navigate } = useCatalogFilters()
  const barRef = useRef<HTMLDivElement>(null)

  // Read by `globals.css`, which pads anchor and focus scrolling below this bar.
  useEffect(() => {
    const root = document.documentElement
    root.setAttribute('data-catalog-toolbar', '')
    return () => root.removeAttribute('data-catalog-toolbar')
  }, [])

  // Back to the top of the results, if the shopper is past it.
  const revealTop = (behavior: ScrollBehavior) => {
    const bar = barRef.current
    // Unpinned, the bar sits where its listing starts.
    const offset = (bar?.parentElement?.getBoundingClientRect().top ?? 0) - (bar?.getBoundingClientRect().top ?? 0)
    if (offset < 0) window.scrollBy({ top: offset, behavior })
  }

  return (
    <div ref={barRef} data-slot="catalog-toolbar" className="bg-background sticky top-12 z-30">
      <div className="container flex h-16 items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          {filters.length > 0 ? (
            <FilterDrawer filters={filters} total={total} onRefined={() => revealTop('smooth')} />
          ) : null}
          {/* `aria-live` spelled out, so the count is still heard beside the modal filter drawer. */}
          <p role="status" aria-live="polite" className="text-foreground-muted text-sm">
            ({total}
            <span className="max-sm:sr-only"> {total === 1 ? 'product' : 'products'}</span>)
          </p>
        </div>
        <Select
          value={parseCatalogFilters(params).sort ?? CATALOG_DEFAULT_SORT}
          onValueChange={(next) => {
            revealTop('instant')
            navigate(withSort(params, next as ProductSort))
          }}
          items={SORT_LABELS}
          alignItemWithTrigger={false}
        >
          <SelectTrigger aria-label="Sort by" className="w-44 min-w-0 sm:w-50">
            <SelectValue />
          </SelectTrigger>
          <SelectContent align="end">
            {Object.entries(SORT_LABELS).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
