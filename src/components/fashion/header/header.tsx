import Link from 'next/link'
import { buttonVariants } from '@appica/ui-react/button'
import type { NavLink } from '@/components/fashion/link-column'
import { type PromoMessage, PromoRotator } from '@/components/promo-rotator'
import { ThemeToggle } from '@/components/theme-toggle'
import { getSession } from '@/lib/auth'
import { fullName } from '@/lib/auth/customer'
import { toHref, withFlag, withSort, withTag } from '@/lib/catalog-filters'
import { getCommerce } from '@/lib/commerce'
import { branchSlugs } from '@/lib/commerce/category-tree'
import type { Category } from '@/lib/commerce/types'
import { getDepartment } from '@/lib/departments'
import { cn } from '@/lib/utils'
import { CartDrawer } from './cart-drawer'
import type { RecommendedProduct } from './cart-recommendations'
import { DepartmentMenu, type DepartmentPanel } from './department-menu'
import { MainMenu } from './main-menu'
import { MenuDrawer } from './menu-drawer'
import { SearchDialog } from './search-dialog'
import { SignInButton } from './sign-in-button'
import { WishlistLink } from './wishlist-link'

/** Merchandising copy. The repairs promise is the About page's. */
const PROMO_MESSAGES: PromoMessage[] = [
  { label: 'Elegantly feminine for special occasions', href: '/collections/long-evenings' },
  { label: 'Free repairs for life on everything we make', href: '/about' },
  { label: 'New knitwear from our ateliers in Portugal', href: '/collections/cold-mornings' },
]

/** The `!` beats the pill `globals.css` gives every button. */
const STRIP_CONTROL = 'rounded-none! font-normal before:hidden'

/** Best sellers each department hands the bag drawer, before it drops what is already in the bag. */
const RECOMMENDED_PER_DEPARTMENT = 12

/**
 * The header: a utility strip that scrolls away, and a bar that stays pinned.
 * Below `lg` the bar's menus move into {@link MenuDrawer}, whose department tabs
 * carry the collections and the sale.
 *
 * Keep `-top-8` equal to the strip's `h-8`, and the bar's `h-14` equal to
 * `--header-height` and `scroll-pt-14` in `globals.css`.
 */
export async function Header() {
  const [departments, department, session] = await Promise.all([
    getCommerce('fashion').getDepartments(),
    getDepartment('fashion'),
    getSession(),
  ])
  // The bare `/` only redirects here, and its redirect blanks the page while it runs.
  const home = department ? `/${department.slug}` : '/'
  const catalogPath = department ? `/catalog/${department.slug}` : '/catalog'
  const departmentLinks = departments.map((branch) => ({
    slug: branch.slug,
    name: branch.name,
    categories: branchSlugs(branch),
    links: [
      ...(branch.children ?? []).map((child) => ({ label: child.name, href: `/catalog/${child.slug}` })),
      { label: 'Shop all', href: `/catalog/${branch.slug}` },
    ],
  }))
  const menuDepartments = await Promise.all(
    departmentLinks.map(async (link) => ({ ...link, panel: await departmentPanel(link.slug, link.links) })),
  )
  const name = session && fullName(session)

  const links = [
    { label: 'Collections', href: department ? `${home}/collections` : '/collections' },
    { label: 'Sale', href: toHref(catalogPath, withFlag(new URLSearchParams(), 'on-sale', true)) },
    { label: 'About', href: '/about' },
  ]

  return (
    // Above the backdrop a department menu lays over the page, for as long as it is there.
    <header className="sticky -top-8 z-40 has-data-backdrop-open:z-50">
      <div className="dark bg-background dark:bg-background-muted">
        <div className="container flex h-8 items-center justify-between gap-2 md:grid md:grid-cols-[1fr_minmax(0,auto)_1fr]">
          <Link
            href="/order-tracking"
            data-slot="button"
            className={cn(
              buttonVariants({ variant: 'ghost', size: 'sm' }),
              STRIP_CONTROL,
              '-ms-2 justify-self-start px-2',
            )}
          >
            Track order
          </Link>
          <PromoRotator messages={PROMO_MESSAGES} className="col-start-2 hidden font-mono uppercase md:grid" />
          <div className="col-start-3 -me-2 flex min-w-0 items-center justify-self-end">
            <ThemeToggle className={STRIP_CONTROL} />
            <WishlistLink href="/account/wishlist" className={cn(STRIP_CONTROL, 'px-2')} />
            {session ? (
              <Link
                href="/account"
                aria-label={`Your account, signed in as ${name || session.email}`}
                data-slot="button"
                className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }), STRIP_CONTROL, 'min-w-0 shrink px-2')}
              >
                <span className="truncate">{name || 'Your account'}</span>
              </Link>
            ) : (
              <SignInButton className={cn(STRIP_CONTROL, 'px-2')} />
            )}
          </div>
        </div>
      </div>

      <div className="bg-background">
        <div className="container grid h-14 grid-cols-[1fr_auto_1fr] items-center gap-2">
          <div className="flex items-center gap-2">
            <MenuDrawer departments={menuDepartments} remembered={department?.slug} className="-ms-2.5 lg:hidden" />
            <Link
              href={home}
              className="outline-ring text-foreground-intense font-mono text-lg font-semibold uppercase"
            >
              The Avenue 30
            </Link>
            <MainMenu links={links} className="ms-4 hidden lg:block" />
          </div>
          {department && (
            <DepartmentMenu departments={menuDepartments} remembered={department.slug} className="hidden lg:block" />
          )}
          <div className="col-start-3 flex items-center gap-1 justify-self-end">
            <SearchDialog departments={departmentLinks} remembered={department?.slug} />
            <CartDrawer
              departments={departmentLinks}
              remembered={department?.slug}
              recommended={bestSellers(departments)}
            />
          </div>
        </div>
      </div>
    </header>
  )
}

/**
 * A department's mega-menu: its categories, the sorted listings beside the
 * shortcuts its menu item carries, its collections, and its campaign.
 */
async function departmentPanel(department: string, categories: NavLink[]): Promise<DepartmentPanel> {
  const commerce = getCommerce('fashion')
  const [collections, [campaign], menu] = await Promise.all([
    commerce.getCollections(department),
    commerce.getPlacementCampaigns('menu', department),
    commerce.getMenu(),
  ])
  const catalogPath = `/catalog/${department}`
  const shortcuts = menu.items.find(({ href }) => href === catalogPath)?.tags ?? []
  const params = new URLSearchParams()

  return {
    columns: [
      { heading: 'Categories', links: categories },
      {
        heading: 'Featured',
        links: [
          { label: 'New in', href: toHref(catalogPath, withSort(params, 'newest')) },
          { label: 'Bestsellers', href: toHref(catalogPath, withSort(params, 'best-selling')) },
          ...shortcuts.map((tag) => ({ label: tag.label, href: toHref(catalogPath, withTag(params, tag)) })),
          { label: 'Sale', href: toHref(catalogPath, withSort(withFlag(params, 'on-sale', true), 'discount')) },
        ],
      },
      {
        heading: 'Collections',
        links: [
          ...collections.map(({ slug, title }) => ({ label: title, href: `/collections/${slug}` })),
          { label: 'All collections', href: `/${department}/collections` },
        ],
      },
    ],
    campaign,
  }
}

/**
 * Each department's best sellers for the bag drawer, keyed by slug so it follows
 * the department on screen (`''` without departments). Unawaited, so the header never waits.
 */
function bestSellers(departments: Category[]): Promise<Record<string, RecommendedProduct[]>> {
  const shelves = departments.length ? departments.map(({ slug }) => slug) : ['']

  return Promise.all(
    shelves.map(async (slug) => {
      const { products } = await getCommerce('fashion').listProducts({
        categorySlug: slug || undefined,
        sort: 'best-selling',
        inStock: true,
        limit: RECOMMENDED_PER_DEPARTMENT,
      })
      const tiles = products.map(({ slug, title, price, media }) => ({ slug, title, price, image: media.image }))
      return [slug, tiles] as const
    }),
  ).then(
    (entries) => Object.fromEntries(entries),
    () => ({}),
  )
}
