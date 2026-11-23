'use client'

import { createElement } from 'react'
import Script from 'next/script'
import { useTheme } from '@appica/ui-react/hooks/use-theme'
import { KlarnaBadge } from '@/components/payment-methods'
import { formatMoney } from '@/lib/commerce/format'
import type { Money } from '@/lib/commerce/types'
import { cn } from '@/lib/utils'

/*
 * The "pay in installments" line under a product's price.
 *
 * Out of the box this is a static sentence and a logo: no account, no script,
 * no network call, so the template renders the way a shopper would see it.
 *
 * Going live is a configuration change rather than a code change. Set the
 * client id from Klarna's Merchant Portal in `.env.local` and the same
 * component renders Klarna's own on-site messaging instead:
 *
 *     NEXT_PUBLIC_KLARNA_CLIENT_ID=klarna_live_client_...
 *     NEXT_PUBLIC_KLARNA_ENVIRONMENT=production
 *
 * Both are public on purpose: Klarna's placement is a browser widget, and the
 * client id is meant to ship to it. Nothing secret belongs here.
 *
 * Klarna's placement replaces the whole line rather than decorating it. The
 * wording of a credit offer is regulated, it differs by market (pay in 4 in the
 * US, pay in 3 in much of Europe), and the "learn more" panel has to be
 * Klarna's, so a store that has an account should be showing Klarna's text and
 * not ours. That is also why the static line below is a placeholder rather than
 * a feature.
 *
 * Dropping the whole thing: delete this file and its usage in each product
 * page's buy box.
 *
 * Docs: https://docs.klarna.com/conversion-boosters/on-site-messaging/
 */

const CLIENT_ID = process.env.NEXT_PUBLIC_KLARNA_CLIENT_ID

/** Klarna's sandbox until a store says otherwise, so a wrong id can't charge anyone. */
const ENVIRONMENT = process.env.NEXT_PUBLIC_KLARNA_ENVIRONMENT ?? 'playground'

const SDK_SRC = 'https://js.klarna.com/web-sdk/v1/klarna.js'

/** The product-page placement: interactive, and sized by its container. */
const PLACEMENT_KEY = 'credit-promotion-auto-size'

/** Picks the market whose terms are quoted. Change it with the catalog's currency. */
const LOCALE = 'en-US'

/** Installments quoted by the static line. Klarna's own placement knows each market's. */
const INSTALLMENTS = 4

/** Where the placeholder's logo points until Klarna's own messaging takes over. */
const LEARN_MORE_URL = 'https://www.klarna.com/us/pay-in-4/'

interface KlarnaMessageProps {
  /** What the shopper would pay today, with any option surcharges already in it. */
  price: Money
  className?: string
}

/**
 * Quotes the price as installments. Renders Klarna's on-site messaging where the
 * store is configured for it, and a static placeholder everywhere else.
 *
 * Pass the price the buy button quotes, not the product's list price: a shopper
 * who upgrades the storage should see the installment follow.
 */
export function KlarnaMessage({ price, className }: KlarnaMessageProps) {
  // `mounted` guards the first render, which happens before the stored theme is
  // known. Guessing there would hydrate a light widget onto a dark page.
  const { resolvedTheme, mounted } = useTheme()

  if (!CLIENT_ID) return <KlarnaPlaceholder price={price} className={className} />

  return (
    <div className={className}>
      {/* Klarna allows 1 SDK instance per page; `next/script` de-duplicates by src. */}
      <Script async src={SDK_SRC} data-environment={ENVIRONMENT} data-client-id={CLIENT_ID} />
      <KlarnaPlacement
        data-key={PLACEMENT_KEY}
        data-locale={LOCALE}
        // Klarna reads minor units, so $1,225.00 is 122500. Klarna asks that a
        // product page keep this in step with the price on screen, which is why
        // the quoted price is a prop rather than read once from the product.
        data-purchase-amount={Math.round(price.amount * 100)}
        data-theme={mounted && resolvedTheme === 'dark' ? 'dark' : 'default'}
      />
    </div>
  )
}

/**
 * Klarna's placement is a custom element, not a React component, so JSX carries
 * no type for the tag. `createElement` takes it as a string and hands the
 * attributes straight to the DOM, which is what a custom element reads.
 */
function KlarnaPlacement(attributes: {
  'data-key': string
  'data-locale': string
  'data-purchase-amount': number
  'data-theme': string
}) {
  return createElement('klarna-placement', attributes)
}

/** The line shown with no Klarna account: the offer a US store would make, spelled out. */
function KlarnaPlaceholder({ price, className }: KlarnaMessageProps) {
  const installment: Money = { ...price, amount: price.amount / INSTALLMENTS }

  return (
    <p className={cn('text-foreground flex flex-wrap items-center gap-2 text-sm', className)}>
      <span>
        Pay in {INSTALLMENTS} interest-free payments of{' '}
        <span className="text-foreground-intense font-semibold">{formatMoney(installment)}</span> with Klarna
      </span>
      <a
        href={LEARN_MORE_URL}
        target="_blank"
        rel="noreferrer"
        aria-label="Learn more about paying with Klarna (opens in a new tab)"
        className="outline-ring rounded-2xs focus-visible:outline-2 focus-visible:outline-offset-2"
      >
        <KlarnaBadge />
      </a>
    </p>
  )
}
