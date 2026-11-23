'use client'

import { Fragment, useId } from 'react'
import Link from 'next/link'
import { HeartPlus, Dimensions, ShoppingBagPlus } from '@appica/icons-react'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from '@appica/ui-react/breadcrumb'
import { Button } from '@appica/ui-react/button'
import { Rating } from '@appica/ui-react/rating'
import { ColorSquares } from '@/components/fashion/product/color-squares'
import { FitScale } from '@/components/fashion/product/fit-scale'
import { REVIEWS_ANCHOR } from '@/components/fashion/product/product-reviews'
import { useProductSelection } from '@/components/fashion/product/product-selection'
import { SizePicker } from '@/components/fashion/product/size-picker'
import { Price } from '@/components/price'
import { WishlistToggle } from '@/components/product/product-collect-toggles'
import type { ProductFit } from '@/lib/commerce/types'
import { cn } from '@/lib/utils'

interface ProductBuyBoxProps {
  /** The categories above the product, department first. */
  trail: { label: string; href: string }[]
  /** Where reviewers put the fit. Without it, the size row has no scale. */
  fit?: ProductFit
  className?: string
}

/**
 * What the garment is, what it costs, and the choices that buy it: color, then
 * size, then the bag. Both page layouts open their details column with it.
 */
export function ProductBuyBox({ trail, fit, className }: ProductBuyBoxProps) {
  const {
    product,
    color,
    colorIndex,
    setColorIndex,
    sizes,
    size,
    setSize,
    canAddToBag,
    addToBag,
    pending,
    addButtonRef,
  } = useProductSelection()
  const labelId = useId()
  const colors = product.colors

  return (
    <div data-slot="product-buy-box" className={cn('flex flex-col gap-6', className)}>
      <Breadcrumb>
        <BreadcrumbList>
          {trail.map(({ label, href }) => (
            <Fragment key={href}>
              <BreadcrumbItem>
                <BreadcrumbLink render={<Link href={href} />}>{label}</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
            </Fragment>
          ))}
          <BreadcrumbItem>
            <BreadcrumbLink active>{product.title}</BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex flex-col gap-3">
        {/* A jump link: the reviews are a long way down. */}
        {product.rating ? (
          <a
            href={`#${REVIEWS_ANCHOR}`}
            className="outline-ring flex w-fit items-center gap-1.5 rounded-xs text-sm focus-visible:outline-2 focus-visible:outline-offset-2"
          >
            <Rating readOnly value={product.rating.value} step={0.5} size={14} className="gap-0.5" aria-hidden />
            <span className="text-foreground-intense font-medium">{product.rating.value}</span>
            <span className="text-foreground-subtle">
              ({product.rating.count}
              <span className="sr-only"> {product.rating.count === 1 ? 'review' : 'reviews'}</span>)
            </span>
          </a>
        ) : null}
        <h1 className="text-foreground-intense text-3xl">{product.title}</h1>
        <div className="flex flex-wrap items-baseline gap-2">
          <Price
            money={product.price}
            scaleFraction={false}
            className="text-foreground-intense font-mono text-xl font-medium"
          />
          {product.compareAtPrice ? (
            <Price
              money={product.compareAtPrice}
              compareAt
              scaleFraction={false}
              className="text-foreground-subtle line-through"
            />
          ) : null}
        </div>
      </div>

      {colors && color ? (
        <div className="flex flex-col gap-2">
          <p id={`${labelId}-color`}>
            Color: <span className="text-foreground-intense ms-1 font-medium">{color.name}</span>
          </p>
          {colors.length > 1 ? (
            <ColorSquares
              aria-labelledby={`${labelId}-color`}
              colors={colors}
              value={colorIndex}
              onValueChange={setColorIndex}
            />
          ) : null}
        </div>
      ) : null}

      {sizes.length ? (
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between gap-4">
              <p id={`${labelId}-size`}>
                Size: <span className="text-foreground-intense ms-1 font-medium">{size?.label}</span>
              </p>
              <Button
                variant="ghost"
                className="rounded-4xs! p-0.5! font-mono uppercase underline before:hidden hover:no-underline"
              >
                <Dimensions aria-hidden className="size-5 stroke-[1.5]" data-icon="start" />
                Find my size
              </Button>
            </div>
            {fit ? <FitScale fit={fit} /> : null}
          </div>
          <SizePicker sizes={sizes} value={size?.id} onValueChange={setSize} labelledBy={`${labelId}-size`} />
        </div>
      ) : null}

      <div className="flex flex-col gap-2">
        <Button
          ref={addButtonRef}
          size="lg"
          disabled={pending || !canAddToBag}
          focusableWhenDisabled
          onClick={() => void addToBag()}
        >
          <ShoppingBagPlus data-icon="start" />
          Add to bag
        </Button>
        <WishlistToggle productSlug={product.slug} icon={<HeartPlus />} variant="ghost" size="lg">
          Wishlist
        </WishlistToggle>
      </div>
    </div>
  )
}
