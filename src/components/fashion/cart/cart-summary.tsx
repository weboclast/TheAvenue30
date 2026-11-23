'use client'

import { useId } from 'react'
import Link from 'next/link'
import { Check, X } from '@appica/icons-react'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@appica/ui-react/accordion'
import { Button, buttonVariants } from '@appica/ui-react/button'
import { Field, FieldError, FieldLabel } from '@appica/ui-react/field'
import { useMediaQuery } from '@appica/ui-react/hooks/use-media-query'
import { Input } from '@appica/ui-react/input'
import { NumberField } from '@appica/ui-react/number-field'
import { Separator } from '@appica/ui-react/separator'
import { Switch } from '@appica/ui-react/switch'
import { useDiscountCode } from '@/components/cart/use-discount-code'
import { SummaryLines } from '@/components/fashion/checkout/summary-lines'
import { ProductPerks } from '@/components/fashion/product/product-perks'
import { TEXT_ACTION } from '@/components/fashion/text-action'
import { Price } from '@/components/price'
import { RewardsPitch } from '@/components/rewards/rewards-pitch'
import { usePointsRedemption } from '@/components/rewards/use-points-redemption'
import { useCart } from '@/lib/cart/cart-context'
import { formatPoints } from '@/lib/rewards/ledger'
import { cn } from '@/lib/utils'

/** A device that points rather than taps, and so has no virtual keyboard to raise. */
const FINE_POINTER = '(hover: hover) and (pointer: fine)'

/**
 * Handed to whoever is trying the template out when a code is refused. **Delete
 * this and the sentence that uses it before going live.** The codes themselves
 * live in `commerce/adapters/demo/cart.ts`.
 */
const DEMO_CODE = 'APPICA10'

interface CartSummaryProps {
  /**
   * Where "Edit bag" goes. Passing it says the summary sits beside the checkout
   * rather than on the bag page, so it also lists what is being bought.
   */
  editHref?: string
  /** The screen's own call to action, in place of the bag's "Checkout": the checkout's "Pay now". */
  action?: React.ReactNode
  className?: string
}

/**
 * What the bag comes to, and the way on. The bag page and the checkout share
 * it, so the 2 can never quote different totals. Every figure is read off the
 * cart the server sent, and a row it has no figure for is left out rather than
 * shown as zero.
 */
export function CartSummary({ editHref, action, className }: CartSummaryProps) {
  const { cart, pending } = useCart()
  const { code, changeCode, ready, error, redeemed, panel, redeem, drop } = useDiscountCode(
    `Try ${DEMO_CODE} in this demo.`,
  )
  const finePointer = useMediaQuery(FINE_POINTER, { defaultValue: true })
  const redemption = usePointsRedemption()
  const pointsSwitch = useId()
  const headingId = useId()

  const collecting = cart.deliveryOptions?.some((option) => option.id === cart.delivery?.optionId && option.pickup)

  return (
    <section
      data-slot="cart-summary"
      aria-labelledby={headingId}
      className={cn('bg-background-muted flex flex-col gap-5 rounded-sm p-6', className)}
    >
      <div className="flex items-baseline justify-between gap-4">
        <h2 id={headingId} className="text-foreground-intense text-2xl font-medium">
          Order summary
        </h2>
        {editHref ? (
          <Link
            href={editHref}
            data-slot="button"
            className={buttonVariants({ variant: 'ghost', size: 'sm', className: TEXT_ACTION })}
          >
            Edit bag
          </Link>
        ) : null}
      </div>

      {/* Below `lg` the checkout lists them above its form instead. */}
      {editHref ? <SummaryLines lines={cart.lines} className="max-lg:hidden" /> : null}

      <dl className="flex flex-col gap-2 text-sm">
        <SummaryRow label="Subtotal">
          <Price money={cart.subtotal} scaleFraction={false} />
        </SummaryRow>
        {cart.giftBox?.added ? (
          <SummaryRow label="Gift wrapping">
            <Price money={cart.giftBox.price} scaleFraction={false} />
          </SummaryRow>
        ) : null}
        {cart.discount ? (
          <SummaryRow
            label={
              <>
                Discount <span className="text-foreground-intense font-mono">{cart.discount.code}</span>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label={`Remove discount code ${cart.discount.code}`}
                  disabled={pending}
                  onClick={() => void drop()}
                  className="size-6"
                >
                  <X className="size-3.5" />
                </Button>
              </>
            }
          >
            -<Price money={cart.discount.amount} scaleFraction={false} />
          </SummaryRow>
        ) : null}
        {redemption.balance ? (
          // Switch beside the label, so the credit aligns with the other figures; the last `dd` wraps below.
          <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
            <dt className="flex items-center gap-3">
              <label htmlFor={pointsSwitch} className="cursor-pointer">
                Pay with points
              </label>
              <Switch
                id={pointsSwitch}
                checked={Boolean(redemption.credit)}
                disabled={pending}
                onCheckedChange={redemption.setApplied}
              />
            </dt>
            {redemption.credit ? (
              <dd className="text-foreground-intense font-mono font-semibold">
                -<Price money={redemption.credit} scaleFraction={false} />
              </dd>
            ) : null}
            <dd className="flex basis-full items-center gap-2">
              {redemption.credit ? (
                <>
                  <NumberField
                    size="sm"
                    min={1}
                    max={redemption.balance}
                    value={redemption.points}
                    disabled={pending}
                    onValueChange={(next) => redemption.setPoints(next ?? 1)}
                    onValueCommitted={(next) => redemption.commit(next ?? 1)}
                    aria-label="Points to spend on this order"
                    className="w-26"
                  />
                  of {formatPoints(redemption.balance)}
                </>
              ) : (
                `${formatPoints(redemption.balance)} available`
              )}
            </dd>
          </div>
        ) : null}
        {cart.shipping ? (
          <SummaryRow label={collecting ? 'Collection' : 'Delivery'}>
            {cart.shipping.amount === 0 ? 'Free' : <Price money={cart.shipping} scaleFraction={false} />}
          </SummaryRow>
        ) : null}
      </dl>

      <Separator />

      <div className="flex flex-col gap-1">
        <p className="text-foreground-intense flex items-baseline justify-between gap-4">
          Total
          <Price money={cart.total} scaleFraction={false} className="font-mono text-lg font-semibold" />
        </p>
        {/* A zero delivery row would read as free delivery, so the note stands in until an option is chosen. */}
        {cart.shipping ? null : <p className="text-sm">Delivery and taxes are calculated at checkout.</p>}
        {cart.savings ? (
          <p className="text-sm">
            You save{' '}
            <Price money={cart.savings} scaleFraction={false} className="text-foreground-intense font-medium" /> on sale
            items.
          </p>
        ) : null}
      </div>

      <Accordion variant="flush" icon="plus" iconPosition="start">
        {/* The item rings when anything inside takes focus; move the ring to the trigger. */}
        <AccordionItem value="discount-code" className="pb-0 has-focus-visible:ring-0">
          <AccordionTrigger className="focus-visible:ring-ring mb-0 rounded-sm text-base focus-visible:ring-3">
            Add a discount code
          </AccordionTrigger>
          <AccordionContent className="*:pt-0">
            {/* The panel clips its overflow to animate its height, so the field's focus ring needs room inside it. */}
            <div ref={panel} className="p-1">
              <div className="flex items-start gap-2">
                <Field name="code" invalid={Boolean(error)} className="flex-1">
                  <FieldLabel className="sr-only">Discount code</FieldLabel>
                  {/* Not on a phone, where the keyboard would cover the summary it is discounting. */}
                  <Input
                    autoFocus={finePointer}
                    clearable
                    onClear={() => changeCode('')}
                    value={code}
                    placeholder="4-16 letters or numbers"
                    autoComplete="off"
                    onChange={(event) => changeCode(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key !== 'Enter') return
                      event.preventDefault()
                      void redeem()
                    }}
                  />
                  <FieldError match={Boolean(error)}>{error}</FieldError>
                </Field>
                <Button
                  type="button"
                  variant="outline"
                  disabled={pending || !ready}
                  focusableWhenDisabled
                  onClick={() => void redeem()}
                >
                  Apply
                </Button>
              </div>
              {/* Kept in the DOM while empty, so screen readers announce the confirmation as it appears. */}
              <div role="status" className="text-success-emphasis text-sm">
                {redeemed ? (
                  <p className="mt-2 flex items-center gap-1.5">
                    <Check aria-hidden strokeWidth={2} className="size-4" />
                    {redeemed} applied to your order.
                  </p>
                ) : null}
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {action ?? (
        // Below `lg` the bag pins its own under the lines (see `CartContents`).
        <Link
          href="/checkout"
          data-slot="button"
          className={buttonVariants({ size: 'lg', className: 'w-full max-lg:hidden' })}
        >
          Checkout
        </Link>
      )}

      <ProductPerks className="text-sm" />

      <RewardsPitch total={cart.total} className="bg-background-subtle rounded-sm" />
    </section>
  )
}

/** One labeled figure in the breakdown. A minus in the children is real text, so a screen reader reads the deduction. */
function SummaryRow({ label, children }: { label: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <dt className="flex items-center gap-1">{label}</dt>
      <dd className="text-foreground-intense font-mono font-semibold">{children}</dd>
    </div>
  )
}
