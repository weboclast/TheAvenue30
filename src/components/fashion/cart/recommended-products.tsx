import { Suspense } from 'react'
import { ProductShelf, ProductShelfSkeleton } from '@/components/fashion/product/product-shelf'
import { getCart } from '@/lib/cart'
import { getCommerce } from '@/lib/commerce'
import { toCardProduct } from '@/lib/commerce/card-product'

const TITLE = 'Recommended'

const SHELF_SIZE = 12

interface RecommendedProductsProps {
  /** The department whose best sellers fill the shelf. Omit for the whole store's. */
  department?: string
  /** Products to leave off besides the bag's, by slug: an order just placed. */
  exclude?: string[]
}

/** The department's best sellers, less what is in the bag. Renders nothing, spacing included, once none are left. */
export function RecommendedProducts({ department, exclude }: RecommendedProductsProps) {
  return (
    <Suspense
      fallback={
        <section className="pb-16 md:pb-20 xl:pb-24">
          <ProductShelfSkeleton title={TITLE} />
        </section>
      }
    >
      <RecommendedShelf department={department} exclude={exclude} />
    </Suspense>
  )
}

async function RecommendedShelf({ department, exclude = [] }: RecommendedProductsProps) {
  const [cart, { products }] = await Promise.all([
    getCart('fashion'),
    // Twice the shelf, so a bag holding some of them still leaves a full row.
    getCommerce('fashion').listProducts({
      categorySlug: department,
      sort: 'best-selling',
      inStock: true,
      limit: SHELF_SIZE * 2,
    }),
  ])
  const owned = new Set([...cart.lines.map((line) => line.productSlug), ...exclude])
  const shelf = products.filter((product) => !owned.has(product.slug)).slice(0, SHELF_SIZE)

  if (shelf.length === 0) return null

  return (
    <section className="pb-16 md:pb-20 xl:pb-24">
      <ProductShelf title={TITLE} products={shelf.map(toCardProduct)} />
    </section>
  )
}
