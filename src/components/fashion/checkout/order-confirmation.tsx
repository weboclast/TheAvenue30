import Image from 'next/image'
import Link from 'next/link'
import { Badge } from '@appica/ui-react/badge'
import { buttonVariants } from '@appica/ui-react/button'
import { CopyButton } from '@appica/ui-react/copy-button'
import { Eyebrow } from '@/components/fashion/eyebrow'
import { SUMMARY_ASIDE, SUMMARY_GRID, SUMMARY_MAIN } from '@/components/fashion/summary-layout'
import { formatDateTime, formatDay, formatDayRange, formatOrderArrival } from '@/lib/commerce/format'
import type { Order } from '@/lib/commerce/types'
import { cn } from '@/lib/utils'
import { OrderDetails } from './order-details'
import { OrderSummary } from './order-summary'
import { TrackOrderLink } from './track-order-link'

/** One stage of "What happens next": its name, when it happens, and what it promises. */
interface Step {
  label: string
  /** Absent where the order knows no time for it. */
  when?: string
  detail: string
}

/**
 * The receipt: that the order landed, what happens next, and where it is going,
 * with the summary in the column it sat in a click ago.
 *
 * 3 grid items rather than a column and a sidebar, so the summary lands between
 * the details and the help once they stack, and spans both rows from `lg` to sit
 * sticky beside them.
 */
export function OrderConfirmation({ order }: { order: Order }) {
  const pickup = order.delivery.pickup
  // A gift ships under the recipient's name, which is not who to thank.
  const heading = order.giftMessage ? 'Thank you for your order' : `Thank you, ${order.shippingAddress.firstName}`

  const steps: Step[] = [
    {
      label: 'Confirmed',
      when: formatDateTime(order.placedAt),
      detail: `Your receipt is on its way to ${order.email}.`,
    },
    pickup
      ? {
          label: 'Ready to collect',
          when: order.delivery.arrival && `From ${formatDay(order.delivery.arrival.from)}`,
          detail: `We'll text ${order.shippingAddress.phone ?? 'you'} when it's waiting at the counter.`,
        }
      : {
          label: 'On its way',
          detail: `Folded, wrapped, and handed to ${order.delivery.carrier?.name ?? 'our courier'}, with a tracking link by email.`,
        },
    pickup
      ? { label: 'Collected', when: pickup.hours, detail: `Bring your order number to ${pickup.address.line1}.` }
      : {
          label: 'Delivered',
          when: order.delivery.arrival
            ? formatDayRange(order.delivery.arrival.from, order.delivery.arrival.to)
            : formatOrderArrival(order.delivery),
          detail: `To ${order.shippingAddress.line1}, ${order.shippingAddress.city}.`,
        },
  ]

  return (
    <section className={cn('container pt-4 pb-16 md:pb-20 lg:pt-6 xl:pb-24', SUMMARY_GRID)}>
      <div className={cn('flex flex-col gap-10', SUMMARY_MAIN)}>
        <header className="flex flex-col items-start gap-4">
          <div className="flex items-center gap-1">
            <Eyebrow className="text-foreground">Order {order.number}</Eyebrow>
            <CopyButton
              value={order.number}
              variant="ghost"
              size="icon-sm"
              label={`Copy order number ${order.number}`}
            />
          </div>
          <h1 className="text-foreground-intense text-4xl font-medium text-balance md:text-5xl">{heading}</h1>
          <p className="max-w-xl text-pretty">
            Your receipt is on its way to <span className="text-foreground-intense">{order.email}</span>.{' '}
            {pickup
              ? `We'll hold your order at our ${pickup.name} store and text you the moment it's ready.`
              : "We'll email a tracking link as soon as it leaves Porto."}
          </p>
          <TrackOrderLink orderNumber={order.number} />
        </header>

        <figure className="bg-background-muted relative aspect-3/2 overflow-hidden rounded-sm">
          <Image
            src="/demo/fashion/checkout/order-box.webp"
            alt="An olive knit sweater and a cobalt linen shirt folded in an open box on a pale stone table, a card tied with yellow ribbon on top"
            fill
            preload
            sizes="(min-width: 1024px) 58vw, 100vw"
            className="object-cover"
          />
          <Badge
            variant="outline"
            size="lg"
            render={<figcaption />}
            className="absolute inset-s-3 bottom-3 text-[0.8125rem] tracking-wide"
          >
            Wrapped by hand
          </Badge>
        </figure>

        <section className="flex flex-col gap-5">
          <h2 className="text-foreground-intense text-2xl font-medium">What happens next</h2>
          <ol className="grid gap-6 sm:grid-cols-3 sm:gap-4">
            {steps.map((step, index) => (
              <li key={step.label} className="flex flex-col gap-1">
                {/* The rail fills as far as the order has got, which on this page is the first step. */}
                <span
                  aria-hidden
                  className={cn('mb-3 h-0.5 rounded-full', index === 0 ? 'bg-foreground-intense' : 'bg-border-strong')}
                />
                <p className="text-foreground-muted font-mono text-sm">0{index + 1}</p>
                <h3 className="text-foreground-intense text-lg font-medium">{step.label}</h3>
                {step.when ? <p className="text-foreground-intense">{step.when}</p> : null}
                <p className="text-pretty">{step.detail}</p>
              </li>
            ))}
          </ol>
        </section>

        <OrderDetails order={order} />
      </div>

      <OrderSummary order={order} className={cn(SUMMARY_ASIDE, 'lg:top-6 lg:row-span-2')} />

      <section
        className={cn(
          'flex flex-col items-start justify-between gap-4 rounded-sm border p-6 sm:flex-row sm:items-center md:gap-6',
          SUMMARY_MAIN,
        )}
      >
        {/* The promise the care FAQ makes, in `contact/care-faq.tsx`: keep the 2 in step. */}
        <div className="flex flex-col gap-1">
          <h2 className="text-foreground-intense text-xl font-medium">Need to change something?</h2>
          <p className="text-sm">
            We can still catch your order until it&apos;s packed, usually by the next business morning. A chat is
            answered in under 2 minutes.
          </p>
        </div>
        <Link href="/contact" data-slot="button" className={buttonVariants({ variant: 'primary' })}>
          Contact us
        </Link>
      </section>
    </section>
  )
}
