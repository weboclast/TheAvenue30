import type { Metadata } from 'next'
import { CartContents } from '@/components/fashion/cart/cart-contents'
import { RecommendedProducts } from '@/components/fashion/cart/recommended-products'
import { SavedForLater } from '@/components/fashion/cart/saved-for-later'
import { getDepartment } from '@/lib/departments'

export const metadata: Metadata = { title: 'Your bag' }

/** The bag, then the shopper's wishlist and the department's best sellers, shown whether the bag is full or empty. */
export default async function FashionCartPage() {
  const department = await getDepartment('fashion')

  return (
    <main className="flex flex-1 flex-col">
      <CartContents shopHref={department ? `/catalog/${department.slug}` : '/catalog'} />
      <SavedForLater />
      <RecommendedProducts department={department?.slug} />
    </main>
  )
}
