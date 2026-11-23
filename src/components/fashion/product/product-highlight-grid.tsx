import { ProductBuyBox } from '@/components/fashion/product/product-buy-box'
import { ProductGallery } from '@/components/fashion/product/product-gallery'
import { ProductInfo } from '@/components/fashion/product/product-info'
import { ProductPerks } from '@/components/fashion/product/product-perks'
import { ProductQuestions } from '@/components/fashion/product/product-questions'
import { StickyColumn } from '@/components/sticky-column'
import type { Product, ProductReviewList } from '@/lib/commerce/types'

interface ProductHighlightGridProps {
  product: Product
  /** The categories above the product, department first. */
  trail: { label: string; href: string }[]
  /** The product's reviews, for the fit scale and the sizing advice. */
  reviews: ProductReviewList
}

/**
 * The top of the product page with the photographs 2 across and everything else
 * in one column beside them. The default of the 2 layouts the demo ships; the
 * product page picks one, and a store keeps one.
 *
 * Both columns pin, so whichever is shorter holds still while the other scrolls.
 */
export function ProductHighlightGrid({ product, trail, reviews }: ProductHighlightGridProps) {
  return (
    <section
      data-slot="product-highlight"
      className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,28rem)] lg:gap-x-10 xl:grid-cols-[minmax(0,1fr)_minmax(0,31.5rem)]"
    >
      <StickyColumn className="lg:sticky lg:self-start">
        <ProductGallery layout="grid" />
      </StickyColumn>

      <StickyColumn className="flex flex-col gap-7 lg:sticky lg:self-start lg:pt-8">
        <ProductBuyBox trail={trail} fit={reviews.fit} />
        <ProductPerks />
        <ProductInfo product={product} />
        <ProductQuestions sizing={reviews.summary?.sizing} />
      </StickyColumn>
    </section>
  )
}
