'use client'

import { Heart, HeartFilled, Scales, ScalesFilled } from '@appica/icons-react'
import { useToastManager } from '@appica/ui-react/toast'
import { ProductActionToggle } from '@/components/product/product-action-toggle'
import { useComparison } from '@/lib/comparison/comparison-context'
import { errorToast } from '@/lib/toast'
import { useWishlist } from '@/lib/wishlist/wishlist-context'

/*
 * Wishlist and compare, the 2 controls that sit over a product's artwork. Only
 * the icons and wording are fixed here. Size, shape, and placement stay with
 * the caller, and so does which of the 2 to show: the Fashion card carries the
 * heart alone, where a storefront that compares takes both.
 *
 * Both are wired here rather than by each screen: each reads its own store,
 * writes through it, and reports a refusal, so a card and a product page can
 * never disagree about what is saved or what is being weighed up.
 */

type ToggleProps = Omit<
  React.ComponentProps<typeof ProductActionToggle>,
  'icon' | 'activeIcon' | 'label' | 'activeClassName' | 'active' | 'onActiveChange'
> & { productSlug: string }

interface WishlistToggleProps extends ToggleProps {
  /**
   * The outline icon shown while nothing is saved. The filled heart it turns
   * into is fixed, so whatever is passed has to read as its empty twin.
   * @default a plain heart
   */
  icon?: React.ReactNode
}

/**
 * Saves a product to the wishlist, or takes it back off. It reads its own state
 * from `@/lib/wishlist`, so it needs no more than the product's slug, and taking
 * it off removes it from every list holding it.
 */
export function WishlistToggle({ productSlug, icon = <Heart />, ...props }: WishlistToggleProps) {
  const { saved, setSaved } = useWishlist()
  const toast = useToastManager()

  const change = async (next: boolean) => {
    const result = await setSaved(productSlug, next)
    if (result.ok) return

    toast.add(errorToast('Could not update your wishlist', result.error))
    // Thrown so the toggle settles back into the state the store is really in.
    throw new Error(result.error)
  }

  return (
    <ProductActionToggle
      icon={icon}
      activeIcon={<HeartFilled />}
      activeClassName="text-foreground-intense"
      label="Add to wishlist"
      active={saved(productSlug)}
      onActiveChange={change}
      {...props}
    />
  )
}

/**
 * Puts a product up against the others being compared, or takes it back out. It
 * reads its own state from `@/lib/comparison`, so it needs no more than the
 * product's slug, and adding one opens the compare bar wherever the shopper is.
 */
export function CompareToggle({ productSlug, ...props }: ToggleProps) {
  const { compared, setCompared } = useComparison()

  const change = async (next: boolean) => {
    const result = await setCompared(productSlug, next)
    // A full set is the usual refusal, and the compare bar is what says so: it
    // holds the products this one could not join. Thrown so the toggle settles
    // back into the state the store is really in.
    if (!result.ok) throw new Error(result.error)
  }

  return (
    <ProductActionToggle
      icon={<Scales />}
      activeIcon={<ScalesFilled />}
      activeClassName="text-foreground-intense"
      label="Add to compare"
      active={compared(productSlug)}
      onActiveChange={change}
      {...props}
    />
  )
}
