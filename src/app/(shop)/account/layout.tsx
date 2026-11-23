import type { CSSProperties } from 'react'
import { AccountCampaigns } from '@/components/fashion/account/account-campaigns'
import { AccountMenu } from '@/components/fashion/account/account-menu'
import { AccountNavigation } from '@/components/fashion/account/account-navigation'
import { StickyColumn } from '@/components/sticky-column'
import { requireSession } from '@/lib/auth'
import { getCommerce } from '@/lib/commerce'
import { getDepartment } from '@/lib/departments'
import { countActiveOrders } from '@/lib/orders'

/**
 * The shell every Fashion account page wears: the navigation and the account's
 * campaigns in a sidebar from `lg`, the page beside it. Below `lg` the sidebar
 * gives way to a menu above the page.
 *
 * It also gates the whole area, so an account page added later is protected by
 * construction. A guest is sent to `/login` and returns to the Overview.
 */
export default async function FashionAccountLayout({ children }: LayoutProps<'/account'>) {
  const [, activeOrders, campaigns, department] = await Promise.all([
    requireSession('/account'),
    countActiveOrders('fashion'),
    getCommerce('fashion').getPlacementCampaigns('account'),
    getDepartment('fashion'),
  ])
  const home = department ? `/${department.slug}` : '/'

  return (
    <main className="container grid flex-1 items-start gap-x-8 gap-y-8 pt-6 pb-16 md:pt-10 md:pb-20 lg:grid-cols-12 xl:gap-x-12 xl:pt-12 xl:pb-24">
      {/* Clears the header's pinned bar by 1.5rem, like the bag's summary. */}
      <StickyColumn
        style={{ '--sticky-top': '5rem' } as CSSProperties}
        className="hidden lg:sticky lg:col-span-3 lg:block lg:self-start"
      >
        <div className="flex flex-col gap-10">
          <AccountNavigation activeOrders={activeOrders} home={home} />
          <AccountCampaigns campaigns={campaigns} />
        </div>
      </StickyColumn>

      <div className="flex min-w-0 flex-col gap-6 sm:gap-8 lg:col-span-9">
        <AccountMenu activeOrders={activeOrders} home={home} className="lg:hidden" />
        {children}
      </div>
    </main>
  )
}
