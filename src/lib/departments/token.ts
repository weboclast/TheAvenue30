import 'server-only'

import { readCookie, writeCookie } from '@/lib/cookies'
import type { DemoSlug } from '@/lib/demos'

/*
 * The remembered department: 1 cookie per demo, holding the slug of the
 * department home last opened. It answers where the URL is silent, like the
 * footer, which a layout renders without a pathname.
 */

const DEPARTMENT_COOKIE_PREFIX = 'appica_department'

/** How long the choice is remembered, in seconds. A year: this is a preference, not a session. */
const DEPARTMENT_MAX_AGE = 60 * 60 * 24 * 365

function departmentCookie(demo: DemoSlug): string {
  return `${DEPARTMENT_COOKIE_PREFIX}_${demo}`
}

/**
 * The slug of the department this visitor last opened. Never trusted: a visitor can edit a
 * cookie, so `getDepartment` resolves it against the store's own departments.
 */
export async function readDepartmentSlug(demo: DemoSlug): Promise<string | null> {
  return readCookie(departmentCookie(demo))
}

/** Stores the choice. Only callable from a Server Action or Route Handler. */
export async function writeDepartmentSlug(demo: DemoSlug, slug: string): Promise<void> {
  await writeCookie(departmentCookie(demo), slug, DEPARTMENT_MAX_AGE)
}
