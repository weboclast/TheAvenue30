'use client'

import { type RefObject, createContext, use, useRef, useState } from 'react'
import { useToastManager } from '@appica/ui-react/toast'
import { useCart } from '@/lib/cart/cart-context'
import { SIZE_OPTION_ID, productSizes } from '@/lib/commerce/product-options'
import type { Product, ProductColor, ProductMedia, ProductOptionValue } from '@/lib/commerce/types'
import { errorToast } from '@/lib/toast'

/** What the product page's sections share about the garment being bought. Read it with {@link useProductSelection}. */
interface ProductSelection {
  product: Product
  /** Index of the chosen color in `product.colors`. */
  colorIndex: number
  setColorIndex: (index: number) => void
  color: ProductColor | undefined
  /** The chosen color's photography. */
  media: ProductMedia
  /** The product's size run, sold-out sizes included. Empty for an unsized piece. */
  sizes: ProductOptionValue[]
  /** The chosen size. `undefined` until the shopper picks one. */
  size: ProductOptionValue | undefined
  setSize: (id: string) => void
  /** Whether every required choice is made. The add to bag buttons stay disabled until it is. */
  canAddToBag: boolean
  /** Adds the chosen configuration to the bag. Does nothing while {@link ProductSelection.canAddToBag} is false. */
  addToBag: () => Promise<void>
  pending: boolean
  /** The buy box's add to bag button, which the bottom bar stands in for once it has scrolled away. */
  addButtonRef: RefObject<HTMLButtonElement | null>
}

const ProductSelectionContext = createContext<ProductSelection | null>(null)

interface ProductSelectionProviderProps {
  product: Product
  /** The color to open on, by {@link ProductColor.name}, as `?color=` carries it. Unknown falls back to the first. */
  color?: string
  children: React.ReactNode
}

/**
 * Holds the color and size a shopper is choosing, for every section of the
 * product page that shows or buys them, so the page can lay those sections out
 * in any order. It is what lets the 2 layouts share them.
 *
 * No size is picked up front, as fashion stores do: a preselected size is how
 * the wrong one ends up in a bag, so adding waits for one. A run of 1 is the
 * exception.
 */
export function ProductSelectionProvider({ product, color, children }: ProductSelectionProviderProps) {
  const [colorIndex, setColorIndex] = useState(() =>
    Math.max(0, product.colors?.findIndex((entry) => entry.name === color) ?? 0),
  )
  const sizes = productSizes(product)
  const [sizeId, setSizeId] = useState(sizes.length === 1 ? sizes[0].id : undefined)
  const addButtonRef = useRef<HTMLButtonElement>(null)
  const { addItem, pending } = useCart()
  const toast = useToastManager()

  const chosenColor = product.colors?.[colorIndex]
  const size = sizes.find((candidate) => candidate.id === sizeId)
  const canAddToBag = !sizes.length || size !== undefined

  const addToBag = async () => {
    if (!canAddToBag) return

    const result = await addItem({
      productSlug: product.slug,
      color: chosenColor?.name,
      ...(size && { options: { [SIZE_OPTION_ID]: size.id } }),
    })
    // Only a failure is said here: a successful add counts in the cart's `addCount`, which the chrome answers.
    if (!result.ok) toast.add(errorToast('Could not add to your bag', result.error))
  }

  const selection: ProductSelection = {
    product,
    colorIndex,
    setColorIndex,
    color: chosenColor,
    media: chosenColor?.media ?? product.media,
    sizes,
    size,
    setSize: setSizeId,
    canAddToBag,
    addToBag,
    pending,
    addButtonRef,
  }

  return <ProductSelectionContext value={selection}>{children}</ProductSelectionContext>
}

/** The garment being bought and what the shopper has chosen of it. Throws outside a {@link ProductSelectionProvider}. */
export function useProductSelection(): ProductSelection {
  const selection = use(ProductSelectionContext)
  if (!selection) throw new Error('useProductSelection must be used inside a <ProductSelectionProvider>.')
  return selection
}
