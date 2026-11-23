'use client'

import { useState } from 'react'
import { Button } from '@appica/ui-react/button'
import { CIRCLE_FLAGS } from '@/components/address-fields'
import { TEXT_ACTION } from '@/components/fashion/text-action'
import { ChangeAddressDialog } from '@/components/orders/change-address-dialog'
import { InvoiceDialog } from '@/components/orders/invoice-dialog'
import type { Order } from '@/lib/commerce/types'
import { ReturnDrawer } from './return-drawer'

/*
 * What a shopper can do about an order, each beside the thing it acts on and
 * each owning its panel. Whether one is offered is the store's answer, on
 * `OrderTracking`; the page decides only where it sits.
 */

/** Asks for the order to go somewhere else, from under the address it replaces. */
export function ChangeAddressAction({ order }: { order: Order }) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button variant="ghost" size="sm" className={TEXT_ACTION} onClick={() => setOpen(true)}>
        Change address
      </Button>
      {/* Takes the order rather than a flag so it stays mounted: a panel first rendered open skips its entrance. */}
      <ChangeAddressDialog
        demo="fashion"
        order={open ? order : null}
        onOpenChange={setOpen}
        fieldVariant="outline"
        flags={CIRCLE_FLAGS}
      />
    </>
  )
}

/** The invoice, from under the payment it records. */
export function ViewInvoiceAction({ order }: { order: Order }) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button variant="ghost" size="sm" className={TEXT_ACTION} onClick={() => setOpen(true)}>
        View invoice
      </Button>
      <InvoiceDialog order={order} open={open} onOpenChange={setOpen} />
    </>
  )
}

/** Opens a return against a delivered order. */
export function StartReturnAction({ order }: { order: Order }) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button onClick={() => setOpen(true)}>Start a return</Button>
      <ReturnDrawer order={open ? order : null} onOpenChange={setOpen} />
    </>
  )
}
