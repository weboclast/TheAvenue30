import type { OrderStatus, OrderTracking, OrderTrackingStep } from '../../types'

/*
 * How the demo store fulfills: the stages a parcel passes through, and how long
 * it spends in each. Store policy, so it sits beside `./delivery.ts`.
 *
 * The 1 openly faked thing in this adapter: with no warehouse, an order's stage
 * is read off a clock started when it was placed.
 *
 * **A real adapter deletes this file.** Fulfillment arrives as the order's
 * status and the carrier events recorded against it. Map those to
 * {@link OrderTrackingStep}s. Where a carrier gives no timestamp, leave `at`
 * unset rather than guessing.
 */

/** How a stage reads to a shopper. */
interface StageCopy {
  label: string
  /** Shown while the order is in this stage. */
  note?: string
}

/**
 * The stages, in order, with the hours from checkout at which the demo enters
 * each, and how the last 2 read for an order collected rather than delivered.
 */
const STAGES: (StageCopy & { status: OrderStatus; after: number; collected?: StageCopy })[] = [
  { status: 'confirmed', label: 'Confirmed', after: 0, note: 'Order placed' },
  { status: 'processing', label: 'Processing', after: 20, note: 'Being packed' },
  {
    status: 'out-for-delivery',
    label: 'Out for delivery',
    after: 68,
    note: 'In transit',
    collected: { label: 'Ready to collect', note: 'At the counter' },
  },
  { status: 'delivered', label: 'Delivered', after: 120, collected: { label: 'Collected' } },
]

/** How long after delivery the store still takes a return, in days. */
const RETURN_DAYS = 30

const HOUR = 3_600_000
const DAY = 24 * HOUR

/**
 * Where an order placed at `placedAt` has got to. Every stage comes back, since
 * the tracker draws the whole journey. A finished stage carries the moment it
 * was reached; the one in progress carries a note instead.
 *
 * `collected` is for an order held at a store, which is ready rather than out
 * for delivery, and has no address to change.
 */
export function trackOrder(placedAt: string, collected = false): OrderTracking {
  const start = new Date(placedAt).getTime()
  // A corrupt token reads as just placed, not as long delivered.
  const elapsed = Number.isNaN(start) ? 0 : Math.max(0, Date.now() - start) / HOUR

  const current = STAGES.reduce((reached, stage, index) => (elapsed >= stage.after ? index : reached), 0)
  const last = STAGES.length - 1

  const steps = STAGES.map((stage, index): OrderTrackingStep => {
    const { label, note } = (collected && stage.collected) || stage
    const done = index < current || (index === current && index === last)
    if (done) {
      return {
        status: stage.status,
        label,
        at: new Date(start + stage.after * HOUR).toISOString(),
        progress: 100,
      }
    }

    if (index > current) return { status: stage.status, label, progress: 0 }

    const span = STAGES[index + 1].after - stage.after
    return {
      status: stage.status,
      label,
      ...(note && { note }),
      progress: Math.min(100, Math.round(((elapsed - stage.after) / span) * 100)),
    }
  })

  const status = STAGES[current].status
  const deliveredAt = start + STAGES[last].after * HOUR

  return {
    steps,
    status,
    // A carrier can still turn a parcel around in transit.
    addressEditable: !collected && status !== 'delivered',
    returnable: status === 'delivered' && Date.now() - deliveredAt < RETURN_DAYS * DAY,
  }
}
