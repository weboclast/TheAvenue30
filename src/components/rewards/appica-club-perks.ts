import { ArrowCapsule, LockStar, MoneybagMove, Package2Export } from '@appica/icons-react'
import { formatPercent } from '@/lib/commerce/format'
import { REWARDS } from '@/lib/commerce/programs/rewards'

/**
 * What membership buys, in the order both screens offer it: the pitch on
 * `/account/appica-club`, and the strip on the rewards page. 2 copies of this
 * list is how a store adds a perk to one screen and not the other.
 */
export const APPICA_CLUB_PERKS = [
  {
    icon: Package2Export,
    title: 'Free expedited shipping',
    body: '2-day delivery on everything you order, with no minimum to reach first.',
  },
  {
    icon: MoneybagMove,
    title: `+${formatPercent(REWARDS.memberRate - REWARDS.rate)} bonus cashback`,
    body: `Earn ${formatPercent(REWARDS.memberRate)} back in points on every order, instead of the usual ${formatPercent(REWARDS.rate)}.`,
  },
  {
    icon: ArrowCapsule,
    title: 'Extended 60-day returns',
    body: 'Twice the standard 30 days to change your mind and send something back.',
  },
  {
    icon: LockStar,
    title: 'Early access',
    body: 'Shop seasonal sales and limited drops 48 hours before anyone else.',
  },
]
