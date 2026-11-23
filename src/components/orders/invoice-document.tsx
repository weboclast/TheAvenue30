import { Fragment } from 'react'
import { Badge } from '@appica/ui-react/badge'
import { Logo } from '@/components/logo'
import { formatDate, formatMoney } from '@/lib/commerce/format'
import type { Money, Order } from '@/lib/commerce/types'
import { cn } from '@/lib/utils'

/**
 * Who the invoice is from. Placeholder: put your own trading name, address, and
 * billing contact here, plus whatever your jurisdiction requires on an invoice.
 */
const ISSUER = {
  name: 'The Avenue 30',
  address: '1 Market St, San Francisco',
  contact: 'support@example.com',
}

/** What an invoice number is prefixed with, so it cannot be mistaken for the order number. */
const INVOICE_PREFIX = 'INV'

/**
 * An order as a printable invoice. Every figure is the order's own; nothing is
 * re-counted, or a reprint next year would disagree with the one already filed.
 */
export function InvoiceDocument({ order }: { order: Order }) {
  return (
    <article className="@container flex flex-col gap-4">
      <header className="bg-background-muted flex flex-col gap-6 rounded-xl p-6">
        <h3 className="text-foreground-intense text-2xl font-semibold tracking-tight">INVOICE</h3>

        <div className="flex items-center gap-3">
          <Logo variant="mark" href={null} label="" className="size-10" />
          <div className="flex min-w-0 flex-col">
            <p className="text-foreground-intense text-sm font-medium">{ISSUER.name}</p>
            <p className="text-xs">{ISSUER.address}</p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <Meta label="Order number">
            <p className="text-foreground-intense text-sm font-medium">{order.number}</p>
          </Meta>
          <Meta label="Invoice date">
            <p className="text-foreground-intense text-sm font-medium">{formatDate(order.placedAt)}</p>
          </Meta>
          <Meta label="Invoice number">
            <Badge variant="outline" className="font-medium">
              {invoiceNumber(order.number)}
            </Badge>
          </Meta>
        </div>
      </header>

      {/* Border and radius on the wrapper: a table with collapsed borders does
          not round its own corners. */}
      <div className="rounded-xl border p-4 @sm:p-6">
        {/* A real table, for column alignment. Not the library's `Table`, whose
            card, tinted header, and padding would all have to be undone here. */}
        <table className="w-full text-sm">
          <thead>
            <tr className="text-xs">
              <th scope="col" className="pb-3 text-start font-normal">
                Item
              </th>
              <th scope="col" className="hidden pe-4 pb-3 text-end font-normal @sm:table-cell">
                Qty
              </th>
              <th scope="col" className="hidden pe-4 pb-3 text-end font-normal @sm:table-cell">
                Price
              </th>
              <th scope="col" className="pb-3 text-end font-normal">
                Amount
              </th>
            </tr>
          </thead>

          <tbody>
            {order.lines.map((line) => (
              <Fragment key={line.id}>
                <LineRow label={line.title} quantity={line.quantity} unit={line.unitPrice} total={line.lineTotal} />
                {/* A plan is sold at its own price, and an invoice itemizes it. */}
                {line.protectionPlan ? (
                  <LineRow
                    label={line.protectionPlan.label}
                    quantity={line.quantity}
                    unit={line.protectionPlan.price}
                    total={{
                      amount: line.protectionPlan.price.amount * line.quantity,
                      currencyCode: line.protectionPlan.price.currencyCode,
                    }}
                  />
                ) : null}
              </Fragment>
            ))}
          </tbody>

          <tfoot>
            <TotalRow label="Subtotal" money={order.subtotal} ruled />
            {order.services ? <TotalRow label="Services and options" money={order.services} /> : null}
            {order.savings ? <TotalRow label="Savings" money={order.savings} negative /> : null}
            {order.tradeInCredit ? <TotalRow label="Trade-in credit" money={order.tradeInCredit} negative /> : null}
            {order.discount ? (
              <TotalRow label={`Discount (${order.discount.code})`} money={order.discount.amount} negative />
            ) : null}
            <TotalRow label="Shipping" money={order.shipping} />
            <TotalRow label="Total" money={order.total} ruled emphasis />
          </tfoot>
        </table>
      </div>

      <p className="text-xs">
        For questions about this invoice, please contact{' '}
        <a
          href={`mailto:${ISSUER.contact}`}
          className="text-foreground-emphasis focus-visible:outline-ring underline hover:no-underline focus-visible:outline-2 focus-visible:outline-offset-1"
        >
          {ISSUER.contact}
        </a>
      </p>
    </article>
  )
}

/** An invoice number derived from the order's, so support can match the 2 without a lookup. */
function invoiceNumber(orderNumber: string): string {
  return `${INVOICE_PREFIX}-${orderNumber.split('-').at(-1) ?? orderNumber}`
}

/** One labeled fact in the invoice masthead. */
function Meta({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col items-start gap-1.5">
      <p className="text-xs">{label}:</p>
      {children}
    </div>
  )
}

interface LineRowProps {
  label: string
  quantity: number
  unit: Money
  total: Money
}

/**
 * One billed line. Too narrow for 4 columns, quantity and unit price fold into
 * the item cell rather than scrolling sideways; hiding a column's every cell
 * collapses it.
 */
function LineRow({ label, quantity, unit, total }: LineRowProps) {
  return (
    <tr>
      <td className="text-foreground-intense py-2 pe-4">
        {label}
        <span className="text-foreground block text-xs tabular-nums @sm:hidden">
          {quantity} &times; {formatMoney(unit)}
        </span>
      </td>
      <td className="hidden py-2 pe-4 text-end tabular-nums @sm:table-cell">{quantity}</td>
      <td className="hidden py-2 pe-4 text-end tabular-nums @sm:table-cell">{formatMoney(unit)}</td>
      <td className="text-foreground-intense py-2 text-end font-semibold tabular-nums">{formatMoney(total)}</td>
    </tr>
  )
}

interface TotalRowProps {
  label: string
  money: Money
  /** Draw the figure as money coming off the order, with a leading minus. */
  negative?: boolean
  /** Rule the row off from the one above with the receipt's dashed line. */
  ruled?: boolean
  /** The order's own total, set larger than the figures it sums. */
  emphasis?: boolean
}

/** One figure in the invoice's tally. The minus is real text, so a screen reader announces it. */
function TotalRow({ label, money, negative, ruled, emphasis }: TotalRowProps) {
  const cell = cn(
    'py-1.5',
    ruled && 'border-border-strong border-t border-dashed pt-3',
    emphasis && 'text-foreground-intense text-base',
  )

  return (
    <tr>
      {/* A tally has 1 figure, and it belongs under the amounts. */}
      <td colSpan={3} className={cn(cell, 'pe-4')}>
        {label}
      </td>
      <td className={cn(cell, 'text-foreground-intense text-end font-semibold tabular-nums', emphasis && 'text-lg')}>
        {negative ? '-' : null}
        {formatMoney(money)}
      </td>
    </tr>
  )
}
