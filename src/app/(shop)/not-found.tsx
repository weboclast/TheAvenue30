import type { Metadata } from 'next'
import { SockArtwork } from '@/components/fashion/sock-artwork'
import { PageNotFound } from '@/components/page-not-found'

export const metadata: Metadata = { title: 'Page not found' }

/** What a missing product, or an address no route matches, renders inside the header and footer. */
export default function NotFound() {
  return (
    <main className="flex flex-1 flex-col">
      <PageNotFound
        demo="fashion"
        artwork={<SockArtwork />}
        eyebrow="Error 404"
        title="This page got lost in the wash"
        description="It may have moved, or the link may be broken. Like the other sock, it might still turn up."
      />
    </main>
  )
}
