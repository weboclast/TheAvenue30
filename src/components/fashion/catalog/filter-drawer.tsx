'use client'

import { useId, useRef, useState } from 'react'
import { Adjustments } from '@appica/icons-react'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@appica/ui-react/accordion'
import { Button } from '@appica/ui-react/button'
import { Chip, ChipGroup } from '@appica/ui-react/chip'
import {
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@appica/ui-react/drawer'
import { useDirection } from '@appica/ui-react/hooks/use-direction'
import { ScrollArea } from '@appica/ui-react/scroll-area'
import { Spinner } from '@appica/ui-react/spinner'
import {
  type ActiveRefinement,
  type AppliedFilters,
  activeRefinements,
  clearFilters,
  parseCatalogFilters,
} from '@/lib/catalog-filters'
import type { Filter } from '@/lib/commerce/types'
import { useCatalogFilters } from '@/components/catalog/catalog-filters-context'
import { FilterOptions } from './filter-options'
import { FilterPrice } from '@/components/catalog/filter-price'

interface FilterDrawerProps {
  filters: Filter[]
  /** Products the refinements leave, for the confirm button. */
  total: number
  /** Fires once the drawer has closed on a listing it refined. */
  onRefined: () => void
}

/**
 * The filter button and its drawer. Every press refines the listing at once, so
 * the confirm button only closes it. The button wears a dot while anything applies.
 */
export function FilterDrawer({ filters, total, onRefined }: FilterDrawerProps) {
  const { params, pending } = useCatalogFilters()
  const [open, setOpen] = useState(false)
  const [openGroups, setOpenGroups] = useState<string[]>([])
  const openedOn = useRef('')
  const triggerId = useId()
  const rtl = useDirection() === 'rtl'
  const applied = parseCatalogFilters(params)
  const active = activeRefinements(filters, applied)

  return (
    <Drawer
      side={rtl ? 'left' : 'right'}
      open={open}
      onOpenChange={(next) => {
        if (next) {
          openedOn.current = params.toString()
          // Open the first group and any in use.
          setOpenGroups(
            filters.filter((filter, index) => index === 0 || inUse(filter, applied)).map((filter) => filter.id),
          )
        }
        setOpen(next)
      }}
      // Not on close: the scroll lock restores the page when it releases.
      onOpenChangeComplete={(next) => {
        if (!next && params.toString() !== openedOn.current) onRefined()
      }}
    >
      {/* Triggers rename the slot; this takes it back for `globals.css`. */}
      <DrawerTrigger id={triggerId} render={<Button data-slot="button" size="icon-md" />}>
        <Adjustments />
        {active.length > 0 ? (
          <span
            aria-hidden
            className="bg-info-emphasis ring-background absolute end-0 top-0 size-2 rounded-full ring-2"
          />
        ) : null}
      </DrawerTrigger>
      {/* Forwards clicks, hover, and press to the button, and names it. */}
      <label
        htmlFor={triggerId}
        className="text-foreground-emphasis cursor-pointer font-mono text-sm font-semibold uppercase select-none"
      >
        Filter
        {active.length > 0 ? <span className="sr-only">, {active.length} active</span> : null}
      </label>

      <DrawerContent className="w-115" closeLabel="Close filters">
        <DrawerHeader className="pb-2.5">
          <DrawerTitle className="font-medium">Filter</DrawerTitle>
        </DrawerHeader>

        <DrawerBody className="overflow-hidden px-0">
          <ScrollArea scrollbarVisibility="auto" className="h-full">
            <div className="px-6 py-1">
              <Accordion
                variant="flush"
                icon="plus"
                multiple
                value={openGroups}
                onValueChange={(next) => setOpenGroups(next as string[])}
              >
                {filters.map((filter) => (
                  // The item rings when anything inside takes focus; move the ring to the trigger.
                  <AccordionItem key={filter.id} value={filter.id} className="pb-0 has-focus-visible:ring-0">
                    <AccordionTrigger className="focus-visible:ring-ring mb-0 rounded-sm focus-visible:ring-3">
                      {filter.label}
                    </AccordionTrigger>
                    {/* Room for the slider's thumbs, which the panel would clip. */}
                    <AccordionContent className="-mx-2.5 px-2.5 *:pt-0">
                      <div className="pb-2.5">
                        <FilterControl filter={filter} applied={applied} />
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </ScrollArea>
        </DrawerBody>

        <DrawerFooter>
          <ActiveFilters active={active} />
          <Button size="lg" className="w-full" onClick={() => setOpen(false)}>
            {pending ? <Spinner variant="dots" currentColor aria-hidden data-icon="start" className="text-xl" /> : null}
            Show results{pending ? null : ` (${total})`}
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}

function inUse(filter: Filter, applied: AppliedFilters): boolean {
  return filter.kind === 'range' ? applied.minPrice != null || applied.maxPrice != null : filter.id in applied.selected
}

function FilterControl({ filter, applied }: { filter: Filter; applied: AppliedFilters }) {
  if (filter.kind !== 'range') return <FilterOptions filter={filter} selected={applied.selected[filter.id] ?? []} />

  return (
    // Keyed by range and bounds, so a navigation resets the handles.
    <FilterPrice
      key={`${applied.minPrice ?? ''}-${applied.maxPrice ?? ''}-${filter.min}-${filter.max}`}
      filter={filter}
      min={applied.minPrice}
      max={applied.maxPrice}
    />
  )
}

/** Active refinements as chips on 1 scrolling row, so they never squeeze the groups, and Clear all. */
function ActiveFilters({ active }: { active: ActiveRefinement[] }) {
  const { params, navigate } = useCatalogFilters()

  if (active.length === 0) return null

  return (
    <>
      {/* A chip cut off at the drawer edge shows the row scrolls. */}
      <ChipGroup size="lg" className="-mx-6 -mt-1 mb-1 scrollbar-none flex-nowrap overflow-x-auto px-6 py-1 *:shrink-0">
        {active.map((chip) => (
          <Chip
            key={chip.id}
            dismissible
            closeLabel={`Remove ${chip.label} filter`}
            onOpenChange={() => navigate(chip.remove(params))}
            className="font-mono text-sm"
          >
            {chip.label}
          </Chip>
        ))}
      </ChipGroup>
      <Button variant="outline" size="lg" className="w-full" onClick={() => navigate(clearFilters(params))}>
        Clear all
      </Button>
    </>
  )
}
