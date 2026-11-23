import Image from 'next/image'
import Link from 'next/link'
import { ProductFlag } from '@/components/fashion/product/product-flag'
import { Price } from '@/components/price'
import type { CardProduct, HeroProduct } from '@/lib/commerce/types'
import { cn } from '@/lib/utils'

/** Slot widths in the search grid. Keep in step with its column steps. */
const CARD_SIZES = '(min-width: 64rem) 240px, (min-width: 48rem) 320px, 50vw'

interface SearchResultCardProps {
  /** A search result, or a piece visual search found, which carries no flag or stock of its own. */
  product: CardProduct | HeroProduct
  onNavigate: () => void
}

/**
 * One product in the search results: the photograph, its flag, the name, and
 * the price, set like the catalog card.
 *
 * Deliberately not {@link ProductCard}. A shopper mid-search wants the product,
 * so the whole tile is 1 link and there is nothing else in it to hit. The
 * colors, the size run, and the heart that card reveals are decisions for the
 * page this opens.
 */
export function SearchResultCard({ product, onNavigate }: SearchResultCardProps) {
  const image = 'media' in product ? product.media.image : product.image
  const soldOut = 'availability' in product && product.availability === 'out-of-stock'

  return (
    <Link
      href={`/product/${product.slug}`}
      onClick={onNavigate}
      data-slot="search-result"
      className="outline-ring rounded-2xs flex flex-col gap-3 focus-visible:outline-2 focus-visible:outline-offset-2"
    >
      <div
        className={cn(
          'bg-background-muted rounded-2xs relative aspect-324/406 overflow-hidden',
          soldOut && 'opacity-70',
        )}
      >
        <Image src={image.src} alt="" fill sizes={CARD_SIZES} className="object-cover" />
        {'badges' in product ? (
          <ProductFlag badges={product.badges} size="sm" className="absolute inset-s-2 top-2" />
        ) : null}
      </div>

      <div className="flex flex-col gap-0.5 px-4">
        <p className="text-foreground-intense line-clamp-2">{product.title}</p>
        <div className="flex items-center gap-2">
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
    </Link>
  )
}
