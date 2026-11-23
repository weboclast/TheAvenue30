import 'server-only'

import { cache } from 'react'
import { getCommerce } from '@/lib/commerce'
import type { Category } from '@/lib/commerce/types'
import { type DemoSlug, isDemoSlug } from '@/lib/demos'
import { readDepartmentSlug, writeDepartmentSlug } from './token'

/*
 * Which half of the store a shopper is in. Each department's home has its own
 * URL, `/<demo>/<slug>`; this remembers the last one opened, for the pages that
 * carry none. `./remember-department.tsx` records it.
 */

/**
 * The department this visitor last opened, else the store's first; `null` for a
 * store with none. The fallback also covers a cookie naming a renamed department.
 */
export const getDepartment = cache(async (demo: DemoSlug): Promise<Category | null> => {
  const [departments, chosen] = await Promise.all([getCommerce(demo).getDepartments(), readDepartmentSlug(demo)])

  return departments.find((department) => department.slug === chosen) ?? departments[0] ?? null
})

/** The department a slug names, or `undefined` for a slug that is not one. */
export async function findDepartment(demo: DemoSlug, slug: string): Promise<Category | undefined> {
  const departments = await getCommerce(demo).getDepartments()
  return departments.find((department) => department.slug === slug)
}

/**
 * Remembers the department a shopper just opened, writing only on a change, and
 * returns whether it switched the department the pages without one show. Both
 * arguments come from a request, so both are checked first.
 */
export async function rememberDepartment(demo: unknown, slug: unknown): Promise<boolean> {
  if (typeof demo !== 'string' || !isDemoSlug(demo) || typeof slug !== 'string') return false
  if (!(await findDepartment(demo, slug))) return false

  const shown = await getDepartment(demo)
  if ((await readDepartmentSlug(demo)) !== slug) await writeDepartmentSlug(demo, slug)
  return shown?.slug !== slug
}
