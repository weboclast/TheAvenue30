import Link from 'next/link'
import { CaretSwap } from '@/components/fashion/caret-swap'
import { CollectionTile } from '@/components/fashion/collections/collection-tile'
import { getCommerce } from '@/lib/commerce'

/** A third of the page from `xl`, and in the rail below it about half, then most of a phone. */
const TILE_SIZES = '(min-width: 75rem) 33vw, (min-width: 48rem) 47vw, 90vw'

interface HomeCollectionsProps {
  /** The department whose collections it shows. Omit for the whole store's. */
  department?: string
}

/**
 * The collections marked `onHome`, 3 across the page from `xl` and a rail below
 * it, under a heading that opens the collections page. Renders nothing, spacing
 * included, when none is marked.
 */
export async function HomeCollections({ department }: HomeCollectionsProps) {
  const collections = (await getCommerce('fashion').getCollections(department)).filter(
    (collection) => collection.onHome,
  )
  if (!collections.length) return null

  return (
    <section className="pb-16 md:pb-20 xl:pb-24">
      {/* In the container, so it lines up with the shelf headings above and below. */}
      <h2 className="text-foreground-intense container mb-4 font-mono text-lg uppercase">
        <Link
          href={department ? `/${department}/collections` : '/collections'}
          className="group outline-ring rounded-4xs inline-flex items-center gap-2 focus-visible:outline-2 focus-visible:outline-offset-2"
        >
          Collections
          <CaretSwap />
        </Link>
      </h2>

      {/* `-my-1 py-1` is the slack a tile's focus ring needs inside the scroller. */}
      <ul className="-my-1 flex snap-x snap-mandatory scroll-px-2 scrollbar-none gap-2 overflow-x-auto px-2 py-1 xl:grid xl:snap-none xl:grid-cols-3 xl:overflow-visible">
        {collections.map((collection) => (
          <li key={collection.id} className="w-9/10 shrink-0 snap-start md:w-[47%] xl:w-auto">
            <CollectionTile collection={collection} sizes={TILE_SIZES} />
          </li>
        ))}
      </ul>
    </section>
  )
}
