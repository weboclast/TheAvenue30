import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { JournalListing } from '@/components/fashion/blog/journal-listing'
import { getBlog } from '@/lib/blog'
import { parseBlogPage } from '@/lib/blog/blog'
import { toSearchParams } from '@/lib/catalog-filters'

/** The section a route parameter names, or `undefined` for one the journal does not file under. */
async function findCategory(slug: string) {
  const categories = await getBlog('fashion').listCategories()
  return categories.find((category) => category.slug === slug)
}

export async function generateMetadata({ params }: PageProps<'/blog/category/[category]'>): Promise<Metadata> {
  const category = await findCategory((await params).category)
  if (!category) notFound()
  return { title: category.name, description: category.description }
}

/** One section of the journal, e.g. `/blog/category/care-and-repair`. */
export default async function FashionBlogCategoryPage({
  params,
  searchParams,
}: PageProps<'/blog/category/[category]'>) {
  const [{ category: slug }, search] = await Promise.all([params, searchParams])
  const category = await findCategory(slug)
  if (!category) notFound()

  const query = toSearchParams(search)

  return (
    <main className="flex flex-1 flex-col">
      <JournalListing category={category} page={parseBlogPage(query)} params={query} />
    </main>
  )
}
