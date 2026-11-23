import { Suspense } from 'react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { CatalogHeading } from '@/components/fashion/catalog/catalog-heading'
import { CatalogListing, CatalogListingSkeleton } from '@/components/fashion/catalog/catalog-listing'
import { CategoryCampaign } from '@/components/fashion/catalog/category-campaign'
import { hasActiveFilters, parseCatalogFilters, toSearchParams } from '@/lib/catalog-filters'
import { getCommerce } from '@/lib/commerce'
import { categoryTrail } from '@/lib/commerce/category-tree'
import { RememberDepartment } from '@/lib/departments/remember-department'

export async function generateMetadata({ params }: PageProps<'/catalog/[category]'>): Promise<Metadata> {
  const category = await getCommerce('fashion').getCategory((await params).category)
  if (!category) notFound()
  return { title: category.name }
}

/**
 * A department (`/catalog/women`) or a garment type under it
 * (`/catalog/womens-sweaters`). The header's search lands here with
 * `?q=`, inside the department on screen.
 */
export default async function FashionCategoryPage({ params, searchParams }: PageProps<'/catalog/[category]'>) {
  const { category: slug } = await params
  const search = toSearchParams(await searchParams)
  const filters = parseCatalogFilters(search)
  const commerce = getCommerce('fashion')

  const [category, tree, campaigns, gridCampaigns] = await Promise.all([
    commerce.getCategory(slug),
    commerce.getCategoryTree(),
    commerce.getCategoryCampaigns(slug),
    commerce.getCategoryGridCampaigns(slug),
  ])
  if (!category) notFound()

  // Campaigns link to filtered listings, so a refined view skips them.
  const refined = hasActiveFilters(filters) || filters.onSale || filters.search != null

  // The department heads the trail, so Home is its home rather than the bare `/`.
  // A search takes the heading, which moves the category itself up into the trail.
  const levels = categoryTrail(tree, slug)
  const trail = [
    { label: 'Home', href: `/${levels[0].slug}` },
    ...(filters.search ? levels : levels.slice(0, -1)).map((level) => ({
      label: level.name,
      href: `/catalog/${level.slug}`,
    })),
  ]

  return (
    <main className="flex flex-1 flex-col">
      <RememberDepartment demo="fashion" slug={levels[0].slug} />
      {refined ? null : <CategoryCampaign campaigns={campaigns} />}
      <CatalogHeading title={filters.search ? `Results for “${filters.search}”` : category.name} trail={trail} />
      {/* A new category, search, or sort shows the skeleton; filters and Load more keep the rows. */}
      <Suspense key={`${slug}:${filters.search ?? ''}:${filters.sort ?? ''}`} fallback={<CatalogListingSkeleton />}>
        <CatalogListing
          applied={filters}
          params={search}
          pathname={`/catalog/${slug}`}
          categorySlug={slug}
          campaigns={refined ? undefined : gridCampaigns}
          emptyState={
            <p className="text-foreground-muted py-12 text-center">
              {filters.search ? (
                `Nothing in ${category.name} matches. Check the spelling, or try a shorter word.`
              ) : (
                <>
                  Nothing in this category yet. <Link href="/catalog">See the whole catalog</Link>.
                </>
              )}
            </p>
          }
        />
      </Suspense>
    </main>
  )
}
