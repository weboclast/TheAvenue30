/**
 * Where the journal lives. Every link into it is built from here, so moving the
 * route is 1 edit. A section sits under `category/` so it can never collide
 * with a story, which is addressed straight off the root.
 */
export const BLOG_PATH = '/blog'

/** One story. */
export function postPath(slug: string): string {
  return `${BLOG_PATH}/${slug}`
}

/** One section, or the whole journal when `slug` is left out. */
export function blogCategoryPath(slug?: string): string {
  return slug ? `${BLOG_PATH}/category/${slug}` : BLOG_PATH
}
