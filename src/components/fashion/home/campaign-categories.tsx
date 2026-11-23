import Image from 'next/image'
import Link from 'next/link'
import { buttonVariants } from '@appica/ui-react/button'
import { CAMPAIGN_CTA } from '@/components/fashion/campaign-cta'
import { CaretSwap } from '@/components/fashion/caret-swap'
import { CategoryIndex } from '@/components/fashion/home/category-index'
import { RevealVideo } from '@/components/reveal-video'
import { getCommerce } from '@/lib/commerce'
import type { CampaignBanner } from '@/lib/commerce/types'
import { cn } from '@/lib/utils'

/** Half the page from `md`, the whole of it below. */
const PHOTO_SIZES = '(min-width: 48rem) 50vw, 100vw'

interface CampaignCategoriesProps {
  /** The department whose home campaign and categories it shows. Omit for the whole store's. */
  department?: string
}

/**
 * The home's campaign beside an index of the categories to shop, in 2 panels of
 * equal height. Renders nothing for a department without categories.
 */
export async function CampaignCategories({ department }: CampaignCategoriesProps) {
  const commerce = getCommerce('fashion')
  const [[campaign], tree] = await Promise.all([
    commerce.getPlacementCampaigns('home', department),
    commerce.getCategoryTree(),
  ])
  const categories = department ? tree.find((category) => category.slug === department)?.children : tree
  if (!categories?.length) return null

  const links = [
    ...categories.map(({ name, slug, image }) => ({ label: name, href: `/catalog/${slug}`, image })),
    { label: 'Shop all', href: department ? `/catalog/${department}` : '/catalog' },
  ]

  return (
    <section className="px-2 pb-16 md:pb-20 xl:pb-24">
      <div className={cn('grid gap-2', campaign && 'md:grid-cols-2')}>
        {campaign ? <CampaignPanel campaign={campaign} /> : null}

        <CategoryIndex
          title="Shop by category"
          links={links}
          className="bg-background-muted rounded-sm px-6 py-12 sm:px-10 sm:py-16 md:px-12 md:py-18 lg:py-20 xl:px-20 xl:py-22 2xl:px-31"
        />
      </div>
    </section>
  )
}

/** The campaign's title and call to action over its photograph or clip. Only the copy is a link. */
function CampaignPanel({ campaign }: { campaign: CampaignBanner }) {
  const { title, image, clip, focus, href, ctaLabel = 'Explore' } = campaign
  const objectPosition = focus && `${focus.x}% ${focus.y}%`

  return (
    <div className="bg-background-muted relative isolate flex aspect-4/5 flex-col items-center justify-end overflow-hidden rounded-sm p-6 text-center text-white sm:aspect-4/3 md:aspect-auto md:min-h-120 md:p-10 xl:min-h-160">
      <Link
        href={href}
        className="group peer outline-ring-light inline-flex flex-col items-center gap-4 rounded-md focus-visible:outline-2 focus-visible:outline-offset-4"
      >
        <span className="max-w-80 font-mono text-xl text-balance uppercase lg:text-2xl">{title}</span>
        <span data-slot="button" className={cn(buttonVariants({ variant: 'light' }), CAMPAIGN_CTA)}>
          {ctaLabel}
          <CaretSwap data-icon="end" />
        </span>
      </Link>

      {/* After the link, so its hover reaches the media as `peer-hover`. */}
      <div className="absolute inset-0 -z-20 transition-transform duration-700 ease-out motion-safe:peer-hover:scale-[1.03] motion-reduce:transition-none">
        <Image src={image.src} alt="" fill sizes={PHOTO_SIZES} style={{ objectPosition }} className="object-cover" />
        {clip ? (
          <RevealVideo src={clip} style={{ objectPosition }} className="absolute inset-0 size-full object-cover" />
        ) : null}
      </div>
      <span
        aria-hidden
        className="absolute inset-x-0 bottom-0 -z-10 h-1/2 bg-linear-to-b from-transparent to-black/50"
      />
    </div>
  )
}
