import type { CategoryTag, NavItem, NavMenu } from '@/lib/commerce/types'
import { fashionCategories } from './categories'
import { fashionCategoryCover } from './category-covers'

/*
 * Fashion navigation, derived from the category taxonomy so it can never drift
 * from it: each department becomes a nav item whose mega-menu panel holds its
 * garment types and the shortcuts below. A curated "SALE" item is appended.
 *
 * The panel draws a department's *direct* children. Nesting the taxonomy deeper
 * is a change to `./categories.ts` alone, but showing that depth here is a
 * design decision this file would have to make.
 */

const catalogHref = (slug: string) => `/catalog/${slug}`

const topLevel = fashionCategories.filter((category) => category.parentId === null)

const childrenOf = (parentId: string) => fashionCategories.filter((category) => category.parentId === parentId)

/**
 * The shortcuts each department's menu lists beside its categories, by category
 * id. A single filter value is fine here: what makes one redundant as a
 * listing's chip is the sidebar beside it, and a menu has none.
 */
const departmentShortcuts: Record<string, CategoryTag[]> = {
  'cat-women': [
    { label: 'Sleeveless', filters: { sleeve: ['sleeveless'] } },
    { label: 'Relaxed fits', filters: { fit: ['relaxed', 'oversize'] } },
    { label: 'Under $100', price: [0, 100] },
  ],
  'cat-men': [
    { label: 'Linen', filters: { material: ['linen'] } },
    { label: 'Relaxed fits', filters: { fit: ['relaxed'] } },
    { label: 'Under $100', price: [0, 100] },
  ],
}

const items: NavItem[] = topLevel.map((category) => ({
  id: `nav-${category.slug}`,
  label: category.name,
  href: catalogHref(category.slug),
  links: childrenOf(category.id).map((child) => ({
    label: child.name,
    href: catalogHref(child.slug),
    image: fashionCategoryCover(child),
  })),
  tags: departmentShortcuts[category.id],
}))

items.push({
  id: 'nav-sale',
  label: 'SALE',
  href: '/catalog?on-sale=1',
  emphasis: 'sale',
})

/** The assembled navigation, ready for the header and its mega-menu. */
export const fashionMenu: NavMenu = { items }
