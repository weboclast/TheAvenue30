import Link from 'next/link'
import { buttonVariants } from '@appica/ui-react/button'
import type { PostCategory } from '@/lib/blog/blog'
import { cn } from '@/lib/utils'
import { blogCategoryPath } from './blog-paths'

interface JournalSectionsProps {
  /** From the blog layer's `listCategories`, in the order to present them. */
  categories: PostCategory[]
  /** The section being read, by slug. Left out on the whole journal. */
  active?: string
}

/**
 * The journal's sections as a row of pills, each a link to its own listing,
 * and "All stories" to clear it. The pill that is on is where the reader is,
 * outlined like a picked filter. Renders nothing for a journal that files
 * nothing.
 */
export function JournalSections({ categories, active }: JournalSectionsProps) {
  if (categories.length === 0) return null

  const sections = [{ slug: undefined, name: 'All stories' }, ...categories]

  return (
    <nav aria-label="Journal sections" className="container pt-4 pb-8 md:pt-6 md:pb-10">
      <ul className="flex flex-wrap gap-1">
        {sections.map(({ slug, name }) => {
          const on = slug === active
          return (
            <li key={slug ?? 'all'}>
              <Link
                href={blogCategoryPath(slug)}
                aria-current={on ? 'page' : undefined}
                data-slot="button"
                className={cn(
                  buttonVariants({ variant: on ? 'primary-outline' : 'outline' }),
                  on && 'text-primary pointer-events-none before:bg-transparent',
                )}
              >
                {name}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
