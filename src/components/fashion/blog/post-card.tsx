import Image from 'next/image'
import Link from 'next/link'
import { buttonVariants } from '@appica/ui-react/button'
import { TEXT_ACTION } from '@/components/fashion/text-action'
import type { PostSummary } from '@/lib/blog/blog'
import { formatDate } from '@/lib/commerce/format'
import { cn } from '@/lib/utils'
import { blogCategoryPath, postPath } from './blog-paths'

/** Slot widths in the journal grid: 1 across on phones, 2 from `md`, 3 from `lg`, capped with the container. */
const CARD_SIZES = '(min-width: 1400px) 450px, (min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw'

/** The lead's photograph: 7 columns of 12 from `lg`, the whole container below. */
const LEAD_SIZES = '(min-width: 1400px) 790px, (min-width: 1024px) 58vw, 100vw'

/** The photograph's link, which eases its image in while the pointer is on it. */
const MEDIA = 'group/media bg-background-muted relative block aspect-4/3 overflow-hidden rounded-sm'
const ZOOM =
  'transition-transform duration-700 ease-out motion-safe:group-hover/media:scale-[1.03] motion-reduce:transition-none'
const PHOTO = cn('object-cover', ZOOM)

/** Fills the frame of a story with no photograph, so a listing stays on its grid. */
const PLACEHOLDER = cn('from-background-muted to-border-strong size-full bg-linear-to-br', ZOOM)

/** The focus ring every text link on a card takes. */
const TEXT_LINK = 'outline-ring rounded-4xs focus-visible:outline-2 focus-visible:outline-offset-2'

/** "Read more", worn like the bag's Remove: a ghost button set as an underlined link. */
const READ_MORE = cn(buttonVariants({ variant: 'ghost', size: 'sm' }), TEXT_ACTION)

interface PostCardProps {
  post: PostSummary
  /**
   * Rendered width at each breakpoint, for `next/image` to pick a source.
   * @default the journal grid's slot widths
   */
  sizes?: string
  className?: string
}

/**
 * A story as a card: its photograph, title, section and date, and "Read more".
 * The title is the link a keyboard meets, and the photograph and "Read more"
 * are silent second ones, so the section can be a link of its own. The title
 * carries `post-card-title`, which `LoadMore` focuses.
 */
export function PostCard({ post, sizes = CARD_SIZES, className }: PostCardProps) {
  const href = postPath(post.slug)

  return (
    <article className={cn('flex flex-col gap-4', className)}>
      <Link href={href} aria-hidden tabIndex={-1} className={MEDIA}>
        {post.image ? (
          <Image src={post.image.src} alt="" fill sizes={sizes} className={PHOTO} />
        ) : (
          <div className={PLACEHOLDER} />
        )}
      </Link>

      <div className="flex flex-1 flex-col items-start gap-2 px-4">
        <h3 className="text-foreground-intense line-clamp-3 text-lg text-balance md:text-xl">
          <Link href={href} data-slot="post-card-title" className={TEXT_LINK}>
            {post.title}
          </Link>
        </h3>
        <PostMeta post={post} />
        <p className="mt-auto pt-1">
          <ReadMore href={href}>Read more</ReadMore>
        </p>
      </div>
    </article>
  )
}

/**
 * The story a listing opens with: the photograph across 7 columns and the
 * title, excerpt, and meta beside it from `lg`, stacked below. Linked like
 * {@link PostCard}, and its title is focused the same way.
 */
export function PostLead({ post }: { post: PostSummary }) {
  const href = postPath(post.slug)

  return (
    <article className="grid gap-6 lg:grid-cols-12 lg:items-center lg:gap-8">
      <Link href={href} aria-hidden tabIndex={-1} className={cn(MEDIA, 'lg:col-span-7')}>
        {post.image ? (
          <Image src={post.image.src} alt="" fill preload sizes={LEAD_SIZES} className={PHOTO} />
        ) : (
          <div className={PLACEHOLDER} />
        )}
      </Link>

      <div className="flex flex-col items-start gap-3 px-4 sm:gap-4 lg:col-span-5 lg:px-0">
        <PostMeta post={post} className="text-sm" />
        <h2 className="text-foreground-intense text-2xl font-medium text-balance md:text-3xl xl:text-4xl">
          <Link href={href} data-slot="post-card-title" className={TEXT_LINK}>
            {post.title}
          </Link>
        </h2>
        <p className="max-w-md text-pretty md:text-lg">{post.excerpt}</p>
        <p className="pt-1 sm:pt-2">
          <ReadMore href={href}>Read the story</ReadMore>
        </p>
      </div>
    </article>
  )
}

/** A link to the story for the pointer only: the title already names it to a keyboard and a screen reader. */
function ReadMore({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} aria-hidden tabIndex={-1} data-slot="button" className={READ_MORE}>
      {children}
    </Link>
  )
}

/** A story's section, linking to its listing, and the day it went out, in mono capitals. */
function PostMeta({ post, className }: { post: PostSummary; className?: string }) {
  return (
    <p className={cn('text-foreground-muted flex flex-wrap gap-x-3 font-mono text-xs uppercase', className)}>
      <Link href={blogCategoryPath(post.category.slug)} className={cn(TEXT_LINK, 'hover:text-foreground-intense')}>
        {post.category.name}
      </Link>
      <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>
    </p>
  )
}
