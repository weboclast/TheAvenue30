'use client'

import { ShieldPlus } from '@appica/icons-react'
import { Radio } from '@appica/ui-react/radio'
import { RadioGroup } from '@appica/ui-react/radio-group'
import { Separator } from '@appica/ui-react/separator'
import { formatMoney } from '@/lib/commerce/format'
import type { ProductProtectionPlan } from '@/lib/commerce/types'
import { cn } from '@/lib/utils'

interface ProductProtectionPlanProps {
  plans: ProductProtectionPlan[]
  /** What the plans cover, in a sentence under the heading. */
  description: string
  /** The chosen plan id, or `null` for none. */
  value?: string | null
  onValueChange?: (planId: string | null) => void
  className?: string
}

/**
 * The warranty upsell beside the buy buttons. "No plan" is the option that starts
 * selected, so nothing is added until the shopper says so: a pre-ticked add-on
 * is a dark pattern, and they came to buy the product, not the plan.
 *
 * That option exists because a radio group has no way out of itself. Without it
 * a shopper who taps a plan to read its price is stuck with it, and the only
 * escape is reloading the page.
 */
export function ProductProtectionPlans({
  plans,
  description,
  value,
  onValueChange,
  className,
}: ProductProtectionPlanProps) {
  return (
    <section
      data-slot="product-protection-plans"
      className={cn('bg-background-muted flex flex-col gap-3 rounded-lg p-5', className)}
    >
      <div className="flex flex-col gap-1.5">
        <h2 className="text-foreground-intense flex items-center gap-3 font-medium">
          <ShieldPlus className="text-foreground-intense size-5.5" />
          Add protection plan
        </h2>
        <p className="text-foreground text-sm">{description}</p>
      </div>

      <Separator variant="dashed" />

      {/*
       * A handful of short options read as one line of choices, so the group
       * runs horizontally and wraps only when the panel is too narrow.
       * The orientation is a prop rather than a class: it also sets
       * `aria-orientation`, which tells a screen reader which arrow keys move
       * between the plans.
       */}
      <RadioGroup
        orientation="horizontal"
        value={value ?? null}
        // Only the values rendered below reach this, so anything that isn't a
        // plan id is the "no plan" option.
        onValueChange={(next) => onValueChange?.(typeof next === 'string' ? next : null)}
        aria-label="Protection plan"
        className="items-center gap-x-6 gap-y-2"
      >
        <label className="flex cursor-pointer items-center gap-2 text-sm">
          <Radio value={null} />
          <span className="text-foreground">No plan</span>
        </label>

        {plans.map((plan) => (
          <label key={plan.id} className="flex cursor-pointer items-center gap-2 text-sm">
            <Radio value={plan.id} />
            <span className="text-foreground">{plan.label}</span>
            <span className="text-foreground-intense font-medium">{formatMoney(plan.price)}</span>
          </label>
        ))}
      </RadioGroup>
    </section>
  )
}
