import type { Metadata } from 'next'
import Image from 'next/image'
import { Button } from '@appica/ui-react/button'
import { CLUB_ARTWORK } from '@/components/fashion/account/club-band'
import { Eyebrow } from '@/components/fashion/eyebrow'
import { APPICA_CLUB_PERKS } from '@/components/rewards/appica-club-perks'
import { RewardsArtwork } from '@/components/rewards/rewards-artwork'
import { formatMoney, formatMoneyRounded, formatPercent } from '@/lib/commerce/format'
import { REWARDS, memberSavings } from '@/lib/commerce/programs/rewards'
import { listAllAccountOrders } from '@/lib/orders'

export const metadata: Metadata = {
  title: REWARDS.name,
}

/**
 * The membership pitch. Nothing here enrolls anyone: the template ships the
 * program as copy and a rate, so the page quotes what the shopper's own orders
 * would have saved. See `commerce/programs/rewards.ts`.
 */
export default async function FashionClubPage() {
  // Unpaginated: the savings figure spans the whole history, which a real
  // backend answers with a sum rather than a page of orders.
  const orders = await listAllAccountOrders('fashion')
  const savings = memberSavings(orders)

  return (
    <>
      <section className="bg-background-muted grid overflow-hidden rounded-sm md:grid-cols-2">
        <div className="relative aspect-4/3 md:aspect-auto md:min-h-112">
          <Image
            src={CLUB_ARTWORK}
            alt=""
            fill
            preload
            sizes="(min-width: 1024px) 38vw, (min-width: 768px) 50vw, 100vw"
            className="object-cover"
          />
        </div>

        <div className="flex flex-col justify-center gap-8 p-6 md:p-10 xl:p-12">
          <div className="flex flex-col gap-3">
            <Eyebrow>Membership</Eyebrow>
            <h1 className="text-foreground-intense text-5xl font-medium md:text-6xl">{REWARDS.name}</h1>
            <p className="text-lg text-pretty">
              Free express delivery, {formatPercent(REWARDS.memberRate)} back in points, twice as long to send things
              back, and a first look at every drop.
            </p>
          </div>

          <div className="flex flex-col items-start gap-3">
            {/* Deliberately inert. Point it at whatever sells the membership: a
                subscription checkout, or a billing provider's hosted page. */}
            <Button size="lg">Join for {formatMoney(REWARDS.price)}/month</Button>
            <p className="text-sm">Billed monthly. Cancel anytime from your account.</p>
          </div>
        </div>
      </section>

      {savings ? (
        <p className="bg-background-muted text-foreground-intense flex items-center gap-4 rounded-sm p-4 pe-6">
          <RewardsArtwork className="size-16" />
          <span>
            As a member, the orders you have placed would have saved you{' '}
            <span className="font-semibold">{formatMoneyRounded(savings)}</span>.
          </span>
        </p>
      ) : null}

      <section aria-labelledby="member-perks" className="flex flex-col gap-2">
        <h2 id="member-perks" className="text-foreground-intense text-2xl font-medium">
          What members get
        </h2>
        <ul className="border-t">
          {APPICA_CLUB_PERKS.map(({ icon: Icon, title, body }) => (
            <li key={title} className="flex items-start gap-4 border-b py-6 sm:gap-6">
              <Icon aria-hidden className="text-foreground-intense mt-0.5 size-6 shrink-0" />
              <div className="flex flex-col gap-1">
                <h3 className="text-foreground-intense text-xl font-medium">{title}</h3>
                <p className="text-pretty">{body}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </>
  )
}
