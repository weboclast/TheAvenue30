import type { Metadata } from 'next'
import localFont from 'next/font/local'
import { StoreProviders } from '@/components/store-providers'
import { getCart } from '@/lib/cart'
import { CartProvider } from '@/lib/cart/cart-context'
import { geistMono } from '@/lib/fonts'
import { getWishlists } from '@/lib/wishlist'
import { WishlistProvider } from '@/lib/wishlist/wishlist-context'
import './globals.css'

export const metadata: Metadata = {
  title: {
    template: '%s | The Avenue 30',
    default: 'The Avenue 30 | Clothing, shoes & accessories',
  },
  description:
    'Shop clothing, shoes, and accessories for women and men, made to last and repaired free for life. Free delivery over $150 and 30-day returns.',
}

export { viewport } from '@/lib/viewport'

/* Satoshi, by Indian Type Foundry. Its license forbids sharing the file, so
 * `pnpm dev` and `pnpm build` save it from Fontshare first (scripts/fontshare.mjs).
 * One variable file covers the whole 300-900 range, so `weight` is a range and
 * not a list of faces. `globals.css` points `--font-sans` at the variable this
 * exposes. */
const satoshi = localFont({
  src: './fonts/fontshare/satoshi/Satoshi-Variable.woff2',
  weight: '300 900',
  variable: '--font-satoshi',
})

/**
 * The root layout. It owns the document, so the stylesheet it imports reaches
 * portalled overlays as well as the page.
 *
 * Satoshi replaces the default sans and `globals.css` moves the base palette
 * onto Tailwind's neutral. The mono stays Geist Mono, which is why
 * `globals.css` still supplies `--font-mono`.
 *
 * The 2 stores sit here rather than in each group because what a shopper has in
 * the cart and saved does not change when they start paying, where the chrome
 * does. There is no comparison store: weighing 2 sweaters on a spec table is
 * not how anybody buys clothes.
 */
export default async function FashionLayout({ children }: LayoutProps<'/'>) {
  // Awaited rather than streamed, so the header's counts and every product
  // card's heart are right in the first paint. Both are cookie reads the demo
  // adapter answers with no artificial latency.
  const [cart, wishlists] = await Promise.all([getCart('fashion'), getWishlists('fashion')])

  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${satoshi.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="flex min-h-full flex-col font-sans">
        <StoreProviders>
          <CartProvider demo="fashion" cart={cart}>
            <WishlistProvider demo="fashion" wishlists={wishlists}>
              {children}
            </WishlistProvider>
          </CartProvider>
        </StoreProviders>
      </body>
    </html>
  )
}
