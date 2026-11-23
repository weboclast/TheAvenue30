import type { Metadata } from 'next'
import { OrderHistoryToolbar } from '@/components/account/order-history-toolbar'
import { OrderList } from '@/components/fashion/account/order-list'
import { PaginationLinks } from '@/components/pagination-links'
import { hasOrderFilters, parseOrderFilters, toOrderQuery, withOrderPage } from '@/lib/account-orders'
import { toHref, toSearchParams } from '@/lib/catalog-filters'
import { getDepartment } from '@/lib/departments'
import { listAccountOrders } from '@/lib/orders'

export const metadata: Metadata = {
  title: 'Orders',
}

/**
 * Everything this account has bought, newest first. The stage, the search, and
 * the page live in the query string, so the list is narrowed on the server and a
 * refined view is an address; see `lib/account-orders.ts`.
 */
export default async function FashionAccountOrdersPage({ searchParams }: PageProps<'/account/orders'>) {
  const params = toSearchParams(await searchParams)
  const filters = parseOrderFilters(params)
  const [{ orders, page, pageCount }, department] = await Promise.all([
    listAccountOrders('fashion', toOrderQuery(filters)),
    getDepartment('fashion'),
  ])

  return (
    <>
      <h1 className="text-foreground-intense text-3xl font-medium md:text-4xl">Orders</h1>

      <OrderHistoryToolbar demo="fashion" filters={filters} fieldVariant="outline" spinnerVariant="dots" />

      <OrderList
        orders={orders}
        filtered={hasOrderFilters(filters)}
        shopHref={department ? `/catalog/${department.slug}` : '/catalog'}
      />

      <PaginationLinks
        page={page}
        pageCount={pageCount}
        href={(target) => toHref('/account/orders', withOrderPage(params, target))}
        label="Orders pages"
      />
    </>
  )
}
