import type { ContentAdapter } from '@/lib/blog/adapter'
import {
  BLOG_PAGE_SIZE,
  type Post,
  type PostCategory,
  type PostList,
  type PostQuery,
  type PostSummary,
} from '@/lib/blog/blog'
import { contentDatasets } from './data'
import type { ContentDataset, PostSource } from './data'

/*
 * The bundled content adapter: the blog as a set of TypeScript files under
 * `./data/`, so the template runs with no CMS behind it.
 *
 * Everything is in memory and every method is still async, which is what keeps a
 * page's loading and streaming behavior identical once a real CMS replaces this.
 * Reads are side-effect free and hold no state between requests.
 */

/**
 * Artificial latency, so a `<Suspense>` boundary and its skeleton are visible in
 * development instead of resolving before the first paint. Set
 * `BLOG_LATENCY_MS=0` to turn it off; it is skipped in production.
 */
const LATENCY_MS = process.env.NODE_ENV === 'production' ? 0 : Number(process.env.BLOG_LATENCY_MS ?? 250)

/** An empty page, which is what a demo with no blog authored returns. */
const EMPTY: PostList = { posts: [], total: 0, page: 1, pageCount: 1 }

export const demoContentAdapter: ContentAdapter = {
  async listPosts(demo, query = {}) {
    await latency()

    const dataset = contentDatasets[demo]
    if (!dataset) return EMPTY

    const matched = select(dataset, query)
    const { pageSize = BLOG_PAGE_SIZE, page = 1 } = query
    const pageCount = Math.max(1, Math.ceil(matched.length / pageSize))
    const current = Math.min(Math.max(1, page), pageCount)

    return {
      posts: matched.slice((current - 1) * pageSize, current * pageSize).map((post) => summarize(dataset, post)),
      total: matched.length,
      page: current,
      pageCount,
    }
  },

  async getPost(demo, slug) {
    await latency()

    const dataset = contentDatasets[demo]
    const post = dataset?.posts.find((candidate) => candidate.slug === slug)
    return dataset && post ? resolve(dataset, post) : null
  },

  async listCategories(demo) {
    const dataset = contentDatasets[demo]
    if (!dataset) return []

    // Only sections something is filed under, so a chip can never strand a
    // reader on an empty listing.
    const filed = new Set(dataset.posts.map((post) => post.categorySlug))
    return dataset.categories.filter((category) => filed.has(category.slug))
  },
}

/** The posts a query matches, in dataset order. */
function select(dataset: ContentDataset, query: PostQuery): PostSource[] {
  const { slugs, categorySlug, featured, withImage, excludeSlugs } = query

  // `slugs` names an exact set in an exact order, so it answers on its own: it
  // is how the facade reads a curated list back out of the blog.
  if (slugs) {
    const bySlug = new Map(dataset.posts.map((post) => [post.slug, post]))
    return slugs.flatMap((slug) => {
      const post = bySlug.get(slug)
      return post && !excludeSlugs?.includes(slug) ? [post] : []
    })
  }

  return dataset.posts.filter(
    (post) =>
      (!categorySlug || post.categorySlug === categorySlug) &&
      (!featured || post.featured === true) &&
      (!withImage || Boolean(post.image)) &&
      !excludeSlugs?.includes(post.slug),
  )
}

/** A whole post, with its section and byline resolved. */
function resolve(dataset: ContentDataset, post: PostSource): Post {
  const { categorySlug, authorId, ...rest } = post
  return { ...rest, category: category(dataset, categorySlug), author: author(dataset, authorId) }
}

/** The same, minus the body and the slugs only an article page reads. */
function summarize(dataset: ContentDataset, post: PostSource): PostSummary {
  return {
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt,
    image: post.image,
    category: category(dataset, post.categorySlug),
    author: author(dataset, post.authorId),
    publishedAt: post.publishedAt,
    featured: post.featured,
    tags: post.tags,
  }
}

/**
 * A section by slug. An unregistered one is titled from its slug rather than
 * throwing, so adding a post before its category still renders.
 */
function category(dataset: ContentDataset, slug: string): PostCategory {
  return dataset.categories.find((candidate) => candidate.slug === slug) ?? { slug, name: slug }
}

function author(dataset: ContentDataset, id: string) {
  return dataset.authors[id] ?? { id, name: id, role: 'Contributor' }
}

function latency(): Promise<void> {
  return LATENCY_MS > 0 ? new Promise((resolve) => setTimeout(resolve, LATENCY_MS)) : Promise.resolve()
}
