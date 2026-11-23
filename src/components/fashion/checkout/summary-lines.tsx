import Image from 'next/image'
import Link from 'next/link'
import { Price } from '@/components/price'
import type { CartLine } from '@/lib/commerce/types'
import { cn } from '@/lib/utils'

/**
 * What is in an order, read-only, in the portrait crop. Takes
 * lines rather than reading the cart, so the checkout and the receipt share it:
 * a placed order's lines are frozen.
 */
export function SummaryLines({ lines, className }: { lines: CartLine[]; className?: string }) {
  return (
    <ul className={cn('flex flex-col gap-4', className)}>
      {lines.map((line) => (
        <li key={line.id} className="flex gap-4">
          <Link
            href={line.href}
            tabIndex={-1}
            aria-hidden
            className="group bg-background rounded-2xs relative aspect-4/5 w-16 shrink-0 overflow-hidden"
          >
            <Image
              src={line.image.src}
              alt=""
              fill
              sizes="64px"
              className="object-cover transition-transform duration-700 ease-out motion-safe:group-hover:scale-[1.03] motion-reduce:transition-none"
            />
          </Link>

          <div className="flex min-w-0 flex-1 items-baseline gap-3">
            <div className="flex min-w-0 flex-1 flex-col gap-1">
              <Link
                href={line.href}
                className="text-foreground-intense outline-ring rounded-4xs line-clamp-2 self-start focus-visible:outline-2 focus-visible:outline-offset-2"
              >
                {line.title}
              </Link>
              <dl className="flex flex-col gap-0.5 text-xs">
                {line.options?.map(({ label, value }) => (
                  <div key={label} className="flex gap-1.5">
                    <dt>{label}:</dt>
                    <dd className="text-foreground-intense">{value}</dd>
                  </div>
                ))}
                <div className="flex gap-1.5">
                  <dt>Quantity:</dt>
                  <dd className="text-foreground-intense">{line.quantity}</dd>
                </div>
              </dl>
            </div>

            <div className="flex flex-col items-end">
              <Price
                money={line.lineTotal}
                scaleFraction={false}
                className="text-foreground-intense font-mono text-sm font-semibold"
              />
              {line.compareAtTotal ? (
                <Price
                  money={line.compareAtTotal}
                  compareAt
                  scaleFraction={false}
                  className="text-foreground-subtle font-mono text-xs line-through"
                />
              ) : null}
            </div>
          </div>
        </li>
      ))}
    </ul>
  )
}
