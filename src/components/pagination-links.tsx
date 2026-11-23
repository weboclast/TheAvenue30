import Link from 'next/link'
import { ChevronLeft, ChevronRight } from '@appica/icons-react'
import {
  Pagination,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationList,
} from '@appica/ui-react/pagination'
import { cn } from '@/lib/utils'

/** Pages either side of the current one that are always spelled out. */
const NEIGHBORS = 1

interface PaginationLinksProps {
  /** Current 1-based page. */
  page: number
  pageCount: number
  /**
   * Where a page number leads. Build it through the list's own URL contract
   * (`lib/catalog-filters.ts`, `lib/account-orders.ts`), so every link keeps the
   * refinements the reader arrived with.
   */
  href: (page: number) => string
  /** Names the control, since several paginated lists can share a page. */
  label: string
  className?: string
}

/**
 * Page links under a paginated list. Real `<a>` links rather than buttons, so
 * every page is crawlable and each carries the current refinements with it.
 *
 * Renders nothing for a list that fits on 1 page. It knows nothing about what is
 * being paged; the caller supplies {@link PaginationLinksProps.href}.
 */
export function PaginationLinks({ page, pageCount, href, label, className }: PaginationLinksProps) {
  if (pageCount <= 1) return null

  return (
    <Pagination aria-label={label} className={cn('mx-auto', className)}>
      <PaginationList>
        <PaginationItem>
          {/* Text, not aria-label: the disabled control is a span, which takes no name. */}
          <PaginationLink disabled={page <= 1} render={page > 1 ? <Link href={href(page - 1)} /> : <span />}>
            <ChevronLeft className="rtl:rotate-180" />
            <span className="sr-only">Previous page</span>
          </PaginationLink>
        </PaginationItem>

        {pageWindow(page, pageCount).map((entry, index) =>
          entry === null ? (
            // Keyed by index: there can be 2 gaps, and neither has an identity.
            <PaginationItem key={`gap-${index}`}>
              <PaginationEllipsis />
            </PaginationItem>
          ) : (
            <PaginationItem key={entry}>
              <PaginationLink active={entry === page} aria-label={`Page ${entry}`} render={<Link href={href(entry)} />}>
                {entry}
              </PaginationLink>
            </PaginationItem>
          ),
        )}

        <PaginationItem>
          <PaginationLink
            disabled={page >= pageCount}
            render={page < pageCount ? <Link href={href(page + 1)} /> : <span />}
          >
            <ChevronRight className="rtl:rotate-180" />
            <span className="sr-only">Next page</span>
          </PaginationLink>
        </PaginationItem>
      </PaginationList>
    </Pagination>
  )
}

/**
 * The pages to spell out: the first, the last, and the current one with its
 * neighbors. `null` marks a gap, except a gap of exactly 1 page, which is
 * rendered as that page so the bar keeps a fixed width.
 */
function pageWindow(page: number, pageCount: number): (number | null)[] {
  const pages: (number | null)[] = []
  let previous = 0

  for (let candidate = 1; candidate <= pageCount; candidate += 1) {
    const near = Math.abs(candidate - page) <= NEIGHBORS
    if (candidate !== 1 && candidate !== pageCount && !near) continue

    if (candidate - previous > 1) pages.push(candidate - previous === 2 ? candidate - 1 : null)
    pages.push(candidate)
    previous = candidate
  }

  return pages
}
