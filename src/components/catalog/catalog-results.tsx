'use client'

import { cn } from '@/lib/utils'
import { useCatalogFilters } from './catalog-filters-context'

/**
 * Dims the grid while a refinement loads. Needs the `<Suspense>` boundary above
 * to stay mounted, so never key it on the filters.
 */
export function CatalogResults({ children, className }: { children: React.ReactNode; className?: string }) {
  const { pending } = useCatalogFilters()

  return (
    <div
      aria-busy={pending}
      data-pending={pending || undefined}
      className={cn(
        'transition-opacity duration-200 ease-out data-pending:opacity-50 motion-reduce:transition-none',
        className,
      )}
    >
      {children}
    </div>
  )
}
