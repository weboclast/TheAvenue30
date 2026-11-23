import type { DemoSlug } from '@/lib/demos'
import type { Offer, OfferArtwork } from './offers'

/*
 * The campaigns the sample customer holds, for an account page that would
 * otherwise open empty on a store with no promotions engine behind it.
 *
 * Every date is counted from today rather than written down, so all 3 tabs
 * always have something on them: in each storefront 2 offers running, 1 spent
 * on a sample order, 2 lapsed.
 *
 * **The live codes have to exist in the store too.** They are redeemed against
 * `DISCOUNT_CODES` in `commerce/adapters/demo/cart.ts`, so a code added here is
 * added there as well, or the panel offers something the cart refuses.
 *
 * Artwork is borrowed from each storefront's banners and photography, which is
 * what a demo has to hand. A real campaign ships its own.
 *
 * **Delete this file with the demo adapters.** A real store reads these from its
 * backend's discounts or its own promotions table, scoped to the customer.
 */

/** A Fashion photograph, which fills its frame and needs no background. */
const photo = (file: string, alt: string, width: number, height: number): OfferArtwork => ({
  image: { src: `/demo/fashion/${file}.webp`, alt, width, height },
})

/** A day `count` days from now, as `YYYY-MM-DD`. Negative counts back. */
function daysFromNow(count: number): string {
  return new Date(Date.now() + count * 86_400_000).toISOString().slice(0, 10)
}

/** Each storefront's offers, built on every read so the dates stay counted from today. */
const OFFERS: Partial<Record<DemoSlug, () => Offer[]>> = {
  fashion: fashionOffers,
}

/** The sample customer's offers in a storefront, newest campaign first. Empty where none were authored. */
export function demoOffers(demo: DemoSlug): Offer[] {
  return OFFERS[demo]?.() ?? []
}

function fashionOffers(): Offer[] {
  return [
    {
      id: 'offer-summer15',
      code: 'SUMMER15',
      title: '15% off the summer edit',
      terms: 'On your next order of dresses and linen. Sale pieces are excluded.',
      categorySlug: 'womens-dresses',
      expiresAt: daysFromNow(9),
      artwork: photo(
        'about/collections',
        'A woman in a yellow slip dress and a linen jacket, walking through a field of poppies',
        1400,
        1400,
      ),
    },
    {
      id: 'offer-knits20',
      code: 'KNITS20',
      title: '20% off knitwear',
      terms: "Sweaters and cardigans, women's and men's. No minimum spend.",
      categorySlug: 'womens-sweaters',
      expiresAt: daysFromNow(45),
      artwork: photo('about/detail', 'Hands mending a green knit sweater by a sunny window', 1200, 1600),
    },
    {
      id: 'offer-welcome10',
      code: 'WELCOME10',
      title: '10% off your first order',
      terms: 'A thank you for joining. Valid once, on anything full price.',
      categorySlug: 'women',
      usedAt: daysFromNow(-9),
      // The sample order delivered last week; see `commerce/adapters/demo/order-book.ts`.
      usedOn: 'APC-026840',
      artwork: photo(
        'about/collection',
        'Linen shirts, a yellow slip dress, and wide trousers on a clothes rail',
        1400,
        1400,
      ),
    },
    {
      id: 'offer-linen25',
      code: 'LINEN25',
      title: '25% off linen shirts',
      terms: 'On every linen shirt in the store, for the first week of summer.',
      categorySlug: 'mens-shirts',
      expiresAt: daysFromNow(-60),
      artwork: photo(
        'banners/mens-short-sleeves',
        'A man in a striped knit polo, resting in a deck chair above a misty rainforest',
        3336,
        1536,
      ),
    },
    {
      id: 'offer-atelier15',
      code: 'ATELIER15',
      title: 'Atelier weekend, 15% off',
      terms: 'Everything made in our ateliers in northern Portugal, for 1 weekend only.',
      categorySlug: 'women',
      expiresAt: daysFromNow(-150),
      artwork: photo('about/atelier', 'A tailor cutting green linen at a long table in a bright atelier', 1920, 1280),
    },
  ]
}
