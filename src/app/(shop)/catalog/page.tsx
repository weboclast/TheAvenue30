import { Suspense } from 'react'
import type { Metadata } from 'next'
import { CatalogHeading } from '@/components/fashion/catalog/catalog-heading'
import { CatalogListing, CatalogListingSkeleton } from '@/components/fashion/catalog/catalog-listing'
import { type AppliedFilters, parseCatalogFilters, toSearchParams } from '@/lib/catalog-filters'
import { getDepartment } from '@/lib/departments'

const PATHNAME = '/catalog'

/** The view's name, for the heading and the browser tab alike. */
function catalogTitle({ search, onSale }: AppliedFilters): string {
  return search ? `Results for “${search}”` : onSale ? 'Sale' : 'Catalog'
}

export async function generateMetadata({ searchParams }: PageProps<'/catalog'>): Promise<Metadata> {
  return { title: catalogTitle(parseCatalogFilters(toSearchParams(await searchParams))) }
}

/**
 * Every product in the store. The header's SALE link lands here with
 * `?on-sale=1`, and a search with `?q=`. Departments live in `./[category]`.
 */
export default async function FashionCatalogPage({ searchParams }: PageProps<'/catalog'>) {
  const params = toSearchParams(await searchParams)
  const filters = parseCatalogFilters(params)
  const department = await getDepartment('fashion')
  const home = department ? `/${department.slug}` : '/'

  const { search } = filters
  const title = catalogTitle(filters)

  return (
    <main className="flex flex-1 flex-col">
      <CatalogHeading title={title} trail={[{ label: 'Home', href: home }]} />
      {/* A new search or sort shows the skeleton; filters and Load more keep the rows. */}
      <Suspense key={`${search ?? ''}:${filters.sort ?? ''}:${filters.onSale}`} fallback={<CatalogListingSkeleton />}>
        <CatalogListing
          applied={filters}
          params={params}
          pathname={PATHNAME}
          emptyState={
            <p className="text-foreground-muted py-12 text-center">
              {search ? 'Nothing matches. Check the spelling, or try a shorter word.' : 'Nothing here just yet.'}
            </p>
          }
        />
      </Suspense>
    </main>
  )
}
