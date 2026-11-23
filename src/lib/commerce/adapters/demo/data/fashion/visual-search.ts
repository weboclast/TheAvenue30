import type { ProductImage } from '@/lib/commerce/types'
import type { VisualSearchSampleSource } from '../dataset'

/** A photograph the store already shows elsewhere, at its own size. */
const photo = (path: string, alt: string, width: number, height: number): ProductImage => ({
  src: `/demo/fashion/${path}.webp`,
  alt,
  width,
  height,
})

/**
 * The outfits the search dialog offers to try, 3 per department, each one a
 * look the store already photographed from its own pieces.
 */
export const fashionVisualSearchSamples: VisualSearchSampleSource[] = [
  {
    id: 'sample-shades-of-blue',
    title: 'Shades of blue',
    department: 'women',
    image: photo(
      'collections/shades-of-blue-look',
      'A woman in a light blue poplin shirt, a denim midi skirt, tan sandals, and tortoiseshell sunglasses, walking across a whitewashed terrace above the sea',
      1696,
      2528,
    ),
    tags: [
      { x: 54, y: 45, slug: 'oversized-poplin-shirt', color: 'Light Blue', label: 'Shirt' },
      { x: 52, y: 65, slug: 'denim-midi-skirt', label: 'Skirt' },
      { x: 55, y: 31, slug: 'tortoiseshell-sunglasses', label: 'Sunglasses' },
      { x: 59, y: 87, slug: 'woven-leather-sandals', color: 'Tan', label: 'Sandals' },
    ],
  },
  {
    id: 'sample-beach-bag',
    title: 'Beach bag',
    department: 'women',
    image: photo(
      'blog/a-week-by-the-sea-in-one-bag',
      'A white linen dress, a straw sun hat, tan leather sandals, sunglasses, and a canvas tote on terracotta tiles by a pool',
      1800,
      1350,
    ),
    tags: [
      { x: 44, y: 60, slug: 'linen-midi-dress', color: 'White', label: 'Dress' },
      { x: 68, y: 23, slug: 'raffia-sun-hat', label: 'Sun hat' },
      { x: 78, y: 66, slug: 'canvas-tote-bag', color: 'Natural', label: 'Tote' },
      { x: 66, y: 48, slug: 'tortoiseshell-sunglasses', label: 'Sunglasses' },
      { x: 19, y: 79, slug: 'woven-leather-sandals', color: 'Tan', label: 'Sandals' },
    ],
  },
  {
    id: 'sample-wide-leg',
    title: 'Wide-leg tailoring',
    department: 'women',
    image: photo(
      'blog/wide-leg-trousers-office-to-saturday',
      'A woman in cream pleated wide-leg trousers, an ivory blouse, and a camel sweater over her shoulders against a pale blue wall',
      1800,
      1350,
    ),
    tags: [
      { x: 51, y: 66, slug: 'pleated-wide-leg-trousers', color: 'Cream', label: 'Trousers' },
      { x: 54, y: 44, slug: 'silk-blend-blouse', label: 'Blouse' },
      { x: 45, y: 29, slug: 'cropped-v-neck-sweater', label: 'Sweater' },
      { x: 63, y: 95, slug: 'leather-ballet-flats', label: 'Flats' },
    ],
  },
  {
    id: 'sample-worn-in-denim',
    title: 'Worn-in denim',
    department: 'men',
    image: photo(
      'collections/worn-in-denim-look',
      'A man in an open indigo chambray shirt over a white tee, mid-wash jeans, and white leather sneakers, walking down a cobbled street lined with blue tiles',
      1392,
      2048,
    ),
    tags: [
      { x: 39, y: 42, slug: 'chambray-work-shirt', label: 'Shirt' },
      { x: 51, y: 38, slug: 'heavyweight-crew-neck-tee', color: 'White', label: 'T-shirt' },
      { x: 46, y: 70, slug: 'straight-leg-jeans', color: 'Mid Wash', label: 'Jeans' },
      { x: 47, y: 91, slug: 'leather-court-sneakers', label: 'Sneakers' },
    ],
  },
  {
    id: 'sample-off-duty',
    title: 'Off duty',
    department: 'men',
    image: photo(
      'collections/off-duty-harbor',
      'A man in an open white linen shirt, ecru drawstring trousers, and suede desert boots, sitting on a harbor wall beside fishing boats',
      2048,
      1536,
    ),
    tags: [
      { x: 39, y: 45, slug: 'washed-linen-shirt', label: 'Shirt' },
      { x: 49, y: 36, slug: 'linen-blend-tee', label: 'T-shirt' },
      { x: 47, y: 62, slug: 'linen-drawstring-trousers', label: 'Trousers' },
      { x: 67, y: 80, slug: 'suede-desert-boots', label: 'Boots' },
    ],
  },
  {
    id: 'sample-polo-season',
    title: 'Polo season',
    department: 'men',
    image: photo(
      'collections/polo-season',
      'A man in a navy knit polo and stone chinos, leaning on a whitewashed wall under pink bougainvillea',
      2048,
      1536,
    ),
    tags: [
      { x: 49, y: 38, slug: 'open-collar-knit-polo', label: 'Polo' },
      { x: 52, y: 65, slug: 'slim-stretch-chinos', color: 'Stone', label: 'Chinos' },
      { x: 58, y: 90, slug: 'suede-slip-on-sneakers', label: 'Shoes' },
    ],
  },
]
