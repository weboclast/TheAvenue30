import type { ReactNode } from 'react'
import Link from 'next/link'
import { buttonVariants } from '@appica/ui-react/button'
import { getCommerce } from '@/lib/commerce'
import type { DemoSlug } from '@/lib/demos'
import { getDepartment } from '@/lib/departments'

/** How many categories the page suggests at most. */
const MAX_CATEGORIES = 7

interface PageNotFoundProps {
  /** The store the page leads back into. */
  demo: DemoSlug
  /** The picture above the title. */
  artwork: ReactNode
  /** A small label over the title, such as "Error 404". */
  eyebrow?: string
  /** The headline, in the store’s own voice. */
  title: string
  /** What may have happened, in 1 or 2 short sentences. */
  description: string
}

/**
 * The 404: what a missing product or a mistyped address shows. The layout is
 * shared and each store brings its own artwork and words. In a store split into
 * departments, the categories are the remembered department's, the one the
 * header shows: a 404's address never names one. A demo restyles the eyebrow and
 * the categories' heading through their `not-found-*` slots.
 */
export async function PageNotFound({ demo, artwork, eyebrow, title, description }: PageNotFoundProps) {
  const [tree, department] = await Promise.all([getCommerce(demo).getCategoryTree(), getDepartment(demo)])
  const branch = department ? (tree.find((category) => category.id === department.id)?.children ?? []) : tree
  const categories = branch.slice(0, MAX_CATEGORIES)

  return (
    <section className="container flex flex-1 flex-col items-center justify-center gap-8 py-16 text-center md:py-20 xl:py-24">
      {artwork}
      <div className="flex flex-col items-center gap-3">
        {eyebrow ? (
          <p data-slot="not-found-eyebrow" className="text-foreground-muted text-sm">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="text-foreground-intense max-w-3xl text-4xl font-medium text-balance md:text-5xl">{title}</h1>
        <p className="max-w-md text-balance">{description}</p>
      </div>
      <div className="flex flex-wrap justify-center gap-3">
        <Link href="/catalog" data-slot="button" className={buttonVariants({ size: 'lg' })}>
          Continue shopping
        </Link>
        <Link href="/" data-slot="button" className={buttonVariants({ variant: 'outline', size: 'lg' })}>
          Back to home
        </Link>
      </div>
      {categories.length > 0 ? (
        <nav aria-labelledby="not-found-categories" className="mt-4 flex flex-col items-center gap-4">
          <h2
            id="not-found-categories"
            data-slot="not-found-categories-title"
            className="text-foreground-intense font-medium"
          >
            Shop by category
          </h2>
          <ul className="flex max-w-2xl flex-wrap justify-center gap-2">
            {categories.map((category) => (
              <li key={category.id}>
                <Link
                  href={`/catalog/${category.slug}`}
                  data-slot="button"
                  className={buttonVariants({ variant: 'soft', size: 'md' })}
                >
                  {category.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      ) : null}
    </section>
  )
}
