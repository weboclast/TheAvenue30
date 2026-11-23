import { cn } from '@/lib/utils'

/**
 * The bleed every card row shares: a rail that scrolls to the viewport edge on
 * narrow screens. Exported for a row that settles into a layout of its own.
 *
 * The negative margin cancels the container's gutter so the rail runs edge to
 * edge, and the matching padding holds the first and last card inside it.
 * `(100%+2rem)/38` is that gutter, the `container` utility's 95% width read
 * from the inside, so a change in `globals.css` is a change here. Electronics'
 * `category-row.tsx` and its footer strip carry the same string.
 */
export const RAIL_BLEED = cn(
  '-mx-4 -my-1 flex scrollbar-none gap-2 overflow-x-auto px-4 py-1',
  'sm:-mx-[calc((100%+2rem)/38+1rem)] sm:px-[calc((100%+2rem)/38+1rem)]',
)

/** A row of 3 wide cards: a rail below `lg`, a grid above it. */
export const CARD_RAIL = cn(RAIL_BLEED, 'lg:-mx-1 lg:grid lg:grid-cols-3 lg:overflow-x-visible lg:px-1')

/** A card's width while {@link CARD_RAIL} is a rail, leaving the next one peeking on a phone. */
export const CARD_RAIL_ITEM = 'w-76 shrink-0 lg:w-auto'

/**
 * A row of 4 narrow cards: a rail until `xl`, where 4 finally fit. The classes
 * are spelled out rather than built from a column count, since Tailwind only
 * finds class names it can read in the source.
 */
export const CARD_RAIL_4 = cn(RAIL_BLEED, 'xl:-mx-1 xl:grid xl:grid-cols-4 xl:overflow-x-visible xl:px-1')

/** A card's width while {@link CARD_RAIL_4} is a rail. Narrower, since these cards are portrait. */
export const CARD_RAIL_4_ITEM = 'w-64 shrink-0 xl:w-auto'
