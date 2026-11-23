import type { DemoSlug } from '@/lib/demos'

/*
 * What a shopper can say when they send something back.
 *
 * The only file in this module that is safe on the client: the drawer renders
 * the list and `./actions.ts` validates against it, and 2 copies of it is how a
 * reason the server rejects ends up on screen.
 */

/** One answer to "why is it going back?". */
export interface ReturnReason {
  id: string
  label: string
}

/** The reasons a storefront offers unless it names its own in {@link OWN_REASONS}. */
const DEFAULT_REASONS: readonly ReturnReason[] = [
  { id: 'not-needed', label: 'No longer need the item' },
  { id: 'mistake', label: 'Ordered by mistake' },
  { id: 'wrong-variant', label: 'Selected the wrong size, color or item' },
  { id: 'better-price', label: 'Found a better price elsewhere' },
  { id: 'too-slow', label: 'Delivery is taking too long' },
]

/**
 * The storefronts with reasons of their own. Fashion asks about fit first,
 * because that is why most clothing goes back, and Furniture about the room.
 * Keyed by demo, so a deleted one leaves a key TypeScript flags.
 */
const OWN_REASONS: Partial<Record<DemoSlug, readonly ReturnReason[]>> = {
  fashion: [
    { id: 'too-small', label: 'Too small' },
    { id: 'too-large', label: 'Too large' },
    { id: 'not-as-pictured', label: 'Not as pictured' },
    { id: 'damaged', label: 'Arrived damaged' },
    { id: 'changed-mind', label: 'Changed my mind' },
  ],
}

/** The reasons this storefront offers, in the order to offer them. */
export function returnReasons(demo: DemoSlug): readonly ReturnReason[] {
  return OWN_REASONS[demo] ?? DEFAULT_REASONS
}

/** How long a shopper's own account of what went wrong can be. */
export const MAX_RETURN_NOTES = 600

/** What the return drawer submits. */
export interface ReturnRequest {
  /** The order it is opened against. */
  orderNumber: string
  /** Which lines are going back, by their `CartLine.id`. At least 1. */
  lineIds: string[]
  /** A {@link ReturnReason.id} from the storefront's own {@link returnReasons}. */
  reason: string
  /** Whatever else the shopper wrote about it. */
  notes?: string
}

/** Whether a string is a reason this storefront offers. Anything from a client is narrowed with this. */
export function isReturnReason(demo: DemoSlug, value: string): boolean {
  return returnReasons(demo).some((reason) => reason.id === value)
}
