import Image from 'next/image'
import type { PostBlock } from '@/lib/blog/blog'
import { cn } from '@/lib/utils'

interface PostBodyProps {
  blocks: PostBlock[]
  /** A figure's rendered width at each breakpoint, for `next/image` to pick a source: the reading column's. */
  figureSizes: string
  className?: string
}

/**
 * An article body, block by block, set in the theme's own type and tokens
 * rather than a prose stylesheet, so dark mode and RTL hold with nothing extra.
 * A demo restyles it from its stylesheet through the `post-heading`,
 * `post-quote`, `post-figure-image`, and `post-caption` slots.
 *
 * Add a variant to `PostBlock` and a case here; the 2 are checked against each
 * other, so a new block cannot be added and forgotten.
 */
export function PostBody({ blocks, figureSizes, className }: PostBodyProps) {
  return (
    <div data-slot="post-body" className={cn('flex flex-col gap-4', className)}>
      {blocks.map((block, index) => (
        // Keyed by index: blocks carry no identity of their own, and the body is
        // rendered whole rather than reordered.
        <Block key={index} block={block} figureSizes={figureSizes} />
      ))}
    </div>
  )
}

function Block({ block, figureSizes }: { block: PostBlock; figureSizes: string }) {
  switch (block.type) {
    case 'paragraph':
      return <p className="text-base leading-relaxed text-pretty md:text-lg">{block.text}</p>

    case 'heading': {
      const Heading = block.level === 3 ? 'h3' : 'h2'
      return (
        <Heading
          data-slot="post-heading"
          className={cn(
            'text-foreground-intense mt-6 font-medium text-balance',
            block.level === 3 ? 'text-lg md:text-xl' : 'text-xl md:text-2xl',
          )}
        >
          {block.text}
        </Heading>
      )
    }

    case 'list': {
      const List = block.ordered ? 'ol' : 'ul'
      return (
        <List
          className={cn(
            'flex flex-col gap-2 ps-6 text-base leading-relaxed md:text-lg',
            block.ordered ? 'list-decimal' : 'list-disc',
          )}
        >
          {block.items.map((item, index) => (
            <li key={index} className="ps-1 text-pretty">
              {item}
            </li>
          ))}
        </List>
      )
    }

    case 'quote':
      return (
        <figure data-slot="post-quote" className="border-border-strong my-2 flex flex-col gap-3 border-s-2 ps-6">
          <blockquote className="text-foreground-intense text-lg font-medium text-pretty md:text-xl">
            {block.text}
          </blockquote>
          {block.attribution ? (
            <figcaption data-slot="post-caption" className="text-foreground-muted text-sm">
              {block.attribution}
            </figcaption>
          ) : null}
        </figure>
      )

    case 'image':
      return (
        <figure className="my-2 flex flex-col gap-3">
          <Image
            data-slot="post-figure-image"
            src={block.image.src}
            alt={block.image.alt}
            width={block.image.width}
            height={block.image.height}
            sizes={figureSizes}
            className="w-full rounded-xl object-cover"
          />
          {block.caption ? (
            <figcaption data-slot="post-caption" className="text-foreground-muted text-sm text-balance">
              {block.caption}
            </figcaption>
          ) : null}
        </figure>
      )

    case 'html':
      // Trusted markup from the store's own CMS, which is the only thing an
      // adapter may put in this block. Never anything a visitor typed.
      return <div className="text-base leading-relaxed md:text-lg" dangerouslySetInnerHTML={{ __html: block.html }} />
  }
}
