'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button, buttonVariants } from '@appica/ui-react/button'
import { useToastManager } from '@appica/ui-react/toast'
import { CIRCLE_FLAGS } from '@/components/address-fields'
import { ReturnDrawer } from '@/components/fashion/order-tracking/return-drawer'
import { TEXT_ACTION } from '@/components/fashion/text-action'
import { ChangeAddressDialog } from '@/components/orders/change-address-dialog'
import { REWARDS } from '@/lib/commerce/programs/rewards'
import type { Order } from '@/lib/commerce/types'
import { formatPoints } from '@/lib/rewards/ledger'
import { successToast } from '@/lib/toast'
import { OrderRow } from './order-row'
import { ReviewDrawer } from './review-drawer'

/** Which panel a row asked for, and the order it asked about. */
type OpenPanel = { kind: 'address' | 'return' | 'review'; order: Order } | null

interface OrderListProps {
  /** The page of orders to draw, already narrowed and sorted by the commerce layer. */
  orders: Order[]
  /** Whether a refinement is what emptied the list, which changes what it says. */
  filtered: boolean
  /** Where an empty history sends the shopper. */
  shopHref: string
}

/**
 * The account's orders, 1 row each, and the panels those rows open: a new
 * address while one can still be changed, a return while one can be opened,
 * and a review once it has arrived. Which of them a row offers is the store's
 * answer, on `OrderTracking`.
 */
export function OrderList({ orders, filtered, shopHref }: OrderListProps) {
  const [open, setOpen] = useState<OpenPanel>(null)
  const close = () => setOpen(null)
  const toast = useToastManager()

  if (orders.length === 0) {
    return (
      <div className="border-border-strong flex flex-col items-center gap-2 rounded-sm border border-dashed px-6 py-16 text-center">
        <p className="text-foreground-intense text-xl font-medium">
          {filtered ? 'No orders match that' : 'No orders yet'}
        </p>
        <p className="max-w-80">
          {filtered
            ? 'Try another stage, or search by an order number, a piece, or a date.'
            : 'When you place an order, it is tracked here from our packing table to your door.'}
        </p>
        {filtered ? null : (
          <Link href={shopHref} data-slot="button" className={buttonVariants()}>
            Start shopping
          </Link>
        )}
      </div>
    )
  }

  return (
    <>
      <ul className="divide-y border-y">
        {orders.map((order) => {
          const { addressEditable, returnable, status } = order.tracking

          return (
            <li key={order.number} className="py-6">
              <OrderRow
                order={order}
                actions={
                  <>
                    {addressEditable ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        className={TEXT_ACTION}
                        onClick={() => setOpen({ kind: 'address', order })}
                      >
                        Change address
                      </Button>
                    ) : null}
                    {returnable ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        className={TEXT_ACTION}
                        onClick={() => setOpen({ kind: 'return', order })}
                      >
                        Start a return
                      </Button>
                    ) : null}
                    {status === 'delivered' ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        className={TEXT_ACTION}
                        onClick={() => setOpen({ kind: 'review', order })}
                      >
                        Write a review
                      </Button>
                    ) : null}
                  </>
                }
              />
            </li>
          )
        })}
      </ul>

      {/* Each takes the order rather than an open flag so it stays mounted: a
          panel first rendered open skips its entrance. */}
      <ChangeAddressDialog
        demo="fashion"
        order={open?.kind === 'address' ? open.order : null}
        onOpenChange={close}
        fieldVariant="outline"
        flags={CIRCLE_FLAGS}
      />
      <ReturnDrawer order={open?.kind === 'return' ? open.order : null} onOpenChange={close} />
      <ReviewDrawer
        order={open?.kind === 'review' ? open.order : null}
        onOpenChange={close}
        onReviewSubmit={() => {
          toast.add(
            successToast(
              'Thanks for the review',
              `${formatPoints(REWARDS.reviewPoints)} land on your balance once it is published.`,
            ),
          )
        }}
      />
    </>
  )
}
