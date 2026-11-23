/*
 * The blog's contract: what a post is, how a listing is narrowed, and what the
 * blog's query string means. The only place that knows how `?page=` is spelled.
 *
 * A section is a route rather than a parameter (`/blog/category/guides`), so the
 * breadcrumb has something to name and each section is its own crawlable page.
 * Each demo's `components/<demo>/blog/blog-paths.ts` builds those paths.
 *
 * Safe on both sides of the network: no server-only imports, no browser globals.
 * The reads are `./index.ts`, which is not.
 *
 * Nothing here imports from `@/lib/commerce`, so the module lifts out whole onto
 * a site that sells nothing. The 1 place the 2 meet is `Post.productSlugs`, and
 * the article page resolves those against the catalog itself.
 */

/**
 * Posts in the listing's "browse other posts" grid, per page.
 *
 * The grid only. The lead and the {@link LATEST_POSTS} beside it are 4 more
 * posts off the same list, so the first page of a listing shows 4 above this
 * many, and later pages show this many alone.
 */
export const BLOG_PAGE_SIZE = 12

/** How many handpicked posts the homepage carousel holds. */
export const FEATURED_POSTS = 6

/** Posts in the column beside a listing's lead. */
export const LATEST_POSTS = 3

/** Related posts under an article, where the page asks for no other count. */
export const RELATED_POSTS = 3

/**
 * A picture in the blog, sized so `next/image` reserves its space. Deliberately
 * not `ProductImage`: the same 4 fields, but importing that one would tie this
 * module to the commerce layer for a shape neither owns.
 */
export interface PostImage {
  /** Path under `/public` (demo adapter) or an absolute URL (remote adapters). */
  src: string
  alt: string
  width: number
  height: number
}

/**
 * A section of the blog, e.g. Guides. One per post, because the card's kicker
 * and the article's breadcrumb both name exactly one.
 */
export interface PostCategory {
  slug: string
  name: string
  /** Sits under the heading when the listing is narrowed to this category. */
  description?: string
}

/** Whoever wrote the post, as their byline and their card at the foot of it show them. */
export interface PostAuthor {
  id: string
  name: string
  /** What they do at the store, e.g. `'Audio editor'`. Shown under the name. */
  role: string
  avatar?: PostImage
  /** A sentence or 2 for the card below the article. Bylines never show it. */
  bio?: string
}

/**
 * One paragraph, subhead, or figure of an article body. A union rather than an
 * HTML string, so the page renders each block with this storefront's own
 * components and tokens, and dark mode and RTL hold without a prose stylesheet.
 *
 * A structured CMS maps onto this directly. One that only hands out markup
 * returns a single `html` block and still works; see the note on that variant.
 */
export type PostBlock =
  | { type: 'paragraph'; text: string }
  /** A subhead. `level` is the heading level under the article's `<h1>`. @default 2 */
  | { type: 'heading'; text: string; level?: 2 | 3 }
  | { type: 'list'; items: string[]; ordered?: boolean }
  | { type: 'quote'; text: string; attribution?: string }
  | { type: 'image'; image: PostImage; caption?: string }
  /**
   * Markup the adapter could not break down, rendered as-is. The escape hatch
   * for a CMS whose bodies are HTML. It is trusted markup from the store's own
   * CMS, never anything a visitor typed.
   */
  | { type: 'html'; html: string }

/**
 * A post as a listing shows it: everything a card draws, and no body. The body
 * is the expensive half and no card reads it, which is the same split every CMS
 * makes between its list and detail endpoints.
 */
export interface PostSummary {
  slug: string
  title: string
  /** 1 or 2 sentences under the title. Also the page's meta description. */
  excerpt: string
  /**
   * The artwork. Optional, and plenty of posts ship without one: a card with no
   * image shrinks to its text rather than reserving an empty box, and the
   * homepage carousel only ever offers posts that have one.
   */
  image?: PostImage
  category: PostCategory
  author: PostAuthor
  /** `YYYY-MM-DD`. Formatted for display with `formatDate`. */
  publishedAt: string
  /**
   * Whether an editor picked this one out. The homepage section leads with these
   * and falls back to the newest, so a store that marks none still fills the row.
   */
  featured?: boolean
  /**
   * Labels a card can show beside the section, e.g. the room and the style:
   * `['Bedroom', 'Minimalist']`. Display only; a listing is narrowed by
   * `category`, never by these.
   */
  tags?: string[]
}

/** A post as its own page shows it: the summary, plus everything only the article needs. */
export interface Post extends PostSummary {
  body: PostBlock[]
  /**
   * Products the article is about, by `Product.slug`, in the order to show them.
   * The article page resolves them through the commerce layer and draws the
   * "Shop this article" row; the blog module never looks at them.
   */
  productSlugs?: string[]
  /**
   * Posts to read next, by slug and in order. Beats the category rule the facade
   * falls back to, the way a product's `relatedSlugs` beats its ranking.
   */
  relatedSlugs?: string[]
  /** `YYYY-MM-DD`, where the post has been revised since it went out. */
  updatedAt?: string
}

/** How a listing of posts is narrowed. Every field is optional; no query returns everything. */
export interface PostQuery {
  /** By {@link PostCategory.slug}. */
  categorySlug?: string
  /** Only the editor's picks. */
  featured?: boolean
  /** Only posts that carry artwork, for a placement that has nothing to draw without one. */
  withImage?: boolean
  /** Exactly these posts, in the order named. Everything else is ignored when it is set. */
  slugs?: string[]
  /** Left out of the results, which is how the article page keeps itself off its own related row. */
  excludeSlugs?: string[]
  /** 1-based. @default 1 */
  page?: number
  /** @default BLOG_PAGE_SIZE */
  pageSize?: number
}

/** One page of posts, and how many pages it came from. */
export interface PostList {
  posts: PostSummary[]
  /** Matches across every page, which is what the listing's count reports. */
  total: number
  /** 1-based, clamped to a page that exists. */
  page: number
  pageCount: number
}

/**
 * A whole listing page: what it leads with, the column beside it, and the grid
 * below. The lead and the column are drawn on the first page only, so both are
 * empty from page 2 on.
 */
export interface BlogListing {
  /** The handpicked post for this scope, or its newest. `null` for a section holding nothing. */
  lead: PostSummary | null
  /** The newest posts after the lead, never repeating it. */
  latest: PostSummary[]
  /** Everything the 2 above did not take, paginated. */
  rest: PostSummary[]
  /** 1-based, clamped to a page that exists. */
  page: number
  pageCount: number
}

/** The pace {@link readingMinutes} assumes, in words a minute. */
const WORDS_PER_MINUTE = 220

/** How long a body takes to read, rounded up to whole minutes. Images add nothing. */
export function readingMinutes(body: PostBlock[]): number {
  const text = body.flatMap((block) => {
    switch (block.type) {
      case 'paragraph':
      case 'heading':
      case 'quote':
        return [block.text]
      case 'list':
        return block.items
      case 'html':
        return [block.html.replace(/<[^>]*>/g, ' ')]
      case 'image':
        return []
    }
  })
  const words = text.join(' ').split(/\s+/).filter(Boolean).length
  return Math.max(1, Math.ceil(words / WORDS_PER_MINUTE))
}

/** Reads the page being asked for, always at least `1`. */
export function parseBlogPage(params: URLSearchParams): number {
  return Math.max(1, Number(params.get('page')) || 1)
}

/** Moves to a page, keeping the category. */
export function withBlogPage(params: URLSearchParams, page: number): URLSearchParams {
  const next = new URLSearchParams(params)
  if (page > 1) next.set('page', String(page))
  else next.delete('page')
  return next
}
