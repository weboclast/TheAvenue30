import { RAIL_BLEED } from '@/components/card-rail'
import { CollectionTile } from '@/components/fashion/collections/collection-tile'
import { Eyebrow } from '@/components/fashion/eyebrow'
import type { Collection } from '@/lib/commerce/types'
import { cn } from '@/lib/utils'

/**
 * Every collection a collections page lists, under the page's `h1`: a rail
 * below `md`, and 2 across from there.
 */
export function CollectionGrid({ collections }: { collections: Collection[] }) {
  return (
    <section className="container flex flex-col gap-8 py-16 md:gap-10 md:py-20 xl:py-24">
      <div className="flex flex-col gap-3">
        <Eyebrow>Collections</Eyebrow>
        <h1 className="text-foreground-intense text-3xl font-medium md:text-4xl">Cut for the season</h1>
        <p className="max-w-xl text-pretty">
          A collection is a handful of pieces that belong together: the same cloth, the same colors, the same days.
          Every one of them is still in the range.
        </p>
      </div>

      {/* Sized like the product gallery's rail. */}
      {collections.length > 0 ? (
        <ul
          className={cn(
            RAIL_BLEED,
            'snap-x snap-mandatory scroll-px-4 sm:scroll-px-[calc((100%+2rem)/38+1rem)]',
            'md:m-0 md:grid md:snap-none md:grid-cols-2 md:overflow-visible md:p-0',
          )}
        >
          {collections.map((collection) => (
            <li key={collection.id} className="w-9/10 shrink-0 snap-start md:w-auto">
              <CollectionTile collection={collection} />
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-foreground-muted py-12 text-center">Nothing here just yet.</p>
      )}
    </section>
  )
}
