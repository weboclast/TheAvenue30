import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { LegalDocument } from '@/components/legal/legal-document'
import { getDepartment } from '@/lib/departments'
import { getLegalDocument, legalDocuments } from '@/lib/legal'

export function generateStaticParams() {
  return legalDocuments.map((doc) => ({ slug: doc.slug }))
}

export async function generateMetadata({ params }: PageProps<'/legal/[slug]'>): Promise<Metadata> {
  const doc = getLegalDocument((await params).slug)
  if (!doc) notFound()
  return { title: doc.title, description: doc.summary }
}

/** One legal document, from `lib/legal`, which every storefront serves through a route of its own. */
export default async function FashionLegalDocumentPage({ params }: PageProps<'/legal/[slug]'>) {
  const doc = getLegalDocument((await params).slug)
  if (!doc) notFound()

  const department = await getDepartment('fashion')

  return <LegalDocument doc={doc} home={department ? `/${department.slug}` : '/'} />
}
