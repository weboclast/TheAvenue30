import Link from 'next/link'
import { CaretSwap } from '@/components/fashion/caret-swap'
import type { PostSummary } from '@/lib/blog/blog'
import { PostCard } from './post-card'
import { PostCardSkeleton } from './post-card-skeleton'

/** Cards in a row, and so in its skeleton. */
export const ROW_LENGTH = 4

/** 4 across from `xl`; in the rail below it about half, then most of a phone. */
const ROW_SIZES = '(min-width: 80rem) 25vw, (min-width: 48rem) 47vw, 90vw'

/** A rail below `xl` that runs to the page's 8px frame, then a grid. `-my-1 py-1` is the slack a card's focus ring needs. */
const ROW =
  '-my-1 flex snap-x snap-mandatory scroll-px-2 scrollbar-none gap-2 overflow-x-auto px-2 py-1 xl:grid xl:snap-none xl:grid-cols-4 xl:overflow-visible'

/** Most of a phone, with the next card peeking in, as on the collections row. */
const ROW_ITEM = 'w-9/10 shrink-0 snap-start md:w-[47%] xl:w-auto'

interface PostRowProps {
  /** The section's heading. */
  title: string
  /** Where the heading leads, which makes it a link. Leave it out for a static title. */
  href?: string
  posts: PostSummary[]
}

/**
 * A titled row of up to 4 stories, full width. Renders nothing, spacing
 * included, when handed no posts.
 */
export function PostRow({ title, href, posts }: PostRowProps) {
  if (posts.length === 0) return null

  return (
    <section className="pb-16 md:pb-20 xl:pb-24">
      <RowHeading title={title} href={href} />
      <ul className={ROW}>
        {posts.slice(0, ROW_LENGTH).map((post) => (
          <li key={post.slug} className={ROW_ITEM}>
            <PostCard post={post} sizes={ROW_SIZES} className="h-full" />
          </li>
        ))}
      </ul>
    </section>
  )
}

/** Holds the row's shape while its posts stream in. */
export function PostRowSkeleton({ title, href }: Omit<PostRowProps, 'posts'>) {
  return (
    <section className="pb-16 md:pb-20 xl:pb-24">
      <RowHeading title={title} href={href} />
      <div className={ROW}>
        {Array.from({ length: ROW_LENGTH }, (_, index) => (
          <PostCardSkeleton key={index} className={ROW_ITEM} />
        ))}
      </div>
    </section>
  )
}

/** In the container, so it lines up with the shelf headings above it. */
function RowHeading({ title, href }: Omit<PostRowProps, 'posts'>) {
  return (
    <h2 className="text-foreground-intense container mb-4 font-mono text-lg uppercase">
      {href ? (
        <Link
          href={href}
          className="group outline-ring rounded-4xs inline-flex items-center gap-2 focus-visible:outline-2 focus-visible:outline-offset-2"
        >
          {title}
          <CaretSwap />
        </Link>
      ) : (
        title
      )}
    </h2>
  )
}
