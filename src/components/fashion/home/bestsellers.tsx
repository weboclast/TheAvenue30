import { Suspense } from 'react'
import { ProductShelf, ProductShelfSkeleton } from '@/components/fashion/product/product-shelf'
import { toHref, withSort } from '@/lib/catalog-filters'
import { getCommerce } from '@/lib/commerce'
import { toCardProduct } from '@/lib/commerce/card-product'

const TITLE = 'Bestsellers'

/** Cards on the shelf. Declared here: a client file's constant reaches a Server Component as a reference. */
const SHELF_SIZE = 12

interface BestsellersProps {
  /** The department whose best sellers fill the shelf. Omit for the whole store's. */
  department?: string
}

/**
 * What sells best, as the backend ranks it, with a heading that opens the full
 * listing in the same order. Renders nothing, spacing included, for a
 * department with nothing in stock.
 */
export function Bestsellers({ department }: BestsellersProps) {
  const href = toHref(
    department ? `/catalog/${department}` : '/catalog',
    withSort(new URLSearchParams(), 'best-selling'),
  )

  return (
    <Suspense
      fallback={
        <section className="pb-16 md:pb-20 xl:pb-24">
          <ProductShelfSkeleton title={TITLE} href={href} />
        </section>
      }
    >
      <BestsellersShelf department={department} href={href} />
    </Suspense>
  )
}

async function BestsellersShelf({ department, href }: BestsellersProps & { href: string }) {
  const { products } = await getCommerce('fashion').listProducts({
    categorySlug: department,
    sort: 'best-selling',
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
