import Image from 'next/image'
import Link from 'next/link'
import { buttonVariants } from '@appica/ui-react/button'
import { Eyebrow } from '@/components/fashion/eyebrow'
import { InfoPopover } from '@/components/info-popover'
import { formatCount, formatMoney } from '@/lib/commerce/format'
import { type RewardsBalance as Balance, balanceFacts, formatPoints, pointsValue } from '@/lib/rewards/ledger'
import { cn } from '@/lib/utils'

/**
 * What the shopper holds and what it is worth, and the 1 place to spend it.
 * Points come off at the checkout rather than here, so the panel's action is the
 * way to the bag, not a form; `lib/rewards/AGENTS.md` traces the path.
 */
export function RewardsBalance({ balance }: { balance: Balance }) {
  return (
    <section aria-labelledby="points-balance" className="bg-background-muted flex flex-col gap-8 rounded-sm p-6 md:p-8">
      <div className="flex items-start justify-between gap-6">
        <div className="flex flex-col gap-2">
          <Eyebrow id="points-balance">Points balance</Eyebrow>
          <p className="text-foreground-intense font-mono text-5xl md:text-6xl">{formatCount(balance.available)}</p>
          <p>
            Worth {formatMoney(pointsValue(balance.available, balance.currencyCode))} at checkout, at{' '}
            {formatMoney(pointsValue(1, balance.currencyCode))} a point.
          </p>
        </div>
        {/* 60px keeps the 120px coin sharp on a 2x screen. */}
        <Image
          src="/demo/shared/reward.webp"
          alt=""
          width={60}
          height={60}
          className="size-15 shrink-0 max-sm:hidden"
        />
      </div>

      <dl className="grid gap-5 border-t pt-6 sm:grid-cols-3">
        {balanceFacts(balance).map((fact) => (
          <div key={fact.label} className="flex flex-col gap-1">
            <dt className="flex items-center gap-1 text-sm">
              {fact.label}
              <InfoPopover label={`What "${fact.label}" means`}>{fact.info}</InfoPopover>
            </dt>
            <dd className="text-foreground-intense order-first font-mono text-xl">{formatPoints(fact.points)}</dd>
          </div>
        ))}
      </dl>

      {balance.available > 0 ? (
        <Link href="/cart" data-slot="button" className={cn(buttonVariants(), 'self-start')}>
          Spend at checkout
        </Link>
      ) : (
        <p className="text-sm">Points land here once an order is delivered.</p>
      )}
    </section>
  )
}
