'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@appica/ui-react/button'
import { NumberField } from '@appica/ui-react/number-field'
import { MAX_QUANTITY, useCartLine } from '@/components/cart/use-cart-line'
import { TEXT_ACTION } from '@/components/fashion/text-action'
import { Price } from '@/components/price'
import type { CartLine } from '@/lib/commerce/types'
import { cn } from '@/lib/utils'

interface CartLineRowProps {
  line: CartLine
  /** Offers "Move to wishlist" beside Remove, unless the garment is saved already. */
  movable?: boolean
  /** Runs when a link on the row is followed, so a drawer can close behind it. */
  onNavigate?: () => void
}

/**
 * One garment in the bag, shared by the drawer and the bag page and sized by its
 * container. Color and size are read-only: changing either makes a new line.
 */
export function CartLineRow({ line, movable, onNavigate }: CartLineRowProps) {
  const { pending, quantity, setQuantity, commitQuantity, remove, wishlisted, moveToWishlist } = useCartLine(line)

  return (
    <li
      data-slot="cart-line"
      className={cn(
        '@container',
        pending && 'pointer-events-none opacity-50 transition-opacity motion-reduce:transition-none',
      )}
    >
      <div className="flex gap-4 @lg:gap-6">
        <Link
          href={line.href}
          tabIndex={-1}
          aria-hidden
          onClick={onNavigate}
          className="group bg-background-muted rounded-2xs relative aspect-4/5 w-28 shrink-0 overflow-hidden @lg:w-40"
        >
          <Image
            src={line.image.src}
            alt=""
            fill
            sizes="160px"
            className="object-cover transition-transform duration-700 ease-out motion-safe:group-hover:scale-[1.03] motion-reduce:transition-none"
          />
        </Link>

        <div className="flex min-w-0 flex-1 flex-col justify-between gap-4">
          {/* Price in its own column, so a struck-through price never pushes the meta down. */}
          <div className="flex items-baseline gap-3">
            <div className="flex min-w-0 flex-1 flex-col gap-1">
              <Link
                href={line.href}
                onClick={onNavigate}
                className="text-foreground-intense outline-ring rounded-4xs self-start focus-visible:outline-2 focus-visible:outline-offset-2 @lg:text-lg"
              >
                {line.title}
              </Link>
              {line.options ? (
                <dl className="flex flex-col gap-1 text-xs">
                  {line.options.map(({ label, value }) => (
                    <div key={label} className="flex gap-2">
                      <dt>{label}:</dt>
                      <dd className="text-foreground-intense">{value}</dd>
                    </div>
                  ))}
                </dl>
              ) : null}
            </div>

            <div className="flex flex-col items-end">
              <Price
                money={line.lineTotal}
                scaleFraction={false}
                className="text-foreground-intense font-mono text-sm font-semibold @lg:text-base"
              />
              {line.compareAtTotal ? (
                <Price
                  money={line.compareAtTotal}
                  compareAt
                  scaleFraction={false}
                  className="text-foreground-subtle font-mono text-xs line-through @lg:text-sm"
                />
              ) : null}
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
            <NumberField
              variant="soft"
              size="sm"
              min={1}
              max={MAX_QUANTITY}
              value={quantity}
              onValueChange={(next) => setQuantity(next ?? 1)}
              onValueCommitted={(next) => commitQuantity(next ?? 1)}
              aria-label={`Quantity of ${line.title}`}
            />
            <div className="flex items-center gap-4">
              {movable && !wishlisted ? (
                <Button
                  variant="ghost"
                  size="sm"
                  aria-label={`Move to wishlist: ${line.title}`}
                  onClick={moveToWishlist}
                  className={TEXT_ACTION}
                >
                  Move to wishlist
                </Button>
              ) : null}
              <Button
                variant="ghost"
                size="sm"
                aria-label={`Remove ${line.title} from your bag`}
                onClick={remove}
                className={TEXT_ACTION}
              >
                Remove
              </Button>
            </div>
          </div>
        </div>
      </div>
    </li>
  )
}
