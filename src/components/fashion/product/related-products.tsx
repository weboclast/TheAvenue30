import { Suspense } from 'react'
import { ProductShelf, ProductShelfSkeleton } from '@/components/fashion/product/product-shelf'
import { getCommerce } from '@/lib/commerce'
import { toCardProduct } from '@/lib/commerce/card-product'

const TITLE = 'You may also like'

/** Cards on the shelf. Declared here: a client file's constant reaches a Server Component as a reference. */
const SHELF_SIZE = 12

/**
 * The shelf that closes a product page: what a shopper who isn't sold on this
 * one should look at next. Which products land here is the commerce layer's
 * call (`getRelatedProducts`, the same category first); where it finds none,
 * this renders nothing, spacing included.
 */
export function RelatedProducts({ slug }: { slug: string }) {
  return (
    <Suspense
      fallback={
        <section className="pb-16 md:pb-20 xl:pb-24">
          <ProductShelfSkeleton title={TITLE} />
        </section>
      }
    >
      <RelatedShelf slug={slug} />
    </Suspense>
  )
}

async function RelatedShelf({ slug }: { slug: string }) {
  const products = await getCommerce('fashion').getRelatedProducts(slug)
  if (!products.length) return null

  return (
    <section className="pb-16 md:pb-20 xl:pb-24">
      <ProductShelf title={TITLE} products={products.slice(0, SHELF_SIZE).map(toCardProduct)} />
    </section>
  )
}
