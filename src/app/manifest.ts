import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'The Avenue 30',
    short_name: 'The Avenue 30',
    description:
      'A multipurpose Next.js and React eCommerce storefront. Cart, checkout, accounts, and order tracking work end to end, ready for your backend.',
    lang: 'en',
    dir: 'ltr',
    start_url: '/',
    scope: '/',
    icons: [
      {
        src: '/app-icons/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/app-icons/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/app-icons/icon-maskable-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
    background_color: '#ffffff',
    theme_color: '#0f172b',
    display: 'standalone',
  }
}
