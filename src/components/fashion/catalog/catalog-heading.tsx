import { Fragment } from 'react'
import Link from 'next/link'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from '@appica/ui-react/breadcrumb'

interface CatalogHeadingProps {
  /** The page's `h1` and last crumb. */
  title: string
  /** The levels above, first to last. */
  trail: { label: string; href: string }[]
  /** A sentence or 2 under the heading. */
  description?: string
}

/** The breadcrumb and the heading over a listing. */
export function CatalogHeading({ title, trail, description }: CatalogHeadingProps) {
  return (
    <div className="container flex flex-col gap-4 pt-6 pb-2 sm:pb-3 md:pt-8 lg:pt-10">
      <Breadcrumb>
        <BreadcrumbList>
          {trail.map(({ label, href }) => (
            <Fragment key={href}>
              <BreadcrumbItem>
                <BreadcrumbLink render={<Link href={href} />}>{label}</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
            </Fragment>
          ))}
          <BreadcrumbItem>
            <BreadcrumbLink active>{title}</BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div className="flex flex-col gap-3">
        <h1 className="text-foreground-intense text-3xl font-medium md:text-4xl">{title}</h1>
        {description ? <p className="max-w-xl text-pretty">{description}</p> : null}
      </div>
    </div>
  )
}
