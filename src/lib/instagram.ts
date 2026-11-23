import 'server-only'

import { cache } from 'react'
import type { DemoSlug } from '@/lib/demos'

/*
 * The Instagram feed behind the storefront's "Follow us on Instagram" strip.
 *
 * Out of the box this returns the bundled placeholder posts, so the template
 * renders with no account, no token, and no network call. Going live is a
 * configuration change rather than a code change: set the two variables below
 * in `.env.local` and the same function reads the real account instead. No
 * component changes, no new dependency.
 *
 *     INSTAGRAM_HANDLE=yourbrand
 *     INSTAGRAM_ACCESS_TOKEN=IGAA...
 *
 * The token is a long-lived user access token from the Instagram API with
 * Instagram Login, Meta's replacement for the retired Basic Display API. It
 * lasts 60 days and is refreshable, so renew it on a schedule. See
 * https://developers.facebook.com/docs/instagram-platform for the app setup.
 *
 * Live posts are served from Instagram's CDN, which `next.config.ts` already
 * allows as a remote image host.
 *
 * A failed read falls back to the placeholders instead of dropping the
 * section, so an expired token degrades the page rather than breaking it.
 * Once a real account is wired up, delete `PLACEHOLDER_POSTS` and the
 * images under `public/demo/<demo>/instagram/`.
 */

/** Posts to request. The strip loops, so it needs enough to fill a wide screen. */
const FEED_LIMIT = 12

/** Media fields to request. `thumbnail_url` covers videos, which carry no image of their own. */
const MEDIA_FIELDS = 'id,permalink,media_type,media_url,thumbnail_url'

const MEDIA_ENDPOINT = 'https://graph.instagram.com/me/media'

/** How long a fetched feed is reused before Next revalidates it, in seconds. */
const REVALIDATE_SECONDS = 3600

/**
 * One post in the feed strip, reduced to what a storefront shows. Field names
 * follow Instagram's media object, so a live response maps across without
 * renaming anything.
 */
export interface InstagramPost {
  /** Media id, unique within the feed. */
  id: string
  /** Square image to display. Videos contribute their thumbnail instead. */
  imageUrl: string
  /** The post's own page on instagram.com, for a strip that links each tile. Absent on a placeholder. */
  permalink?: string
}

const handle = process.env.INSTAGRAM_HANDLE

/**
 * The account the strip names and links to. Set `INSTAGRAM_HANDLE` and both
 * follow it. Without it the demo shows `@appica` with no `url`, so the template
 * ships without linking anyone to a real profile.
 */
export const instagramProfile = {
  handle: handle ?? 'appica',
  url: handle ? `https://www.instagram.com/${handle}/` : undefined,
}

/** The shape Instagram returns for one media object, narrowed to the requested fields. */
interface InstagramMedia {
  id: string
  permalink: string
  media_type: 'IMAGE' | 'VIDEO' | 'CAROUSEL_ALBUM'
  media_url?: string
  thumbnail_url?: string
}

/**
 * The posts behind the strip: the live account when `INSTAGRAM_ACCESS_TOKEN`
 * is set, the demo's bundled placeholders otherwise. The account is the same
 * for every demo, so `demo` only picks the placeholders. Wrapped in React's
 * `cache` so repeated reads in one request share a single call, and
 * revalidated every {@link REVALIDATE_SECONDS} across requests.
 */
export const getInstagramFeed = cache(async (demo: DemoSlug): Promise<InstagramPost[]> => {
  const token = process.env.INSTAGRAM_ACCESS_TOKEN
  if (!token) return placeholderFeed(demo)

  try {
    const url = new URL(MEDIA_ENDPOINT)
    url.searchParams.set('fields', MEDIA_FIELDS)
    url.searchParams.set('limit', String(FEED_LIMIT))
    url.searchParams.set('access_token', token)

    const response = await fetch(url, { next: { revalidate: REVALIDATE_SECONDS } })
    if (!response.ok) throw new Error(`Instagram responded with ${response.status}`)

    const { data } = (await response.json()) as { data: InstagramMedia[] }
    const posts = data.flatMap(toPost)
    return posts.length > 0 ? posts : placeholderFeed(demo)
  } catch (error) {
    // One social widget should never cost the visitor the page. Swap the log
    // for your error reporter; the fallback keeps the section rendering.
    console.error('Instagram feed unavailable, showing the placeholder posts instead.', error)
    return placeholderFeed(demo)
  }
})

/** Maps one media object to a post, dropping anything with no image to show. */
function toPost(media: InstagramMedia): InstagramPost[] {
  const imageUrl = media.media_type === 'VIDEO' ? media.thumbnail_url : media.media_url
  if (!imageUrl) return []

  return [{ id: media.id, imageUrl, permalink: media.permalink }]
}

/**
 * How many square photos each demo bundles under `public/demo/<demo>/instagram/`,
 * named `1.webp` onward. They stand in for a real account so the template has
 * something to show on first run, and they are what the strip falls back to
 * when a live read fails.
 */
const PLACEHOLDER_POSTS: Partial<Record<DemoSlug, number>> = {}

/** A demo's bundled feed, empty for a demo that bundles none. */
function placeholderFeed(demo: DemoSlug): InstagramPost[] {
  return Array.from({ length: PLACEHOLDER_POSTS[demo] ?? 0 }, (_, index) => ({
    id: `placeholder-${index + 1}`,
    imageUrl: `/demo/${demo}/instagram/${index + 1}.webp`,
  }))
}
