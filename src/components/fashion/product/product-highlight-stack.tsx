import { ProductBuyBox } from '@/components/fashion/product/product-buy-box'
import { ProductGallery } from '@/components/fashion/product/product-gallery'
import { ProductInfo } from '@/components/fashion/product/product-info'
import { ProductPerks } from '@/components/fashion/product/product-perks'
import { ProductQuestions } from '@/components/fashion/product/product-questions'
import { StickyColumn } from '@/components/sticky-column'
import type { Product, ProductReviewList } from '@/lib/commerce/types'

interface ProductHighlightStackProps {
  product: Product
  /** The categories above the product, department first. */
  trail: { label: string; href: string }[]
  /** The product's reviews, for the fit scale and the sizing advice. */
  reviews: ProductReviewList
}

/**
 * The top of the product page with the photographs stacked down the middle,
 * the buy box pinned on one side and the details on the other. One of the 2
 * layouts the demo ships; the product page picks one, and a store keeps one.
 *
 * 3 columns from `xl`. Below that the side columns share one, and their wrapper
 * steps aside with `contents` once they split.
 */
export function ProductHighlightStack({ product, trail, reviews }: ProductHighlightStackProps) {
  return (
    <section
      data-slot="product-highlight"
      className="grid gap-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:gap-x-10 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.25fr)_minmax(0,1fr)] xl:gap-x-12 2xl:gap-x-16"
    >
      <ProductGallery layout="stack" className="lg:row-start-1 xl:col-start-2" />

      <StickyColumn className="flex flex-col gap-10 lg:sticky lg:col-start-2 lg:row-start-1 lg:self-start lg:pt-6 xl:contents">
        <StickyColumn className="xl:sticky xl:col-start-1 xl:row-start-1 xl:self-start xl:pt-14">
          <ProductBuyBox trail={trail} fit={reviews.fit} />
        </StickyColumn>
        <StickyColumn className="flex flex-col gap-6 xl:sticky xl:col-start-3 xl:row-start-1 xl:self-start xl:pt-14">
          <ProductPerks />
          <ProductInfo product={product} />
          <ProductQuestions sizing={reviews.summary?.sizing} />
        </StickyColumn>
      </StickyColumn>
    </section>
  )
}
