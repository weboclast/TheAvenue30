import { Badge, type BadgeProps } from '@appica/ui-react/badge'
import type { ProductBadge } from '@/lib/commerce/types'
import { cn } from '@/lib/utils'

/**
 * Merchandising flag → how it presents. Only a markdown is worth color here, so
 * the one card with money off is the one the eye finds. Electronics colors all
 * 5, which is why each demo keeps its own copy of this map.
 */
const BADGE_PRESETS: Record<ProductBadge, { label: string; variant: BadgeProps['variant'] }> = {
  sale: { label: 'Sale', variant: 'error' },
  new: { label: 'New', variant: 'outline' },
  limited: { label: 'Limited', variant: 'outline' },
  exclusive: { label: 'Exclusive', variant: 'outline' },
  bestseller: { label: 'Bestseller', variant: 'outline' },
}

/** Only one flag fits the corner; the first match on a product wins. */
const BADGE_PRIORITY: ProductBadge[] = ['sale', 'new', 'limited', 'exclusive', 'bestseller']

interface ProductFlagProps extends Omit<BadgeProps, 'variant' | 'children'> {
  badges: ProductBadge[]
}

/**
 * The single pill a garment wears in the corner of its artwork, on the card and
 * on the product page alike. Renders nothing when the product carries no flags,
 * so callers can drop it in unconditionally. The label is authored in sentence, so the wording survives translation.
 */
export function ProductFlag({ badges, className, ...props }: ProductFlagProps) {
  const flag = BADGE_PRIORITY.find((candidate) => badges.includes(candidate))
  if (!flag) return null

  const { label, variant } = BADGE_PRESETS[flag]
  return (
    <Badge variant={variant} className={cn('tracking-wide', className)} {...props}>
      {label}
    </Badge>
  )
}
