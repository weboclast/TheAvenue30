import { CopyButton } from '@appica/ui-react/copy-button'
import { Progress } from '@appica/ui-react/progress'
import { Eyebrow } from '@/components/fashion/eyebrow'
import { formatDate, formatDateTime, formatDayRange, formatOrderArrival } from '@/lib/commerce/format'
import type { Order, OrderStatus, PickupLocation } from '@/lib/commerce/types'
import { cn } from '@/lib/utils'

/** What the headline says at a stage: the stage in a word or 2, when, and what it means for the shopper. */
export interface StatusCopy {
  title: string
  /** Absent where the order knows no time for it. */
  when?: string
  detail: string
}

/*
 * The headline for each stage, keyed by `OrderStatus` so a store extending the
 * union has to write the new stage's copy before this compiles. Porto is where
 * this store packs, as the receipt and the care FAQ say.
 */

const SHIPPED: Record<OrderStatus, (order: Order) => StatusCopy> = {
  confirmed: (order) => ({
    title: 'Order received',
    when: arriving(order),
    detail: 'It goes to our packing table in Porto next, and the tracking link follows by email once it leaves.',
  }),
  processing: (order) => ({
    title: 'Being packed',
    when: arriving(order),
    detail: `Folded and wrapped in Porto, then handed to ${courier(order)}. The tracking link follows by email.`,
  }),
  'out-for-delivery': (order) => ({
    title: 'On its way',
    when: arriving(order),
    detail: `With ${courier(order)} and heading to ${order.shippingAddress.city}.`,
  }),
  delivered: (order) => ({
    title: 'Delivered',
    when: reached(order, 'delivered', 'Arrived'),
    detail: `To ${order.shippingAddress.line1}, ${order.shippingAddress.city}.`,
  }),
}

const COLLECTED: Record<OrderStatus, (order: Order, store: PickupLocation) => StatusCopy> = {
  confirmed: (order, store) => ({
    title: 'Order received',
    when: readyFrom(order),
    detail: `We'll text ${order.shippingAddress.phone ?? 'you'} the moment it's waiting at the counter in ${store.name}.`,
  }),
  processing: (order, store) => ({
    title: 'Being packed',
    when: readyFrom(order),
    detail: `Then it goes to our ${store.name} store, and we text you the moment it's there.`,
  }),
  'out-for-delivery': (_order, store) => ({
    title: 'Ready to collect',
    when: store.hours,
    detail: `Waiting at the counter at ${store.address.line1}, ${store.address.city}. Bring your order number.`,
  }),
  delivered: (order, store) => ({
    title: 'Collected',
    when: reached(order, 'delivered', 'Collected'),
    detail: `From our ${store.name} store. We hope it fits beautifully.`,
  }),
}

/**
 * Where an order has got to: the stage in words, when it lands, and the 4
 * stages as a rail. The rail matches the receipt's "What happens next", so
 * tracking reads as the same journey moving on.
 */
export function TrackingStatus({ order, className }: { order: Order; className?: string }) {
  const { status, steps } = order.tracking
  const { title, when, detail } = statusCopy(order)

  return (
    <div className={cn('flex flex-col gap-10', className)}>
      <header className="flex flex-col items-start gap-4">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
          <div className="flex items-center gap-1">
            <Eyebrow className="text-foreground">Order {order.number}</Eyebrow>
            <CopyButton
              value={order.number}
              variant="ghost"
              size="icon-sm"
              label={`Copy order number ${order.number}`}
            />
          </div>
          <Eyebrow>Placed {formatDate(order.placedAt)}</Eyebrow>
        </div>
        <h1 className="text-foreground-intense text-4xl font-medium text-balance md:text-5xl">{title}</h1>
        <div className="flex flex-col gap-1">
          {when ? <p className="text-foreground-intense text-xl">{when}</p> : null}
          <p className="max-w-xl text-pretty">{detail}</p>
        </div>
      </header>

      {/* The bars are decorative: the times and `aria-current` say how far it has got. */}
      <ol aria-label="Order progress" className="grid grid-cols-2 gap-x-4 gap-y-6 md:grid-cols-4">
        {steps.map((step, index) => (
          <li
            key={step.status}
            aria-current={step.status === status ? 'step' : undefined}
            className="flex flex-col gap-1"
          >
            <StageBar value={step.progress} className="mb-3" />
            <p className="text-foreground-muted font-mono text-sm">{String(index + 1).padStart(2, '0')}</p>
            <p
              className={cn(
                'text-lg font-medium',
                step.progress > 0 ? 'text-foreground-intense' : 'text-foreground-muted',
              )}
            >
              {step.label}
            </p>
            {step.at ? <p className="text-sm">{formatDateTime(step.at)}</p> : null}
            {step.note ? <p className="text-sm">{step.note}</p> : null}
          </li>
        ))}
      </ol>
    </div>
  )
}

/** One stage's bar on a rail, in ink on the strong border. Decorative: the words beside it say how far. */
export function StageBar({ value, className }: { value: number; className?: string }) {
  return (
    <Progress
      aria-hidden
      value={value}
      thickness={2}
      indicatorColor="var(--foreground-intense)"
      className={cn('**:data-[slot=progress-track]:bg-border-strong', className)}
    />
  )
}

/** What an order's headline says at its stage, for a shipped order or a collected one. */
export function statusCopy(order: Order): StatusCopy {
  const { pickup } = order.delivery
  return pickup ? COLLECTED[order.tracking.status](order, pickup) : SHIPPED[order.tracking.status](order)
}

/** When a shipped order lands, without the year a window a few days out never needs. */
function arriving({ delivery }: Order): string {
  return delivery.arrival
    ? `Arriving ${formatDayRange(delivery.arrival.from, delivery.arrival.to)}`
    : formatOrderArrival(delivery)
}

/** When a collected order can first be picked up. */
function readyFrom({ delivery }: Order): string | undefined {
  return delivery.arrival && `Ready from ${formatDate(delivery.arrival.from)}`
}

/** Who is carrying it, or who will be. */
function courier({ delivery }: Order): string {
  return delivery.carrier?.name ?? 'our courier'
}

/** `verb` and the day a stage was reached, or `undefined` where the carrier sent no time. */
function reached({ tracking }: Order, stage: OrderStatus, verb: string): string | undefined {
  const at = tracking.steps.find((step) => step.status === stage)?.at
  return at && `${verb} ${formatDate(at)}`
}
