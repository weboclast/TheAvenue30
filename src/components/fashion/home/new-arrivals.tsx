import { Suspense } from 'react'
import { ProductShelf, ProductShelfSkeleton } from '@/components/fashion/product/product-shelf'
import { toHref, withSort } from '@/lib/catalog-filters'
import { getCommerce } from '@/lib/commerce'
import { toCardProduct } from '@/lib/commerce/card-product'

const TITLE = 'New arrivals'

/** Cards on the shelf. Declared here: a client file's constant reaches a Server Component as a reference. */
const SHELF_SIZE = 12

interface NewArrivalsProps {
  /** The department whose newest pieces fill the shelf. Omit for the whole store's. */
  department?: string
}

/**
 * The newest pieces, with a heading that opens the full listing newest first.
 * Renders nothing, spacing included, for a department with nothing in stock.
 */
export function NewArrivals({ department }: NewArrivalsProps) {
  const href = toHref(department ? `/catalog/${department}` : '/catalog', withSort(new URLSearchParams(), 'newest'))

  return (
    <Suspense
      fallback={
        <section className="pb-16 md:pb-20 xl:pb-24">
          <ProductShelfSkeleton title={TITLE} href={href} />
        </section>
      }
    >
      <NewArrivalsShelf department={department} href={href} />
    </Suspense>
  )
}

async function NewArrivalsShelf({ department, href }: NewArrivalsProps & { href: string }) {
  const { products } = await getCommerce('fashion').listProducts({
    categorySlug: department,
    sort: 'newest',
    inStock: true,
    limit: SHELF_SIZE,
  })
  if (!products.length) return null

  return (
    <section className="pb-16 md:pb-20 xl:pb-24">
      <ProductShelf title={TITLE} href={href} products={products.map(toCardProduct)} />
    </section>
  )
}
