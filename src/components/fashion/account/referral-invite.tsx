'use client'

import Image from 'next/image'
import { Share } from '@appica/icons-react'
import { Button } from '@appica/ui-react/button'
import { CopyButton } from '@appica/ui-react/copy-button'
import { Input } from '@appica/ui-react/input'
import { Eyebrow } from '@/components/fashion/eyebrow'
import { useWebShare } from '@/components/use-web-share'
import { formatMoneyRounded } from '@/lib/commerce/format'
import { formatPoints } from '@/lib/rewards/ledger'
import type { Referral } from '@/lib/rewards/referral'

/** The 2 faces beside the offer: the shopper and the friend they send it to. */
const FACES = ['/demo/shared/referral-1.webp', '/demo/shared/referral-2.webp']

/**
 * The invitation, readable rather than hidden behind a button, since a shopper
 * about to paste a link into a message wants to see it. Share opens the phone's
 * own sheet, and only where the browser has one.
 */
export function ReferralInvite({ referral }: { referral: Referral }) {
  const share = useWebShare()

  return (
    <section aria-labelledby="referral" className="grid gap-6 rounded-sm border p-6 md:grid-cols-5 md:gap-8 md:p-8">
      <div className="flex flex-col items-start gap-3 md:col-span-3">
        <span className="flex *:not-first:-ms-3">
          {FACES.map((face) => (
            <Image
              key={face}
              src={face}
              alt=""
              width={96}
              height={96}
              className="border-background size-12 rounded-full border-2 object-cover"
            />
          ))}
        </span>
        <Eyebrow>Refer a friend</Eyebrow>
        <h2 id="referral" className="text-foreground-intense text-2xl font-medium">
          Give {formatMoneyRounded(referral.friendDiscount)}, get {formatPoints(referral.points)}
        </h2>
        <p className="text-pretty">
          Your friend takes {formatMoneyRounded(referral.friendDiscount)} off their first order with your link, and the
          points reach you once that order arrives.
        </p>
      </div>

      <div className="flex flex-col justify-end md:col-span-2">
        <Input
          readOnly
          variant="outline"
          inputSize="lg"
          value={referral.url}
          aria-label="Your referral link"
          className="pe-1.75"
          inputProps={{ onFocus: (event) => event.target.select() }}
          endSlot={
            <span className="flex items-center">
              <CopyButton
                value={referral.url}
                variant="ghost"
                size="icon-md"
                label="Copy referral link"
                copiedLabel="Referral link copied"
              />
              {share ? (
                <Button
                  variant="ghost"
                  size="icon-md"
                  aria-label="Share referral link"
                  onClick={() => void share({ title: 'The Avenue 30', text: 'Here is my invite', url: referral.url })}
                >
                  <Share />
                </Button>
              ) : null}
            </span>
          }
        />
      </div>
    </section>
  )
}
