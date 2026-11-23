'use client'

import { useId } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@appica/ui-react/select'
import { Tabs, TabsList, TabsTrigger } from '@appica/ui-react/tabs'
import { accountPath } from '@/components/account/account-paths'
import type { FieldVariant } from '@/components/address-fields'
import { toHref } from '@/lib/catalog-filters'
import type { DemoSlug } from '@/lib/demos'
import {
  REVIEW_SORTS,
  REVIEW_TABS,
  type ReviewSort,
  type ReviewTab,
  withReviewSort,
  withReviewTab,
} from '@/lib/reviews/reviews'
import { cn } from '@/lib/utils'

interface ReviewsToolbarProps {
  /** The storefront whose reviews page this drives. */
  demo: DemoSlug
  tab: ReviewTab
  sort: ReviewSort
  /** How the sort select is drawn. @default 'soft' */
  fieldVariant?: FieldVariant
  className?: string
}

/**
 * The row above the reviews: which half of them to show, and in what order.
 * Everything it changes is a query parameter, so each tab is a server fetch of
 * the list being read and a sorted view is an address a shopper can bookmark.
 *
 * Each tab is a link rather than a panel switch, which is what keeps the other
 * tab unfetched, and `nativeButton={false}` is required by that: Base UI refuses
 * to drop native button semantics silently. `Tabs` still owns the strip and
 * slides the indicator; the URL is the state and nothing here holds any.
 */
export function ReviewsToolbar({ demo, tab, sort, fieldVariant = 'soft', className }: ReviewsToolbarProps) {
  const router = useRouter()
  const params = useSearchParams()
  const labelId = useId()
  const sorts = REVIEW_SORTS[tab]
  const pathname = accountPath(demo, 'reviews')

  return (
    <div className={cn('flex flex-col justify-between gap-3 md:flex-row md:items-center', className)}>
      <Tabs value={tab}>
        <TabsList aria-label="Reviews">
          {REVIEW_TABS.map((entry) => (
            <TabsTrigger
              key={entry.value}
              value={entry.value}
              nativeButton={false}
              render={<Link href={toHref(pathname, withReviewTab(new URLSearchParams(params), entry.value))} />}
            >
              {entry.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <div className="flex items-center gap-2">
        <span id={labelId} className="text-foreground-intense text-sm font-medium">
          Sort by:
        </span>
        <Select
          variant={fieldVariant}
          value={sort}
          onValueChange={(next) =>
            router.push(toHref(pathname, withReviewSort(new URLSearchParams(params), next as ReviewSort)))
          }
          items={sorts.map(({ value, label }) => ({ value, label }))}
        >
          <SelectTrigger aria-labelledby={labelId} className="w-50">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {sorts.map(({ value, label }) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
