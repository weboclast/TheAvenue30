import Image from 'next/image'
import Link from 'next/link'
import { BrandFacebook, BrandInstagram, BrandTiktok, BrandYoutube } from '@appica/icons-react'
import { buttonVariants } from '@appica/ui-react/button'
import { Copyright } from '@/components/copyright'
import { STORES, storeImage } from '@/components/fashion/stores'
import { toHref, withFlag, withSort } from '@/lib/catalog-filters'
import { getCommerce } from '@/lib/commerce'
import { branchSlugs } from '@/lib/commerce/category-tree'
import type { Category } from '@/lib/commerce/types'
import { getDepartment } from '@/lib/departments'
import { legalDocuments, legalLinkLabel } from '@/lib/legal'
import { cn } from '@/lib/utils'
import { type NavColumn } from '@/components/fashion/link-column'
import { StoreWordmark } from './wordmark'
import { FooterNav } from './footer-nav'
import { NewsletterForm } from './newsletter-form'

/* Merchandising copy, not catalog data. */
function exploreColumn(department?: Category): NavColumn {
  return {
    heading: 'Explore',
    links: [
      { label: 'Collections', href: department ? `/${department.slug}/collections` : '/collections' },
      { label: 'Journal', href: '/blog' },
      { label: 'Our story', href: '/about' },
    ],
  }
}

/* The policies sit here rather than beside the copyright, where links go to be ignored. */
const HELP: NavColumn = {
  heading: 'Help',
  links: [
    { label: 'Contact us', href: '/contact' },
    { label: 'Track order', href: '/order-tracking' },
    { label: 'Your account', href: '/account', account: true },
    ...legalDocuments.map((doc) => ({ label: legalLinkLabel(doc), href: `/legal/${doc.slug}` })),
  ],
}

/** `#!` on purpose: a placeholder that stays put instead of jumping to the top like a bare `#`. */
const SOCIAL = [
  { label: 'Instagram', href: '#!', Icon: BrandInstagram },
  { label: 'Facebook', href: '#!', Icon: BrandFacebook },
  { label: 'TikTok', href: '#!', Icon: BrandTiktok },
  { label: 'YouTube', href: '#!', Icon: BrandYoutube },
]

/** A department's link column, or the whole store's when it has none. */
function shopColumn(department?: Category): NavColumn {
  const catalogPath = department ? `/catalog/${department.slug}` : '/catalog'

  return {
    heading: department?.name ?? 'Shop',
    links: [
      { label: 'New in', href: toHref(catalogPath, withSort(new URLSearchParams(), 'newest')) },
      ...(department?.children ?? []).map((child) => ({
        label: child.name,
        href: `/catalog/${child.slug}`,
      })),
      { label: 'Sale', href: toHref(catalogPath, withFlag(new URLSearchParams(), 'on-sale', true)) },
      { label: 'Shop all', href: catalogPath },
    ],
  }
}

/** Stacked, the 3 blocks share the 1 tile their container draws, so each takes its own only from `lg`. */
const TILE = 'lg:bg-background-muted lg:rounded-sm lg:p-8 xl:p-10'

/** The 2 headings the left tile opens its halves with. */
const TILE_HEADING = 'text-foreground-intense font-mono text-2xl uppercase'

/**
 * The footer, rendered by the shop layout on every page but the checkout. The
 * `<footer>` is only an 8px frame at the sides and bottom, leaving the gap above
 * to the last section; `className` lands on the tiles inside it. `mt-auto` keeps
 * it at the bottom of a page too short to fill the screen. Its first
 * column is the department on screen, picked by {@link FooterNav}.
 *
 * Stacked, the 3 blocks share 1 tile and a rule divides the links from the
 * sign-up. From `lg` each takes its own, and the wordmark closes the right-hand
 * column across a dropped row gap: 3 tiles in the markup, 2 on the screen.
 */
export async function Footer({ className }: { className?: string }) {
  const [departments, remembered] = await Promise.all([
    getCommerce('fashion').getDepartments(),
    getDepartment('fashion'),
  ])
  const explore = exploreColumn(remembered ?? undefined)
  const departmentColumns = departments.map((branch) => ({
    slug: branch.slug,
    name: branch.name,
    categories: branchSlugs(branch),
    column: shopColumn(branch),
  }))

  return (
    <footer className="mt-auto px-2 pb-2">
      <div
        className={cn(
          'bg-background-muted rounded-sm px-6 pt-12 pb-6 md:px-8 md:pt-14 md:pb-8',
          'grid gap-8 lg:grid-cols-2 lg:grid-rows-[1fr_auto] lg:gap-x-2 lg:gap-y-0',
          'lg:rounded-none lg:bg-transparent lg:p-0',
          className,
        )}
      >
        <FooterNav
          departments={departmentColumns}
          remembered={remembered?.slug}
          columns={departmentColumns.length > 0 ? [explore, HELP] : [shopColumn(), explore, HELP]}
          className={cn(TILE, 'lg:col-start-2 lg:row-start-1 lg:rounded-b-none')}
        />

        <div
          className={cn(
            TILE,
            'flex flex-col justify-between gap-10 border-t pt-8',
            'lg:col-start-1 lg:row-span-2 lg:row-start-1 lg:border-t-0',
          )}
        >
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <h2 className={TILE_HEADING}>Care for 10% off?</h2>
              <p>Subscribe and take 10% off your first order.</p>
            </div>
            <NewsletterForm />
          </div>

          {STORES.length > 0 && (
            <div className="flex flex-col gap-4">
              <h2 className={TILE_HEADING}>Find us</h2>
              <ul className="flex flex-col gap-3">
                {STORES.map(({ id, city, address, phone }) => (
                  <li key={id}>
                    <Link
                      href={`/contact#${id}`}
                      className="outline-ring rounded-2xs group inline-flex items-end gap-4 focus-visible:outline-2 focus-visible:outline-offset-2"
                    >
                      <span className="rounded-2xs bg-background-strong relative size-28 shrink-0 overflow-hidden xl:size-36">
                        <Image
                          src={storeImage(id)}
                          alt=""
                          fill
                          sizes="144px"
                          className="object-cover transition-transform duration-350 ease-out group-hover:scale-105 motion-reduce:transition-none"
                        />
                      </span>
                      <span className="text-foreground-emphasis flex flex-col text-sm">
                        <span>
                          {address[0]}, {city}
                        </span>
                        <span className="text-foreground-muted">{phone}</span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex flex-col-reverse gap-4 sm:flex-row sm:items-end sm:justify-between sm:gap-6">
            <Copyright className="text-foreground-muted text-sm" />

            <ul className="flex shrink-0 gap-1">
              {SOCIAL.map(({ label, href, Icon }) => (
                <li key={label}>
                  <a
                    href={href}
                    aria-label={label}
                    data-slot="button"
                    className={buttonVariants({ variant: 'outline', size: 'icon-md' })}
                  >
                    <Icon aria-hidden />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className={cn(TILE, 'lg:col-start-2 lg:row-start-2 lg:rounded-t-none lg:pt-0')}>
          <StoreWordmark className="text-background-strong" />
        </div>
      </div>
    </footer>
  )
}
