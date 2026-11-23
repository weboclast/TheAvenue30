import { Skeleton } from '@appica/ui-react/skeleton'
import { cn } from '@/lib/utils'

/**
 * Placeholder for {@link ProductCard} while a catalog read streams in.
 *
 * The boxes and the gaps between them are the card's own (the photograph, a
 * single title line, and the price) so a skeleton stands exactly as tall as the
 * card that replaces it and nothing jumps.
 */
export function ProductCardSkeleton({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div data-slot="product-card-skeleton" className={cn('flex flex-col gap-3', className)} {...props}>
      <Skeleton className="rounded-2xs aspect-324/406" />
      <div className="flex flex-col gap-0.5 px-4">
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-5 w-16" />
      </div>
    </div>
  )
}
