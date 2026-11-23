import type { ProductAvailability } from '@/lib/commerce/types'
import { cn } from '@/lib/utils'

const STOCK_PRESETS: Record<ProductAvailability, { label: string; dot: string }> = {
  'in-stock': { label: 'In stock', dot: 'bg-success-strong' },
  preorder: { label: 'Pre-order', dot: 'bg-info-strong' },
  'out-of-stock': { label: 'Out of stock', dot: 'bg-border-strong' },
}

interface StockStatusProps {
  availability: ProductAvailability
  className?: string
}

/** Whether a product can be bought, as a colored dot and a word, the way product cards state it. */
export function StockStatus({ availability, className }: StockStatusProps) {
  const { label, dot } = STOCK_PRESETS[availability]

  return (
    <p data-slot="product-card-availability" className={cn('flex items-center gap-1.5', className)}>
      <span className={cn('size-1.75 rounded-full', dot)} />
      {label}
    </p>
  )
}
