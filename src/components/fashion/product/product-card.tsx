'use client'

import { type ComponentProps, type ReactNode, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { HeartPlus } from '@appica/icons-react'
import { ColorBars } from '@/components/fashion/product/color-bars'
import { ProductFlag } from '@/components/fashion/product/product-flag'
import { SizeScale } from '@/components/fashion/product/size-scale'
import { Price } from '@/components/price'
import { WishlistToggle } from '@/components/product/product-collect-toggles'
import { productSizes } from '@/lib/commerce/product-options'
import type { CardProduct, CardProductMedia } from '@/lib/commerce/types'
import { cn } from '@/lib/utils'

/** Slot widths in the catalog grid: 2 across on phones, up to 4 on wide screens. */
const CATALOG_SIZES = '(min-width: 1200px) 25vw, (min-width: 768px) 33vw, 50vw'

/**
 * What the artwork reveals once a pointer settles on it. The delay is on the
 * hovered state only, so leaving is immediate; focus skips it, because a
 * keyboard lands on a card deliberately.
 *
 * `hover-none` drops the reveal entirely on a touch device, where on a 2-up
 * grid it would cover a third of the photograph with controls too small to tap.
 * The heart stays: saving is the one thing a shopper does to a card on a phone.
 */
const REVEALED = cn(
  'pointer-events-none opacity-0 transition-opacity duration-300 ease-out motion-reduce:transition-none',
  'group-hover/card:pointer-events-auto group-hover/card:opacity-100 group-hover/card:delay-150',
  'group-focus-within/card:pointer-events-auto group-focus-within/card:opacity-100',
  'hover-none:hidden',
)

/**
 * The heart, which stays on the card at every size. `ghost` fills on hover with
 * `background-muted`, the same tone as the panel it sits on, so the ground is
 * moved to `background` where it reads.
 */
const SAVE_BUTTON = 'hover:before:bg-background data-pressed:before:bg-background'

interface ProductCardProps extends Omit<ComponentProps<'article'>, 'children'> {
  /** Trimmed with `toCardProduct` where a Server Component passes it. */
  product: CardProduct
  /** Overrides the image's own alt text. Pass `''` where a surrounding list already names the product. */
  alt?: string
  /**
   * The `sizes` the artwork is fetched at. Set it wherever the card is not in a
   * catalog grid, or the browser downloads a grid-sized image for a small one.
   * @default the catalog grid's slot widths
   */
  sizes?: string
  /**
   * Replaces the control floating over the artwork, for a screen that owns that
   * corner: the account's wishlist puts its own selection checkbox there.
   */
  action?: ReactNode
  /**
   * The color showing, by {@link ProductColor.name}. Controlled when set, so
   * pass {@link onColorChange} with it; leave both out and the card holds the
   * selection itself, starting on the product's first color.
   */
  color?: string
  /** Called with the color a bar selects. */
  onColorChange?: (color: string) => void
  /**
   * The shot the card shows: each color's lead, or its packshot, the piece on
   * its own, for a grid set beside a photograph of the pieces worn.
   * @default 'lead'
   */
  shot?: 'lead' | 'packshot'
}

/**
 * One garment in a grid or a shelf: the photograph, the colors it comes in, the
 * sizes it is left in, its name, and its price.
 *
 * The photograph never swaps on hover the way the Electronics card's does: a
 * garment's second shot is the same garment from behind, which reads as a
 * glitch rather than as a second look. Here the colors do the swapping, each
 * carrying its own photography, and all the state that is presentation.
 */
export function ProductCard({
  product,
  alt,
  sizes = CATALOG_SIZES,
  action,
  color,
  onColorChange,
  shot = 'lead',
  className,
  ...props
}: ProductCardProps) {
  const [ownColor, setOwnColor] = useState<string>()
  // A color the product no longer carries falls back to its first, so a stale
  // link or a retired color opens the card rather than blanking it.
  const colorIndex = Math.max(0, product.colors?.findIndex((entry) => entry.name === (color ?? ownColor)) ?? 0)
  // Which colors have been rendered, and so fetched. A color joins when the
  // pointer touches its bar, so its photography is usually decoded by the click.
  const [warmColors, setWarmColors] = useState(() => new Set([0]))

  const colorSets = product.colors?.map((entry) => entry.media) ?? [product.media]
  const shotOf = (media: CardProductMedia) => (shot === 'packshot' && media.packshot) || media.image
  const hasColorBars = colorSets.length > 1
  const scale = productSizes(product)
  const soldOut = product.availability === 'out-of-stock'

  const warmColor = (index: number) => {
    setWarmColors((warm) => (warm.has(index) ? warm : new Set(warm).add(index)))
  }

  const selectColor = (index: number) => {
    warmColor(index)
    const name = product.colors?.[index].name
    if (!name) return
    setOwnColor(name)
    onColorChange?.(name)
  }

  // The color travels with the link, so the product page opens on the one the
  // card is showing. Left off the default, which that page already opens on.
  const chosen = colorIndex > 0 ? product.colors?.[colorIndex].name : undefined
  const href = `/product/${product.slug}${chosen ? `?color=${encodeURIComponent(chosen)}` : ''}`

  return (
    <article data-slot="product-card" className={cn('group/card flex flex-col gap-3', className)} {...props}>
      <div
        data-slot="product-card-media"
        className={cn(
          'bg-background-muted rounded-2xs relative isolate aspect-324/406 overflow-hidden',
          soldOut && 'opacity-70',
        )}
      >
        {/* Every warm color keeps a layer and only the selected one is opaque,
            so a color change crossfades photography already in the document
            rather than blanking the card while the next file arrives. */}
        {colorSets.map((media, index) => {
          if (!warmColors.has(index) && index !== colorIndex) return null
          const image = shotOf(media)

          return (
            <Image
              key={image.src}
              data-slot="product-card-image"
              src={image.src}
              alt={index === colorIndex ? (alt ?? image.alt) : ''}
              fill
              sizes={sizes}
              className={cn(
                'object-cover transition-opacity duration-250 ease-out motion-reduce:transition-none',
                index === colorIndex ? 'opacity-100' : 'opacity-0',
              )}
            />
          )
        })}

        {/* The title link below carries the name, so this one stays out of the
            tab order and the accessibility tree: one link per card, not two. */}
        <Link href={href} aria-hidden tabIndex={-1} className="absolute inset-0" />

        {/* The flag and the color strip share this corner, so the flag steps
            aside for it. `group-hover` needs no guard, Tailwind already confining
            it to devices that hover; focus-within is not confined, and a tap
            focuses the link covering the artwork, which on a phone took the flag
            away for a strip that never arrives. */}
        <ProductFlag
          badges={product.badges}
          size="sm"
          className={cn(
            'absolute inset-s-2 top-2 transition-opacity duration-300 ease-out motion-reduce:transition-none',
            hasColorBars && 'not-hover-none:group-focus-within/card:opacity-0 group-hover/card:opacity-0',
          )}
        />

        {product.colors && hasColorBars ? (
          <ColorBars
            colors={product.colors}
            value={colorIndex}
            onValueChange={selectColor}
            onPreload={warmColor}
            label={`Color, ${product.title}`}
            className={cn('absolute inset-s-1.5 top-1.5', REVEALED)}
          />
        ) : null}

        {/* As wide as the heart, so the button reaches the column's own edge
            and sits the same 4px off the top and the side. The size numbers
            center on the same axis. */}
        <div data-slot="product-card-actions" className="absolute inset-e-1 top-1 flex w-8 flex-col items-center gap-1">
          {action ?? (
            <WishlistToggle
              productSlug={product.slug}
              icon={<HeartPlus />}
              variant="ghost"
              size="icon-sm"
              className={SAVE_BUTTON}
            />
          )}
          {scale.length > 0 ? (
            <SizeScale sizes={scale} label={`Sizes, ${product.title}`} className={cn('w-full', REVEALED)} />
          ) : null}
        </div>
      </div>

      {/* The body takes the slack a grid row hands a short card, and the price
          sits at the bottom of it, so a name that wraps to a second line on one
          card does not drop its neighbors' prices out of line. */}
      <div data-slot="product-card-body" className="flex flex-1 flex-col gap-0.5 px-4">
        <Link
          href={href}
          data-slot="product-card-title"
          className="text-foreground-intense outline-ring line-clamp-2 focus-visible:outline-2 focus-visible:outline-offset-2"
        >
          {product.title}
        </Link>
        <div data-slot="product-card-price" className="mt-auto flex items-center gap-2">
          <Price
            money={product.price}
            scaleFraction={false}
            className={cn(
              'font-mono text-sm font-medium',
              soldOut ? 'text-foreground-muted' : 'text-foreground-intense',
            )}
          />
          {product.compareAtPrice ? (
            <Price
              money={product.compareAtPrice}
              compareAt
              scaleFraction={false}
              className="text-foreground-subtle text-sm line-through"
            />
          ) : null}
        </div>
      </div>
    </article>
  )
}
