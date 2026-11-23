import { Geist, Geist_Mono } from 'next/font/google'

/*
 * The default typeface pair, shared by the entry pages and by Electronics, which
 * runs on stock Appica UI tokens. A demo that restyles declares its own font
 * beside its root layout and repoints `--font-sans` in its own stylesheet;
 * nothing here has to change for it.
 */

/** The default sans, exposed to CSS as `--font-geist-sans`. */
export const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

/** The default mono, exposed to CSS as `--font-geist-mono`. */
export const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})
