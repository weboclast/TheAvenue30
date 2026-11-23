import type { MetadataRoute } from 'next'

/** `/robots.txt`, letting every crawler in. Add a `sitemap` here once the store has one. */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', allow: '/' },
  }
}
