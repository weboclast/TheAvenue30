import { CopyButton } from '@appica/ui-react/copy-button'
import { orderPaymentLabel, orderPaymentMark } from '@/components/orders/order-payment'
import { PaymentMark, paymentMarkSlot } from '@/components/payment-methods'
import { formatCountry, formatDate, formatOrderArrival } from '@/lib/commerce/format'
import type { Order } from '@/lib/commerce/types'
import { cn } from '@/lib/utils'

interface OrderDetailsProps {
  order: Order
  /** Set under the address, e.g. a way to change it. */
  addressAction?: React.ReactNode
  /** Set under the payment, e.g. the invoice. */
  paymentAction?: React.ReactNode
  className?: string
}

/**
 * Where an order is going, how, and what paid for it, as a grid of labeled
 * facts. Shared by the receipt and order tracking; the carrier appears once it
 * has the parcel.
 */
export function OrderDetails({ order, addressAction, paymentAction, className }: OrderDetailsProps) {
  const { pickup, carrier, trackingNumber } = order.delivery
  const { status, steps } = order.tracking
  const address = order.shippingAddress
  const deliveredAt = steps.find((step) => step.status === 'delivered')?.at
  const carried = !pickup && carrier && (status === 'out-for-delivery' || status === 'delivered')

  let arrival = formatOrderArrival(order.delivery)
  if (deliveredAt) arrival = `${pickup ? 'Collected' : 'Arrived'} ${formatDate(deliveredAt)}`
  else if (pickup && order.delivery.arrival) arrival = `Ready from ${formatDate(order.delivery.arrival.from)}`

  return (
    <dl className={cn('grid gap-6 rounded-sm border p-6 sm:grid-cols-2', className)}>
      <Detail label={pickup ? 'Collect from' : 'Delivery address'} action={addressAction}>
        <address className="not-italic">
          {pickup ? pickup.name : `${address.firstName} ${address.lastName}`}
          <br />
          {address.line1}
          <br />
          {address.city}
          {address.state ? `, ${address.state}` : null} {address.postcode}
          <br />
          {formatCountry(address.countryCode)}
        </address>
      </Detail>

      <Detail label={pickup ? 'Collection' : 'Delivery method'}>
        {order.delivery.name}
        <br />
        <span className="text-foreground">{arrival}</span>
      </Detail>

      {carried ? (
        <Detail label="Carrier">
          {carrier.name}
          {/* Dropped once it lands, when support asks for the order number instead. */}
          {trackingNumber && !deliveredAt ? (
            <span className="text-foreground flex items-center gap-1">
              <span className="font-mono text-sm">{trackingNumber}</span>
              <CopyButton
                value={trackingNumber}
                variant="ghost"
                size="icon-sm"
                label={`Copy tracking number ${trackingNumber}`}
              />
            </span>
          ) : null}
        </Detail>
      ) : null}

      <Detail label="Payment" action={paymentAction}>
        <span className="flex flex-wrap items-center gap-2">
          {orderPaymentLabel(order)}
          <PaymentBrand order={order} />
        </span>
      </Detail>

      <Detail label={pickup ? 'Collected by' : 'Contact'}>
        {/* A shipped order names its recipient in the address; a collected one has only the store's there. */}
        {pickup ? (
          <>
            {address.firstName} {address.lastName}
            <br />
          </>
        ) : null}
        {order.email}
        {address.phone ? (
          <>
            <br />
            {address.phone}
          </>
        ) : null}
      </Detail>

      {order.giftMessage ? (
        <Detail label="Gift note" className="sm:col-span-2">
          <q className="whitespace-pre-line">{order.giftMessage}</q>
        </Detail>
      ) : null}

      {order.notes ? (
        <Detail label="Delivery note" className="sm:col-span-2">
          <span className="whitespace-pre-line">{order.notes}</span>
        </Detail>
      ) : null}
    </dl>
  )
}

interface DetailProps {
  label: string
  /** Set under the fact it acts on. */
  action?: React.ReactNode
  className?: string
  children: React.ReactNode
}

/** One labeled fact, its label set like the storefront's eyebrows. */
function Detail({ label, action, className, children }: DetailProps) {
  return (
    <div className={cn('flex flex-col items-start gap-2', className)}>
      <dt className="text-foreground-muted font-mono text-sm tracking-wide uppercase">{label}</dt>
      <dd className="text-foreground-intense">{children}</dd>
      {action ? <dd>{action}</dd> : null}
    </div>
  )
}

/** The card scheme or wallet that paid, in its own colors: a receipt names what charged it. */
function PaymentBrand({ order }: { order: Order }) {
  const mark = orderPaymentMark(order)
  if (!mark) return null

  return (
    <span aria-hidden className={paymentMarkSlot(mark)}>
      <PaymentMark name={mark} />
    </span>
  )
}
