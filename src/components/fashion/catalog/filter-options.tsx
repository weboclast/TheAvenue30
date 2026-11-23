'use client'

import { ColorSwatch } from '@appica/ui-react/color-swatch'
import { ToggleGroup } from '@appica/ui-react/toggle-group'
import { PillOption } from '@/components/fashion/pill-group'
import { withFilterValues } from '@/lib/catalog-filters'
import type { ColorFilter, ListFilter } from '@/lib/commerce/types'
import { useCatalogFilters } from '@/components/catalog/catalog-filters-context'

/** A multi-select filter as a row of pills. Color pills lead with a swatch. */
export function FilterOptions({ filter, selected }: { filter: ListFilter | ColorFilter; selected: string[] }) {
  const { params, navigate } = useCatalogFilters()

  return (
    <ToggleGroup
      multiple
      value={selected}
      onValueChange={(values) => navigate(withFilterValues(params, filter.id, values))}
      aria-label={filter.label}
      className="w-auto flex-wrap gap-2"
    >
      {filter.values.map((value) => (
        <PillOption key={value.value} value={value.value}>
          {'hex' in value ? (
            <ColorSwatch aria-hidden color={value.hex} shape="circle" size="3xs" data-icon="start" />
          ) : null}
          {value.label}
        </PillOption>
      ))}
    </ToggleGroup>
  )
}
