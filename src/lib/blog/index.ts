import 'server-only'

import { cache } from 'react'
import type { DemoSlug } from '@/lib/demos'
import { LATEST_POSTS, RELATED_POSTS, type BlogListing, type PostQuery, type PostSummary } from './blog'
import { contentAdapter } from './config'

/*
 * The blog facade: the single entry point blog screens call for posts.
 *
 *     import { getBlog } from '@/lib/blog'
 *     const blog = getBlog('electronics')
 *     const { posts } = await blog.listPosts({ categorySlug: 'guides' })
 *
 * Every read is scoped to a demo, the way `getCommerce` is, because the template
 * hosts several storefronts side by side and an electronics blog is not a
 * fashion blog. The client delegates to whichever `contentAdapter` is active in
 * `./config`, so screens stay backend-agnostic.
 *
 * Reads are wrapped in React's `cache` to de-duplicate identical calls within a
 * single request (the article page and its related row both asking for the same
 * post). Request-scoped memoization only; nothing persists between requests.
 *
 * 4 of the reads are not delegation. `listFeatured`, `getLead`, `getListing`,
 * and `getRelatedPosts` compose ordinary `listPosts` calls instead of adding methods
 * every adapter would have to implement, which is the same trade
 * `getRelatedProducts` makes in the commerce facade.
 *
 * These functions are server-only. Client Components receive their data as props
 * from a Server Component. Import display types and the URL helpers from
 * `@/lib/blog/blog`, which is safe on the client.
 */

const listPosts = cache((demo: DemoSlug, query?: PostQuery) => contentAdapter.listPosts(demo, query))
const getPost = cache((demo: DemoSlug, slug: string) => contentAdapter.getPost(demo, slug))
const listCategories = cache((demo: DemoSlug) => contentAdapter.listCategories(demo))

/**
 * The posts the storefront's homepage carries: handpicked, newest first, and
 * only ones carrying artwork.
 *
 * Deliberately no fallback to the newest. The row is an editorial choice
 * somebody makes, and a homepage that quietly fills itself with whatever
 * published last is the thing handpicking exists to prevent. It comes back empty
 * until a post is picked, and the section renders nothing.
 */
const listFeatured = cache(async (demo: DemoSlug, limit: number) => {
  const { posts } = await listPosts(demo, { featured: true, withImage: true, pageSize: limit })
  return posts
})

/**
 * The post a scope opens with: its handpicked one, or its newest where nothing
 * is picked, so a section always has something to lead with. `null` only for a
 * section holding nothing.
 */
const getLead = cache(async (demo: DemoSlug, categorySlug: string | undefined) => {
  const { posts: picked } = await listPosts(demo, { categorySlug, featured: true, pageSize: 1 })
  const [lead] = picked.length ? picked : (await listPosts(demo, { categorySlug, pageSize: 1 })).posts
  return lead ?? null
})

/**
 * A whole listing page for a scope: the {@link getLead} post, the column beside
 * it, and the grid below.
 *
 * The lead and the column are drawn on the first page only; from page 2 the
 * reader is in the grid, and repeating the lead above it would cost them a row.
 */
const getListing = cache(async (demo: DemoSlug, categorySlug: string | undefined, page: number) => {
  const lead = await getLead(demo, categorySlug)

  const taken = lead ? [lead.slug] : []
  const { posts: latest } = await listPosts(demo, {
    categorySlug,
    excludeSlugs: taken,
    pageSize: LATEST_POSTS,
  })

  // The lead and the column are the first 4 posts of the listing, not extras on
  // top of it, so the grid pages through what is left of the same list.
  const {
    posts: rest,
    page: current,
    pageCount,
  } = await listPosts(demo, {
    categorySlug,
    excludeSlugs: [...taken, ...latest.map((post) => post.slug)],
    page,
  })

  return {
    lead: current === 1 ? lead : null,
    latest: current === 1 ? latest : [],
    rest,
    page: current,
    pageCount,
  } satisfies BlogListing
})

/**
 * What to read after this post: its `relatedSlugs` first and in the order they
 * were authored, then the newest others in its section, then the newest on the
 * blog, and never itself.
 *
 * Each step only tops the row up, so naming 2 picks gets you those 2 and a third
 * chosen for you, rather than none of them.
 */
const getRelatedPosts = cache(async (demo: DemoSlug, slug: string, limit: number) => {
  const post = await getPost(demo, slug)
  if (!post) return []

  const picked: PostSummary[] = []
  const seen = new Set([slug])

  const topUp = async (query: PostQuery) => {
    if (picked.length >= limit) return
    const { posts } = await listPosts(demo, {
      ...query,
      excludeSlugs: [...seen],
      pageSize: limit - picked.length,
    })
    for (const found of posts) {
      picked.push(found)
      seen.add(found.slug)
    }
  }

  if (post.relatedSlugs?.length) await topUp({ slugs: post.relatedSlugs })
  await topUp({ categorySlug: post.category.slug })
  // A thin section is the normal case on a young blog, not the broken one.
  await topUp({})

  return picked
})

/** A blog client whose reads are scoped to 1 demo storefront. */
export interface Blog {
  /** A filtered page of posts, newest first. Stream it behind `<Suspense>` for the loading state. */
  listPosts: (query?: PostQuery) => ReturnType<typeof listPosts>
  /** A single post by slug, body included, or `null`. */
  getPost: (slug: string) => ReturnType<typeof getPost>
  /** The blog's sections, in presentation order. Stable, so it renders into the shell. */
  listCategories: () => ReturnType<typeof listCategories>
  /** The handpicked posts the homepage carries. Empty until somebody picks one. */
  listFeatured: (limit: number) => ReturnType<typeof listFeatured>
  /** The post the blog, or 1 section of it, opens with: handpicked, else newest. */
  getLead: (categorySlug: string | undefined) => ReturnType<typeof getLead>
  /** A whole listing page for the blog, or for 1 section of it. */
  getListing: (categorySlug: string | undefined, page: number) => ReturnType<typeof getListing>
  /** What to read after a post, never itself. Empty for a post that is no longer published. @default RELATED_POSTS of them */
  getRelatedPosts: (slug: string, limit?: number) => ReturnType<typeof getRelatedPosts>
}

/** Returns a {@link Blog} client whose reads are scoped to `demo`. */
export function getBlog(demo: DemoSlug): Blog {
  return {
    listPosts: (query) => listPosts(demo, query),
    getPost: (slug) => getPost(demo, slug),
    listCategories: () => listCategories(demo),
    listFeatured: (limit) => listFeatured(demo, limit),
    getLead: (categorySlug) => getLead(demo, categorySlug),
    getListing: (categorySlug, page) => getListing(demo, categorySlug, page),
    getRelatedPosts: (slug, limit = RELATED_POSTS) => getRelatedPosts(demo, slug, limit),
  }
}
