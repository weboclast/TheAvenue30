import Image from 'next/image'
import Link from 'next/link'
import { buttonVariants } from '@appica/ui-react/button'
import { accountPath } from '@/components/account/account-paths'
import { Eyebrow } from '@/components/fashion/eyebrow'
import { APPICA_CLUB_PERKS } from '@/components/rewards/appica-club-perks'
import { formatMoney } from '@/lib/commerce/format'
import { REWARDS } from '@/lib/commerce/programs/rewards'
import { cn } from '@/lib/utils'

/** The membership's artwork, which its own page opens with: the storefront's 4 colors, draped. Decorative. */
export const APPICA_CLUB_ARTWORK = '/demo/fashion/account/appica-club-fabric.webp'

/**
 * The membership, signposted: the promise and the perks beside its artwork,
 * and the way to the page that sells it. Nothing here enrolls anyone.
 */
export function AppicaClubBand({ className }: { className?: string }) {
  return (
    <section
      aria-labelledby="appica-club-band"
      className={cn('bg-background-muted grid overflow-hidden rounded-sm sm:grid-cols-5', className)}
    >
      <div className="relative aspect-3/2 sm:col-span-2 sm:aspect-auto">
        <Image
          src={APPICA_CLUB_ARTWORK}
          alt=""
          fill
          sizes="(min-width: 1024px) 28vw, (min-width: 500px) 40vw, 100vw"
          className="object-cover"
        />
      </div>

      <div className="flex flex-col items-start gap-6 p-6 sm:col-span-3 md:p-8">
        <div className="flex flex-col gap-2">
          <Eyebrow>Membership</Eyebrow>
          <h2 id="appica-club-band" className="text-foreground-intense text-2xl font-medium">
            {REWARDS.name}
          </h2>
          <p className="text-pretty">Everything we sell, delivered faster, rewarded more, and kept longer.</p>
        </div>

        <ul className="grid gap-x-6 gap-y-2.5 md:grid-cols-2">
          {APPICA_CLUB_PERKS.map(({ icon: Icon, title }) => (
            <li key={title} className="text-foreground-intense flex items-center gap-2 text-sm">
              <Icon aria-hidden className="size-4.5 shrink-0" />
              {title}
            </li>
          ))}
        </ul>

        <Link href={accountPath('fashion', 'appica-club')} data-slot="button" className={buttonVariants()}>
          Join for {formatMoney(REWARDS.price)}/month
        </Link>
      </div>
    </section>
  )
}
