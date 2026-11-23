import { buttonVariants } from '@appica/ui-react/button'
import { cn } from '@/lib/utils'

/** Where {@link SkipLink} jumps to: the {@link SkipTarget} each layout sets before its page. */
const TARGET_ID = 'main'

/**
 * "Skip to content", the first stop for a keyboard: out of sight until it takes
 * focus, then pinned to the top start corner. Rendered once, by `StoreProviders`.
 */
export function SkipLink() {
  return (
    <a
      href={`#${TARGET_ID}`}
      data-slot="button"
      className={cn(buttonVariants(), 'fixed inset-s-4 top-4 z-100 not-focus:sr-only')}
    >
      Skip to content
    </a>
  )
}

/**
 * Where {@link SkipLink} lands: just before the page, after the layout's header,
 * so the next Tab goes into the page. It takes no space and shows no ring.
 */
export function SkipTarget() {
  return <div id={TARGET_ID} tabIndex={-1} className="outline-none" />
}
