import { Skeleton } from '@appica/ui-react/skeleton'
import { cn } from '@/lib/utils'

/*
 * Placeholders for the cards in `post-card.tsx`, box for box at the type
 * ramp's line heights. Change a size or a gap there and change it here too.
 */

/** Placeholder for {@link PostCard}: the photograph, 2 title lines, the meta, and "Read more". */
export function PostCardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('flex flex-col gap-4', className)}>
      <Skeleton className="aspect-4/3 rounded-sm" />
      <div className="flex flex-col gap-2 px-4">
        <Skeleton className="h-7 w-full" />
        <Skeleton className="h-7 w-2/3" />
        <Skeleton className="h-4 w-40" />
        <Skeleton className="mt-1 h-5 w-20" />
      </div>
    </div>
  )
}

/** Placeholder for {@link PostLead}. */
export function PostLeadSkeleton() {
  return (
    <div className="grid gap-6 lg:grid-cols-12 lg:items-center lg:gap-8">
      <Skeleton className="aspect-4/3 rounded-sm lg:col-span-7" />
      <div className="flex flex-col gap-3 px-4 sm:gap-4 lg:col-span-5 lg:px-0">
        <Skeleton className="h-5 w-48" />
        <div className="flex flex-col gap-2">
          <Skeleton className="h-8 w-full md:h-9 xl:h-10" />
          <Skeleton className="h-8 w-3/4 md:h-9 xl:h-10" />
        </div>
        <div className="flex flex-col gap-2">
          <Skeleton className="h-6 w-full max-w-md md:h-7" />
          <Skeleton className="h-6 w-4/5 max-w-md md:h-7" />
        </div>
        <Skeleton className="mt-1 h-5 w-28 sm:mt-2" />
      </div>
    </div>
  )
}
