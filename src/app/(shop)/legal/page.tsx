import { permanentRedirect } from 'next/navigation'
import { legalDocuments, legalPath } from '@/lib/legal'

/**
 * `/legal` is a folder, not a page. An index listing 3 documents would repeat
 * the footer's links, so the bare path lands on the first instead of 404ing.
 */
export default function FashionLegalIndexPage() {
  permanentRedirect(legalPath('fashion', legalDocuments[0]!.slug))
}
