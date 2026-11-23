import { MenuDeep } from '@appica/icons-react'
import { Toc, TocItem, TocLink, TocList } from '@appica/ui-react/toc'
import type { LegalTocItem } from '@/lib/legal'

/** Pulled past the header's tallest state, or a heading sliding under the bar still reads as the current one. */
const ACTIVE_BOUNDARY = '-96px 0px -70% 0px'

/**
 * A legal document's headings, with the one in view marked. Rendered twice per
 * page: the rail beside the prose from `lg`, and the floating button's popover
 * below it. Each runs its own scroll spy, and only the visible one is on screen
 * to show the result.
 */
export function LegalToc({ items, ...props }: { items: LegalTocItem[] } & React.ComponentProps<typeof Toc>) {
  return (
    <Toc aria-label="On this page" rootMargin={ACTIVE_BOUNDARY} {...props}>
      {/* A `p`, not a heading: `Toc`'s `aria-label` already names this nav, and an
          `h2` here would sit in the outline among the document's own sections. */}
      <p className="text-foreground-muted mb-3 flex items-center gap-1.5 text-xs font-semibold tracking-wider uppercase">
        {/* Mirrored so the rule lengths descend, reading as an outline rather than a menu. */}
        <MenuDeep size={18} className="-ms-1 -scale-x-100" />
        On this page
      </p>

      <TocList>
        {items.map((item) => (
          <TocItem key={item.id}>
            {/* Depth reads from the indent and the rule, so a subsection keeps
                the same size as everything else rather than shrinking. */}
            <TocLink href={`#${item.id}`} depth={item.depth}>
              {item.number} {item.title}
            </TocLink>
          </TocItem>
        ))}
      </TocList>
    </Toc>
  )
}
