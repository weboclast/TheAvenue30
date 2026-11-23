import Link from 'next/link'
import { CalendarDot } from '@appica/icons-react'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from '@appica/ui-react/breadcrumb'
import { Separator } from '@appica/ui-react/separator'
import { LegalBody } from '@/components/legal/legal-body'
import { LegalToc } from '@/components/legal/legal-toc'
import { LegalTocFloating } from '@/components/legal/legal-toc-floating'
import { PrintButton } from '@/components/legal/print-button'
import { formatDate } from '@/lib/commerce/format'
import { type LegalDocument as LegalDocumentData, legalTocItems } from '@/lib/legal'

/** The document and its rail, stacked until a 9/3 split at `lg`. */
const GRID = 'container grid items-start gap-x-6 gap-y-10 pt-6 pb-16 md:pt-8 md:pb-20 lg:grid-cols-12 lg:pt-10 xl:pb-24'

/** The gutter is padding on the reading side until the container stops growing, as on an article page. */
const COLUMN = 'flex min-w-0 flex-col gap-8 lg:col-span-9 lg:pe-8 2xl:pe-0'

/** `top` clears the header by `--header-height`, set in a storefront's stylesheet or by `ScrollRevealHeader`. */
const RAIL =
  'hidden min-w-0 lg:sticky lg:top-[calc(var(--header-height,0px)+(--spacing(4)))] lg:col-span-3 lg:block 2xl:ps-8'

interface LegalDocumentProps {
  doc: LegalDocumentData
  /** Where the breadcrumb's Home link leads: the storefront's home, or a department's. */
  home: string
}

/**
 * One legal document as a whole page: the prose, the rail beside it, and the
 * collapsed rail below `lg`, all from the same data, so a new section appears in
 * all 3.
 */
export function LegalDocument({ doc, home }: LegalDocumentProps) {
  const items = legalTocItems(doc)

  return (
    <main className={GRID}>
      <div className={COLUMN}>
        {/* Marks what prints. The `@media print` block in `globals.css` drops
            everything else on the page, chrome included. */}
        <article data-print-root className="flex flex-col gap-8">
          <div className="flex flex-col gap-3">
            <Breadcrumb className="print:hidden">
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink render={<Link href={home} />}>Home</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink active>{doc.title}</BreadcrumbLink>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>

            <h1 className="text-foreground-intense text-3xl font-medium text-balance md:text-4xl">{doc.title}</h1>
            <p>{doc.summary}</p>

            <div className="mt-1 flex flex-wrap items-center justify-between gap-3">
              <p className="text-foreground-muted flex items-center gap-2 text-sm">
                <CalendarDot size={18} />
                Effective {formatDate(doc.effectiveDate)}
              </p>
              <PrintButton />
            </div>
          </div>

          <Separator />

          <LegalBody doc={doc} />
        </article>
      </div>

      <div className={RAIL}>
        <LegalToc items={items} />
      </div>

      <LegalTocFloating items={items} className="lg:hidden" />
    </main>
  )
}
