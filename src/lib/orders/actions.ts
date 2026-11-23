'use server'

import { commerceAdapter } from '@/lib/commerce'
import type { Address, DeliverySlotSelection } from '@/lib/commerce/types'
import { type DemoSlug, isDemoSlug } from '@/lib/demos'
import { validateAddress, validateEmail, validateRequired } from '@/lib/validation'
import { type ReturnRequest, MAX_RETURN_NOTES, isReturnReason } from './returns'
import { writeTrackedOrderToken } from './token'

/*
 * What a shopper can do with an order they are not signed in for: find it, ask
 * for it to go somewhere else or on another day, ask to send it back.
 *
 * Only the lookup writes anything. The other 3 are requests, because a store
 * does not silently reroute a parcel a courier is carrying, books its own
 * crews, and decides for itself what it takes back; a real store queues them
 * against its own desk and confirms by email, which is where the copy for that
 * belongs.
 */

/** What a lookup gives back. A miss is a return value, not an exception. */
export type TrackOrderResult = { ok: true; number: string } | { ok: false; error: string }

/** What the 3 request actions give back. A refusal is a return value, not an exception. */
export type OrderRequestResult = { ok: true } | { ok: false; error: string }

/** The 1 thing a failed lookup ever says, whichever half was wrong. */
const NOT_FOUND = 'Check the order number and the email it was placed with, then try again.'

/**
 * Finds an order by its number and the email it was placed with, and remembers
 * that this visitor may see it. The screen navigates on `ok`.
 *
 * A miss never says which half was wrong, or the form becomes an oracle for
 * which order numbers exist. Add a rate limit here, keyed by IP, before this
 * reaches a real order table.
 */
export async function trackOrderAction(demo: DemoSlug, number: string, email: string): Promise<TrackOrderResult> {
  if (!isDemoSlug(demo)) return { ok: false, error: 'That store does not exist.' }

  const invalid = validateRequired(number, 'Order number') ?? validateEmail(email)
  if (invalid) return { ok: false, error: invalid }

  try {
    const found = await commerceAdapter.lookupOrder(demo, number, email)
    if (!found) return { ok: false, error: NOT_FOUND }

    await writeTrackedOrderToken(demo, found.token)
    return { ok: true, number: found.order.number }
  } catch {
    return { ok: false, error: 'Your order could not be looked up. Try again in a moment.' }
  }
}

/**
 * Asks for an order to be delivered somewhere else. A request rather than a
 * write, because once a courier has the parcel only the carrier can turn it
 * around. Whether it is offered at all is `OrderTracking.addressEditable`.
 *
 * Point this at whatever handles it: your own order API, a carrier's redirect
 * endpoint, or a ticket on the support desk.
 */
export async function changeShippingAddressAction(
  demo: DemoSlug,
  orderNumber: string,
  address: Address,
): Promise<OrderRequestResult> {
  if (!isDemoSlug(demo)) return { ok: false, error: 'That store does not exist.' }

  const invalid = validateRequired(orderNumber, 'Order number') ?? validateAddress(address)
  if (invalid) return { ok: false, error: invalid }

  return { ok: true }
}

/** A day as `YYYY-MM-DD`, the shape every date in a delivery schedule takes. */
const ISO_DAY = /^\d{4}-\d{2}-\d{2}$/

/**
 * Asks for a booked delivery to move to another day or window. A request like
 * the 2 beside it: the crew's calendar is the store's, so the store confirms
 * the move. Whether it is offered, and on which days, is `OrderTracking.reschedule`.
 *
 * Point this at your delivery partner's booking API, or a ticket on the desk
 * that books your crews.
 */
export async function rescheduleDeliveryAction(
  demo: DemoSlug,
  orderNumber: string,
  slot: DeliverySlotSelection,
): Promise<OrderRequestResult> {
  if (!isDemoSlug(demo)) return { ok: false, error: 'That store does not exist.' }

  const invalid = validateRequired(orderNumber, 'Order number')
  if (invalid) return { ok: false, error: invalid }
  if (!ISO_DAY.test(slot.date) || !slot.slotId) return { ok: false, error: 'Choose a day and a window.' }

  return { ok: true }
}

/**
 * Opens a return against an order. A request like the one above: the store
 * decides what it takes back, prices the refund, and issues the label. Post this
 * to your returns provider or to your own desk.
 */
export async function requestReturnAction(demo: DemoSlug, request: ReturnRequest): Promise<OrderRequestResult> {
  if (!isDemoSlug(demo)) return { ok: false, error: 'That store does not exist.' }

  if (request.lineIds.length === 0) return { ok: false, error: 'Choose at least 1 item to return.' }
  if (!isReturnReason(demo, request.reason)) return { ok: false, error: 'Tell us why this is going back.' }
  if ((request.notes?.length ?? 0) > MAX_RETURN_NOTES) {
    return { ok: false, error: `Keep your note under ${MAX_RETURN_NOTES} characters.` }
  }

  return { ok: true }
}
