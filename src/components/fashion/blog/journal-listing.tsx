import { Suspense } from 'react'
import Link from 'next/link'
import { buttonVariants } from '@appica/ui-react/button'
import { CatalogHeading } from '@/components/fashion/catalog/catalog-heading'
import { LoadMore } from '@/components/load-more'
import { getBlog } from '@/lib/blog'
import { type PostCategory, withBlogPage } from '@/lib/blog/blog'
import { toHref } from '@/lib/catalog-filters'
import { getDepartment } from '@/lib/departments'
import { BLOG_PATH, blogCategoryPath } from './blog-paths'
import { JournalSections } from './journal-sections'
import { PostCard, PostLead } from './post-card'
import { PostCardSkeleton, PostLeadSkeleton } from './post-card-skeleton'

/** The journal's own title and intro, wherever the reader is not inside a section. */
const JOURNAL_TITLE = 'Journal'
const JOURNAL_INTRO = 'How our clothes are made, worn, and mended, from the people who do all 3.'

/** Stories in the grid on arrival (3 rows of 3) and per "Load more". The lead is on top of these. */
const FIRST_SCREEN = 9
const MORE_PER_SCREEN = 6

const GRID = 'grid gap-x-2 gap-y-10 md:grid-cols-2 lg:grid-cols-3'

interface JournalListingProps {
  /** The section being read. Left out on the journal's root. */
  category?: PostCategory
  /** Screens loaded, from `?page=`: N means N screens, not the Nth. */
  page: number
  /** The current query string, kept on the next screen's link. */
  params: URLSearchParams
}

/**
 * The journal, or 1 section of it: the heading and section pills, then the
 * lead story over a grid that loads a screen at a time, the way the catalog
 * does. The lead is the section's handpicked story, or its newest.
 *
 * The heading renders into the shell and the stories stream behind it. The
 * boundary is keyed on the section, not the page: a new section shows the
 * skeleton, and "Load more" keeps the rows on screen.
 */
export async function JournalListing({ category, page, params }: JournalListingProps) {
  const [categories, department] = await Promise.all([getBlog('fashion').listCategories(), getDepartment('fashion')])
  // The remembered department's home, since a client navigation to the bare `/` redirect blanks.
  const home = department ? `/${department.slug}` : '/'

  return (
    <>
      <CatalogHeading
        title={category?.name ?? JOURNAL_TITLE}
        trail={[{ label: 'Home', href: home }, ...(category ? [{ label: 'Journal', href: BLOG_PATH }] : [])]}
        description={category?.description ?? JOURNAL_INTRO}
      />
      <JournalSections categories={categories} active={category?.slug} />

      <Suspense key={category?.slug} fallback={<ListingSkeleton />}>
        <ListingBody category={category} page={page} params={params} />
      </Suspense>
    </>
  )
}

async function ListingBody({ category, page, params }: JournalListingProps) {
  const blog = getBlog('fashion')
  const lead = await blog.getLead(category?.slug)
  if (!lead) return <EmptyJournal inSection={Boolean(category)} />

  const { posts, total } = await blog.listPosts({
    categorySlug: category?.slug,
    excludeSlugs: [lead.slug],
    pageSize: FIRST_SCREEN + (page - 1) * MORE_PER_SCREEN,
  })

  return (
    <section className="container pb-16 md:pb-20 xl:pb-24">
      {/* The lead counts as a story shown, and is first in the order `LoadMore` focuses by. */}
      <LoadMore
        shown={posts.length + 1}
        total={total + 1}
        unit="stories"
        focusSlot="post-card-title"
        href={toHref(blogCategoryPath(category?.slug), withBlogPage(params, page + 1))}
        paged={total > FIRST_SCREEN}
      >
        <div className="flex flex-col gap-12 md:gap-16">
          <PostLead post={lead} />
          {posts.length > 0 ? (
            <ul className={GRID}>
              {posts.map((post) => (
                <li key={post.slug}>
                  <PostCard post={post} className="h-full" />
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </LoadMore>
    </section>
  )
}

function ListingSkeleton() {
  return (
    <div className="container flex flex-col gap-12 pb-16 md:gap-16 md:pb-20 xl:pb-24">
      <PostLeadSkeleton />
      <div className={GRID}>
        {Array.from({ length: 6 }, (_, index) => (
          <PostCardSkeleton key={index} />
        ))}
      </div>
    </div>
  )
}

function EmptyJournal({ inSection }: { inSection: boolean }) {
  return (
    <div className="container flex flex-col items-center gap-4 py-16 text-center md:py-24">
      <h2 className="text-foreground-intense text-xl font-medium">
        {inSection ? 'Nothing in this section yet' : 'No stories yet'}
      </h2>
      <p className="text-foreground-muted max-w-prose text-balance">
        {inSection
          ? 'Its first story is on the way. The rest of the journal is here now.'
          : 'The first story is being written.'}
      </p>
      {inSection ? (
        <Link href={BLOG_PATH} data-slot="button" className={buttonVariants({ variant: 'outline' })}>
          Read the journal
        </Link>
      ) : null}
    </div>
  )
}
