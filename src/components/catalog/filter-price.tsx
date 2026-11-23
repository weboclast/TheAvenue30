'use client'

import { useId, useState } from 'react'
import { Input } from '@appica/ui-react/input'
import { Slider } from '@appica/ui-react/slider'
import { withPriceRange } from '@/lib/catalog-filters'
import { currencySymbol } from '@/lib/commerce/format'
import type { FieldVariant } from '@/components/address-fields'
import type { RangeFilter } from '@/lib/commerce/types'
import { useCatalogFilters } from './catalog-filters-context'

/** Coarse enough to drag smoothly, fine enough to land on a round price. */
function stepFor(span: number): number {
  if (span > 5000) return 100
  if (span > 1000) return 50
  return 10
}

interface FilterPriceProps {
  filter: RangeFilter
  /** The lower bound the URL asks for, if any. */
  min?: number
  /** The upper bound the URL asks for, if any. */
  max?: number
  /** @default 'outline' */
  fieldVariant?: FieldVariant
}

/**
 * A price range slider with both ends editable. Commits on release, blur, or
 * Enter; remount it when the URL's range changes.
 */
export function FilterPrice({ filter, min, max, fieldVariant = 'outline' }: FilterPriceProps) {
  const { params, navigate } = useCatalogFilters()
  const [range, setRange] = useState<[number, number]>([min ?? filter.min, max ?? filter.max])
  const symbol = filter.currencyCode ? ` (${currencySymbol(filter.currencyCode)})` : ''

  const commit = (next: [number, number]) => {
    // Correct a crossed or out-of-bounds pair rather than reject it.
    const low = Math.min(Math.max(next[0], filter.min), filter.max)
    const high = Math.min(Math.max(next[1], filter.min), filter.max)
    const sorted: [number, number] = low <= high ? [low, high] : [high, low]

    setRange(sorted)
    navigate(withPriceRange(params, sorted, [filter.min, filter.max]))
  }

  return (
    <div className="flex flex-col gap-6 pt-7">
      {/* Stops a thumb drag from swiping the drawer shut; the drawer listens for both. */}
      <div onPointerDown={(event) => event.stopPropagation()} onTouchStart={(event) => event.stopPropagation()}>
        <Slider
          value={range}
          min={filter.min}
          max={filter.max}
          step={stepFor(filter.max - filter.min)}
          onValueChange={(next) => setRange(next as [number, number])}
          onValueCommitted={(next) => commit(next as [number, number])}
          thumbAriaLabel={(index) => (index === 0 ? 'Lowest price' : 'Highest price')}
          thumbAlignment="edge"
          tooltipVisibility="always"
        />
      </div>

      <div className="flex items-center gap-3">
        <PriceInput
          label={`From${symbol}`}
          value={range[0]}
          variant={fieldVariant}
          onCommit={(value) => commit([value, range[1]])}
        />
        <span aria-hidden className="text-foreground-subtle">
          -
        </span>
        <PriceInput
          label={`To${symbol}`}
          value={range[1]}
          variant={fieldVariant}
          onCommit={(value) => commit([range[0], value])}
        />
      </div>
    </div>
  )
}

interface PriceInputProps {
  label: string
  value: number
  variant: FieldVariant
  onCommit: (value: number) => void
}

/** One end of the range. A `null` draft follows the slider. */
function PriceInput({ label, value, variant, onCommit }: PriceInputProps) {
  const id = useId()
  const [draft, setDraft] = useState<string | null>(null)

  const commit = () => {
    setDraft(null)
    const parsed = Number(draft)
    if (draft !== null && draft.trim() !== '' && Number.isFinite(parsed)) onCommit(parsed)
  }

  return (
    <Input
      id={id}
      variant={variant}
      value={draft ?? String(value)}
      onValueChange={setDraft}
      onBlur={commit}
      onKeyDown={(event) => {
        if (event.key === 'Enter') {
          event.preventDefault()
          event.currentTarget.blur()
        }
      }}
      inputMode="numeric"
      startSlot={
        <label htmlFor={id} className="text-foreground-strong font-medium whitespace-nowrap">
          {label}
        </label>
      }
      className="min-w-0 flex-1"
    />
  )
}
