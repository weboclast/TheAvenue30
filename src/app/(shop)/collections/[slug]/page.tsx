import { Suspense } from 'react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { CatalogHeading } from '@/components/fashion/catalog/catalog-heading'
import { CatalogListing, CatalogListingSkeleton } from '@/components/fashion/catalog/catalog-listing'
import { CollectionCover } from '@/components/fashion/collections/collection-cover'
import { parseCatalogFilters, toSearchParams } from '@/lib/catalog-filters'
import { getCommerce } from '@/lib/commerce'
import { findDepartment, getDepartment } from '@/lib/departments'
import { RememberDepartment } from '@/lib/departments/remember-department'

export async function generateMetadata({ params }: PageProps<'/collections/[slug]'>): Promise<Metadata> {
  const collection = await getCommerce('fashion').getCollection((await params).slug)
  if (!collection) notFound()
  return { title: collection.title, description: collection.description }
}

/**
 * A collection's pieces, listed with the catalog's toolbar, in the collection's
 * own order until a sort is picked.
 */
export default async function FashionCollectionPage({ params, searchParams }: PageProps<'/collections/[slug]'>) {
  const { slug } = await params
  const search = toSearchParams(await searchParams)
  const filters = parseCatalogFilters(search)
  const [collection, remembered] = await Promise.all([
    getCommerce('fashion').getCollection(slug),
    getDepartment('fashion'),
  ])
  if (!collection) notFound()

  // One every department lists files under the department opened last.
  const own = collection.department ? await findDepartment('fashion', collection.department) : undefined
  const department = own ?? remembered
  const home = department ? `/${department.slug}` : '/'

  return (
    <main className="flex flex-1 flex-col">
      {own ? <RememberDepartment demo="fashion" slug={own.slug} /> : null}
      <CollectionCover collection={collection} />
      <CatalogHeading
        title={collection.title}
        description={collection.description}
        trail={[
          { label: 'Home', href: home },
          { label: 'Collections', href: department ? `${home}/collections` : '/collections' },
        ]}
      />
      {/* A new sort shows the skeleton; filters keep the rows. */}
      <Suspense key={`${slug}:${filters.sort ?? ''}`} fallback={<CatalogListingSkeleton />}>
        <CatalogListing
          applied={filters}
          params={search}
          pathname={`/collections/${slug}`}
          slugs={collection.slugs}
          emptyState={
            <p className="text-foreground-muted py-12 text-center">
              Nothing in this collection yet. <Link href="/catalog">See the whole catalog</Link>.
            </p>
          }
        />
      </Suspense>
    </main>
  )
}
