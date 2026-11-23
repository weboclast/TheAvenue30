import { CampaignCell } from '@/components/fashion/catalog/campaign-cell'
import { ProductCard } from '@/components/fashion/product/product-card'
import { ProductCardSkeleton } from '@/components/fashion/product/product-card-skeleton'
import { toCardProduct } from '@/lib/commerce/card-product'
import type { GridCampaign, Product } from '@/lib/commerce/types'
import { cn } from '@/lib/utils'

/*
 * The listing grid and the shape it holds while the products are still in
 * flight. They live in one file precisely because the column counts have to
 * match: a skeleton that lays out differently from the grid it stands in for is
 * a layout shift with extra steps.
 */
const GRID_CLASSES = 'grid grid-cols-2 gap-x-2 gap-y-8 md:grid-cols-3 xl:grid-cols-4 xl:gap-y-12'

interface ProductGridProps {
  products: Product[]
  /** Campaigns to place among the cards, each at its {@link GridCampaign.position}. */
  campaigns?: GridCampaign[]
  className?: string
}

/** The catalog listing: every garment as a card, 2 across on phones and up to 4 on wide screens. */
export function ProductGrid({ products, campaigns = [], className }: ProductGridProps) {
  const cells: React.ReactNode[] = products.map((product) => (
    <ProductCard key={product.id} product={toCardProduct(product)} />
  ))

  // In position order, so each slot already counts the campaigns before it.
  for (const { campaign, position } of campaigns.toSorted((a, b) => a.position - b.position)) {
    const slot = Math.max(position, 1) - 1
    if (slot >= cells.length) break
    cells.splice(slot, 0, <CampaignCell key={campaign.id} campaign={campaign} />)
  }

  return <div className={cn(GRID_CLASSES, className)}>{cells}</div>
}

/** The grid's placeholder, holding `count` card-shaped boxes in the same columns. */
export function ProductGridSkeleton({ count, className }: { count: number; className?: string }) {
  return (
    <div className={cn(GRID_CLASSES, className)}>
      {Array.from({ length: count }, (_, index) => (
        <ProductCardSkeleton key={index} />
      ))}
    </div>
  )
}
