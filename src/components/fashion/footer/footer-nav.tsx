'use client'

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@appica/ui-react/accordion'
import { LinkColumn, LinkList, type NavColumn } from '@/components/fashion/link-column'
import { type DepartmentLink, useCurrentDepartment } from '@/components/fashion/use-current-department'

/** A department with its footer column. */
interface DepartmentColumn extends DepartmentLink {
  column: NavColumn
}

interface FooterNavProps {
  /** The columns every page shows. */
  columns: NavColumn[]
  /** A column per department; the one on screen comes first. */
  departments?: DepartmentColumn[]
  /** The department opened last, used where the URL names none. */
  remembered?: string
  className?: string
}

/**
 * The footer's link columns, led by the department on screen. Below `sm` the 3
 * stacked lists turn into an accordion; from `sm` up they sit side by side,
 * always open. Both renderings are in the DOM and CSS picks one, which keeps the
 * server output identical for every viewport.
 */
export function FooterNav({ columns: shared, departments = [], remembered, className }: FooterNavProps) {
  const { current } = useCurrentDepartment(departments, remembered)
  const lead = departments.find(({ slug }) => slug === current)?.column
  const columns = lead ? [lead, ...shared] : shared

  return (
    <div className={className}>
      <Accordion variant="flush" icon="plus" className="-mt-3.5 sm:hidden">
        {columns.map((column, index) => (
          <AccordionItem key={column.heading} value={column.heading} className="pb-0">
            <AccordionTrigger className="mb-0 font-mono text-base uppercase">{column.heading}</AccordionTrigger>
            {/* The panel's top padding is the component's own, and its bottom is
                set below: on the item it would space the closed ones too. */}
            <AccordionContent className="*:pt-0">
              <div className={index < columns.length - 1 ? 'pb-2.5' : undefined}>
                <LinkList links={column.links} label={column.heading} />
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

      <div className="hidden gap-8 sm:grid sm:grid-cols-3 lg:gap-10">
        {columns.map((column) => (
          <LinkColumn key={column.heading} column={column} />
        ))}
      </div>
    </div>
  )
}
