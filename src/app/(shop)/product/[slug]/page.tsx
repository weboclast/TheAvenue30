import { Suspense } from 'react'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Skeleton } from '@appica/ui-react/skeleton'
import { RAIL_BLEED } from '@/components/card-rail'
import { AddToBagBar } from '@/components/fashion/product/add-to-bag-bar'
import { ProductHighlightGrid } from '@/components/fashion/product/product-highlight-grid'
import { ProductHighlightStack } from '@/components/fashion/product/product-highlight-stack'
import { ProductReviews } from '@/components/fashion/product/product-reviews'
import { ProductSelectionProvider } from '@/components/fashion/product/product-selection'
import { RelatedProducts } from '@/components/fashion/product/related-products'
import { getSession } from '@/lib/auth'
import { getCommerce } from '@/lib/commerce'
import { productCategoryTrail } from '@/lib/commerce/category-tree'
import { RememberDepartment } from '@/lib/departments/remember-department'
import { cn } from '@/lib/utils'

/**
 * Demo scaffolding: the products that open on the 3-column layout, so the demo
 * shows both. The photo grid is the default and wants 4 shots in every color to
 * fill its rows, so these are the products with fewer. A store keeps one
 * layout, deletes the other's file, and renders the one it kept in place of the
 * choice below.
 */
const THREE_COLUMN_LAYOUT = new Set([
  'breton-stripe-top',
  'brushed-flannel-check-shirt',
  'brushed-mohair-blend-sweater',
  'canvas-tote-bag',
  'coin-pendant-necklace',
  'corduroy-overshirt',
  'cotton-chino-shorts',
  'cotton-field-jacket',
  'cotton-pique-polo',
  'cropped-v-neck-sweater',
  'cross-strap-leather-sandals',
  'cross-strap-leather-slides',
  'crossover-leather-slides',
  'denim-midi-skirt',
  'fitted-button-up-cardigan',
  'floral-print-midi-dress',
  'gathered-leather-pouch',
  'heavyweight-cotton-tee',
  'heavyweight-crew-neck-tee',
  'lambswool-v-neck-sweater',
  'leather-ballet-flats',
  'leather-band-slides',
  'leather-court-sneakers',
  'leather-derby-shoes',
  'leather-penny-loafers',
  'lightweight-windbreaker',
  'linen-blend-suit',
  'linen-blend-tee',
  'linen-camp-collar-shirt',
  'linen-drawstring-trousers',
  'linen-midi-dress',
  'linen-straight-trousers',
  'loopback-cotton-sweatshirt',
  'merino-crew-neck-sweater',
  'merino-quarter-zip-sweater',
  'minimal-leather-sneakers',
  'oversized-poplin-shirt',
  'oxford-button-down-shirt',
  'pleated-wide-leg-trousers',
  'pleated-wool-trousers',
  'pointed-backless-mules',
  'quilted-liner-jacket',
  'raffia-sun-hat',
  'relaxed-cargo-trousers',
  'relaxed-linen-shirt',
  'ribbed-cotton-sweater',
  'ribbed-knit-midi-dress',
  'ribbed-racer-tank',
  'satin-midi-skirt',
  'satin-slip-dress',
  'shawl-collar-cardigan',
  'silk-blend-blouse',
  'slim-cotton-suit',
  'slim-leather-belt',
  'slim-poplin-dress-shirt',
  'slim-stretch-chinos',
  'square-neck-mini-dress',
  'straight-leg-jeans',
  'striped-knit-polo',
  'striped-long-sleeve-tee',
  'striped-poplin-shirt',
  'striped-seersucker-shorts',
  'striped-shirt-dress',
  'suede-chelsea-boots',
  'suede-clog-mules',
  'suede-desert-boots',
  'suede-shopper-bag',
  'suede-slip-on-sneakers',
  'suede-trucker-jacket',
  'suede-western-ankle-boots',
  'terry-cloth-polo',
  'textured-camp-collar-shirt',
  'tie-waist-linen-trousers',
  'tiered-maxi-dress',
  'tiered-maxi-skirt',
  'tortoiseshell-sunglasses',
  'waffle-knit-henley',
  'waffle-knit-vest',
  'washed-linen-shirt',
  'wide-wale-corduroy-trousers',
  'wool-blend-overcoat',
  'wool-blend-scarf',
  'woven-leather-sandals',
  'wrap-midi-dress',
])

/** The container's width on small screens, and near the full width from `lg`, where the photographs lead. */
const FRAME = 'mx-auto w-full px-4 pt-2 pb-16 sm:max-w-[95%] md:pb-20 lg:max-w-480 lg:px-8 lg:pt-0 xl:pb-24 2xl:px-16'

/** The skeleton's shots: the gallery's edge-to-edge rail below `lg`, a grid from it. */
const SHOT_ROW = cn(RAIL_BLEED, 'overflow-hidden lg:m-0 lg:grid lg:p-0')

export async function generateMetadata({ params }: PageProps<'/product/[slug]'>): Promise<Metadata> {
  const product = await getCommerce('fashion').getProduct((await params).slug)
  if (!product) notFound()
  return { title: product.title, description: product.description }
}

export default async function FashionProductPage({ params, searchParams }: PageProps<'/product/[slug]'>) {
  const { slug } = await params

  return (
    // Columns pin at the header bar's 3.5rem plus this padding, the moment the header itself pins.
    <main className="flex flex-1 flex-col pt-2 md:pt-4 md:[--sticky-top:4.5rem]">
      <Suspense fallback={<ProductSkeleton threeColumn={THREE_COLUMN_LAYOUT.has(slug)} />}>
        <ProductPage slug={slug} searchParams={searchParams} />
      </Suspense>
    </main>
  )
}

async function ProductPage({
  slug,
  searchParams,
}: {
  slug: string
  searchParams: PageProps<'/product/[slug]'>['searchParams']
}) {
  const commerce = getCommerce('fashion')
  const [product, reviews, tree, session, query] = await Promise.all([
    commerce.getProduct(slug),
    commerce.getProductReviews(slug),
    commerce.getCategoryTree(),
    getSession(),
    searchParams,
  ])
  if (!product) notFound()

  // Department first, the way the catalog heading trails.
  const levels = productCategoryTrail(tree, product.categoryIds)
  const department = levels[0]
  const trail = [
    { label: 'Home', href: department ? `/${department.slug}` : '/' },
    ...levels.map((level) => ({ label: level.name, href: `/catalog/${level.slug}` })),
  ]
  const Highlight = THREE_COLUMN_LAYOUT.has(slug) ? ProductHighlightStack : ProductHighlightGrid

  return (
    // `?color=` is what a card links with once a shopper has picked one on it.
    <ProductSelectionProvider product={product} color={typeof query.color === 'string' ? query.color : undefined}>
      {department ? <RememberDepartment demo="fashion" slug={department.slug} /> : null}
      <div className={FRAME}>
        <Highlight product={product} trail={trail} reviews={reviews} />
      </div>
      <ProductReviews list={reviews} signedIn={session !== null} />
      <RelatedProducts slug={slug} />
      <AddToBagBar />
    </ProductSelectionProvider>
  )
}

/**
 * The shape the page settles into while the product read is in flight: the
 * photographs and every column beside them, in the layout the product opens on.
 * Keep it in step with the 2 layouts' columns.
 */
function ProductSkeleton({ threeColumn }: { threeColumn: boolean }) {
  // The rail needs a 3rd shot to cut at the viewport's edge; the 3-column grid shows 2.
  const shots = Array.from({ length: 3 + (threeColumn ? 0 : 1) }, (_, index) => (
    <Skeleton
      key={index}
      className={cn(
        'aspect-4/5 w-4/5 shrink-0 rounded-sm md:w-[44%] lg:w-auto',
        threeColumn && index === 2 && 'lg:hidden',
      )}
    />
  ))

  const details = (
    <div className="flex flex-col gap-6">
      <Skeleton className="h-5 w-56" />
      <div className="flex flex-col gap-3">
        <Skeleton className="h-5 w-28" />
        <Skeleton className="h-8 w-4/5" />
        <Skeleton className="h-7 w-20" />
      </div>
      <Skeleton className="h-14 w-32" />
      <Skeleton className="h-24 w-full" />
      <div className="flex flex-col gap-2">
        <Skeleton className="h-12 w-full rounded-full" />
        <Skeleton className="h-12 w-full rounded-full" />
      </div>
    </div>
  )

  const perks = (
    <div className="flex flex-col gap-2">
      <Skeleton className="h-6 w-3/4" />
      <Skeleton className="h-6 w-full" />
      <Skeleton className="h-6 w-4/5" />
    </div>
  )

  const info = (
    <div className="flex flex-col">
      {Array.from({ length: 4 }, (_, index) => (
        <div key={index} className="flex h-13.5 items-center justify-between">
          <Skeleton className="h-5 w-36" />
          <Skeleton className="size-4" />
        </div>
      ))}
    </div>
  )

  const questions = (
    <div className="flex flex-col gap-2">
      <Skeleton className="h-53.5 rounded-sm" />
      <Skeleton className="h-12 rounded-full" />
    </div>
  )

  return (
    <div className={FRAME}>
      {threeColumn ? (
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:gap-x-10 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.25fr)_minmax(0,1fr)] xl:gap-x-12 2xl:gap-x-16">
          <div className={cn(SHOT_ROW, 'lg:row-start-1 xl:col-start-2')}>{shots}</div>
          <div className="flex flex-col gap-10 lg:col-start-2 lg:row-start-1 lg:pt-6 xl:contents">
            <div className="xl:col-start-1 xl:row-start-1 xl:pt-14">{details}</div>
            <div className="flex flex-col gap-6 xl:col-start-3 xl:row-start-1 xl:pt-14">
              {perks}
              {info}
              {questions}
            </div>
          </div>
        </div>
      ) : (
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,28rem)] lg:gap-x-10 xl:grid-cols-[minmax(0,1fr)_minmax(0,31.5rem)]">
          <div className={cn(SHOT_ROW, 'lg:grid-cols-1 lg:self-start xl:grid-cols-2')}>{shots}</div>
          <div className="flex flex-col gap-7 lg:pt-8">
            {details}
            {perks}
            {info}
            {questions}
          </div>
        </div>
      )}
    </div>
  )
}
