import type { ComponentType } from 'react'
import { ArrowCapsule, Coins, HeartStar, Package2Export } from '@appica/icons-react'
import { Thumbnail } from '@appica/ui-react/thumbnail'
import { cn } from '@/lib/utils'

/** One perk of having an account: an icon and a line saying what it is. */
export interface AccountBenefit {
  icon: ComponentType
  label: string
}

const BENEFITS: AccountBenefit[] = [
  { icon: Coins, label: 'Get $5 back for every $100 you spend.' },
  { icon: Package2Export, label: "Stay updated on your package's journey." },
  { icon: ArrowCapsule, label: 'Stay in sync on all your devices.' },
  { icon: HeartStar, label: 'Enjoy early access and exclusive events.' },
]

interface AccountBenefitsProps {
  /** The perks to list, for a store whose account offers others. @default the rewards program's 4 */
  items?: AccountBenefit[]
  className?: string
}

/** The account-perks list shared by the sign-in drawer and the auth pages. */
export function AccountBenefits({ items = BENEFITS, className }: AccountBenefitsProps) {
  return (
    <ul className={cn('flex flex-col gap-2', className)}>
      {items.map(({ icon: Icon, label }) => (
        <li key={label} className="text-foreground flex items-center gap-2 text-sm">
          <Thumbnail variant="icon-outline" size={24} className="[&_svg]:stroke-[1.85]">
            <Icon />
          </Thumbnail>
          {label}
        </li>
      ))}
    </ul>
  )
}
