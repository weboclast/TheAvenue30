import type { ReactNode } from 'react'
import type { PaymentMethodId } from '@/lib/commerce/types'
import { cn } from '@/lib/utils'

/*
 * The accepted-payment marks.
 *
 * Inlined as SVG rather than shipped as images, so each can be drawn in its
 * brand's colors or flattened to whatever color it sits in. That is the
 * `monochrome` switch, and why every mark is a function rather than a node.
 *
 * The colors are not always the official swatch: these marks are 19px tall and
 * have to survive both themes, so the near-navy ones are lightened. The 3 that
 * are simply black artwork take `text-foreground-intense` instead.
 */

/** A brand color, or `currentColor` where the caller asked for 1 flat tone. */
const tone = (monochrome: boolean, color: string) => (monochrome ? 'currentColor' : color)

/** What a mark drawn in ink rather than in color wears, so it inverts with the theme. */
const INK = 'text-foreground-intense'

/** The 2 overlapping discs Mastercard and Maestro share, drawn once with the colors as props. */
function CircleDuoMark({
  monochrome,
  colors,
  registered,
}: {
  monochrome: boolean
  /** The left disc, their overlap, and the right disc, in that order. */
  colors: [string, string, string]
  /** Draw the ® beside the discs, which only Mastercard carries. */
  registered?: boolean
}) {
  const [left, overlap, right] = colors

  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="31.03" height="19.18" viewBox="0 0 31.03 19.18" aria-hidden="true">
      {/* In 1 tone the discs are told apart by opacity instead of by hue. */}
      <path
        fill={tone(monochrome, left)}
        opacity={monochrome ? 0.5 : undefined}
        d="M11.85 9.6a9.6 9.6 0 0 1 3.67-7.55 9.59 9.59 0 1 0 0 15.08 9.6 9.6 0 0 1-3.67-7.54"
      />
      <path
        fill={tone(monochrome, overlap)}
        opacity={monochrome ? 0.75 : undefined}
        d="M15.52 2.05a9.59 9.59 0 0 1 0 15.08 9.59 9.59 0 0 1 0-15.08"
      />
      <path
        fill={tone(monochrome, right)}
        d="M31.03 9.6a9.59 9.59 0 0 1-15.51 7.53 9.6 9.6 0 0 0 0-15.08A9.59 9.59 0 0 1 31.03 9.6"
      />
      {registered ? (
        <path
          fill={tone(monochrome, right)}
          d="M30.12 15.54v-.31h.13v-.07h-.32v.07h.13v.3zm.61 0v-.38h-.1l-.1.27-.12-.27h-.1v.38h.08v-.29l.1.25h.07l.1-.25v.29z"
        />
      ) : null}
    </svg>
  )
}

/**
 * The PayPal wordmark, as its 2 words. Split out of the single path it arrived
 * as by rewriting each subpath's relative start to an absolute one, so the
 * halves sit exactly where the whole did.
 */
const PAYPAL_PAY =
  'M19.46 2.54h-1.32a.4.4 0 0 0-.32.17L16 5.39l-.77-2.58a.4.4 0 0 0-.37-.27h-1.3a.23.23 0 0 0-.22.3l1.46 4.28-1.37 1.93c-.1.15 0 .36.19.36h1.32q.2 0 .31-.17l4.4-6.34c.1-.15 0-.36-.19-.36M10.62 5.1a1.5 1.5 0 0 1-1.49 1.26q-.57 0-.88-.36-.3-.36-.2-.92c.11-.75.72-1.27 1.47-1.27q.57 0 .88.36.3.38.22.93M12.45 2.54h-1.31q-.18.01-.23.2l-.06.36-.09-.13c-.28-.42-.92-.55-1.55-.55-1.46 0-2.7 1.1-2.94 2.64-.13.77.05 1.5.49 2.02q.61.69 1.66.67c1.17 0 1.82-.75 1.82-.75l-.06.36c-.02.14.09.27.23.27h1.18c.19 0 .35-.14.38-.32l.71-4.5a.23.23 0 0 0-.23-.27M4.56 2.57c-.15.99-.9.99-1.64.99h-.41l.3-1.84q.02-.18.22-.2h.19c.5 0 .96 0 1.2.29q.23.25.14.76M4.24 0H1.49a.4.4 0 0 0-.38.32L.01 7.36c-.03.14.08.27.22.27h1.31c.19 0 .35-.14.38-.32l.3-1.9a.4.4 0 0 1 .38-.33h.86q2.73 0 3.13-2.6.18-1.14-.35-1.78-.6-.7-2-.7'

const PAYPAL_PAL =
  'M33.6.2l-1.12 7.16c-.02.14.08.27.22.27h1.14c.19 0 .35-.14.38-.32l1.1-7.05A.23.23 0 0 0 35.1 0h-1.27q-.18.01-.22.2M30.22 5.1a1.5 1.5 0 0 1-1.48 1.26q-.6 0-.89-.36t-.2-.92c.11-.75.72-1.27 1.47-1.27q.57 0 .88.36.3.38.22.93M32.05 2.54h-1.31q-.18.01-.23.2l-.06.36-.09-.13c-.28-.42-.92-.55-1.55-.55-1.46 0-2.7 1.1-2.94 2.64-.12.77.05 1.5.5 2.02q.62.69 1.65.67c1.17 0 1.82-.75 1.82-.75l-.06.36c-.02.14.09.27.23.27h1.18c.2 0 .35-.14.38-.32l.71-4.5a.23.23 0 0 0-.23-.27M24.16 2.57c-.15.99-.9.99-1.63.99h-.42l.3-1.84q.02-.18.22-.2h.19c.5 0 .96 0 1.2.29q.23.25.14.76M23.84 0H21.1a.4.4 0 0 0-.37.32L19.6 7.36c-.02.14.09.27.23.27h1.41q.21-.02.26-.23l.32-2a.4.4 0 0 1 .38-.32h.87q2.7 0 3.12-2.6.19-1.14-.35-1.78-.6-.7-2-.7'

/** Klarna's wordmark, drawn alone in a row of marks and on its pink in {@link KlarnaBadge}. */
const KLARNA_WORDMARK =
  'M30.63 6.75c-.78 0-1.4-.65-1.4-1.44s.62-1.44 1.4-1.44c.79 0 1.4.65 1.4 1.44s-.61 1.44-1.4 1.44m-.39 1.52a2.1 2.1 0 0 0 2-1.26l.04.03c-.2.54-.2.87-.2.95v.13h1.68V2.5h-1.68v.13c0 .08 0 .4.2.95l-.04.03a2.1 2.1 0 0 0-2-1.26c-1.6 0-2.74 1.28-2.74 2.96s1.14 2.96 2.74 2.96m-5.67-5.92c-.76 0-1.36.27-1.85 1.26l-.04-.03c.2-.54.2-.87.2-.95V2.5H21.2v5.62h1.73V5.16c0-.78.45-1.26 1.18-1.26q1.09 0 1.08 1.25v2.97h1.74V4.54c0-1.27-1-2.19-2.36-2.19M18.7 3.61l-.04-.03c.2-.54.2-.87.2-.95V2.5h-1.68v5.62h1.73l.01-2.7c0-.8.42-1.27 1.1-1.27q.26 0 .5.07V2.5c-.75-.16-1.44.13-1.82 1.1m-5.5 3.14c-.79 0-1.4-.65-1.4-1.44s.61-1.44 1.4-1.44 1.4.65 1.4 1.44-.62 1.44-1.4 1.44m-.4 1.52a2.1 2.1 0 0 0 2-1.26l.05.03c-.21.54-.21.87-.21.95v.13h1.69V2.5h-1.7v.13c0 .08 0 .4.22.95l-.05.03a2.1 2.1 0 0 0-2-1.26c-1.6 0-2.73 1.28-2.73 2.96s1.13 2.96 2.73 2.96m-5.15-.15h1.74V0H7.64zM6.37 0H4.61c0 1.45-.9 2.75-2.24 3.68l-.53.37V0H0v8.12h1.84V4.09l3.03 4.03h2.24L4.2 4.27A5.2 5.2 0 0 0 6.37 0'

const paymentMethods = [
  {
    name: 'Mastercard',
    mark: (monochrome: boolean) => (
      <CircleDuoMark monochrome={monochrome} registered colors={['#eb001b', '#ff5f00', '#f79e1b']} />
    ),
  },
  {
    name: 'Maestro',
    // The same drawing as Mastercard: only the hues tell them apart, as in the
    // real marks. See {@link UNADVERTISED} for why it sits out the footer's row.
    mark: (monochrome: boolean) => <CircleDuoMark monochrome={monochrome} colors={['#0099df', '#6c6bbd', '#eb001b']} />,
  },
  {
    name: 'Visa',
    mark: (monochrome: boolean) => (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="32.68"
        height="10.54"
        viewBox="0 0 32.68 10.54"
        // Lightened from Visa's #1434cb, a smudge on a dark page.
        fill={tone(monochrome, '#4a6cf5')}
        aria-hidden="true"
      >
        <path d="m12.4.19-4.27 10.2h-2.8l-2.1-8.14c-.12-.5-.24-.69-.62-.9A11 11 0 0 0 0 .48l.06-.3h4.5c.57 0 1.08.39 1.21 1.05l1.12 5.9L9.63.19zm10.95 6.86c0-2.69-3.73-2.84-3.7-4.04 0-.36.35-.75 1.12-.85a5 5 0 0 1 2.6.45l.46-2.16A7 7 0 0 0 21.36 0c-2.6 0-4.44 1.39-4.46 3.37-.02 1.47 1.31 2.29 2.31 2.78 1.03.5 1.38.82 1.37 1.26 0 .69-.82.99-1.58 1-1.33.02-2.1-.36-2.7-.64L15.8 10c.62.28 1.76.53 2.94.54 2.77 0 4.59-1.37 4.6-3.49m6.89 3.33h2.44L30.55.18H28.3c-.51 0-.94.3-1.13.75l-3.96 9.45h2.77l.55-1.52h3.39zm-2.95-3.61 1.4-3.83.8 3.83zM16.2.19 14 10.39h-2.63L13.54.18z" />
      </svg>
    ),
  },
  {
    name: 'American Express',
    mark: (monochrome: boolean) => (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="17.74"
        height="19.18"
        viewBox="0 0 37 40"
        fill={tone(monochrome, '#1c7ed6')}
        aria-hidden="true"
      >
        <path
          fillRule="evenodd"
          d="M32.11 33.92H36.59L30.72 27.63L36.59 21.44H32.21L28.48 25.49L24.85 21.44H20.37L26.35 27.73L20.37 33.92H24.75L28.48 29.87L32.11 33.92ZM13.23 31.04V29.12H20.27V26.24H13.23V24.32H20.37V21.44H9.81V33.92H20.37V31.04H13.23ZM33.28 19.63H36.48V7.04L31.36 7.15L28.59 14.93L25.71 7.15H20.37V19.63H23.79V10.88L26.99 19.63H29.97L33.28 10.88V19.63ZM14.93 7.15H10.56L5.01 19.63H8.75L9.81 17.17H15.57L16.64 19.63H20.48L14.93 7.15ZM10.99 14.29L12.69 10.24L14.4 14.29H10.99ZM31.36 35.63L28.59 32.53L25.71 35.63H7.89V21.23H2.24L9.28 5.12H16.11L18.56 10.67V5.12H27.09L28.59 9.28L30.08 5.12H36.59V0L0 0L0 40L36.59 40V35.63H31.36ZM33.49 27.31L36.59 30.72V23.89L33.49 27.31Z"
        />
      </svg>
    ),
  },
  {
    name: 'Diners Club',
    mark: (monochrome: boolean) => (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="22.13"
        height="19.18"
        viewBox="0 0 45 39"
        fill={tone(monochrome, '#0079be')}
        aria-hidden="true"
      >
        <path
          fillRule="evenodd"
          d="M30.95 19.47C30.94 14.64 27.93 10.53 23.7 8.9V30.03C27.93 28.4 30.94 24.29 30.95 19.47ZM15.62 30.02V8.91C11.39 10.54 8.39 14.65 8.38 19.47C8.39 24.28 11.39 28.39 15.62 30.02ZM19.66 1.61C9.83 1.62 1.86 9.61 1.86 19.47C1.86 29.32 9.83 37.31 19.66 37.31C29.5 37.31 37.46 29.32 37.47 19.47C37.46 9.61 29.5 1.62 19.66 1.61ZM19.62 39C8.86 39.05 0 30.31 0 19.67C0 8.04 8.86 0 19.62 0H24.66C35.29 0 45 8.04 45 19.67C45 30.31 35.29 39 24.66 39H19.62Z"
        />
      </svg>
    ),
  },
  {
    name: 'Google Pay',
    mark: (monochrome: boolean) => (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="38.4"
        height="14.79"
        viewBox="0 0 38.4 14.79"
        fill="currentColor"
        aria-hidden="true"
        // The wordmark stays ink so it follows the theme; the G keeps its 4
        // quadrants, in the palette the Google button in `(auth)` uses.
        className={monochrome ? undefined : INK}
      >
        <path
          fillRule="evenodd"
          d="M18.16 11.56V7.23h2.34q1.45 0 2.44-.92a3 3 0 0 0 1.02-2.27 3 3 0 0 0-1.02-2.26A3.5 3.5 0 0 0 20.5.85h-3.76v10.71zm0-5.65V2.17h2.38a2 2 0 0 1 1.4.57 1.8 1.8 0 0 1 0 2.62 2 2 0 0 1-1.4.55zm11.54-1.1A3.6 3.6 0 0 0 27.23 4q-2.01 0-3.05 1.43l1.25.77a2.2 2.2 0 0 1 1.88-.98c.5 0 1 .18 1.37.5.38.3.59.75.59 1.22v.32a4.3 4.3 0 0 0-2.08-.45q-1.48 0-2.37.67t-.89 1.81c0 .69.3 1.35.85 1.8a3 3 0 0 0 2.08.71q1.47 0 2.35-1.25h.06v1.01h1.35V7.05q0-1.43-.9-2.24m-3.84 5.4c-.3-.2-.47-.54-.47-.89q0-.6.58-1 .57-.4 1.44-.4 1.19 0 1.85.5 0 .87-.7 1.51c-.43.41-1 .64-1.6.65q-.62 0-1.1-.36M38.4 4.24l-4.73 10.55H32.2l1.76-3.7-3.12-6.85h1.55l2.25 5.26h.03l2.19-5.26z"
        />
        <path
          fill={tone(monochrome, '#1976d2')}
          d="M12.43 6.3q0-.64-.1-1.26h-6v2.37h3.43c-.15.76-.6 1.44-1.27 1.87v1.54h2.04a6 6 0 0 0 1.89-4.53"
        />
        <path
          fill={tone(monochrome, '#4caf50')}
          d="M6.34 12.3c1.71 0 3.15-.54 4.2-1.48L8.5 9.28q-.86.57-2.16.59a3.8 3.8 0 0 1-3.56-2.54H.68V8.9a6.4 6.4 0 0 0 5.66 3.4"
        />
        <path fill={tone(monochrome, '#ffc107')} d="M2.78 7.33a3.6 3.6 0 0 1 0-2.36V3.4H.68a6 6 0 0 0 0 5.52z" />
        <path
          fill={tone(monochrome, '#ff3d00')}
          d="M6.34 2.44a3.5 3.5 0 0 1 2.43.92l1.81-1.76A6.2 6.2 0 0 0 6.34 0 6.4 6.4 0 0 0 .68 3.39l2.1 1.58a3.8 3.8 0 0 1 3.56-2.53"
        />
      </svg>
    ),
  },
  {
    name: 'Apple Pay',
    mark: (monochrome: boolean) => (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="35.2"
        height="14.63"
        viewBox="0 0 35.2 14.63"
        fill="currentColor"
        aria-hidden="true"
        className={monochrome ? undefined : INK}
      >
        <path
          fillRule="evenodd"
          d="M23.14 11.76c1.05 0 2.01-.53 2.45-1.38h.04v1.3h1.54v-5.4c0-1.57-1.24-2.58-3.14-2.58-1.77 0-3.08 1.03-3.12 2.43h1.5c.12-.67.73-1.1 1.57-1.1 1.02 0 1.59.48 1.59 1.36v.6l-2.08.12c-1.93.12-2.98.92-2.98 2.31 0 1.41 1.08 2.34 2.63 2.34m6.09 2.87c1.62 0 2.38-.63 3.05-2.53l2.92-8.3h-1.7l-1.95 6.42h-.04L29.55 3.8h-1.73l2.81 7.9-.15.48c-.25.81-.66 1.12-1.4 1.12-.13 0-.38 0-.49-.02v1.3c.1.03.51.04.64.04M7.03 2.85c-.96-.06-1.77.55-2.23.55s-1.15-.53-1.9-.51C1.9 2.9 1 3.47.5 4.36c-1.04 1.8-.28 4.46.72 5.92.49.72 1.07 1.52 1.84 1.49.73-.03 1.02-.48 1.9-.48.89 0 1.14.48 1.91.47.8-.02 1.3-.73 1.79-1.45.56-.82.78-1.62.8-1.67-.02 0-1.54-.6-1.56-2.38-.01-1.5 1.2-2.2 1.26-2.24a2.7 2.7 0 0 0-2.13-1.17M12.55.83v10.85h1.67V7.97h2.3c2.1 0 3.58-1.46 3.58-3.58A3.4 3.4 0 0 0 16.57.83zM6.43 1.89c-.41.49-1.07.88-1.73.82A2.5 2.5 0 0 1 5.32.9 2.6 2.6 0 0 1 7.04 0c.07.7-.2 1.38-.6 1.89M23.59 10.47c-.89 0-1.45-.43-1.45-1.09q.01-1.03 1.58-1.14l1.85-.12v.61c0 1.02-.86 1.74-1.98 1.74m-9.37-8.22h1.91c1.45 0 2.27.78 2.27 2.15s-.82 2.16-2.27 2.16h-1.91z"
        />
      </svg>
    ),
  },
  {
    name: 'Klarna',
    mark: (monochrome: boolean) => (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="33.76"
        height="8.27"
        viewBox="0 0 33.76 8.27"
        fill="currentColor"
        aria-hidden="true"
        // Klarna's color is the pink behind the wordmark, never the wordmark
        // itself, and there is no pink here to sit on.
        className={monochrome ? undefined : INK}
      >
        <path d={KLARNA_WORDMARK} />
      </svg>
    ),
  },
  {
    name: 'PayPal',
    mark: (monochrome: boolean) => (
      <svg xmlns="http://www.w3.org/2000/svg" width="35.33" height="9.41" viewBox="0 0 35.33 9.41" aria-hidden="true">
        {/* The dark half is a step brighter than PayPal's #003087, a smudge on a dark page. */}
        <path fillRule="evenodd" fill={tone(monochrome, '#2563eb')} d={PAYPAL_PAY} />
        <path fillRule="evenodd" fill={tone(monochrome, '#009cde')} d={PAYPAL_PAL} />
      </svg>
    ),
  },
  {
    name: 'BLIK',
    mark: (monochrome: boolean) => (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="26.54"
        height="13.33"
        viewBox="0 0 26.54 13.33"
        fill="currentColor"
        aria-hidden="true"
        className={monochrome ? undefined : INK}
      >
        <path d="M8.42 2.01a1.98 1.98 0 1 0-3.97-.03 1.98 1.98 0 0 0 3.97.03" />
        <path d="M23.68 13.24h2.86L23.1 8.8 26.22 5h-2.6l-3.05 3.83V.65h-2.22v12.59h2.22v-4.4zM9.98.65h2.22v12.59H9.98zM14.16 5h2.22v8.24h-2.22zM4.2 4.91q-1.05 0-1.98.5V.65H0v8.47A4.2 4.2 0 1 0 4.2 4.9m0 6.23a2.03 2.03 0 1 1 0-4.05 2.03 2.03 0 0 1 0 4.05" />
      </svg>
    ),
  },
] as const satisfies readonly { name: string; mark: (monochrome: boolean) => ReactNode }[]

/** A mark this store has artwork for. Add a brand to {@link paymentMethods} to widen it. */
export type PaymentMarkName = (typeof paymentMethods)[number]['name']

/**
 * Whether this store can draw a brand's mark, for the places the brand arrives
 * as a plain string: the card scheme a payment provider names on a receipt.
 */
export function hasPaymentMark(name: string): name is PaymentMarkName {
  return paymentMethods.some((method) => method.name === name)
}

/**
 * The mark a payment method wears, where this store draws one. `card` has none:
 * a card is a scheme, and which scheme is on `Order.card.brand`.
 */
const METHOD_MARKS: Partial<Record<PaymentMethodId, PaymentMarkName>> = {
  klarna: 'Klarna',
  paypal: 'PayPal',
  'apple-pay': 'Apple Pay',
  'google-pay': 'Google Pay',
}

/** @see METHOD_MARKS */
export function paymentMethodMark(method: PaymentMethodId): PaymentMarkName | undefined {
  return METHOD_MARKS[method]
}

/**
 * Marks left out of the row a store advertises with, though it still draws them
 * everywhere else. Maestro is Mastercard's artwork in other hues, so the row,
 * which is drawn in 1 tone, would carry the same 2 discs twice. A screen naming
 * a card that really is one still asks for it by name.
 */
const UNADVERTISED: PaymentMarkName[] = ['Maestro']

/** The wordmarks, which are drawn far wider than they are tall. */
const WIDE_MARKS: PaymentMarkName[] = ['Klarna', 'PayPal', 'Apple Pay', 'Google Pay']

/** Whether a mark is a wordmark rather than a compact symbol, so a caller can widen its slot. */
export function isWideMark(name: PaymentMarkName): boolean {
  return WIDE_MARKS.includes(name)
}

/** The slot a single mark sits in beside its own name, sized for the shape it is. */
export function paymentMarkSlot(name: PaymentMarkName): string {
  return cn('flex items-center *:h-auto *:max-w-full', isWideMark(name) ? 'w-9.5' : 'w-7')
}

/** Shared by both exports below. */
interface PaymentMarkProps {
  /**
   * Flatten the mark to `currentColor`, for the places it is a footnote rather
   * than a fact: the footer's row, the marks beside a checkout option.
   * @default false
   */
  monochrome?: boolean
}

/**
 * One brand's mark on its own, for the places a method is named rather than
 * listed: the card on a receipt, the marks beside a payment option.
 */
export function PaymentMark({ name, monochrome = false }: PaymentMarkProps & { name: PaymentMarkName }) {
  return paymentMethods.find((method) => method.name === name)?.mark(monochrome) ?? null
}

/**
 * Klarna's badge: the wordmark on Klarna pink, for the line that quotes a price
 * in installments. A row of marks shows the bare wordmark instead, since the
 * pink belongs behind it, never on it.
 */
export function KlarnaBadge({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="37"
      height="24"
      viewBox="0 0 37 24"
      aria-hidden="true"
      className={className}
    >
      <rect width="37" height="24" rx="4" fill="#ffa8cd" />
      <path transform="translate(5.5 8.82) scale(0.77)" fill="#000" d={KLARNA_WORDMARK} />
    </svg>
  )
}

interface PaymentMethodsProps extends PaymentMarkProps {
  /**
   * Which marks to draw, in this file's own order. Defaults to the advertised
   * set, which is what a footer carries; a screen offering to save a method
   * passes the shorter set it can actually save, and may name an
   * {@link UNADVERTISED} mark to get it back.
   */
  names?: readonly PaymentMarkName[]
  /**
   * Draw each mark on its own bordered tile, letterboxed by the SVG's viewBox.
   * @default false
   */
  boxed?: boolean
  className?: string
}

/**
 * The row of accepted payment methods. Purely informational: nothing here is
 * interactive, and the real set should come from your payment provider once one
 * is wired up.
 */
export function PaymentMethods({ names, boxed = false, monochrome = false, className }: PaymentMethodsProps) {
  return (
    <ul
      aria-label="Accepted payment methods"
      className={cn('text-foreground-muted flex flex-wrap items-center gap-1', className)}
    >
      {paymentMethods
        .filter(({ name }) => (names ? names.includes(name) : !UNADVERTISED.includes(name)))
        .map(({ name, mark }) => (
          <li
            key={name}
            className={cn(
              'flex items-center justify-center',
              boxed ? 'bg-background rounded-3xs h-6.5 w-10 border p-1.5 *:max-h-full *:max-w-full' : 'h-8 w-12',
            )}
          >
            {mark(monochrome)}
            <span className="sr-only">{name}</span>
          </li>
        ))}
    </ul>
  )
}
