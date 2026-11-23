import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

export const metadata: Metadata = {
  title: 'Page not found',
}

/**
 * Any address under the store that no other route matches, sent to the store's
 * own 404 inside its header and footer rather than to the bare one at the root.
 */
export default function UnmatchedPage() {
  notFound()
}
