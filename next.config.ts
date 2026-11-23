import type { NextConfig } from 'next'

/**
 * Where the sample photos and videos live: Appica's media server, since they
 * are not part of the download. Keep in step with `scripts/download-media.mjs`.
 */
const DEMO_MEDIA_URL = 'https://media.appica.dev/appica-store'

const nextConfig: NextConfig = {
  experimental: {
    agentUpgrade: 'security',
  },

  /*
   * Every `/demo/…` path loads from the media server, unless `public/demo/` holds
   * the same file, which `pnpm download-media` saves for working offline.
   * `afterFiles` runs after the files in `public/` but before the catch-all
   * routes, which would otherwise answer every missing file with a page.
   *
   * Delete this alongside the demo adapter: a real backend serves its own media.
   */
  async rewrites() {
    return {
      afterFiles: [{ source: '/demo/:path*', destination: `${DEMO_MEDIA_URL}/demo/:path*` }],
    }
  },

  images: {
    /*
     * Instagram serves feed photos from per-region `scontent-*` subdomains, so
     * the host has to be matched by wildcard. Only the Instagram section reads
     * this, and only once `INSTAGRAM_ACCESS_TOKEN` is set (see
     * `src/lib/instagram.ts`). Drop it if you remove that section.
     */
    remotePatterns: [{ protocol: 'https', hostname: '**.cdninstagram.com' }],
  },
}

export default nextConfig
