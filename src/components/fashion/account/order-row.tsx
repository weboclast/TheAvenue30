import Image from 'next/image'
import Link from 'next/link'
import { buttonVariants } from '@appica/ui-react/button'
import { accountPath } from '@/components/account/account-paths'
import { CaretSwap } from '@/components/fashion/caret-swap'
import { Eyebrow } from '@/components/fashion/eyebrow'
import { StageBar, statusCopy } from '@/components/fashion/order-tracking/tracking-status'
import { Price } from '@/components/price'
import { formatDate } from '@/lib/commerce/format'
import type { Order } from '@/lib/commerce/types'
import { cn } from '@/lib/utils'

/** The slots a row's photos take, the last one a count where the order holds more. */
const SLOTS = 3

const PHOTO = 'bg-background-muted rounded-2xs relative aspect-4/5 w-16 shrink-0 overflow-hidden sm:w-20'

interface OrderRowProps {
  order: Order
  /** The heading level the row's headline takes, below the page's own. @default 'h2' */
  heading?: 'h2' | 'h3'
  /** Small actions beside the way to the order: a return, a review, a new address. */
  actions?: React.ReactNode
  className?: string
}

/**
 * One order in the account: where it has got to, in the tracker's words, what
 * was in it, what it came to, and the way to its page. The headline, the photos,
 * and View order all lead there; the order number stays text, to be copied.
 * One still on its way shows its stages as well.
 */
export function OrderRow({ order, heading: Heading = 'h2', actions, className }: OrderRowProps) {
  const { title, when } = statusCopy(order)
  const { status, steps } = order.tracking
  const items = order.lines.reduce((total, line) => total + line.quantity, 0)
  const shown = order.lines.length > SLOTS ? order.lines.slice(0, SLOTS - 1) : order.lines
  const extra = order.lines.length - shown.length
  const href = accountPath('fashion', `orders/${order.number}`)

  return (
    <article className={cn('flex flex-col gap-5 md:flex-row md:gap-6', className)}>
      {/* 3 slots wide however many it holds, so every row's text starts at the same edge. */}
      <div className="group/photos relative self-start md:w-64 md:shrink-0">
        <ul className="flex gap-2">
          {shown.map((line) => (
            <li key={line.id} className={PHOTO}>
              <Image
                src={line.image.src}
                alt={line.title}
                fill
                sizes="80px"
                className="object-cover transition-transform duration-700 ease-out motion-safe:group-hover/photos:scale-[1.03] motion-reduce:transition-none"
              />
            </li>
          ))}
          {extra > 0 ? (
            <li className={cn(PHOTO, 'text-foreground-muted flex items-center justify-center font-mono text-sm')}>
              +{extra}
              <span className="sr-only"> more items</span>
            </li>
          ) : null}
        </ul>
        {/* Over the photos, not around them, so their names are still read out. The headline is the real link. */}
        <Link href={href} aria-hidden tabIndex={-1} className="absolute inset-0" />
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-4">
        <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-2">
          <div className="flex min-w-0 flex-col gap-1">
            <Eyebrow>
              Order {order.number} · {formatDate(order.placedAt)}
            </Eyebrow>
            <Heading className="text-foreground-intense text-xl font-medium">
              <Link
                href={href}
                className="outline-ring rounded-4xs focus-visible:outline-2 focus-visible:outline-offset-2"
              >
                <span className="sr-only">Order {order.number}: </span>
                {title}
              </Link>
            </Heading>
            {when ? <p>{when}</p> : null}
          </div>

          <p className="flex flex-col sm:items-end">
            <Price
              money={order.total}
              scaleFraction={false}
              className="text-foreground-intense font-mono font-semibold"
            />
            <span className="text-sm">
              {items} {items === 1 ? 'item' : 'items'}
            </span>
          </p>
        </div>

        {status === 'delivered' ? null : (
          // Decorative like the tracker's own: the headline above says how far it has got.
          <ol aria-hidden className="grid max-w-xl grid-cols-4 gap-2">
            {steps.map((step) => (
              <li key={step.status} className="flex flex-col gap-2">
                <StageBar value={step.progress} />
                <span className={cn('text-sm', step.progress > 0 && 'text-foreground-intense')}>{step.label}</span>
              </li>
            ))}
          </ol>
        )}

        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <Link
            href={href}
            data-slot="button"
            className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'group')}
          >
            View order
            <CaretSwap data-icon="end" className="size-3" />
          </Link>
          {actions}
        </div>
      </div>
    </article>
  )
}
