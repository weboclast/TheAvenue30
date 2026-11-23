import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { CollectionGrid } from '@/components/fashion/collections/collection-grid'
import { FeaturedCollections } from '@/components/fashion/collections/featured-collections'
import { ShopTheLook } from '@/components/fashion/collections/shop-the-look'
import { StoryNote } from '@/components/fashion/collections/story-note'
import { getCommerce } from '@/lib/commerce'
import { getDepartment } from '@/lib/departments'

export const metadata: Metadata = {
  title: 'Collections',
  description: 'The range in edits: a handful of pieces at a time, cut for a cloth, a color, or a season.',
}

/**
 * Redirects to the collections of the department opened last. A store with no
 * departments lists every collection here, the way a department's page does.
 */
export default async function FashionCollectionsPage() {
  const department = await getDepartment('fashion')
  if (department) redirect(`/${department.slug}/collections`)

  const collections = await getCommerce('fashion').getCollections()
  const look = collections.find((collection) => collection.lookImage)

  return (
    <main className="flex flex-1 flex-col">
      <FeaturedCollections collections={collections.filter((collection) => collection.featured)} />
      <CollectionGrid collections={collections} />
      {look ? <ShopTheLook collection={look} /> : null}
      <StoryNote />
    </main>
  )
}
