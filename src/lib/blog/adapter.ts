import type { DemoSlug } from '@/lib/demos'
import type { Post, PostCategory, PostList, PostQuery } from './blog'

/**
 * The contract between the blog screens and whatever publishes the posts. The
 * template ships the demo posts in `./adapters/demo/`, and a CMS is another
 * implementation selected in `./config.ts`. It is apart from `CommerceAdapter`
 * on purpose: a store's blog and its catalog often live in different backends,
 * so either is swapped without the other knowing.
 *
 * Every read is scoped to a `demo`, because an electronics blog is not a fashion
 * blog; a single-site CMS maps every demo to its one blog. Every method is async
 * even here, so loading behaves the same against fixtures and a network. Reads
 * must be side-effect free: they run during rendering.
 */
export interface ContentAdapter {
  /**
   * A filtered page of posts, newest first. Called with no query returns the
   * first page of everything.
   *
   * Summaries rather than whole posts: a card draws none of a body, and asking a
   * CMS for 9 of them is a page of markup nothing renders.
   */
  listPosts(demo: DemoSlug, query?: PostQuery): Promise<PostList>

  /** A single post by slug within a demo, body included, or `null` if it does not exist. */
  getPost(demo: DemoSlug, slug: string): Promise<Post | null>

  /**
   * The blog's sections, in the order to present them. Empty for a blog that
   * files nothing.
   *
   * A category with no published post in it is left out, so the chip row can
   * never strand a reader on an empty listing.
   */
  listCategories(demo: DemoSlug): Promise<PostCategory[]>
}
