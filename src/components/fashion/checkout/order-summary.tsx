import { Separator } from '@appica/ui-react/separator'
import { Price } from '@/components/price'
import { RewardsArtwork } from '@/components/rewards/rewards-artwork'
import { formatMoney } from '@/lib/commerce/format'
import { REWARDS, memberRewardPoints, rewardPoints } from '@/lib/commerce/programs/rewards'
import type { Order } from '@/lib/commerce/types'
import { cn } from '@/lib/utils'
import { SummaryLines } from './summary-lines'

/**
 * What a placed order came to, laid out like the bag's summary it was paid from.
 * Every figure is the one the order recorded, never a fresh quote, so a price
 * change tomorrow cannot rewrite today's receipt.
 */
export function OrderSummary({ order, className }: { order: Order; className?: string }) {
  const items = order.lines.reduce((total, line) => total + line.quantity, 0)
  const points = rewardPoints(order.total)

  return (
    <section className={cn('bg-background-muted flex flex-col gap-5 rounded-sm p-6', className)}>
      <h2 className="text-foreground-intense text-2xl font-medium">
        Order summary <span className="text-foreground-subtle text-xl font-normal">({items})</span>
      </h2>

      <SummaryLines lines={order.lines} />

      <Separator />

      <dl className="flex flex-col gap-2 text-sm">
        <ReceiptRow label="Subtotal">
          <Price money={order.subtotal} scaleFraction={false} />
        </ReceiptRow>
        {/* Gift wrapping is the only service this store sells. */}
        {order.services ? (
          <ReceiptRow label="Gift wrapping">
            <Price money={order.services} scaleFraction={false} />
          </ReceiptRow>
        ) : null}
        {order.discount ? (
          <ReceiptRow
            label={
              <>
                Discount <span className="text-foreground-intense font-mono">{order.discount.code}</span>
              </>
            }
          >
            -<Price money={order.discount.amount} scaleFraction={false} />
          </ReceiptRow>
        ) : null}
        {order.rewards ? (
          <ReceiptRow label={`${order.rewards.points} points`}>
            -<Price money={order.rewards.credit} scaleFraction={false} />
          </ReceiptRow>
        ) : null}
        <ReceiptRow label={order.delivery.pickup ? 'Collection' : 'Delivery'}>
          {order.shipping.amount === 0 ? 'Free' : <Price money={order.shipping} scaleFraction={false} />}
        </ReceiptRow>
      </dl>

      <Separator />

      <div className="flex flex-col gap-1">
        <p className="text-foreground-intense flex items-baseline justify-between gap-4">
          Total
          <Price money={order.total} scaleFraction={false} className="font-mono text-lg font-semibold" />
        </p>
        {order.savings ? (
          <p className="text-sm">
            You saved{' '}
            <Price money={order.savings} scaleFraction={false} className="text-foreground-intense font-medium" /> on
            sale items.
          </p>
        ) : null}
      </div>

      {/* Past tense, unlike the bag's pitch: this order has earned them. Nothing is
          awarded here; wire that to your loyalty provider. */}
      <div className="bg-background-subtle flex items-center gap-3 rounded-sm border p-3">
        <RewardsArtwork />
        <div className="flex flex-col gap-1 text-sm">
          <p className="text-foreground-intense font-medium">
            You earned {points} points, worth{' '}
            {formatMoney({ amount: points * REWARDS.pointValue, currencyCode: order.total.currencyCode })}
          </p>
          <p>
            With {REWARDS.name} this order would have earned {memberRewardPoints(order.total)}.
          </p>
        </div>
      </div>
    </section>
  )
}

/** One labeled figure. A minus in the children is real text, so a screen reader reads the deduction. */
function ReceiptRow({ label, children }: { label: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <dt>{label}</dt>
      <dd className="text-foreground-intense font-mono font-semibold">{children}</dd>
    </div>
  )
}
