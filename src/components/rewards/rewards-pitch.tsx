import { formatPercent } from '@/lib/commerce/format'
import { REWARDS, memberRewardPoints, rewardPoints } from '@/lib/commerce/programs/rewards'
import type { Money } from '@/lib/commerce/types'
import { cn } from '@/lib/utils'
import { RewardsArtwork } from './rewards-artwork'

interface RewardsPitchProps {
  /** What the order comes to, which is what it earns on. */
  total: Money
  className?: string
}

/** The loyalty program's pitch in a cart summary: the member rate, and what this order earns at both rates. */
export function RewardsPitch({ total, className }: RewardsPitchProps) {
  return (
    <div data-slot="rewards-pitch" className={cn('flex items-center gap-3 rounded-xl border p-3', className)}>
      <RewardsArtwork />
      <div className="flex flex-col gap-1 text-sm">
        <p data-slot="rewards-pitch-title" className="text-foreground-intense font-medium">
          {formatPercent(REWARDS.memberRate)} back with {REWARDS.name}
        </p>
        <p>
          This order earns {rewardPoints(total)} points, or {memberRewardPoints(total)} as a member.
        </p>
      </div>
    </div>
  )
}
