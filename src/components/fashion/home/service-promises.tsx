import Link from 'next/link'
import { buttonVariants } from '@appica/ui-react/button'
import { accountPath } from '@/components/account/account-paths'
import { AccountLink } from '@/components/auth/sign-in-gate'
import { CaretSwap } from '@/components/fashion/caret-swap'
import { STORE_PROMISES } from '@/components/fashion/product/product-perks'
import { Logo } from '@/components/logo'
import { APPICA_CLUB_PERKS } from '@/components/rewards/appica-club-perks'
import { formatMoney } from '@/lib/commerce/format'
import { REWARDS } from '@/lib/commerce/programs/rewards'

const HEADING = 'text-foreground-intense flex items-center gap-3 font-mono text-lg uppercase'

/**
 * The membership beside what every order comes with, closing the home page.
 * Each promise opens the answer that spells out its terms. Nothing here
 * enrolls anyone: the membership's own page sells it, and a guest signs in on
 * the way there.
 */
export function ServicePromises() {
  return (
    <section className="container grid gap-12 pb-16 md:pb-20 lg:grid-cols-2 lg:gap-x-12 xl:gap-x-20 xl:pb-24">
      <div className="flex flex-col items-start gap-6">
        <div className="flex flex-col gap-3">
          <h2 className={HEADING}>
            <Logo href={null} variant="mark" club label="" className="h-7" />
            {REWARDS.name}
          </h2>
          <p className="max-w-md text-pretty">More back on every order, and longer to decide.</p>
        </div>

        <ul className="w-full border-t">
          {APPICA_CLUB_PERKS.map(({ icon: Icon, title }) => (
            <li key={title} className="text-foreground-intense flex items-center gap-3 border-b py-4">
              <Icon aria-hidden className="size-5 shrink-0" />
              {title}
            </li>
          ))}
        </ul>

        <AccountLink href={accountPath('fashion', 'appica-club')} data-slot="button" className={buttonVariants()}>
          Join for {formatMoney(REWARDS.price)}/month
        </AccountLink>
      </div>

      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-3">
          <h2 className={HEADING}>With every order</h2>
          <p className="max-w-md text-pretty">Member or not, these come with everything we sell.</p>
        </div>

        <ul className="border-t">
          {STORE_PROMISES.map(({ icon: Icon, label, topic }) => (
            <li key={topic} className="border-b">
              <Link
                href={`/contact#${topic}`}
                className="group outline-ring text-foreground-intense rounded-4xs flex items-center gap-3 py-4 focus-visible:outline-2 focus-visible:outline-offset-2"
              >
                <Icon aria-hidden className="size-5 shrink-0" />
                <span className="flex-1">{label}</span>
                <CaretSwap />
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
