import type { HeroCampaign, ProductImage } from '@/lib/commerce/types'

/** A cut-out from `/public/demo/fashion/hero/`, filed by department and all drawn on the same canvas. */
const cutout = (file: string, alt: string): ProductImage => ({
  src: `/demo/fashion/hero/${file}.webp`,
  alt,
  width: 2808,
  height: 2160,
})

/** The campaigns a department's home opens with, by department id. Each ground holds white copy at 4.5:1. */
export const fashionDepartmentHeroCampaigns: Record<string, HeroCampaign[]> = {
  'cat-women': [
    {
      id: 'hero-long-evenings',
      eyebrow: 'Summer collection',
      title: 'Long evenings',
      description:
        'Slip, wrap, and tiered dresses for the hours after the heat, and the small things that finish them.',
      href: '/collections/long-evenings',
      image: cutout(
        'women/long-evenings',
        '2 women cheek to cheek behind an armful of pink, yellow, and coral wildflowers',
      ),
      background: '#4b7d91',
    },
    {
      id: 'hero-soft-tailoring',
      eyebrow: 'New collection',
      title: 'Soft tailoring',
      description: 'Suits and separates cut loose enough to sit down in, from the blazer to the pleated trousers.',
      href: '/collections/soft-tailoring',
      image: cutout(
        'women/soft-tailoring',
        'A woman in an oversized sand blazer over a ribbed crop top and pleated trousers',
      ),
      background: '#df3030',
    },
    {
      id: 'hero-summer-linen',
      eyebrow: 'Essentials',
      title: 'Summer linen',
      description: 'Shirts, wide trousers, and shorts cut in washed linen. Cool by noon, and softer with every wash.',
      href: '/collections/linen-days',
      image: cutout('women/linen-days', 'A woman in a terracotta linen shirt and matching shorts'),
      background: '#6c7a68',
    },
    {
      id: 'hero-cold-mornings',
      eyebrow: 'Autumn preview',
      title: 'Cold mornings',
      description:
        'The cable sweater we opened with in 2016, now in powder blue. Every knit we make is mended for life.',
      href: '/collections/cold-mornings',
      image: cutout('women/cold-mornings', 'A woman in a powder-blue cable-knit sweater and cream wide trousers'),
      background: '#a26933',
    },
  ],
  'cat-men': [
    {
      id: 'hero-city-layers',
      eyebrow: 'New collection',
      title: 'Essential layers',
      description:
        'Overshirts, fine knits, and a suede jacket to throw over them. Smart enough for the office, easy enough for Sunday.',
      href: '/collections/city-layers',
      image: cutout(
        'men/city-layers',
        'A man in a cream camp-collar shirt with a sand sweater over his shoulders and a suede jacket in his hand',
      ),
      background: '#6c7a68',
    },
    {
      id: 'hero-polo-season',
      eyebrow: 'Summer collection',
      title: 'Refined simplicity',
      description:
        'Polos in piqué, terry, and fine knit, cut to be worn on their own. The easiest way to look put together in the heat.',
      href: '/collections/polo-season',
      image: cutout('men/polo-season', 'A man in a navy polo shirt and cream chinos, his hands in his pockets'),
      background: '#507d8c',
    },
    {
      id: 'hero-off-duty',
      eyebrow: 'Essentials',
      title: 'Summer essentials',
      description: 'Washed linen shirts, drawstring trousers, and seersucker shorts, for a week with nothing planned.',
      href: '/collections/off-duty',
      image: cutout(
        'men/off-duty',
        'A man in a straw hat, sunglasses, and a white linen shirt, smiling off to one side',
      ),
      background: '#87744e',
    },
  ],
}
