'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import type { DemoSlug } from '@/lib/demos'

/**
 * Records the department whose home is on screen. A page can't set a cookie
 * while it renders, so this posts to `/remember-department` once mounted, and
 * refreshes the page only when that switched the department: the chrome reading
 * the cookie, like the footer, then follows.
 */
export function RememberDepartment({ demo, slug }: { demo: DemoSlug; slug: string }) {
  const router = useRouter()

  useEffect(() => {
    void fetch('/remember-department', { method: 'POST', body: JSON.stringify({ demo, slug }), keepalive: true })
      .then((response) => response.json())
      .then(({ switched }: { switched: boolean }) => {
        if (switched) router.refresh()
      })
      .catch(() => {})
  }, [demo, slug, router])

  return null
}
