'use client'

import { createContext, use } from 'react'
import { Collapsible, CollapsibleContent } from '@appica/ui-react/collapsible'
import { Radio } from '@appica/ui-react/radio'
import { RadioGroup } from '@appica/ui-react/radio-group'
import { cn } from '@/lib/utils'

/*
 * The checkout's one interaction pattern, in every storefront: pick a delivery,
 * pick a payment method.
 *
 * A radio group rather than an accordion, because a shopper is answering a
 * question and not browsing sections: arrow keys move between the options and
 * nothing can be left open beside the answer. `Collapsible` supplies the height
 * animation an accordion would have brought, and unmounts the panel when it
 * closes, so a field inside an unchosen option cannot take focus.
 *
 * A storefront restyles it through the `choice-option`, `choice-option-label`,
 * `choice-option-description`, and `choice-option-panel` slots, with
 * `data-selected` on the chosen option.
 */

const ChoiceContext = createContext<string | undefined>(undefined)

interface ChoiceGroupProps {
  /** The chosen option, by the `value` on its {@link ChoiceOption}. */
  value: string | undefined
  onValueChange: (value: string) => void
  /** Names the group for screen readers, since the question is asked by a heading outside it. */
  'aria-label': string
  children: React.ReactNode
  className?: string
}

/** The list of options a checkout section offers. Holds which one is chosen. */
export function ChoiceGroup({ value, onValueChange, children, className, ...props }: ChoiceGroupProps) {
  return (
    <RadioGroup
      value={value ?? ''}
      onValueChange={(next) => onValueChange(String(next))}
      className={cn('flex flex-col gap-2', className)}
      {...props}
    >
      <ChoiceContext value={value}>{children}</ChoiceContext>
    </RadioGroup>
  )
}

interface ChoiceOptionProps {
  value: string
  /** What the option is called, e.g. `'Standard delivery'`. */
  label: string
  /** A line under the label: what a courier will do, where a pickup happens. */
  description?: React.ReactNode
  /** What sits at the end of the header row: a price, a set of card marks. */
  aside?: React.ReactNode
  /** What finishing this choice takes. Mounted only while the option is chosen. */
  children?: React.ReactNode
}

/**
 * One option in a {@link ChoiceGroup}. The header row is a label, so the whole
 * row selects the option; the panel is a sibling of that label rather than
 * inside it, or clicking a field in the panel would count as clicking the radio.
 */
export function ChoiceOption({ value, label, description, aside, children }: ChoiceOptionProps) {
  const selected = use(ChoiceContext) === value

  return (
    <Collapsible
      open={selected}
      data-slot="choice-option"
      data-selected={selected || undefined}
      className={cn(
        'rounded-xl border transition-colors motion-reduce:transition-none',
        selected ? 'bg-background-muted border-transparent' : 'bg-background hover:border-border-strong',
      )}
    >
      {/* A grid, so the radio shares the first row with the label and centers on
          it, while the aside spans the description's row too. */}
      <label className="grid cursor-pointer grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-x-3 p-4">
        <Radio value={value} />
        <span data-slot="choice-option-label" className="text-foreground-intense font-medium">
          {label}
        </span>
        {aside ? <span className="row-span-2 flex items-center gap-2">{aside}</span> : null}
        {description ? (
          <span data-slot="choice-option-description" className="col-start-2 mt-0.5 text-sm">
            {description}
          </span>
        ) : null}
      </label>

      {children ? (
        <CollapsibleContent>
          <div data-slot="choice-option-panel" className="bg-background m-1.5 mt-0 rounded-lg p-4">
            {children}
          </div>
        </CollapsibleContent>
      ) : null}
    </Collapsible>
  )
}
