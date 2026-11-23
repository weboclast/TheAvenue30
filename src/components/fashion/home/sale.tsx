import { Suspense } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { buttonVariants } from '@appica/ui-react/button'
import { Countdown, CountdownSegment } from '@appica/ui-react/countdown'
import { CaretSwap } from '@/components/fashion/caret-swap'
import { ProductShelf, ProductShelfSkeleton } from '@/components/fashion/product/product-shelf'
import { toHref, withFlag, withSort } from '@/lib/catalog-filters'
import { getCommerce } from '@/lib/commerce'
import { toCardProduct } from '@/lib/commerce/card-product'
import { formatPercent } from '@/lib/commerce/format'
import type { Product } from '@/lib/commerce/types'
import { cn } from '@/lib/utils'

const TITLE = 'Mid-season sale'

/** Cards on the shelf. Declared here: a client file's constant reaches a Server Component as a reference. */
const SHELF_SIZE = 12

/** Its own shape stacked above the row, and the row's height beside it from `lg`. */
const BANNER_FRAME = 'aspect-square rounded-sm sm:aspect-video lg:aspect-auto lg:h-full'

const COUNTDOWN_UNITS = [
  { unit: 'days', label: 'Days' },
  { unit: 'hours', label: 'Hours' },
  { unit: 'minutes', label: 'Minutes' },
  { unit: 'seconds', label: 'Seconds' },
] as const

interface SaleProps {
  /** The department whose markdowns fill the shelf. Omit for the whole store's. */
  department?: string
}

/**
 * The sale: a banner counting down to its end beside the markdowns, deepest
 * first, under a heading that opens the same listing. Renders nothing, spacing
 * included, when nothing in stock is marked down.
 */
export function Sale({ department }: SaleProps) {
  const href = toHref(
    department ? `/catalog/${department}` : '/catalog',
    withSort(withFlag(new URLSearchParams(), 'on-sale', true), 'discount'),
  )

  return (
    <Suspense
      fallback={
        <section className="pb-16 md:pb-20 xl:pb-24">
          <ProductShelfSkeleton
            title={TITLE}
            href={href}
            aside={<div className={cn(BANNER_FRAME, 'bg-background-muted')} />}
          />
        </section>
      }
    >
      <SaleShelf department={department} href={href} />
    </Suspense>
  )
}

async function SaleShelf({ department, href }: SaleProps & { href: string }) {
  const { products } = await getCommerce('fashion').listProducts({
    categorySlug: department,
    onSale: true,
    inStock: true,
    sort: 'discount',
    limit: SHELF_SIZE,
  })
  if (!products.length) return null

  return (
    <section className="pb-16 md:pb-20 xl:pb-24">
      <ProductShelf
        title={TITLE}
        href={href}
        products={products.map(toCardProduct)}
        aside={<SaleBanner href={href} deepest={products[0]} />}
      />
    </section>
  )
}

/** The deepest markdown sets the "up to", so the banner never promises more than the shelf holds. */
function SaleBanner({ href, deepest }: { href: string; deepest: Product }) {
  const listPrice = deepest.compareAtPrice?.amount ?? deepest.price.amount
  // Floored to a whole percent, since rounding up would overstate the saving.
  const depth = Math.floor((1 - deepest.price.amount / listPrice) * 100) / 100

  return (
    <div
      className={cn(
        BANNER_FRAME,
        'relative isolate flex flex-col items-center justify-end gap-5 overflow-hidden p-6 text-center text-white md:p-8',
      )}
    >
      <Image
        src="/demo/fashion/banners/sale-rail.webp"
        alt=""
        fill
        sizes="(min-width: 64rem) 50vw, 100vw"
        className="-z-20 object-cover"
      />
      <span
        aria-hidden
        className="absolute inset-x-0 bottom-0 -z-10 h-2/3 bg-linear-to-b from-transparent to-black/60"
      />

      <div className="flex flex-col items-center gap-2">
        <p className="font-mono text-2xl uppercase lg:text-3xl">Up to {formatPercent(depth)} off</p>
        <p className="max-w-80 text-sm text-pretty text-white/80 md:text-base">
          Linen, knits, and leather from this season, while sizes last.
        </p>
      </div>

      <Countdown targetDate={saleEndsAt()} aria-label="Sale ends in" className="gap-5 font-mono">
        {COUNTDOWN_UNITS.map(({ unit, label }) => (
          <span key={unit} className="flex flex-col items-center gap-1">
            <CountdownSegment unit={unit} className="text-2xl lg:text-3xl" />
            <span className="text-xs text-white/80 uppercase">{label}</span>
          </span>
        ))}
      </Countdown>

      <Link href={href} data-slot="button" className={cn(buttonVariants({ variant: 'light' }), 'group')}>
        Shop the sale
        <CaretSwap data-icon="end" />
      </Link>
    </div>
  )
}

/**
 * Demo scaffolding: the sale ends every Monday at 00:00 UTC, so the countdown
 * never runs out. A real store passes the end of the sale it is running.
 */
function saleEndsAt(now = new Date()): string {
  const daysToMonday = (8 - now.getUTCDay()) % 7 || 7
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + daysToMonday)).toISOString()
}
