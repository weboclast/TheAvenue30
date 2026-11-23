import type { Metadata } from 'next'
import { ReviewsToolbar } from '@/components/account/reviews-toolbar'
import { ReviewableList } from '@/components/fashion/account/reviewable-list'
import { WrittenReviews } from '@/components/fashion/account/written-reviews'
import { PaginationLinks } from '@/components/pagination-links'
import { toHref, toSearchParams } from '@/lib/catalog-filters'
import { listReviewable, listWrittenReviews } from '@/lib/reviews'
import { parseReviewPage, parseReviewSort, parseReviewTab, withReviewPage } from '@/lib/reviews/reviews'

export const metadata: Metadata = {
  title: 'Reviews',
}

/**
 * What this shopper has written, and what they have received and not written
 * about yet. The tab lives in the query string, so only the list being read is
 * fetched; `lib/reviews/reviews.ts` is the only place that knows what each
 * parameter means.
 */
export default async function FashionAccountReviewsPage({ searchParams }: PageProps<'/account/reviews'>) {
  const params = toSearchParams(await searchParams)
  const tab = parseReviewTab(params)
  const query = { sort: parseReviewSort(params, tab), page: parseReviewPage(params) }

  const list = tab === 'written' ? await listWrittenReviews('fashion', query) : await listReviewable('fashion', query)

  return (
    <>
      <h1 className="text-foreground-intense text-3xl font-medium md:text-4xl">Reviews</h1>

      <ReviewsToolbar demo="fashion" tab={tab} sort={query.sort} fieldVariant="outline" />

      {list.tab === 'written' ? (
        <WrittenReviews reviews={list.reviews} />
      ) : (
        <ReviewableList purchases={list.purchases} />
      )}

      <PaginationLinks
        page={list.page}
        pageCount={list.pageCount}
        href={(target) => toHref('/account/reviews', withReviewPage(params, target))}
        label="Review pages"
      />
    </>
  )
}
