import Link from 'next/link'
import { buttonVariants } from '@appica/ui-react/button'
import { Skeleton } from '@appica/ui-react/skeleton'
import { ProductGrid, ProductGridSkeleton } from '@/components/fashion/product/product-grid'
import { LoadMore } from '@/components/load-more'
import {
  type AppliedFilters,
  clearFilters,
  hasActiveFilters,
  toHref,
  toProductQuery,
  withPage,
} from '@/lib/catalog-filters'
import { getCommerce } from '@/lib/commerce'
import type { GridCampaign } from '@/lib/commerce/types'
import { CatalogFiltersProvider } from '@/components/catalog/catalog-filters-context'
import { CatalogResults } from '@/components/catalog/catalog-results'
import { CatalogToolbar } from './catalog-toolbar'

/** Grid cells on arrival (5 rows of 4) and per "Load more". A campaign takes a cell. */
const FIRST_SCREEN = 20
const MORE_PER_SCREEN = 8

const RESULTS = 'container pt-1 pb-16 md:pb-20 xl:pb-24'

/** How many of the first `cells` hold products, once the campaigns among them take theirs. */
function productCells(cells: number, campaigns: GridCampaign[]) {
  return cells - campaigns.filter((campaign) => campaign.position <= cells).length
}

interface CatalogListingProps {
  /** Refinements parsed from the request. */
  applied: AppliedFilters
  /** The query string, kept on the next screen's link. */
  params: URLSearchParams
  /** Path this listing lives at, e.g. `/catalog/women`. */
  pathname: string
  /** Limits the listing to a category and its descendants. */
  categorySlug?: string
  /** Limits the listing to these products, in this order until a sort is picked. */
  slugs?: string[]
  /** Campaigns to place among the cards. Pass none on a refined view. */
  campaigns?: GridCampaign[]
  /** Shown when the listing is empty and no filter caused it. */
  emptyState: React.ReactNode
}

/**
 * The toolbar and the grid, loaded a screen at a time: `?page=N` means N
 * screens loaded, not the Nth. Products sold out in every size are left out;
 * their pages stay reachable.
 */
export async function CatalogListing({
  applied,
  params,
  pathname,
  categorySlug,
  slugs,
  campaigns = [],
  emptyState,
}: CatalogListingProps) {
  const cells = FIRST_SCREEN + (applied.page - 1) * MORE_PER_SCREEN
  const { products, total, filters } = await getCommerce('fashion').listProducts({
    ...toProductQuery(applied, categorySlug),
    ...(slugs && { slugs }),
    page: 1,
    pageSize: productCells(cells, campaigns),
    inStock: true,
  })

  return (
    <CatalogFiltersProvider pathname={pathname} query={params.toString()}>
      <div className="flex flex-1 flex-col">
        <CatalogToolbar total={total} filters={filters} />
        <CatalogResults className={RESULTS}>
          {products.length > 0 ? (
            <LoadMore
              shown={products.length}
              total={total}
              unit="items"
              focusSlot="product-card-title"
              href={toHref(pathname, withPage(params, applied.page + 1))}
              paged={total > productCells(FIRST_SCREEN, campaigns)}
            >
              <ProductGrid products={products} campaigns={campaigns} />
            </LoadMore>
          ) : hasActiveFilters(applied) ? (
            <div className="flex flex-col items-center gap-4 py-12 text-center">
              <p className="text-foreground-muted">Nothing matches these filters.</p>
              <Link
                href={toHref(pathname, clearFilters(params))}
                scroll={false}
                data-slot="button"
                className={buttonVariants({ variant: 'outline' })}
              >
                Clear all filters
              </Link>
            </div>
          ) : (
            emptyState
          )}
        </CatalogResults>
      </div>
    </CatalogFiltersProvider>
  )
}

/** Placeholder for {@link CatalogListing}: the toolbar and 2 rows. */
export function CatalogListingSkeleton() {
  return (
    <div className="flex flex-1 flex-col">
      <div className="container flex h-16 items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Skeleton className="size-10 rounded-full" />
          <Skeleton className="h-5 w-24 sm:w-32" />
        </div>
        {/* Skeletons don't shrink by default; this one must, like the select it stands for. */}
        <Skeleton className="h-10 w-44 min-w-0 shrink rounded-full sm:w-50" />
      </div>
      <div className={RESULTS}>
        <ProductGridSkeleton count={8} />
      </div>
    </div>
  )
}
