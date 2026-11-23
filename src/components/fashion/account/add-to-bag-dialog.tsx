'use client'

import { useId, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Button, buttonVariants } from '@appica/ui-react/button'
import { useToastManager } from '@appica/ui-react/toast'
import { ColorSquares } from '@/components/fashion/product/color-squares'
import { SizePicker } from '@/components/fashion/product/size-picker'
import {
  Overlay,
  OverlayBody,
  OverlayContent,
  OverlayFooter,
  OverlayHeader,
  OverlayTitle,
} from '@/components/overlay-sheet'
import { Price } from '@/components/price'
import { useHeldWhileClosing } from '@/components/use-held-while-closing'
import { useCart } from '@/lib/cart/cart-context'
import { SIZE_OPTION_ID, productSizes } from '@/lib/commerce/product-options'
import type { Product } from '@/lib/commerce/types'
import { errorToast } from '@/lib/toast'

interface AddToBagDialogProps {
  /** The saved piece going into the bag. `null` closes the dialog. */
  product: Product | null
  /** The color to open on, by name: the one its card is showing. */
  color?: string
  onOpenChange: (open: boolean) => void
}

/**
 * Picking the size a saved piece goes into the bag in, since a wishlist keeps
 * products rather than sizes. Adding waits for a size, as it does on the
 * product page. A successful add opens the bag drawer, so only a refusal is
 * said here.
 */
export function AddToBagDialog({ product, color, onOpenChange }: AddToBagDialogProps) {
  const shown = useHeldWhileClosing(product, product !== null)
  const shownColor = useHeldWhileClosing(color, product !== null)

  return (
    <Overlay open={product !== null} onOpenChange={onOpenChange}>
      <OverlayContent className="w-120" closeLabel="Close">
        {/* Keyed on the piece, so the next one opens with nothing picked. */}
        {shown ? (
          <SizeForm key={shown.slug} product={shown} color={shownColor} onClose={() => onOpenChange(false)} />
        ) : null}
      </OverlayContent>
    </Overlay>
  )
}

function SizeForm({ product, color, onClose }: { product: Product; color?: string; onClose: () => void }) {
  const id = useId()
  const sizes = productSizes(product)
  const colors = product.colors ?? []
  const [colorIndex, setColorIndex] = useState(() =>
    Math.max(
      0,
      colors.findIndex((entry) => entry.name === color),
    ),
  )
  const [sizeId, setSizeId] = useState(sizes.length === 1 ? sizes[0].id : undefined)
  const { addItem, pending } = useCart()
  const toast = useToastManager()

  const chosen = colors[colorIndex]
  const media = chosen?.media ?? product.media

  const add = async () => {
    const result = await addItem({
      productSlug: product.slug,
      color: chosen?.name,
      ...(sizeId && { options: { [SIZE_OPTION_ID]: sizeId } }),
    })
    if (!result.ok) {
      toast.add(errorToast('Could not add to your bag', result.error))
      return
    }
    onClose()
  }

  return (
    <>
      <OverlayHeader>
        <OverlayTitle className="font-medium">Add to bag</OverlayTitle>
      </OverlayHeader>

      <OverlayBody className="flex flex-col gap-6 pb-1">
        <div className="flex items-center gap-4">
          <span className="bg-background-muted rounded-2xs relative aspect-4/5 w-16 shrink-0 overflow-hidden">
            <Image src={media.image.src} alt="" fill sizes="64px" className="object-cover" />
          </span>
          <span className="flex min-w-0 flex-col gap-1">
            <span className="text-foreground-intense line-clamp-2">{product.title}</span>
            <Price
              money={product.price}
              scaleFraction={false}
              className="text-foreground-intense font-mono text-sm font-medium"
            />
          </span>
        </div>

        {colors.length > 1 ? (
          <div className="flex flex-col gap-3">
            <p id={`${id}-color`} className="text-foreground-intense font-medium">
              Color: <span className="ms-1 font-normal">{chosen?.name}</span>
            </p>
            <ColorSquares
              aria-labelledby={`${id}-color`}
              colors={colors}
              value={colorIndex}
              onValueChange={setColorIndex}
            />
          </div>
        ) : null}

        {sizes.length > 0 ? (
          <div className="flex flex-col gap-3">
            <p id={`${id}-size`} className="text-foreground-intense font-medium">
              Size
            </p>
            <SizePicker sizes={sizes} value={sizeId} onValueChange={setSizeId} labelledBy={`${id}-size`} />
          </div>
        ) : null}
      </OverlayBody>

      <OverlayFooter>
        <Link
          href={`/product/${product.slug}${chosen && colorIndex > 0 ? `?color=${encodeURIComponent(chosen.name)}` : ''}`}
          data-slot="button"
          className={buttonVariants({ variant: 'outline' })}
        >
          View product
        </Link>
        <Button disabled={pending || (sizes.length > 0 && !sizeId)} focusableWhenDisabled onClick={() => void add()}>
          Add to bag
        </Button>
      </OverlayFooter>
    </>
  )
}
