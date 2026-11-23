import type { Metadata } from 'next'
import { JournalListing } from '@/components/fashion/blog/journal-listing'
import { parseBlogPage } from '@/lib/blog/blog'
import { toSearchParams } from '@/lib/catalog-filters'

export const metadata: Metadata = {
  title: 'Journal',
  description: 'How our clothes are made, worn, and mended, from the people who do all 3.',
}

/** The journal's root. Its sections are routes of their own under `category/`. */
export default async function FashionBlogPage({ searchParams }: PageProps<'/blog'>) {
  const params = toSearchParams(await searchParams)

  return (
    <main className="flex flex-1 flex-col">
      <JournalListing page={parseBlogPage(params)} params={params} />
    </main>
  )
}
