'use client'

import { useParams, usePathname } from 'next/navigation'

/** A department as the header and footer need it. */
export interface DepartmentLink {
  slug: string
  name: string
  /** Slugs of every category under it, its own included. */
  categories: string[]
}

/**
 * The department on screen: the one the URL names (its home, a page under it,
 * or a category in it), else the one opened last. `isHome` marks its own home.
 */
export function useCurrentDepartment(departments: DepartmentLink[], remembered: string | undefined) {
  const { department, category } = useParams<{ department?: string; category?: string }>()
  const pathname = usePathname()
  const branch = departments.find(({ slug }) => slug === department)
  const inUrl = branch ?? departments.find(({ categories }) => category !== undefined && categories.includes(category))
  return { current: inUrl?.slug ?? remembered, isHome: branch !== undefined && pathname.endsWith(`/${branch.slug}`) }
}
