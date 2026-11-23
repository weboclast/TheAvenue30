import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { CollectionGrid } from '@/components/fashion/collections/collection-grid'
import { FeaturedCollections } from '@/components/fashion/collections/featured-collections'
import { ShopTheLook } from '@/components/fashion/collections/shop-the-look'
import { StoryNote } from '@/components/fashion/collections/story-note'
import { getCommerce } from '@/lib/commerce'
import { findDepartment } from '@/lib/departments'
import { RememberDepartment } from '@/lib/departments/remember-department'

export async function generateMetadata({ params }: PageProps<'/[department]/collections'>): Promise<Metadata> {
  const department = await findDepartment('fashion', (await params).department)
  if (!department) notFound()

  return {
    title: `Collections | ${department.name}`,
    description: 'The range in edits: a handful of pieces at a time, cut for a cloth, a color, or a season.',
  }
}

/**
 * A department's collections: the featured ones in the slider, all of them in
 * the grid, and the first photographed as a look, shopped piece by piece.
 */
export default async function FashionDepartmentCollectionsPage({ params }: PageProps<'/[department]/collections'>) {
  const department = await findDepartment('fashion', (await params).department)
  if (!department) notFound()

  const collections = await getCommerce('fashion').getCollections(department.slug)
  const look = collections.find((collection) => collection.lookImage)

  return (
    <main className="flex flex-1 flex-col">
      <RememberDepartment demo="fashion" slug={department.slug} />
      <FeaturedCollections collections={collections.filter((collection) => collection.featured)} />
      <CollectionGrid collections={collections} />
      {look ? <ShopTheLook collection={look} /> : null}
      <StoryNote />
    </main>
  )
}
