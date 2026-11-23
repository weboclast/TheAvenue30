import type { Post, PostAuthor, PostCategory } from '@/lib/blog/blog'

/**
 * A post as a demo dataset authors it: ids where the API returns whole objects,
 * so a section can be renamed or an author's role corrected in 1 place rather
 * than on every post they wrote.
 */
export interface PostSource extends Omit<Post, 'category' | 'author'> {
  /** By {@link PostCategory.slug}. */
  categorySlug: string
  /** By {@link PostAuthor.id}. */
  authorId: string
}

/** Everything the demo content adapter needs to serve 1 storefront's blog. */
export interface ContentDataset {
  /** Newest first. The adapter keeps this order rather than sorting, so a post can be pinned by moving it. */
  posts: PostSource[]
  /** In the order the chip row offers them. A section nothing is filed under is dropped. */
  categories: PostCategory[]
  /** Keyed by {@link PostAuthor.id}. */
  authors: Record<string, PostAuthor>
}
