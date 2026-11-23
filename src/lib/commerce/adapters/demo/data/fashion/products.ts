import type { Money, Product, ProductColor, ProductOption, ProductSpec } from '@/lib/commerce/types'
import { SIZE_OPTION_ID } from '@/lib/commerce/product-options'
import { type ShotSize, readProductMedia } from '../product-media'
import { fashionCategories } from './categories'
import photos from './photos.json'

/*
 * Fashion catalog. Built on the same seed-and-`build` shape as the Electronics
 * one, so the 2 datasets read alike; what differs is what a garment carries.
 *
 * Seeds run in featured order. Keep 2 of a category, or 2 shoes and accessories
 * (shot without a model), from sitting side by side at any column count.
 *
 * Every garment names at least 1 color, which the product page labels and the
 * color filter reads. Photography: `products/<department>/<slug>/<color>/`, and
 * each color names the shot showing the piece on its own as its `packshot`.
 *
 * Size runs are listed in full, sold-out sizes marked `available: false`: a
 * missing 44 reads as "this doesn't come in my size".
 *
 * Each department flags 12 products `new` and gives `unitsSold` to 12 others, so
 * its New arrivals and Bestsellers shelves are full and never repeat a product.
 */

const DEMO = 'fashion'

/** Fashion is shot 4:5 portrait, the garment cut out of its studio ground. */
const SHOT_SIZE: ShotSize = { width: 1280, height: 1600 }

const usd = (amount: number): Money => ({ amount, currencyCode: 'USD' })

/** Women's knitwear, tops, and dresses. */
const LETTER = ['XS', 'S', 'M', 'L', 'XL']
/** Women's jersey basics, which start a size smaller. */
const LETTER_EXTENDED = ['XXS', 'XS', 'S', 'M', 'L', 'XL']
/** Women's trousers, skirts, and shorts, by European size. */
const WAIST = ['34', '36', '38', '40', '42', '44']
/** Women's shoes, by European size. */
const SHOE = ['36', '37', '38', '39', '40', '41']
/** Belts, by length in centimeters. */
const BELT = ['75', '80', '85', '90']
/** Men's tops, knitwear, and outerwear. */
const MENS_LETTER = ['S', 'M', 'L', 'XL', 'XXL']
/** Men's dress shirts, by collar size in centimeters. */
const COLLAR = ['38', '39', '40', '41', '42', '43']
/** Men's trousers and shorts, by European size. */
const MENS_WAIST = ['44', '46', '48', '50', '52', '54']
/** Suits, by European jacket size (the trousers match). */
const SUIT = ['46', '48', '50', '52', '54', '56']
/** Men's shoes, by European size. */
const MENS_SHOE = ['40', '41', '42', '43', '44', '45', '46']

/** The size option for a run, with the sizes that have sold out struck through. */
function sizes(run: string[], soldOut: string[] = []): ProductOption[] {
  const values = run.map((size) => ({
    id: size.toLowerCase(),
    label: size,
    ...(soldOut.includes(size) && { available: false }),
  }))
  return [{ id: SIZE_OPTION_ID, label: 'Size', values }]
}

/** Headings the product page lists the sheet under. */
const DETAILS = 'Product details'
const SIZE_AND_FIT = 'Size & fit'
const MATERIALS = 'Materials & care'

/** What a garment's page says about it beyond its description. */
interface SheetSeed {
  /** Construction lines under "Product details", as `[label, value]`. */
  details: [label: string, value: string][]
  fit?: string
  /** Who the first color is photographed on, e.g. `'Is 176 cm tall and wears size S'`. */
  model?: string
  composition: string
  care: string
  origin: string
}

/** The spec sheet, with ids stable across the catalog. */
function sheet({ details, fit, model, composition, care, origin }: SheetSeed): ProductSpec[] {
  return [
    ...details.map(([label, value]) => ({
      id: label.toLowerCase().replace(/\W+/g, '-'),
      label,
      value,
      group: DETAILS,
    })),
    ...(fit ? [{ id: 'fit', label: 'Fit', value: fit, group: SIZE_AND_FIT }] : []),
    ...(model ? [{ id: 'model', label: 'Model', value: model, group: SIZE_AND_FIT }] : []),
    { id: 'composition', label: 'Composition', value: composition, group: MATERIALS },
    { id: 'care', label: 'Care', value: care, group: MATERIALS },
    { id: 'origin', label: 'Made in', value: origin, group: MATERIALS },
  ]
}

/** A color name paired with its swatch value; its photography follows from the name. */
interface ColorSeed {
  name: string
  hex: string
  /** The number of the shot showing the piece on its own, which can differ from color to color. */
  packshot?: number
}

type Seed = Omit<Product, 'id' | 'media' | 'colors' | 'availability'> & {
  colors: [ColorSeed, ...ColorSeed[]]
}

/** The seed's department, which is also its photography folder. */
function departmentOf(seed: Seed): string | undefined {
  return fashionCategories.find((category) => category.parentId === null && seed.categoryIds.includes(category.id))
    ?.slug
}

function build(seed: Seed): Product {
  const { colors: colorSeeds, ...rest } = seed
  const group = departmentOf(seed)

  const colors: ProductColor[] = colorSeeds.map((color) => ({
    name: color.name,
    hex: color.hex,
    media: readProductMedia(photos, DEMO, seed.slug, {
      alt: `${seed.title}, ${color.name}`,
      size: SHOT_SIZE,
      color: color.name,
      group,
      packshot: color.packshot,
    }),
  }))

  // Scarcity is per size; a product sold out entirely would only drop off the listing.
  return { ...rest, id: seed.slug, media: colors[0].media, colors, availability: 'in-stock' }
}

const seeds: Seed[] = [
  {
    slug: 'oversized-cable-knit-sweater',
    title: 'Oversized cable-knit sweater',
    description:
      'A cable-knit sweater cut wide through the body, with dropped shoulders and a ribbed crew neck. Soft enough to wear against the skin, and heavy enough to stand on its own through a cold morning.',
    specSheet: sheet({
      details: [
        ['Neckline', 'Ribbed crew neck'],
        ['Knit', 'Cable, 7 gauge'],
      ],
      fit: 'Oversize, dropped shoulder',
      model: 'Is 179 cm tall and wears size S',
      composition: '70% wool, 30% recycled polyamide',
      care: 'Hand wash cold, dry flat',
      origin: 'Portugal',
    }),
    options: sizes(LETTER, ['XL']),
    // Swatches run a little richer than the knit photographs: an 8px bar loses
    // the chroma a whole sweater carries, and 3 pale bars stop telling apart.
    colors: [
      { name: 'Powder Blue', hex: '#9BB5D9', packshot: 6 },
      { name: 'Sage', hex: '#9CC194', packshot: 6 },
      { name: 'Navy', hex: '#2C4A8C', packshot: 6 },
    ],
    price: usd(72),
    badges: ['new'],
    categoryIds: ['cat-women', 'cat-womens-sweaters'],
    tags: ['sweater', 'knitwear', 'cable knit', 'oversize', 'wool'],
    attributes: { material: ['Wool'], fit: ['Oversize'], sleeve: ['3/4 sleeve'] },
  },
  {
    slug: 'woven-leather-sandals',
    title: 'Woven leather sandals',
    description:
      'Flat sandals with wide crossed straps and a buckled ankle strap, on a stacked leather sole. The leather softens and darkens with wear.',
    specSheet: sheet({
      details: [
        ['Upper', 'Vegetable-tanned leather straps'],
        ['Fastening', 'Adjustable ankle buckle'],
        ['Sole', 'Stacked leather, rubber heel tip'],
      ],
      fit: 'True to size. Take the next size up between sizes',
      composition: 'Upper and lining: 100% leather. Sole: leather and rubber',
      care: 'Wipe clean, condition the leather now and then',
      origin: 'Italy',
    }),
    options: sizes(SHOE, ['36']),
    colors: [
      { name: 'Tan', hex: '#B5652E', packshot: 1 },
      { name: 'Black', hex: '#1C1C1C', packshot: 1 },
    ],
    price: usd(56),
    unitsSold: 1980,
    badges: ['bestseller'],
    categoryIds: ['cat-women', 'cat-womens-shoes'],
    tags: ['sandals', 'flats', 'leather', 'summer'],
    attributes: { material: ['Leather'] },
  },
  {
    slug: 'mid-length-denim-shorts',
    title: 'Mid-length denim shorts',
    description:
      'High-waisted shorts in light-wash rigid denim, cut to mid-thigh and left with a raw hem that frays a little more with every wash.',
    specSheet: sheet({
      details: [
        ['Rise', 'High'],
        ['Closure', 'Button fly'],
        ['Pockets', '5 pockets'],
      ],
      fit: 'Relaxed through the leg',
      model: 'Is 177 cm tall and wears size 36',
      composition: '100% organic cotton denim',
      care: 'Machine wash cold, inside out',
      origin: 'Turkey',
    }),
    options: sizes(WAIST, ['44']),
    colors: [{ name: 'Light Wash', hex: '#A9C1DB', packshot: 4 }],
    price: usd(88),
    badges: ['new'],
    categoryIds: ['cat-women', 'cat-womens-trousers'],
    tags: ['shorts', 'denim', 'jeans', 'summer'],
    attributes: { material: ['Denim'], fit: ['Relaxed'] },
  },
  {
    slug: 'satin-slip-dress',
    title: 'Satin midi slip dress',
    description:
      'A bias-cut slip dress in fluid satin, with a soft cowl neck and fine straps. It falls to mid-calf and moves with you.',
    specSheet: sheet({
      details: [
        ['Neckline', 'Cowl'],
        ['Straps', 'Adjustable'],
        ['Length', 'Midi'],
      ],
      fit: 'Bias cut, skims the body',
      model: 'Is 175 cm tall and wears size S',
      composition: '100% viscose satin',
      care: 'Hand wash cold, hang to dry',
      origin: 'Portugal',
    }),
    options: sizes(LETTER, ['XS']),
    colors: [
      { name: 'Champagne', hex: '#D9C3A0', packshot: 3 },
      { name: 'Black', hex: '#1B1B1B', packshot: 2 },
    ],
    price: usd(120),
    badges: ['new'],
    categoryIds: ['cat-women', 'cat-womens-dresses'],
    tags: ['dress', 'slip dress', 'satin', 'midi', 'occasion'],
    attributes: { material: ['Viscose'], fit: ['Fitted'], sleeve: ['Sleeveless'] },
  },
  {
    slug: 'relaxed-linen-shirt',
    title: 'Relaxed linen shirt',
    description:
      'A white shirt in washed European linen, cut loose enough to wear open over a swimsuit or buttoned with tailored trousers.',
    specSheet: sheet({
      details: [
        ['Collar', 'Classic point collar'],
        ['Closure', 'Button front'],
      ],
      fit: 'Relaxed',
      model: 'Is 176 cm tall and wears size S',
      composition: '100% linen',
      care: 'Machine wash cold, line dry',
      origin: 'Lithuania',
    }),
    options: sizes(LETTER),
    colors: [{ name: 'White', hex: '#F7F6F2', packshot: 3 }],
    price: usd(78),
    badges: [],
    categoryIds: ['cat-women', 'cat-womens-tops'],
    tags: ['shirt', 'linen', 'summer', 'white'],
    attributes: { material: ['Linen'], fit: ['Relaxed'], sleeve: ['Long sleeve'] },
  },
  {
    slug: 'pointed-backless-mules',
    title: 'Pointed backless mules',
    description:
      'Slip-on mules in soft nappa with a sharply pointed toe and a low heel. Quiet enough for every day, sharp enough for an evening.',
    specSheet: sheet({
      details: [
        ['Toe', 'Pointed'],
        ['Heel', '1.5 cm'],
      ],
      fit: 'True to size',
      composition: 'Upper and lining: 100% leather. Sole: leather',
      care: 'Wipe clean with a soft dry cloth',
      origin: 'Italy',
    }),
    options: sizes(SHOE, ['40']),
    colors: [{ name: 'Beige', hex: '#D6BC96', packshot: 1 }],
    price: usd(96),
    badges: [],
    categoryIds: ['cat-women', 'cat-womens-shoes'],
    tags: ['mules', 'slippers', 'flats', 'leather'],
    attributes: { material: ['Leather'] },
  },
  {
    slug: 'cable-knit-crew-sweater',
    title: 'Cable-knit crew sweater',
    description:
      'A classic crew-neck sweater in soft ecru wool, knitted with vertical cable panels. The one to reach for from October to April.',
    specSheet: sheet({
      details: [
        ['Neckline', 'Ribbed crew neck'],
        ['Knit', 'Cable, 5 gauge'],
      ],
      fit: 'Relaxed',
      model: 'Is 175 cm tall and wears size S',
      composition: '80% wool, 20% alpaca',
      care: 'Hand wash cold, dry flat',
      origin: 'Portugal',
    }),
    options: sizes(LETTER, ['S']),
    colors: [{ name: 'Ecru', hex: '#EFE9DD', packshot: 3 }],
    price: usd(96),
    unitsSold: 1050,
    badges: [],
    categoryIds: ['cat-women', 'cat-womens-sweaters'],
    tags: ['sweater', 'knitwear', 'cable knit', 'wool'],
    attributes: { material: ['Wool'], fit: ['Relaxed'], sleeve: ['Long sleeve'] },
  },
  {
    slug: 'linen-camp-collar-shirt',
    title: 'Linen camp-collar shirt',
    description:
      'A short-sleeved shirt in washed linen with an open camp collar and a boxy, straight hem. Wear it with the matching shorts or loose over a tank.',
    specSheet: sheet({
      details: [
        ['Collar', 'Camp collar'],
        ['Closure', 'Button front'],
      ],
      fit: 'Boxy',
      model: 'Is 174 cm tall and wears size S',
      composition: '100% linen',
      care: 'Machine wash cold, line dry',
      origin: 'Lithuania',
    }),
    options: sizes(LETTER, ['L']),
    colors: [{ name: 'Terracotta', hex: '#B8603F', packshot: 3 }],
    price: usd(72),
    badges: ['new'],
    categoryIds: ['cat-women', 'cat-womens-tops'],
    tags: ['shirt', 'linen', 'short sleeve', 'summer'],
    attributes: { material: ['Linen'], fit: ['Relaxed'], sleeve: ['Short sleeve'] },
  },
  {
    slug: 'suede-western-ankle-boots',
    title: 'Suede western ankle boots',
    description:
      'Ankle boots in soft suede with western stitching, elastic side panels, and a slanted block heel, made for the months between sandals and snow.',
    specSheet: sheet({
      details: [
        ['Toe', 'Pointed'],
        ['Heel', '5 cm stacked block'],
        ['Shaft', '14 cm'],
      ],
      fit: 'True to size',
      composition: 'Upper: 100% suede. Lining: leather. Sole: rubber',
      care: 'Brush clean, treat with a suede protector',
      origin: 'Spain',
    }),
    options: sizes(SHOE, ['37', '41']),
    colors: [{ name: 'Taupe', hex: '#8E7659', packshot: 1 }],
    price: usd(120),
    compareAtPrice: usd(160),
    badges: ['sale'],
    categoryIds: ['cat-women', 'cat-womens-shoes'],
    tags: ['boots', 'ankle boots', 'western', 'suede'],
    attributes: { material: ['Suede'] },
  },
  {
    slug: 'oversized-poplin-shirt',
    title: 'Oversized poplin shirt',
    description:
      'A crisp cotton poplin shirt with dropped shoulders, a chest pocket, and a long curved hem, oversized enough to tuck in or wear loose.',
    specSheet: sheet({
      details: [
        ['Collar', 'Classic point collar'],
        ['Closure', 'Button front'],
        ['Pockets', '1 chest pocket'],
      ],
      fit: 'Oversize',
      model: 'Is 176 cm tall and wears size S',
      composition: '100% organic cotton poplin',
      care: 'Machine wash at 40°C, iron on medium',
      origin: 'Portugal',
    }),
    options: sizes(LETTER),
    colors: [
      { name: 'Light Blue', hex: '#9DC0E8', packshot: 4 },
      { name: 'Butter', hex: '#F1DE9A', packshot: 2 },
    ],
    price: usd(69),
    unitsSold: 1870,
    badges: ['bestseller'],
    categoryIds: ['cat-women', 'cat-womens-tops'],
    tags: ['shirt', 'poplin', 'cotton', 'oversize'],
    attributes: { material: ['Cotton'], fit: ['Oversize'], sleeve: ['Long sleeve'] },
  },
  {
    slug: 'denim-maxi-skirt',
    title: 'Denim maxi skirt',
    description:
      'A long, straight skirt in mid-wash denim with a front slit that keeps it easy to walk in. Five pockets, and a waist that sits high.',
    specSheet: sheet({
      details: [
        ['Rise', 'High'],
        ['Closure', 'Zip fly with button'],
        ['Length', 'Ankle, with a front slit'],
      ],
      fit: 'Straight',
      model: 'Is 178 cm tall and wears size 36',
      composition: '100% organic cotton denim',
      care: 'Machine wash cold, inside out',
      origin: 'Turkey',
    }),
    options: sizes(WAIST, ['34']),
    colors: [{ name: 'Mid Wash', hex: '#5E7FA8', packshot: 4 }],
    price: usd(111),
    unitsSold: 1390,
    badges: ['bestseller'],
    categoryIds: ['cat-women', 'cat-womens-trousers'],
    tags: ['skirt', 'denim', 'maxi', 'jeans'],
    attributes: { material: ['Denim'], fit: ['Straight'] },
  },
  {
    slug: 'fitted-button-up-cardigan',
    title: 'Fitted button-up cardigan',
    description:
      'A fine rib cardigan cut close to the body and finished at the waist, with a V-neck and horn buttons. Wear it buttoned on its own or open over a tee.',
    specSheet: sheet({
      details: [
        ['Neckline', 'V-neck'],
        ['Closure', '5 horn buttons'],
        ['Knit', 'Fine rib, 12 gauge'],
      ],
      fit: 'Fitted, waist length',
      model: 'Is 177 cm tall and wears size S',
      composition: '100% merino wool',
      care: 'Hand wash cold, dry flat',
      origin: 'Portugal',
    }),
    options: sizes(LETTER, ['M']),
    colors: [
      { name: 'Navy', hex: '#1F2A4D', packshot: 3 },
      { name: 'Ecru', hex: '#EDE6D6', packshot: 2 },
    ],
    price: usd(68),
    compareAtPrice: usd(85),
    unitsSold: 2140,
    badges: ['sale'],
    categoryIds: ['cat-women', 'cat-womens-sweaters'],
    tags: ['cardigan', 'knitwear', 'merino', 'wool'],
    attributes: { material: ['Wool'], fit: ['Fitted'], sleeve: ['Long sleeve'] },
  },
  {
    slug: 'canvas-tote-bag',
    title: 'Canvas tote bag',
    description:
      'A deep tote in washed cotton canvas with long shoulder straps and room for a laptop, a sweater, and the market on the way home.',
    specSheet: sheet({
      details: [
        ['Dimensions', '42 × 38 × 14 cm'],
        ['Strap drop', '28 cm'],
        ['Interior', '1 zip pocket'],
      ],
      composition: '100% organic cotton canvas',
      care: 'Spot clean, air dry',
      origin: 'Portugal',
    }),
    colors: [
      { name: 'Moss', hex: '#8A9A3B', packshot: 1 },
      { name: 'Natural', hex: '#E9E1CF', packshot: 1 },
    ],
    price: usd(48),
    badges: ['new'],
    categoryIds: ['cat-women', 'cat-womens-accessories'],
    tags: ['bag', 'tote', 'canvas'],
    attributes: { material: ['Cotton'] },
  },
  {
    slug: 'cropped-v-neck-sweater',
    title: 'Loose cropped V-neck sweater',
    description:
      'A boxy, cropped sweater with a deep V-neck and full sleeves, knitted from a brushed yarn that feels like a blanket.',
    specSheet: sheet({
      details: [
        ['Neckline', 'Deep V-neck'],
        ['Knit', 'Brushed jersey, 7 gauge'],
      ],
      fit: 'Boxy and cropped',
      model: 'Is 174 cm tall and wears size S',
      composition: '60% alpaca, 30% polyamide, 10% wool',
      care: 'Hand wash cold, dry flat',
      origin: 'Portugal',
    }),
    options: sizes(LETTER),
    colors: [{ name: 'Camel', hex: '#C49A6C', packshot: 3 }],
    price: usd(89),
    badges: [],
    categoryIds: ['cat-women', 'cat-womens-sweaters'],
    tags: ['sweater', 'knitwear', 'cropped', 'alpaca'],
    attributes: { material: ['Wool'], fit: ['Oversize'], sleeve: ['Long sleeve'] },
  },
  {
    slug: 'linen-straight-trousers',
    title: 'Linen straight trousers',
    description:
      'Tailored trousers in slubby sand linen with a high waist and long straight legs. Part of a suit, with the blazer sold separately.',
    specSheet: sheet({
      details: [
        ['Rise', 'High'],
        ['Closure', 'Hook and zip fly'],
        ['Pockets', 'Side and back welt pockets'],
      ],
      fit: 'Straight, full length',
      model: 'Is 178 cm tall and wears size 36',
      composition: '100% linen',
      care: 'Machine wash cold, line dry',
      origin: 'Lithuania',
    }),
    options: sizes(WAIST, ['42']),
    colors: [{ name: 'Sand', hex: '#D9CDB8', packshot: 3 }],
    price: usd(96),
    badges: [],
    categoryIds: ['cat-women', 'cat-womens-trousers'],
    tags: ['trousers', 'linen', 'tailoring', 'suit'],
    attributes: { material: ['Linen'], fit: ['Straight'] },
  },
  {
    slug: 'floral-print-midi-dress',
    title: 'Floral print midi dress',
    description:
      'A light viscose dress printed with poppies, marigolds, and cornflowers, with flutter sleeves, a gathered waist, and a skirt that moves.',
    specSheet: sheet({
      details: [
        ['Neckline', 'V-neck'],
        ['Sleeves', 'Short flutter sleeves'],
        ['Length', 'Midi'],
      ],
      fit: 'Fitted at the waist, flowing skirt',
      model: 'Is 174 cm tall and wears size S',
      composition: '100% viscose',
      care: 'Machine wash cold on a gentle cycle',
      origin: 'Portugal',
    }),
    options: sizes(LETTER),
    colors: [{ name: 'Wildflower', hex: '#E9DFC8', packshot: 3 }],
    price: usd(128),
    badges: ['new'],
    categoryIds: ['cat-women', 'cat-womens-dresses'],
    tags: ['dress', 'floral', 'print', 'midi', 'summer'],
    attributes: { material: ['Viscose'], fit: ['Regular'], sleeve: ['Short sleeve'] },
  },
  {
    slug: 'bobble-knit-sweater',
    title: 'Bobble-knit elbow-sleeve sweater',
    description:
      'A textured sweater knitted with raised cables and bobbles, with elbow-length sleeves that leave room for a bracelet or a rolled shirt cuff.',
    specSheet: sheet({
      details: [
        ['Neckline', 'Ribbed crew neck'],
        ['Knit', 'Cable and bobble, 7 gauge'],
      ],
      fit: 'Relaxed, dropped shoulder',
      model: 'Is 176 cm tall and wears size S',
      composition: '70% wool, 30% recycled polyamide',
      care: 'Hand wash cold, dry flat',
      origin: 'Portugal',
    }),
    options: sizes(LETTER, ['XS']),
    colors: [{ name: 'Oat', hex: '#D8CBB5', packshot: 4 }],
    price: usd(111),
    badges: ['limited'],
    categoryIds: ['cat-women', 'cat-womens-sweaters'],
    tags: ['sweater', 'knitwear', 'cable knit', 'wool'],
    attributes: { material: ['Wool'], fit: ['Relaxed'], sleeve: ['3/4 sleeve'] },
  },
  {
    slug: 'crossover-leather-slides',
    title: 'Crossover leather slides',
    description:
      'Flat slides with 2 wide leather straps crossing over the foot, on a suede-lined footbed. The pair you take on every trip.',
    specSheet: sheet({
      details: [
        ['Upper', 'Crossed leather straps'],
        ['Footbed', 'Suede lined, cushioned'],
      ],
      fit: 'True to size',
      composition: 'Upper: 100% leather. Footbed: suede. Sole: rubber',
      care: 'Wipe clean with a damp cloth',
      origin: 'Italy',
    }),
    options: sizes(SHOE),
    colors: [{ name: 'Dark Brown', hex: '#3E2A1E', packshot: 1 }],
    price: usd(56),
    badges: ['new'],
    categoryIds: ['cat-women', 'cat-womens-shoes'],
    tags: ['sandals', 'slides', 'flats', 'leather'],
    attributes: { material: ['Leather'] },
  },
  {
    slug: 'denim-midi-skirt',
    title: 'Straight denim midi skirt',
    description:
      'A column skirt in light-wash denim that sits at the waist and falls to mid-calf, with a front slit and classic five-pocket details.',
    specSheet: sheet({
      details: [
        ['Rise', 'High'],
        ['Closure', 'Zip fly with button'],
        ['Length', 'Midi, with a front slit'],
      ],
      fit: 'Straight',
      model: 'Is 175 cm tall and wears size 36',
      composition: '100% organic cotton denim',
      care: 'Machine wash cold, inside out',
      origin: 'Turkey',
    }),
    options: sizes(WAIST),
    colors: [{ name: 'Light Wash', hex: '#A6BFD9', packshot: 3 }],
    price: usd(120),
    badges: ['new'],
    categoryIds: ['cat-women', 'cat-womens-trousers'],
    tags: ['skirt', 'denim', 'midi', 'jeans'],
    attributes: { material: ['Denim'], fit: ['Straight'] },
  },
  {
    slug: 'tailored-linen-waistcoat',
    title: 'Tailored linen waistcoat',
    description:
      'A fitted waistcoat in sage linen with a deep V-neck, 5 buttons, and a pointed hem, worn as a top on its own. Matching shorts complete the look.',
    specSheet: sheet({
      details: [
        ['Neckline', 'Deep V-neck'],
        ['Closure', '5 buttons'],
        ['Back', 'Adjustable half belt'],
      ],
      fit: 'Fitted',
      model: 'Is 176 cm tall and wears size S',
      composition: '100% linen. Lining: 100% cupro',
      care: 'Dry clean or hand wash cold',
      origin: 'Portugal',
    }),
    options: sizes(LETTER, ['XL']),
    colors: [{ name: 'Sage', hex: '#A3AE95', packshot: 4 }],
    price: usd(85),
    badges: ['new'],
    categoryIds: ['cat-women', 'cat-womens-tops'],
    tags: ['waistcoat', 'vest', 'linen', 'tailoring'],
    attributes: { material: ['Linen'], fit: ['Fitted'], sleeve: ['Sleeveless'] },
  },
  {
    slug: 'suede-shopper-bag',
    title: 'Suede shopper bag',
    description:
      'A soft, unstructured shopper in chocolate suede with long flat handles that sit comfortably on the shoulder.',
    specSheet: sheet({
      details: [
        ['Dimensions', '40 × 34 × 12 cm'],
        ['Handle drop', '24 cm'],
        ['Closure', 'Magnetic snap'],
      ],
      composition: 'Outer: 100% suede. Lining: 100% cotton',
      care: 'Brush clean, treat with a suede protector',
      origin: 'Italy',
    }),
    colors: [{ name: 'Chocolate', hex: '#3F2B22', packshot: 1 }],
    price: usd(145),
    badges: [],
    categoryIds: ['cat-women', 'cat-womens-accessories'],
    tags: ['bag', 'shopper', 'tote', 'suede'],
    attributes: { material: ['Suede'] },
  },
  {
    slug: 'linen-midi-dress',
    title: 'Linen button-front midi dress',
    description:
      'A short-sleeved dress in washed linen, buttoned all the way down with wooden buttons and tied at the waist with its own belt.',
    specSheet: sheet({
      details: [
        ['Neckline', 'V-neck'],
        ['Closure', 'Wooden buttons'],
        ['Belt', 'Self-tie, removable'],
      ],
      fit: 'Relaxed A-line',
      model: 'Is 175 cm tall and wears size S',
      composition: '100% linen',
      care: 'Machine wash cold, line dry',
      origin: 'Lithuania',
    }),
    options: sizes(LETTER, ['L']),
    colors: [
      { name: 'White', hex: '#F4F2EC', packshot: 3 },
      { name: 'Sage', hex: '#A8B59A', packshot: 2 },
    ],
    price: usd(139),
    unitsSold: 1240,
    badges: [],
    categoryIds: ['cat-women', 'cat-womens-dresses'],
    tags: ['dress', 'linen', 'midi', 'summer'],
    attributes: { material: ['Linen'], fit: ['Relaxed'], sleeve: ['Short sleeve'] },
  },
  {
    slug: 'leather-band-slides',
    title: 'Leather band slides',
    description:
      'Slides with a single wide leather band and a padded leather footbed, on a light crepe-style sole that stays comfortable all day.',
    specSheet: sheet({
      details: [
        ['Upper', 'Single wide leather band'],
        ['Footbed', 'Padded leather'],
        ['Sole', '2.5 cm EVA'],
      ],
      fit: 'True to size. Take the next size down between sizes',
      composition: 'Upper and footbed: 100% leather. Sole: EVA',
      care: 'Wipe clean with a damp cloth',
      origin: 'Italy',
    }),
    options: sizes(SHOE, ['39']),
    colors: [
      { name: 'Olive', hex: '#6E7040', packshot: 1 },
      { name: 'Black', hex: '#1C1C1C', packshot: 1 },
    ],
    price: usd(64),
    badges: [],
    categoryIds: ['cat-women', 'cat-womens-shoes'],
    tags: ['sandals', 'slides', 'flats', 'leather'],
    attributes: { material: ['Leather'] },
  },
  {
    slug: 'ribbed-racer-tank',
    title: 'Ribbed racer tank',
    description:
      'A fitted tank in stretch rib jersey with a high neck and a racer back, cropped to meet a high-waisted jean.',
    specSheet: sheet({
      details: [
        ['Neckline', 'High round neck'],
        ['Back', 'Racerback'],
      ],
      fit: 'Fitted, cropped',
      model: 'Is 173 cm tall and wears size XS',
      composition: '95% organic cotton, 5% elastane',
      care: 'Machine wash at 30°C',
      origin: 'Portugal',
    }),
    options: sizes(LETTER_EXTENDED, ['XXS']),
    colors: [
      { name: 'Black', hex: '#1C1C1C', packshot: 3 },
      { name: 'White', hex: '#F5F5F2', packshot: 2 },
      { name: 'Oat', hex: '#D9C9AE', packshot: 2 },
    ],
    price: usd(29),
    unitsSold: 1460,
    badges: ['bestseller'],
    categoryIds: ['cat-women', 'cat-womens-tops'],
    tags: ['tank', 'top', 'rib', 'basics', 'jersey'],
    attributes: { material: ['Cotton'], fit: ['Fitted'], sleeve: ['Sleeveless'] },
  },
  {
    slug: 'pleated-wide-leg-trousers',
    title: 'Pleated wide-leg trousers',
    description:
      'High-waisted trousers with front pleats and wide legs that fall to the floor, in a fluid wool-blend twill that drapes rather than creases.',
    specSheet: sheet({
      details: [
        ['Rise', 'High'],
        ['Closure', 'Hook and zip fly'],
        ['Pockets', 'Slanted side, back welt'],
      ],
      fit: 'Wide leg, full length',
      model: 'Is 178 cm tall and wears size 36',
      composition: '54% recycled polyester, 44% wool, 2% elastane',
      care: 'Dry clean',
      origin: 'Portugal',
    }),
    options: sizes(WAIST, ['38']),
    colors: [
      { name: 'Cream', hex: '#EFE9DC', packshot: 3 },
      { name: 'Black', hex: '#1C1C1C', packshot: 2 },
    ],
    price: usd(112),
    unitsSold: 1720,
    badges: [],
    categoryIds: ['cat-women', 'cat-womens-trousers'],
    tags: ['trousers', 'tailoring', 'pleated', 'wide leg'],
    attributes: { material: ['Wool'], fit: ['Wide leg'] },
  },
  {
    slug: 'coin-pendant-necklace',
    title: 'Coin pendant necklace',
    description:
      'A fine gold-plated chain with a round brushed coin, engraved with a small botanical motif. Long enough to sit over a crew neck.',
    specSheet: sheet({
      details: [
        ['Length', '45 cm, with a 5 cm extender'],
        ['Pendant', '2 cm round coin'],
        ['Clasp', 'Lobster clasp'],
      ],
      composition: '18k gold plating on recycled brass',
      care: 'Keep dry, store in the pouch it comes in',
      origin: 'Denmark',
    }),
    colors: [{ name: 'Gold', hex: '#C9A55A', packshot: 1 }],
    price: usd(45),
    unitsSold: 1530,
    badges: ['bestseller'],
    categoryIds: ['cat-women', 'cat-womens-accessories'],
    tags: ['jewelry', 'necklace', 'pendant', 'gold'],
    attributes: { material: ['Metal'] },
  },
  {
    slug: 'waffle-knit-vest',
    title: 'Waffle-knit sweater vest',
    description:
      'A sleeveless V-neck vest in an open waffle knit, worn on its own in summer or layered over a shirt when it cools down.',
    specSheet: sheet({
      details: [
        ['Neckline', 'V-neck'],
        ['Knit', 'Open waffle, 5 gauge'],
      ],
      fit: 'Relaxed',
      model: 'Is 172 cm tall and wears size S',
      composition: '100% organic cotton',
      care: 'Hand wash cold, dry flat',
      origin: 'Portugal',
    }),
    options: sizes(LETTER),
    colors: [{ name: 'Taupe', hex: '#8B755F', packshot: 2 }],
    price: usd(58),
    badges: ['new'],
    categoryIds: ['cat-women', 'cat-womens-sweaters'],
    tags: ['vest', 'knitwear', 'waffle knit', 'cotton'],
    attributes: { material: ['Cotton'], fit: ['Relaxed'], sleeve: ['Sleeveless'] },
  },
  {
    slug: 'ribbed-knit-midi-dress',
    title: 'Ribbed knit midi dress',
    description:
      'A long-sleeved knit dress in a fine rib that skims the body and ends at mid-calf. Wear it with boots now and sneakers in spring.',
    specSheet: sheet({
      details: [
        ['Neckline', 'Crew neck'],
        ['Knit', 'Fine rib, 12 gauge'],
        ['Length', 'Midi'],
      ],
      fit: 'Body-skimming',
      model: 'Is 177 cm tall and wears size S',
      composition: '52% wool, 48% viscose',
      care: 'Hand wash cold, dry flat',
      origin: 'Portugal',
    }),
    options: sizes(LETTER, ['S']),
    colors: [{ name: 'Oatmeal', hex: '#D8CDBB', packshot: 3 }],
    price: usd(115),
    compareAtPrice: usd(145),
    badges: ['sale'],
    categoryIds: ['cat-women', 'cat-womens-dresses'],
    tags: ['dress', 'knit', 'midi', 'knitwear'],
    attributes: { material: ['Wool'], fit: ['Fitted'], sleeve: ['Long sleeve'] },
  },
  {
    slug: 'suede-clog-mules',
    title: 'Suede clog mules',
    description:
      'Backless clogs in soft suede with a penny strap and a thick cushioned sole, made for socks in autumn and bare feet in summer.',
    specSheet: sheet({
      details: [
        ['Upper', 'Suede with penny strap'],
        ['Sole', '3 cm cushioned EVA'],
      ],
      fit: 'Roomy. Take the next size down between sizes',
      composition: 'Upper: 100% suede. Lining: leather. Sole: EVA',
      care: 'Brush clean, treat with a suede protector',
      origin: 'Portugal',
    }),
    options: sizes(SHOE, ['38']),
    colors: [{ name: 'Taupe', hex: '#9C8778', packshot: 1 }],
    price: usd(98),
    badges: ['new'],
    categoryIds: ['cat-women', 'cat-womens-shoes'],
    tags: ['clogs', 'mules', 'slippers', 'suede'],
    attributes: { material: ['Suede'] },
  },
  {
    slug: 'heavyweight-cotton-tee',
    title: 'Heavyweight cotton tee',
    description:
      'A boxy tee in thick, matte cotton jersey that holds its shape, with dropped shoulders and a ribbed crew neck.',
    specSheet: sheet({
      details: [
        ['Neckline', 'Ribbed crew neck'],
        ['Weight', '240 g/m²'],
      ],
      fit: 'Boxy',
      model: 'Is 176 cm tall and wears size S',
      composition: '100% organic cotton',
      care: 'Machine wash at 30°C',
      origin: 'Portugal',
    }),
    options: sizes(LETTER_EXTENDED),
    colors: [
      { name: 'White', hex: '#F6F6F4', packshot: 2 },
      { name: 'Black', hex: '#222222', packshot: 2 },
    ],
    price: usd(35),
    unitsSold: 980,
    badges: [],
    categoryIds: ['cat-women', 'cat-womens-tops'],
    tags: ['t-shirt', 'tee', 'basics', 'jersey', 'cotton'],
    attributes: { material: ['Cotton'], fit: ['Oversize'], sleeve: ['Short sleeve'] },
  },
  {
    slug: 'raffia-sun-hat',
    title: 'Raffia sun hat',
    description:
      'A wide-brimmed hat woven from natural raffia and finished with a black grosgrain band. It folds into a suitcase and springs back.',
    specSheet: sheet({
      details: [
        ['Brim', '11 cm'],
        ['Band', 'Grosgrain ribbon'],
        ['Head size', '57 cm, adjustable inside'],
      ],
      composition: '100% raffia. Band: 100% polyester',
      care: 'Spot clean, reshape while damp',
      origin: 'Madagascar',
    }),
    colors: [{ name: 'Natural', hex: '#D8C39A', packshot: 1 }],
    price: usd(55),
    badges: [],
    categoryIds: ['cat-women', 'cat-womens-accessories'],
    tags: ['hat', 'sun hat', 'straw', 'summer'],
    attributes: { material: ['Raffia'] },
  },
  {
    slug: 'tie-waist-linen-trousers',
    title: 'Tie-waist linen trousers',
    description:
      'Wide cropped trousers in washed linen with a paperbag waist and a self-tie belt. They pull on, tie off, and stay cool on the hottest day.',
    specSheet: sheet({
      details: [
        ['Rise', 'High, paperbag waist'],
        ['Closure', 'Elasticated back, self-tie belt'],
        ['Length', 'Cropped at the ankle'],
      ],
      fit: 'Wide leg',
      model: 'Is 174 cm tall and wears size 36',
      composition: '100% linen',
      care: 'Machine wash cold, line dry',
      origin: 'Lithuania',
    }),
    options: sizes(WAIST, ['36']),
    colors: [
      { name: 'Olive', hex: '#6B7446', packshot: 3 },
      { name: 'Sand', hex: '#D6C3A1', packshot: 2 },
    ],
    price: usd(96),
    compareAtPrice: usd(120),
    badges: ['sale'],
    categoryIds: ['cat-women', 'cat-womens-trousers'],
    tags: ['trousers', 'linen', 'wide leg', 'summer'],
    attributes: { material: ['Linen'], fit: ['Wide leg'] },
  },
  {
    slug: 'striped-shirt-dress',
    title: 'Striped cotton shirt dress',
    description:
      'A classic shirt dress in blue and white striped poplin, with rolled sleeves and a belt that ties at the waist. It works just as well undone as a light coat.',
    specSheet: sheet({
      details: [
        ['Collar', 'Classic point collar'],
        ['Closure', 'Button front'],
        ['Belt', 'Self-tie, removable'],
      ],
      fit: 'Relaxed',
      model: 'Is 176 cm tall and wears size S',
      composition: '100% organic cotton poplin',
      care: 'Machine wash at 40°C',
      origin: 'Portugal',
    }),
    options: sizes(LETTER),
    colors: [{ name: 'Blue Stripe', hex: '#7E9CCB', packshot: 3 }],
    price: usd(110),
    badges: [],
    categoryIds: ['cat-women', 'cat-womens-dresses'],
    tags: ['dress', 'shirt dress', 'stripes', 'cotton'],
    attributes: { material: ['Cotton'], fit: ['Relaxed'], sleeve: ['Short sleeve'] },
  },
  {
    slug: 'gathered-leather-pouch',
    title: 'Gathered leather pouch',
    description:
      'A slouchy clutch in butter-soft leather, gathered into a knot at the top, with a wrist loop that keeps it in hand.',
    specSheet: sheet({
      details: [
        ['Dimensions', '30 × 20 × 8 cm'],
        ['Closure', 'Magnetic snap'],
        ['Strap', 'Wrist loop'],
      ],
      composition: 'Outer: 100% leather. Lining: 100% cotton',
      care: 'Wipe clean with a soft dry cloth',
      origin: 'Italy',
    }),
    colors: [{ name: 'Beige', hex: '#D8C4A4', packshot: 1 }],
    price: usd(120),
    badges: ['limited'],
    categoryIds: ['cat-women', 'cat-womens-accessories'],
    tags: ['bag', 'clutch', 'pouch', 'leather'],
    attributes: { material: ['Leather'] },
  },
  {
    slug: 'ribbed-cotton-sweater',
    title: 'Ribbed cotton sweater',
    description:
      'A relaxed sweater in a fine vertical rib, with a rolled boat neck and dropped shoulders, knitted from cool cotton for the in-between months.',
    specSheet: sheet({
      details: [
        ['Neckline', 'Rolled boat neck'],
        ['Knit', 'Fine rib, 12 gauge'],
      ],
      fit: 'Relaxed, dropped shoulder',
      model: 'Is 176 cm tall and wears size S',
      composition: '100% organic cotton',
      care: 'Machine wash cold on a wool cycle, dry flat',
      origin: 'Portugal',
    }),
    options: sizes(LETTER),
    colors: [{ name: 'Dusty Blue', hex: '#8FA7BF', packshot: 3 }],
    price: usd(84),
    badges: [],
    categoryIds: ['cat-women', 'cat-womens-sweaters'],
    tags: ['sweater', 'knitwear', 'rib', 'cotton'],
    attributes: { material: ['Cotton'], fit: ['Relaxed'], sleeve: ['Long sleeve'] },
  },
  {
    slug: 'minimal-leather-sneakers',
    title: 'Minimal leather sneakers',
    description:
      'Low-top sneakers in smooth white calf leather with tonal laces and a small suede heel tab, on a stitched cupsole that can be resoled.',
    specSheet: sheet({
      details: [
        ['Upper', 'Calf leather, suede heel tab'],
        ['Sole', 'Stitched rubber cupsole'],
      ],
      fit: 'True to size',
      composition: 'Upper and lining: 100% leather. Sole: natural rubber',
      care: 'Wipe clean, condition the leather now and then',
      origin: 'Portugal',
    }),
    options: sizes(SHOE, ['41']),
    colors: [{ name: 'White', hex: '#F4F4F2', packshot: 1 }],
    price: usd(110),
    unitsSold: 1180,
    badges: ['exclusive'],
    categoryIds: ['cat-women', 'cat-womens-shoes'],
    tags: ['sneakers', 'trainers', 'leather', 'white'],
    attributes: { material: ['Leather'] },
  },
  {
    slug: 'silk-blend-blouse',
    title: 'Silk-blend tie-neck blouse',
    description:
      'A fluid blouse with a soft satin sheen, a tie neck you can knot or leave loose, and full sleeves gathered into buttoned cuffs.',
    specSheet: sheet({
      details: [
        ['Neckline', 'Tie neck'],
        ['Closure', 'Concealed button placket'],
        ['Cuffs', 'Buttoned'],
      ],
      fit: 'Relaxed',
      model: 'Is 177 cm tall and wears size S',
      composition: '70% viscose, 30% silk',
      care: 'Hand wash cold, iron on low',
      origin: 'Portugal',
    }),
    options: sizes(LETTER, ['XS']),
    colors: [{ name: 'Ivory', hex: '#F2ECDD', packshot: 3 }],
    price: usd(98),
    badges: ['exclusive'],
    categoryIds: ['cat-women', 'cat-womens-tops'],
    tags: ['blouse', 'silk', 'workwear', 'occasion'],
    attributes: { material: ['Silk'], fit: ['Relaxed'], sleeve: ['Long sleeve'] },
  },
  {
    slug: 'tiered-maxi-dress',
    title: 'Tiered cotton maxi dress',
    description:
      'A long dress in terracotta cotton voile with a square neck, thin straps, and 3 softly gathered tiers. Summer, in one piece.',
    specSheet: sheet({
      details: [
        ['Neckline', 'Square'],
        ['Straps', 'Adjustable'],
        ['Back', 'Smocked'],
      ],
      fit: 'Relaxed, tiered skirt',
      model: 'Is 175 cm tall and wears size S',
      composition: '100% organic cotton voile',
      care: 'Machine wash cold, line dry',
      origin: 'India',
    }),
    options: sizes(LETTER, ['M']),
    colors: [{ name: 'Terracotta', hex: '#B45A3C', packshot: 3 }],
    price: usd(135),
    badges: ['limited'],
    categoryIds: ['cat-women', 'cat-womens-dresses'],
    tags: ['dress', 'maxi', 'cotton', 'summer'],
    attributes: { material: ['Cotton'], fit: ['Relaxed'], sleeve: ['Sleeveless'] },
  },
  {
    slug: 'wool-blend-scarf',
    title: 'Wool-blend scarf',
    description:
      'A generous scarf in brushed wool-blend twill with a short fringe, soft enough to wrap twice and warm enough to need only once.',
    specSheet: sheet({
      details: [
        ['Dimensions', '200 × 70 cm'],
        ['Finish', 'Brushed, fringed ends'],
      ],
      composition: '70% wool, 30% cashmere',
      care: 'Dry clean or hand wash cold',
      origin: 'Scotland',
    }),
    colors: [
      { name: 'Camel', hex: '#B8895A', packshot: 1 },
      { name: 'Gray', hex: '#9A9A98', packshot: 1 },
    ],
    price: usd(59),
    compareAtPrice: usd(79),
    badges: ['sale'],
    categoryIds: ['cat-women', 'cat-womens-accessories'],
    tags: ['scarf', 'wool', 'cashmere', 'winter'],
    attributes: { material: ['Wool'] },
  },
  {
    slug: 'tiered-maxi-skirt',
    title: 'Tiered cotton maxi skirt',
    description:
      'A long skirt in crinkled cotton with an elasticated waist and 2 small ruffle tiers at the hem. Light enough to pack in any bag.',
    specSheet: sheet({
      details: [
        ['Waist', 'Elasticated'],
        ['Length', 'Ankle, ruffled hem'],
      ],
      fit: 'Relaxed',
      model: 'Is 175 cm tall and wears size 36',
      composition: '100% organic cotton',
      care: 'Machine wash cold, do not iron',
      origin: 'India',
    }),
    options: sizes(WAIST),
    colors: [{ name: 'Cream', hex: '#EEE6D2', packshot: 3 }],
    price: usd(98),
    badges: [],
    categoryIds: ['cat-women', 'cat-womens-trousers'],
    tags: ['skirt', 'maxi', 'cotton', 'summer'],
    attributes: { material: ['Cotton'], fit: ['Relaxed'] },
  },
  {
    slug: 'breton-stripe-top',
    title: 'Breton stripe top',
    description:
      'The long-sleeved striped top, in a sturdy cotton jersey with a wide boat neck. Ecru with narrow navy stripes, the way it has always been.',
    specSheet: sheet({
      details: [
        ['Neckline', 'Boat neck'],
        ['Weight', '220 g/m²'],
      ],
      fit: 'Relaxed',
      model: 'Is 174 cm tall and wears size S',
      composition: '100% organic cotton',
      care: 'Machine wash at 30°C',
      origin: 'Portugal',
    }),
    options: sizes(LETTER),
    colors: [{ name: 'Navy Stripe', hex: '#2B3A5C', packshot: 3 }],
    price: usd(45),
    compareAtPrice: usd(59),
    badges: ['sale'],
    categoryIds: ['cat-women', 'cat-womens-tops'],
    tags: ['top', 'stripes', 'breton', 'jersey'],
    attributes: { material: ['Cotton'], fit: ['Relaxed'], sleeve: ['Long sleeve'] },
  },
  {
    slug: 'leather-ballet-flats',
    title: 'Leather ballet flats',
    description:
      'Soft nappa ballet flats with an almond toe, a tiny bow, and an elastic topline that keeps them on your feet.',
    specSheet: sheet({
      details: [
        ['Toe', 'Almond'],
        ['Topline', 'Elasticated'],
        ['Sole', 'Leather, rubber heel tip'],
      ],
      fit: 'Snug. Take the next size up between sizes',
      composition: 'Upper and lining: 100% leather. Sole: leather',
      care: 'Wipe clean with a soft dry cloth',
      origin: 'Spain',
    }),
    options: sizes(SHOE, ['37']),
    colors: [{ name: 'Black', hex: '#111111', packshot: 1 }],
    price: usd(89),
    badges: [],
    categoryIds: ['cat-women', 'cat-womens-shoes'],
    tags: ['ballet flats', 'flats', 'leather'],
    attributes: { material: ['Leather'] },
  },
  {
    slug: 'wrap-midi-dress',
    title: 'Wrap midi dress',
    description:
      'A long-sleeved wrap dress in fluid olive crepe, tied at the side waist so the fit is always yours, with a skirt that ends at mid-calf.',
    specSheet: sheet({
      details: [
        ['Neckline', 'Wrap V-neck'],
        ['Closure', 'Side tie'],
        ['Length', 'Midi'],
      ],
      fit: 'Adjustable wrap',
      model: 'Is 176 cm tall and wears size S',
      composition: '100% viscose crepe',
      care: 'Machine wash cold on a gentle cycle',
      origin: 'Portugal',
    }),
    options: sizes(LETTER),
    colors: [{ name: 'Olive', hex: '#5E6B3A', packshot: 3 }],
    price: usd(119),
    compareAtPrice: usd(149),
    badges: ['sale'],
    categoryIds: ['cat-women', 'cat-womens-dresses'],
    tags: ['dress', 'wrap dress', 'midi', 'workwear'],
    attributes: { material: ['Viscose'], fit: ['Regular'], sleeve: ['Long sleeve'] },
  },
  {
    slug: 'slim-leather-belt',
    title: 'Slim leather belt',
    description:
      'A slim belt in smooth black calf leather with a rounded gold-tone buckle, narrow enough for trouser loops and a high-waisted jean.',
    specSheet: sheet({
      details: [
        ['Width', '2.5 cm'],
        ['Buckle', 'Gold-tone brass'],
      ],
      composition: '100% calf leather',
      care: 'Wipe clean, condition the leather now and then',
      origin: 'Italy',
    }),
    options: sizes(BELT, ['90']),
    colors: [{ name: 'Black', hex: '#1A1A1A', packshot: 1 }],
    price: usd(39),
    badges: [],
    categoryIds: ['cat-women', 'cat-womens-accessories'],
    tags: ['belt', 'leather'],
    attributes: { material: ['Leather'] },
  },
  {
    slug: 'open-knit-sweater',
    title: 'Open-knit boxy sweater',
    description:
      'An airy sweater in a chunky open knit, cut boxy and wide through the sleeves. It layers over a tank and lets the summer air through.',
    specSheet: sheet({
      details: [
        ['Neckline', 'Crew neck'],
        ['Knit', 'Open mesh, 3 gauge'],
      ],
      fit: 'Boxy, dropped shoulder',
      model: 'Is 177 cm tall and wears size S',
      composition: '60% cotton, 40% linen',
      care: 'Hand wash cold, dry flat',
      origin: 'Portugal',
    }),
    options: sizes(LETTER),
    colors: [{ name: 'Oatmeal', hex: '#DCCFBD', packshot: 3 }],
    price: usd(110),
    badges: ['exclusive'],
    categoryIds: ['cat-women', 'cat-womens-sweaters'],
    tags: ['sweater', 'knitwear', 'open knit', 'summer'],
    attributes: { material: ['Cotton'], fit: ['Oversize'], sleeve: ['Long sleeve'] },
  },
  {
    slug: 'satin-midi-skirt',
    title: 'Satin bias-cut midi skirt',
    description:
      'A bias-cut skirt in chocolate satin with a narrow elasticated waist, falling to mid-calf in a fluid line. Dress it down with a tank.',
    specSheet: sheet({
      details: [
        ['Waist', 'Narrow elasticated'],
        ['Length', 'Midi'],
      ],
      fit: 'Bias cut',
      model: 'Is 175 cm tall and wears size 36',
      composition: '100% viscose satin',
      care: 'Hand wash cold, hang to dry',
      origin: 'Portugal',
    }),
    options: sizes(WAIST, ['44']),
    colors: [{ name: 'Chocolate', hex: '#4A2F22', packshot: 3 }],
    price: usd(85),
    badges: ['limited'],
    categoryIds: ['cat-women', 'cat-womens-trousers'],
    tags: ['skirt', 'satin', 'midi', 'occasion'],
    attributes: { material: ['Viscose'], fit: ['Fitted'] },
  },
  {
    slug: 'tortoiseshell-sunglasses',
    title: 'Tortoiseshell sunglasses',
    description:
      'Rounded square sunglasses in warm tortoiseshell acetate with gradient lenses and small gold-tone rivets.',
    specSheet: sheet({
      details: [
        ['Lenses', 'Gradient brown, UV400'],
        ['Frame', 'Hand-polished acetate'],
        ['Case', 'Leather case included'],
      ],
      composition: 'Frame: acetate. Lenses: polycarbonate',
      care: 'Clean with the cloth provided',
      origin: 'Italy',
    }),
    colors: [{ name: 'Tortoiseshell', hex: '#6B4226', packshot: 1 }],
    price: usd(65),
    badges: ['new'],
    categoryIds: ['cat-women', 'cat-womens-accessories'],
    tags: ['sunglasses', 'eyewear', 'summer'],
    attributes: { material: ['Acetate'] },
  },
  {
    slug: 'square-neck-mini-dress',
    title: 'Square-neck mini dress',
    description:
      'A black mini dress in crisp cotton poplin with wide straps, a square neck, and a fitted bodice over an A-line skirt.',
    specSheet: sheet({
      details: [
        ['Neckline', 'Square'],
        ['Closure', 'Concealed back zip'],
        ['Length', 'Mini'],
      ],
      fit: 'Fitted bodice, A-line skirt',
      model: 'Is 174 cm tall and wears size XS',
      composition: '100% organic cotton poplin. Lining: 100% cotton',
      care: 'Machine wash at 30°C',
      origin: 'Portugal',
    }),
    options: sizes(LETTER, ['XS', 'XL']),
    colors: [{ name: 'Black', hex: '#1A1A1A', packshot: 3 }],
    price: usd(89),
    unitsSold: 1650,
    badges: ['bestseller'],
    categoryIds: ['cat-women', 'cat-womens-dresses'],
    tags: ['dress', 'mini', 'black dress', 'occasion'],
    attributes: { material: ['Cotton'], fit: ['Fitted'], sleeve: ['Sleeveless'] },
  },
  {
    slug: 'striped-knit-polo',
    title: 'Striped knit polo',
    description:
      'A short-sleeved polo knitted in fine textured cotton, striped in navy, white, and heather gray, with a solid ribbed collar, cuffs, and hem. Smart under a blazer, easy with shorts.',
    specSheet: sheet({
      details: [
        ['Collar', 'Ribbed polo collar'],
        ['Closure', '3-button placket'],
        ['Knit', 'Textured cotton, 14 gauge'],
      ],
      fit: 'Slim',
      model: 'Is 182 cm tall and wears size M',
      composition: '100% organic cotton',
      care: 'Hand wash cold, dry flat',
      origin: 'Portugal',
    }),
    options: sizes(MENS_LETTER, ['XXL']),
    colors: [
      { name: 'Navy Stripe', hex: '#2B3452', packshot: 4 },
      { name: 'Green Stripe', hex: '#2F4B3C', packshot: 3 },
      { name: 'Burgundy Stripe', hex: '#6D2436', packshot: 3 },
    ],
    price: usd(89),
    badges: ['new'],
    categoryIds: ['cat-men', 'cat-mens-tops'],
    tags: ['polo', 'knitwear', 'stripes', 'cotton'],
    attributes: { material: ['Cotton'], fit: ['Slim'], sleeve: ['Short sleeve'] },
  },
  {
    slug: 'cotton-field-jacket',
    title: 'Cotton field jacket',
    description:
      'A four-pocket field jacket in washed cotton twill, with epaulettes, a zip and snap front, and a drawcord waist. It looks better the longer you wear it.',
    specSheet: sheet({
      details: [
        ['Collar', 'Point collar'],
        ['Closure', 'Zip and snap front'],
        ['Pockets', '4 flap pockets'],
      ],
      fit: 'Regular',
      model: 'Is 186 cm tall and wears size M',
      composition: '100% cotton. Lining: 100% cotton',
      care: 'Machine wash at 30°C',
      origin: 'Portugal',
    }),
    options: sizes(MENS_LETTER, ['S']),
    colors: [
      { name: 'Olive', hex: '#5E6344', packshot: 4 },
      { name: 'Navy', hex: '#283049', packshot: 2 },
    ],
    price: usd(179),
    badges: ['new'],
    categoryIds: ['cat-men', 'cat-mens-jackets'],
    tags: ['jacket', 'field jacket', 'outerwear', 'cotton'],
    attributes: { material: ['Cotton'], fit: ['Regular'] },
  },
  {
    slug: 'cross-strap-leather-sandals',
    title: 'Cross-strap leather sandals',
    description:
      'Sandals with 2 wide crossed leather straps, a buckled heel strap, and a chunky rubber sole that grips on wet stone.',
    specSheet: sheet({
      details: [
        ['Upper', 'Crossed leather straps'],
        ['Fastening', 'Adjustable heel strap'],
        ['Sole', 'Chunky rubber'],
      ],
      fit: 'True to size',
      composition: 'Upper and lining: 100% leather. Sole: rubber',
      care: 'Wipe clean with a damp cloth',
      origin: 'Portugal',
    }),
    options: sizes(MENS_SHOE, ['46']),
    colors: [
      { name: 'Black', hex: '#1C1C1C', packshot: 1 },
      { name: 'Brown', hex: '#5A3A28', packshot: 1 },
    ],
    price: usd(89),
    badges: [],
    categoryIds: ['cat-men', 'cat-mens-shoes'],
    tags: ['sandals', 'leather', 'summer'],
    attributes: { material: ['Leather'] },
  },
  {
    slug: 'tailored-wool-suit',
    title: 'Tailored wool suit',
    description:
      'A 2-button suit in Italian wool twill with notch lapels and flat-front trousers, cut slim and half-lined so it wears light all year.',
    specSheet: sheet({
      details: [
        ['Jacket', '2 buttons, notch lapel, half-lined'],
        ['Trousers', 'Flat front, side adjusters'],
        ['Fabric', 'Wool twill, Super 110s'],
      ],
      fit: 'Slim',
      model: 'Is 188 cm tall and wears size 50',
      composition: '100% wool. Lining: 100% cupro',
      care: 'Dry clean',
      origin: 'Italy',
    }),
    options: sizes(SUIT, ['46']),
    colors: [{ name: 'Navy', hex: '#232C45', packshot: 3 }],
    price: usd(449),
    unitsSold: 1360,
    badges: ['bestseller'],
    categoryIds: ['cat-men', 'cat-mens-jackets'],
    tags: ['suit', 'tailoring', 'wool', 'formal'],
    attributes: { material: ['Wool'], fit: ['Slim'] },
  },
  {
    slug: 'relaxed-cargo-trousers',
    title: 'Relaxed cargo trousers',
    description:
      'Cargo trousers in brushed cotton twill, with buttoned thigh pockets that lie flat and a straight leg that breaks over sneakers.',
    specSheet: sheet({
      details: [
        ['Rise', 'Mid'],
        ['Closure', 'Zip fly with button'],
        ['Pockets', '2 flap cargo pockets'],
      ],
      fit: 'Relaxed, straight leg',
      model: 'Is 189 cm tall and wears size 50',
      composition: '100% cotton twill',
      care: 'Machine wash at 30°C',
      origin: 'Portugal',
    }),
    options: sizes(MENS_WAIST, ['44']),
    colors: [{ name: 'Charcoal', hex: '#4A4A4D', packshot: 3 }],
    price: usd(89),
    badges: ['new'],
    categoryIds: ['cat-men', 'cat-mens-trousers'],
    tags: ['trousers', 'cargo', 'utility', 'cotton'],
    attributes: { material: ['Cotton'], fit: ['Relaxed'] },
  },
  {
    slug: 'merino-crew-neck-sweater',
    title: 'Merino crew-neck sweater',
    description:
      'A fine-gauge crew neck in extra-fine merino, finished with a small tonal X embroidered on the chest. Light enough to layer, warm enough to wear alone.',
    specSheet: sheet({
      details: [
        ['Neckline', 'Ribbed crew neck'],
        ['Knit', 'Extra-fine merino, 14 gauge'],
        ['Detail', 'Tonal embroidered X'],
      ],
      fit: 'Regular',
      model: 'Is 186 cm tall and wears size M',
      composition: '100% extra-fine merino wool',
      care: 'Hand wash cold, dry flat',
      origin: 'Italy',
    }),
    options: sizes(MENS_LETTER, ['XXL']),
    colors: [
      { name: 'Charcoal', hex: '#3E3F42', packshot: 3 },
      { name: 'Navy', hex: '#22293D', packshot: 2 },
      { name: 'Camel', hex: '#B08A5E', packshot: 2 },
    ],
    price: usd(89),
    unitsSold: 1860,
    badges: ['bestseller'],
    categoryIds: ['cat-men', 'cat-mens-sweaters'],
    tags: ['sweater', 'knitwear', 'merino', 'wool', 'crew neck'],
    attributes: { material: ['Wool'], fit: ['Regular'], sleeve: ['Long sleeve'] },
  },
  {
    slug: 'brushed-flannel-check-shirt',
    title: 'Brushed flannel check shirt',
    description:
      'A heavy flannel shirt in a blue and brown check, brushed on both sides until it feels like a blanket. Wear it buttoned, or open over a tee.',
    specSheet: sheet({
      details: [
        ['Collar', 'Point collar'],
        ['Closure', 'Button front'],
        ['Fabric', 'Double-brushed flannel'],
      ],
      fit: 'Regular',
      model: 'Is 185 cm tall and wears size M',
      composition: '100% cotton',
      care: 'Machine wash at 30°C',
      origin: 'Portugal',
    }),
    options: sizes(MENS_LETTER, ['L']),
    colors: [
      { name: 'Blue Check', hex: '#34506E', packshot: 3 },
      { name: 'Red Check', hex: '#9B3A32', packshot: 2 },
    ],
    price: usd(79),
    badges: ['new'],
    categoryIds: ['cat-men', 'cat-mens-shirts'],
    tags: ['shirt', 'flannel', 'check', 'tartan'],
    attributes: { material: ['Cotton'], fit: ['Regular'], sleeve: ['Long sleeve'] },
  },
  {
    slug: 'suede-slip-on-sneakers',
    title: 'Suede slip-on sneakers',
    description:
      'Laceless sneakers in soft taupe suede, with an elastic gusset, a strap across the instep, and a matching rubber cupsole.',
    specSheet: sheet({
      details: [
        ['Upper', 'Suede, elastic gusset'],
        ['Strap', 'Brushed metal plate'],
        ['Sole', 'Rubber cupsole'],
      ],
      fit: 'True to size',
      composition: 'Upper: 100% suede. Lining: leather. Sole: rubber',
      care: 'Brush clean, treat with a suede protector',
      origin: 'Portugal',
    }),
    options: sizes(MENS_SHOE, ['40']),
    colors: [{ name: 'Taupe', hex: '#8C735A', packshot: 1 }],
    price: usd(129),
    badges: [],
    categoryIds: ['cat-men', 'cat-mens-shoes'],
    tags: ['sneakers', 'slip-on', 'suede'],
    attributes: { material: ['Suede'] },
  },
  {
    slug: 'oxford-button-down-shirt',
    title: 'Oxford button-down shirt',
    description:
      'The shirt that goes with everything: a sturdy oxford cloth with a soft button-down collar, a chest pocket, and a curved hem.',
    specSheet: sheet({
      details: [
        ['Collar', 'Button-down collar'],
        ['Pockets', '1 chest pocket'],
        ['Fabric', 'Oxford cloth'],
      ],
      fit: 'Regular',
      model: 'Is 186 cm tall and wears size M',
      composition: '100% organic cotton',
      care: 'Machine wash at 40°C, iron on medium',
      origin: 'Portugal',
    }),
    options: sizes(MENS_LETTER),
    colors: [
      { name: 'Light Blue', hex: '#9FBFE0', packshot: 3 },
      { name: 'Pink', hex: '#E7C3C7', packshot: 2 },
    ],
    price: usd(69),
    unitsSold: 1290,
    badges: ['bestseller'],
    categoryIds: ['cat-men', 'cat-mens-shirts'],
    tags: ['shirt', 'oxford', 'button-down', 'cotton'],
    attributes: { material: ['Cotton'], fit: ['Regular'], sleeve: ['Long sleeve'] },
  },
  {
    slug: 'leather-derby-shoes',
    title: 'Leather derby shoes',
    description:
      'Plain-toe derbies in hand-burnished cognac calf, on a stacked leather heel and a stitched sole that can be resoled.',
    specSheet: sheet({
      details: [
        ['Upper', 'Burnished calf leather'],
        ['Lacing', 'Open derby, 5 eyelets'],
        ['Sole', 'Leather, stacked heel'],
      ],
      fit: 'True to size',
      composition: 'Upper and lining: 100% leather. Sole: leather and rubber',
      care: 'Polish now and then, keep on shoe trees',
      origin: 'Spain',
    }),
    options: sizes(MENS_SHOE, ['41', '45']),
    colors: [{ name: 'Cognac', hex: '#8A4B28', packshot: 1 }],
    price: usd(149),
    compareAtPrice: usd(189),
    badges: ['sale'],
    categoryIds: ['cat-men', 'cat-mens-shoes'],
    tags: ['shoes', 'derby', 'leather', 'formal'],
    attributes: { material: ['Leather'] },
  },
  {
    slug: 'linen-blend-suit',
    title: 'Linen-blend suit',
    description:
      'An unstructured summer suit in textured linen and wool, with a band-collar jacket and patch pockets. Wear the pieces together or apart.',
    specSheet: sheet({
      details: [
        ['Jacket', 'Band collar, unlined'],
        ['Pockets', 'Patch pockets'],
        ['Trousers', 'Cropped, straight leg'],
      ],
      fit: 'Relaxed',
      model: 'Is 185 cm tall and wears size 48',
      composition: '55% linen, 45% wool',
      care: 'Dry clean',
      origin: 'Italy',
    }),
    options: sizes(SUIT, ['54']),
    colors: [{ name: 'Sand', hex: '#CDBE9F', packshot: 3 }],
    price: usd(399),
    badges: ['limited'],
    categoryIds: ['cat-men', 'cat-mens-jackets'],
    tags: ['suit', 'linen', 'tailoring', 'summer'],
    attributes: { material: ['Linen'], fit: ['Relaxed'] },
  },
  {
    slug: 'slim-poplin-dress-shirt',
    title: 'Slim poplin dress shirt',
    description:
      'A crisp white shirt in fine two-ply cotton poplin, with a semi-spread collar and a slim cut that sits cleanly under a jacket.',
    specSheet: sheet({
      details: [
        ['Collar', 'Semi-spread collar'],
        ['Cuffs', 'Single button, rounded'],
        ['Fabric', 'Two-ply poplin'],
      ],
      fit: 'Slim',
      model: 'Is 183 cm tall and wears size 40',
      composition: '100% cotton',
      care: 'Machine wash at 40°C, iron on high',
      origin: 'Portugal',
    }),
    options: sizes(COLLAR, ['43']),
    colors: [{ name: 'White', hex: '#F7F7F5', packshot: 3 }],
    price: usd(79),
    badges: [],
    categoryIds: ['cat-men', 'cat-mens-shirts'],
    tags: ['shirt', 'dress shirt', 'poplin', 'formal', 'white'],
    attributes: { material: ['Cotton'], fit: ['Slim'], sleeve: ['Long sleeve'] },
  },
  {
    slug: 'lightweight-windbreaker',
    title: 'Lightweight windbreaker',
    description:
      'A packable zip jacket in a water-repellent cotton blend, with a stand collar and elasticated cuffs and hem. The one for the bottom of your bag.',
    specSheet: sheet({
      details: [
        ['Collar', 'Stand collar'],
        ['Closure', 'Full zip'],
        ['Finish', 'Water-repellent'],
      ],
      fit: 'Regular',
      model: 'Is 184 cm tall and wears size M',
      composition: '65% recycled polyester, 35% organic cotton',
      care: 'Machine wash at 30°C',
      origin: 'Portugal',
    }),
    options: sizes(MENS_LETTER, ['XXL']),
    colors: [
      { name: 'Khaki', hex: '#7E7D57', packshot: 3 },
      { name: 'Black', hex: '#1D1D1F', packshot: 2 },
    ],
    price: usd(119),
    badges: [],
    categoryIds: ['cat-men', 'cat-mens-jackets'],
    tags: ['jacket', 'windbreaker', 'outerwear', 'water-repellent'],
    attributes: { material: ['Polyester'], fit: ['Regular'] },
  },
  {
    slug: 'washed-linen-shirt',
    title: 'Washed linen shirt',
    description:
      'A white shirt in garment-washed European linen, soft from the first wear. Roll the sleeves and leave the top buttons open.',
    specSheet: sheet({
      details: [
        ['Collar', 'Point collar'],
        ['Closure', 'Button front'],
      ],
      fit: 'Regular',
      model: 'Is 187 cm tall and wears size L',
      composition: '100% linen',
      care: 'Machine wash cold, line dry',
      origin: 'Lithuania',
    }),
    options: sizes(MENS_LETTER, ['S']),
    colors: [{ name: 'White', hex: '#F6F4EE', packshot: 3 }],
    price: usd(59),
    compareAtPrice: usd(79),
    unitsSold: 1640,
    badges: ['sale'],
    categoryIds: ['cat-men', 'cat-mens-shirts'],
    tags: ['shirt', 'linen', 'summer', 'white'],
    attributes: { material: ['Linen'], fit: ['Regular'], sleeve: ['Long sleeve'] },
  },
  {
    slug: 'heavyweight-crew-neck-tee',
    title: 'Heavyweight crew-neck tee',
    description:
      'The tee everything else goes over: heavy, matte cotton jersey cut boxy through the body, with dropped shoulders and a ribbed crew neck that keeps its shape.',
    specSheet: sheet({
      details: [
        ['Neckline', 'Ribbed crew neck'],
        ['Weight', '260 g/m²'],
      ],
      fit: 'Boxy, dropped shoulder',
      model: 'Is 188 cm tall and wears size L',
      composition: '100% organic cotton',
      care: 'Machine wash at 30°C',
      origin: 'Portugal',
    }),
    options: sizes(MENS_LETTER),
    colors: [
      { name: 'White', hex: '#F4F4F1', packshot: 3 },
      { name: 'Black', hex: '#1E1E1E', packshot: 2 },
      { name: 'Gray Melange', hex: '#A6A6A3', packshot: 2 },
    ],
    price: usd(35),
    unitsSold: 1480,
    badges: ['bestseller'],
    categoryIds: ['cat-men', 'cat-mens-tops'],
    tags: ['t-shirt', 'tee', 'basics', 'jersey', 'cotton'],
    attributes: { material: ['Cotton'], fit: ['Oversize'], sleeve: ['Short sleeve'] },
  },
  {
    slug: 'textured-camp-collar-shirt',
    title: 'Textured camp-collar shirt',
    description:
      'A short-sleeved shirt in slubby, textured cotton with an open camp collar and a straight hem, cut to wear untucked.',
    specSheet: sheet({
      details: [
        ['Collar', 'Camp collar'],
        ['Closure', 'Button front'],
        ['Hem', 'Straight'],
      ],
      fit: 'Boxy',
      model: 'Is 182 cm tall and wears size M',
      composition: '100% cotton',
      care: 'Machine wash at 30°C',
      origin: 'Portugal',
    }),
    options: sizes(MENS_LETTER, ['XL']),
    colors: [{ name: 'Forest Green', hex: '#2F4D3B', packshot: 3 }],
    price: usd(69),
    badges: [],
    categoryIds: ['cat-men', 'cat-mens-shirts'],
    tags: ['shirt', 'short sleeve', 'camp collar', 'summer'],
    attributes: { material: ['Cotton'], fit: ['Relaxed'], sleeve: ['Short sleeve'] },
  },
  {
    slug: 'slim-stretch-chinos',
    title: 'Slim stretch chinos',
    description: 'Everyday chinos in stretch cotton twill, slim through the thigh and tapered to a clean ankle.',
    specSheet: sheet({
      details: [
        ['Rise', 'Mid'],
        ['Closure', 'Zip fly with button'],
        ['Pockets', 'Slanted side, back welt'],
      ],
      fit: 'Slim, tapered',
      model: 'Is 184 cm tall and wears size 48',
      composition: '98% cotton, 2% elastane',
      care: 'Machine wash at 30°C',
      origin: 'Portugal',
    }),
    options: sizes(MENS_WAIST, ['52']),
    colors: [
      { name: 'Olive', hex: '#6E6F4B', packshot: 3 },
      { name: 'Stone', hex: '#CFC4AE', packshot: 2 },
      { name: 'Navy', hex: '#242C3F', packshot: 2 },
    ],
    price: usd(69),
    unitsSold: 1570,
    badges: [],
    categoryIds: ['cat-men', 'cat-mens-trousers'],
    tags: ['trousers', 'chinos', 'cotton', 'stretch'],
    attributes: { material: ['Cotton'], fit: ['Slim'] },
  },
  {
    slug: 'slim-cotton-suit',
    title: 'Slim cotton suit',
    description:
      'A slim 2-button suit in stretch cotton twill, in a bottle green that works for a wedding and for the weekend after it.',
    specSheet: sheet({
      details: [
        ['Jacket', '2 buttons, notch lapel'],
        ['Trousers', 'Flat front, tapered leg'],
        ['Fabric', 'Stretch cotton twill'],
      ],
      fit: 'Slim',
      model: 'Is 187 cm tall and wears size 50',
      composition: '97% cotton, 3% elastane. Lining: 100% cupro',
      care: 'Dry clean',
      origin: 'Portugal',
    }),
    options: sizes(SUIT, ['48']),
    colors: [{ name: 'Bottle Green', hex: '#2F4B3E', packshot: 3 }],
    price: usd(349),
    badges: ['new'],
    categoryIds: ['cat-men', 'cat-mens-jackets'],
    tags: ['suit', 'cotton', 'tailoring', 'green'],
    attributes: { material: ['Cotton'], fit: ['Slim'] },
  },
  {
    slug: 'cross-strap-leather-slides',
    title: 'Cross-strap leather slides',
    description:
      'Slides with 2 crossed leather straps on a contoured footbed and a deep-tread sole, for the pool, the beach, and the walk home.',
    specSheet: sheet({
      details: [
        ['Upper', 'Crossed leather straps'],
        ['Footbed', 'Contoured, leather lined'],
        ['Sole', 'Rubber, deep tread'],
      ],
      fit: 'True to size',
      composition: 'Upper and footbed: 100% leather. Sole: rubber',
      care: 'Wipe clean with a damp cloth',
      origin: 'Portugal',
    }),
    options: sizes(MENS_SHOE),
    colors: [{ name: 'Dark Brown', hex: '#4A3024', packshot: 1 }],
    price: usd(69),
    badges: ['new'],
    categoryIds: ['cat-men', 'cat-mens-shoes'],
    tags: ['sandals', 'slides', 'leather', 'summer'],
    attributes: { material: ['Leather'] },
  },
  {
    slug: 'striped-seersucker-shorts',
    title: 'Striped seersucker shorts',
    description:
      'Drawstring shorts in blue and white seersucker, whose puckered weave keeps the fabric off your skin on the hottest days.',
    specSheet: sheet({
      details: [
        ['Waist', 'Elasticated, drawstring'],
        ['Length', 'Above the knee'],
        ['Pockets', 'Slanted side, back patch'],
      ],
      fit: 'Regular',
      model: 'Is 186 cm tall and wears size 48',
      composition: '100% cotton seersucker',
      care: 'Machine wash at 30°C',
      origin: 'Portugal',
    }),
    options: sizes(MENS_WAIST),
    colors: [{ name: 'Blue Stripe', hex: '#8FA6C8', packshot: 3 }],
    price: usd(49),
    badges: ['new'],
    categoryIds: ['cat-men', 'cat-mens-trousers'],
    tags: ['shorts', 'seersucker', 'stripes', 'summer'],
    attributes: { material: ['Cotton'], fit: ['Regular'] },
  },
  {
    slug: 'chunky-cable-knit-sweater',
    title: 'Chunky cable-knit sweater',
    description:
      'A fisherman sweater in thick undyed wool, knitted with a braided center panel and rope cables down the sides and sleeves.',
    specSheet: sheet({
      details: [
        ['Neckline', 'Ribbed crew neck'],
        ['Knit', 'Cable, 5 gauge'],
      ],
      fit: 'Relaxed',
      model: 'Is 185 cm tall and wears size M',
      composition: '100% wool',
      care: 'Hand wash cold, dry flat',
      origin: 'Portugal',
    }),
    options: sizes(MENS_LETTER, ['M']),
    colors: [{ name: 'Ecru', hex: '#EDE6D6', packshot: 3 }],
    price: usd(135),
    badges: ['exclusive'],
    categoryIds: ['cat-men', 'cat-mens-sweaters'],
    tags: ['sweater', 'knitwear', 'cable knit', 'fisherman', 'wool'],
    attributes: { material: ['Wool'], fit: ['Relaxed'], sleeve: ['Long sleeve'] },
  },
  {
    slug: 'leather-court-sneakers',
    title: 'Leather court sneakers',
    description:
      'Clean white court sneakers in full-grain calf leather, with 6 eyelets, tonal laces, and an off-white suede heel tab. Keep them white or let them age.',
    specSheet: sheet({
      details: [
        ['Upper', 'Full-grain calf leather'],
        ['Lining', 'Leather'],
        ['Sole', 'Stitched rubber cupsole'],
      ],
      fit: 'True to size. Take the next size down between sizes',
      composition: 'Upper and lining: 100% leather. Sole: natural rubber',
      care: 'Wipe clean, condition the leather now and then',
      origin: 'Portugal',
    }),
    options: sizes(MENS_SHOE, ['43']),
    colors: [{ name: 'White', hex: '#F3F3F0', packshot: 1 }],
    price: usd(139),
    unitsSold: 1790,
    badges: ['bestseller'],
    categoryIds: ['cat-men', 'cat-mens-shoes'],
    tags: ['sneakers', 'trainers', 'leather', 'white'],
    attributes: { material: ['Leather'] },
  },
  {
    slug: 'cotton-pique-polo',
    title: 'Cotton piqué polo',
    description:
      'A classic polo in breathable cotton piqué, with a flat-knit collar, mother-of-pearl buttons, and a longer back hem that stays put, tucked in or worn loose.',
    specSheet: sheet({
      details: [
        ['Collar', 'Flat-knit collar'],
        ['Closure', '2-button placket'],
        ['Hem', 'Longer back, side vents'],
      ],
      fit: 'Regular',
      model: 'Is 185 cm tall and wears size M',
      composition: '100% organic cotton piqué',
      care: 'Machine wash at 30°C',
      origin: 'Portugal',
    }),
    options: sizes(MENS_LETTER, ['S']),
    colors: [
      { name: 'White', hex: '#F5F4F0', packshot: 3 },
      { name: 'Sky Blue', hex: '#A9C5E2', packshot: 2 },
    ],
    price: usd(55),
    unitsSold: 1040,
    badges: [],
    categoryIds: ['cat-men', 'cat-mens-tops'],
    tags: ['polo', 'piqué', 'cotton', 'summer'],
    attributes: { material: ['Cotton'], fit: ['Regular'], sleeve: ['Short sleeve'] },
  },
  {
    slug: 'wool-blend-overcoat',
    title: 'Wool-blend overcoat',
    description:
      'A single-breasted overcoat in heavy melton, long enough to cover a jacket and sharp enough to wear over a sweater.',
    specSheet: sheet({
      details: [
        ['Collar', 'Notch lapel'],
        ['Closure', '3 horn buttons'],
        ['Length', 'Above the knee'],
      ],
      fit: 'Regular',
      model: 'Is 184 cm tall and wears size M',
      composition: '70% wool, 20% recycled polyamide, 10% cashmere. Lining: 100% viscose',
      care: 'Dry clean',
      origin: 'Portugal',
    }),
    options: sizes(MENS_LETTER, ['XL']),
    colors: [
      { name: 'Camel', hex: '#B78E60', packshot: 3 },
      { name: 'Charcoal', hex: '#3C3D40', packshot: 2 },
    ],
    price: usd(299),
    badges: ['exclusive'],
    categoryIds: ['cat-men', 'cat-mens-jackets'],
    tags: ['coat', 'overcoat', 'outerwear', 'wool'],
    attributes: { material: ['Wool'], fit: ['Regular'] },
  },
  {
    slug: 'straight-leg-jeans',
    title: 'Straight-leg jeans',
    description:
      'Five-pocket jeans in 13 oz rigid denim, cut straight from hip to hem. They start stiff and fade to fit you.',
    specSheet: sheet({
      details: [
        ['Rise', 'Mid'],
        ['Closure', 'Zip fly with button'],
        ['Denim', '13 oz rigid'],
      ],
      fit: 'Straight',
      model: 'Is 185 cm tall and wears size 48',
      composition: '100% organic cotton denim',
      care: 'Machine wash cold, inside out',
      origin: 'Turkey',
    }),
    options: sizes(MENS_WAIST, ['54']),
    colors: [
      { name: 'Mid Wash', hex: '#5F7FA6', packshot: 3 },
      { name: 'Rinse', hex: '#26324A', packshot: 2 },
    ],
    price: usd(89),
    badges: [],
    categoryIds: ['cat-men', 'cat-mens-trousers'],
    tags: ['jeans', 'denim', 'straight leg', 'five pocket'],
    attributes: { material: ['Denim'], fit: ['Straight'] },
  },
  {
    slug: 'chambray-work-shirt',
    title: 'Chambray work shirt',
    description:
      'A workwear classic in washed indigo chambray, with 2 flap pockets, horn-look buttons, and a slub that makes every shirt a little different.',
    specSheet: sheet({
      details: [
        ['Collar', 'Point collar'],
        ['Pockets', '2 chest pockets with flaps'],
        ['Fabric', 'Washed chambray'],
      ],
      fit: 'Regular',
      model: 'Is 184 cm tall and wears size M',
      composition: '100% cotton',
      care: 'Machine wash at 30°C, inside out',
      origin: 'Portugal',
    }),
    options: sizes(MENS_LETTER, ['XXL']),
    colors: [{ name: 'Indigo', hex: '#5A6F92', packshot: 3 }],
    price: usd(85),
    badges: ['limited'],
    categoryIds: ['cat-men', 'cat-mens-shirts'],
    tags: ['shirt', 'chambray', 'denim', 'workwear'],
    attributes: { material: ['Cotton'], fit: ['Regular'], sleeve: ['Long sleeve'] },
  },
  {
    slug: 'merino-quarter-zip-sweater',
    title: 'Merino quarter-zip sweater',
    description:
      'A fine merino sweater with a ribbed stand collar and a short metal zip, so it goes on over a shirt and zips up against the wind.',
    specSheet: sheet({
      details: [
        ['Neckline', 'Stand collar, quarter zip'],
        ['Knit', 'Extra-fine merino, 14 gauge'],
      ],
      fit: 'Slim',
      model: 'Is 187 cm tall and wears size M',
      composition: '100% extra-fine merino wool',
      care: 'Hand wash cold, dry flat',
      origin: 'Italy',
    }),
    options: sizes(MENS_LETTER, ['S']),
    colors: [
      { name: 'Navy', hex: '#1F2840', packshot: 3 },
      { name: 'Oatmeal', hex: '#D5C8B2', packshot: 2 },
    ],
    price: usd(79),
    compareAtPrice: usd(99),
    badges: ['sale'],
    categoryIds: ['cat-men', 'cat-mens-sweaters'],
    tags: ['sweater', 'knitwear', 'merino', 'quarter zip'],
    attributes: { material: ['Wool'], fit: ['Slim'], sleeve: ['Long sleeve'] },
  },
  {
    slug: 'suede-chelsea-boots',
    title: 'Suede Chelsea boots',
    description:
      'Chelsea boots in water-repellent suede with elastic sides, a pull tab, and a slim stacked heel. They go with jeans and with a suit.',
    specSheet: sheet({
      details: [
        ['Upper', 'Water-repellent suede'],
        ['Shaft', '14 cm, elastic sides'],
        ['Heel', '3 cm stacked'],
      ],
      fit: 'True to size',
      composition: 'Upper: 100% suede. Lining: leather. Sole: rubber',
      care: 'Brush clean, treat with a suede protector',
      origin: 'Portugal',
    }),
    options: sizes(MENS_SHOE, ['44']),
    colors: [
      { name: 'Brown', hex: '#6A4A33', packshot: 1 },
      { name: 'Black', hex: '#1D1D1D', packshot: 1 },
    ],
    price: usd(199),
    unitsSold: 1120,
    badges: [],
    categoryIds: ['cat-men', 'cat-mens-shoes'],
    tags: ['boots', 'chelsea boots', 'suede'],
    attributes: { material: ['Suede'] },
  },
  {
    slug: 'open-collar-knit-polo',
    title: 'Open-collar knit polo',
    description:
      'A fine-gauge knitted polo with a buttonless collar that lies flat and opens into a neat V. Somewhere between a tee and a shirt, it works under a jacket too.',
    specSheet: sheet({
      details: [
        ['Collar', 'Open johnny collar'],
        ['Knit', 'Mercerized cotton, 16 gauge'],
      ],
      fit: 'Regular',
      model: 'Is 183 cm tall and wears size M',
      composition: '100% mercerized cotton',
      care: 'Hand wash cold, dry flat',
      origin: 'Italy',
    }),
    options: sizes(MENS_LETTER, ['XL']),
    colors: [{ name: 'Navy', hex: '#1F2A44', packshot: 3 }],
    price: usd(79),
    badges: ['new'],
    categoryIds: ['cat-men', 'cat-mens-tops'],
    tags: ['polo', 'knitwear', 'cotton'],
    attributes: { material: ['Cotton'], fit: ['Regular'], sleeve: ['Short sleeve'] },
  },
  {
    slug: 'pleated-wool-trousers',
    title: 'Pleated wool trousers',
    description:
      'High-rise trousers in soft wool flannel, with single pleats, a pressed crease, and an extended waistband tab. Tailoring without the suit.',
    specSheet: sheet({
      details: [
        ['Rise', 'High'],
        ['Closure', 'Extended tab, zip fly'],
        ['Pleats', 'Single front pleats'],
      ],
      fit: 'Relaxed, tapered',
      model: 'Is 183 cm tall and wears size 48',
      composition: '100% wool flannel',
      care: 'Dry clean',
      origin: 'Italy',
    }),
    options: sizes(MENS_WAIST, ['46']),
    colors: [{ name: 'Taupe', hex: '#8C8175', packshot: 2 }],
    price: usd(139),
    badges: [],
    categoryIds: ['cat-men', 'cat-mens-trousers'],
    tags: ['trousers', 'tailoring', 'pleated', 'wool'],
    attributes: { material: ['Wool'], fit: ['Relaxed'] },
  },
  {
    slug: 'corduroy-overshirt',
    title: 'Corduroy overshirt',
    description:
      'A boxy overshirt in fine-wale corduroy that does the job of a light jacket, with 2 flap pockets and dark horn buttons.',
    specSheet: sheet({
      details: [
        ['Collar', 'Point collar'],
        ['Pockets', '2 chest patch pockets'],
        ['Fabric', 'Fine-wale corduroy'],
      ],
      fit: 'Boxy',
      model: 'Is 188 cm tall and wears size L',
      composition: '100% cotton',
      care: 'Machine wash at 30°C, inside out',
      origin: 'Portugal',
    }),
    options: sizes(MENS_LETTER, ['S']),
    colors: [{ name: 'Tobacco', hex: '#8B5E34', packshot: 3 }],
    price: usd(110),
    badges: ['new'],
    categoryIds: ['cat-men', 'cat-mens-shirts'],
    tags: ['overshirt', 'corduroy', 'shacket', 'layering'],
    attributes: { material: ['Cotton'], fit: ['Relaxed'], sleeve: ['Long sleeve'] },
  },
  {
    slug: 'cashmere-roll-neck-sweater',
    title: 'Cashmere roll-neck sweater',
    description:
      'A roll neck in 2-ply cashmere, soft enough to wear against the skin and fine enough to wear under a coat.',
    specSheet: sheet({
      details: [
        ['Neckline', 'Folded roll neck'],
        ['Knit', '2-ply cashmere, 12 gauge'],
      ],
      fit: 'Regular',
      model: 'Is 186 cm tall and wears size M',
      composition: '100% cashmere',
      care: 'Hand wash cold, dry flat',
      origin: 'Scotland',
    }),
    options: sizes(MENS_LETTER, ['L']),
    colors: [{ name: 'Black', hex: '#1F1F1F', packshot: 3 }],
    price: usd(195),
    badges: ['limited'],
    categoryIds: ['cat-men', 'cat-mens-sweaters'],
    tags: ['sweater', 'knitwear', 'cashmere', 'roll neck', 'turtleneck'],
    attributes: { material: ['Cashmere'], fit: ['Regular'], sleeve: ['Long sleeve'] },
  },
  {
    slug: 'suede-trucker-jacket',
    title: 'Suede trucker jacket',
    description:
      'The trucker jacket in soft sand goat suede, with pleated front panels, 2 pointed flap pockets, and a buttoned waistband.',
    specSheet: sheet({
      details: [
        ['Collar', 'Point collar'],
        ['Closure', 'Button front'],
        ['Pockets', '2 chest flap pockets, 2 hand pockets'],
      ],
      fit: 'Regular',
      model: 'Is 186 cm tall and wears size M',
      composition: '100% goat suede. Lining: 100% cotton',
      care: 'Specialist leather clean',
      origin: 'Spain',
    }),
    options: sizes(MENS_LETTER, ['S', 'XXL']),
    colors: [{ name: 'Sand', hex: '#BFA27D', packshot: 3 }],
    price: usd(349),
    unitsSold: 960,
    badges: ['exclusive'],
    categoryIds: ['cat-men', 'cat-mens-jackets'],
    tags: ['jacket', 'suede', 'trucker', 'outerwear'],
    attributes: { material: ['Suede'], fit: ['Regular'] },
  },
  {
    slug: 'leather-penny-loafers',
    title: 'Leather penny loafers',
    description:
      'Penny loafers in polished dark brown calf, hand-stitched at the moc toe and set on a leather sole with a low stacked heel.',
    specSheet: sheet({
      details: [
        ['Upper', 'Polished calf leather'],
        ['Toe', 'Hand-stitched moc toe'],
        ['Sole', 'Leather, rubber heel tip'],
      ],
      fit: 'Snug at first. Take the next size up between sizes',
      composition: 'Upper and lining: 100% leather. Sole: leather',
      care: 'Polish now and then, keep on shoe trees',
      origin: 'Italy',
    }),
    options: sizes(MENS_SHOE, ['40', '46']),
    colors: [{ name: 'Dark Brown', hex: '#3B2519', packshot: 1 }],
    price: usd(179),
    badges: [],
    categoryIds: ['cat-men', 'cat-mens-shoes'],
    tags: ['loafers', 'leather', 'formal'],
    attributes: { material: ['Leather'] },
  },
  {
    slug: 'waffle-knit-henley',
    title: 'Waffle-knit henley',
    description:
      'A long-sleeved henley in a deep cotton waffle knit, with a 3-button placket and ribbed cuffs. Warm on its own, and just as good under an open shirt.',
    specSheet: sheet({
      details: [
        ['Neckline', 'Round neck, 3-button placket'],
        ['Knit', 'Cotton waffle'],
      ],
      fit: 'Regular',
      model: 'Is 187 cm tall and wears size L',
      composition: '100% organic cotton',
      care: 'Machine wash at 30°C',
      origin: 'Portugal',
    }),
    options: sizes(MENS_LETTER, ['M']),
    colors: [{ name: 'Oatmeal', hex: '#D8CCB6', packshot: 3 }],
    price: usd(49),
    compareAtPrice: usd(65),
    badges: ['sale'],
    categoryIds: ['cat-men', 'cat-mens-tops'],
    tags: ['henley', 'waffle', 'long sleeve', 'cotton'],
    attributes: { material: ['Cotton'], fit: ['Regular'], sleeve: ['Long sleeve'] },
  },
  {
    slug: 'linen-drawstring-trousers',
    title: 'Linen drawstring trousers',
    description:
      'Wide, easy trousers in washed linen with an elasticated drawstring waist. Pull them on and forget about them.',
    specSheet: sheet({
      details: [
        ['Waist', 'Elasticated, drawstring'],
        ['Pockets', 'Slanted side, back patch'],
      ],
      fit: 'Wide leg',
      model: 'Is 184 cm tall and wears size 48',
      composition: '100% linen',
      care: 'Machine wash cold, line dry',
      origin: 'Lithuania',
    }),
    options: sizes(MENS_WAIST, ['50']),
    colors: [{ name: 'Ecru', hex: '#EAE3D2', packshot: 3 }],
    price: usd(79),
    unitsSold: 1210,
    badges: ['bestseller'],
    categoryIds: ['cat-men', 'cat-mens-trousers'],
    tags: ['trousers', 'linen', 'drawstring', 'summer'],
    attributes: { material: ['Linen'], fit: ['Wide leg'] },
  },
  {
    slug: 'shawl-collar-cardigan',
    title: 'Shawl-collar cardigan',
    description:
      'A heavy cardigan in brushed wool with a wide ribbed shawl collar, 2 patch pockets, and 5 dark buttons. A jacket for the house and a coat for the garden.',
    specSheet: sheet({
      details: [
        ['Collar', 'Ribbed shawl collar'],
        ['Closure', '5 buttons'],
        ['Pockets', '2 patch pockets'],
      ],
      fit: 'Relaxed',
      model: 'Is 184 cm tall and wears size M',
      composition: '80% wool, 20% recycled polyamide',
      care: 'Hand wash cold, dry flat',
      origin: 'Portugal',
    }),
    options: sizes(MENS_LETTER, ['XL']),
    colors: [{ name: 'Brown Melange', hex: '#6F5A48', packshot: 3 }],
    price: usd(139),
    badges: [],
    categoryIds: ['cat-men', 'cat-mens-sweaters'],
    tags: ['cardigan', 'knitwear', 'shawl collar', 'wool'],
    attributes: { material: ['Wool'], fit: ['Relaxed'], sleeve: ['Long sleeve'] },
  },
  {
    slug: 'striped-poplin-shirt',
    title: 'Striped poplin shirt',
    description:
      'A long-sleeved shirt in crisp cotton poplin with fine blue and white stripes and a single chest pocket. It works tucked into tailoring or loose over chinos.',
    specSheet: sheet({
      details: [
        ['Collar', 'Point collar'],
        ['Pockets', '1 chest pocket'],
      ],
      fit: 'Regular',
      model: 'Is 183 cm tall and wears size M',
      composition: '100% cotton',
      care: 'Machine wash at 40°C, iron on medium',
      origin: 'Portugal',
    }),
    options: sizes(MENS_LETTER, ['L']),
    colors: [{ name: 'Blue Stripe', hex: '#7F9CC4', packshot: 3 }],
    price: usd(55),
    compareAtPrice: usd(69),
    badges: ['sale'],
    categoryIds: ['cat-men', 'cat-mens-shirts'],
    tags: ['shirt', 'stripes', 'poplin', 'cotton'],
    attributes: { material: ['Cotton'], fit: ['Regular'], sleeve: ['Long sleeve'] },
  },
  {
    slug: 'quilted-liner-jacket',
    title: 'Quilted liner jacket',
    description:
      'A light, collarless jacket in diamond-quilted nylon with a snap front. Wear it on its own in spring, or under a coat in winter.',
    specSheet: sheet({
      details: [
        ['Neckline', 'Collarless'],
        ['Closure', 'Snap front'],
        ['Filling', 'Recycled polyester'],
      ],
      fit: 'Regular',
      model: 'Is 183 cm tall and wears size M',
      composition: '100% recycled nylon. Filling: 100% recycled polyester',
      care: 'Machine wash at 30°C',
      origin: 'Portugal',
    }),
    options: sizes(MENS_LETTER),
    colors: [{ name: 'Black', hex: '#1E1F21', packshot: 3 }],
    price: usd(99),
    compareAtPrice: usd(129),
    badges: ['sale'],
    categoryIds: ['cat-men', 'cat-mens-jackets'],
    tags: ['jacket', 'quilted', 'liner', 'outerwear'],
    attributes: { material: ['Nylon'], fit: ['Regular'] },
  },
  {
    slug: 'suede-desert-boots',
    title: 'Suede desert boots',
    description: 'Unlined desert boots in sand suede on a natural crepe sole, soft from the first day.',
    specSheet: sheet({
      details: [
        ['Upper', 'Unlined suede'],
        ['Lacing', '2 eyelets'],
        ['Sole', 'Natural crepe rubber'],
      ],
      fit: 'Roomy. Take the next size down between sizes',
      composition: 'Upper: 100% suede. Sole: natural crepe rubber',
      care: 'Brush clean, treat with a suede protector',
      origin: 'Portugal',
    }),
    options: sizes(MENS_SHOE, ['42']),
    colors: [{ name: 'Sand', hex: '#C6A67A', packshot: 1 }],
    price: usd(149),
    badges: ['new'],
    categoryIds: ['cat-men', 'cat-mens-shoes'],
    tags: ['boots', 'desert boots', 'chukka', 'suede'],
    attributes: { material: ['Suede'] },
  },
  {
    slug: 'linen-blend-tee',
    title: 'Linen-blend tee',
    description: 'A relaxed tee in slubby linen and cotton that stays cool in the heat and softens every summer.',
    specSheet: sheet({
      details: [
        ['Neckline', 'Narrow ribbed crew neck'],
        ['Weight', '180 g/m²'],
      ],
      fit: 'Relaxed',
      model: 'Is 184 cm tall and wears size M',
      composition: '55% linen, 45% cotton',
      care: 'Machine wash cold, line dry',
      origin: 'Portugal',
    }),
    options: sizes(MENS_LETTER),
    colors: [{ name: 'Sand', hex: '#D2C2A5', packshot: 3 }],
    price: usd(45),
    badges: ['new'],
    categoryIds: ['cat-men', 'cat-mens-tops'],
    tags: ['t-shirt', 'tee', 'linen', 'summer'],
    attributes: { material: ['Linen'], fit: ['Relaxed'], sleeve: ['Short sleeve'] },
  },
  {
    slug: 'cotton-chino-shorts',
    title: 'Cotton chino shorts',
    description:
      'Classic chino shorts in garment-dyed cotton twill, with an 18 cm inseam that ends just above the knee.',
    specSheet: sheet({
      details: [
        ['Rise', 'Mid'],
        ['Inseam', '18 cm'],
        ['Pockets', 'Slanted side, back welt'],
      ],
      fit: 'Regular',
      model: 'Is 188 cm tall and wears size 50',
      composition: '100% organic cotton',
      care: 'Machine wash at 30°C',
      origin: 'Portugal',
    }),
    options: sizes(MENS_WAIST, ['44', '54']),
    colors: [{ name: 'Sage', hex: '#9AA38A', packshot: 3 }],
    price: usd(39),
    compareAtPrice: usd(55),
    badges: ['sale'],
    categoryIds: ['cat-men', 'cat-mens-trousers'],
    tags: ['shorts', 'chinos', 'cotton', 'summer'],
    attributes: { material: ['Cotton'], fit: ['Regular'] },
  },
  {
    slug: 'lambswool-v-neck-sweater',
    title: 'Lambswool V-neck sweater',
    description:
      'A V-neck in soft Scottish lambswool, the kind that sits over a shirt and tie and still looks right with jeans.',
    specSheet: sheet({
      details: [
        ['Neckline', 'Ribbed V-neck'],
        ['Knit', 'Lambswool, 12 gauge'],
      ],
      fit: 'Regular',
      model: 'Is 183 cm tall and wears size M',
      composition: '100% lambswool',
      care: 'Hand wash cold, dry flat',
      origin: 'Scotland',
    }),
    options: sizes(MENS_LETTER),
    colors: [{ name: 'Burgundy', hex: '#6D2A36', packshot: 3 }],
    price: usd(85),
    unitsSold: 890,
    badges: [],
    categoryIds: ['cat-men', 'cat-mens-sweaters'],
    tags: ['sweater', 'knitwear', 'v-neck', 'lambswool', 'wool'],
    attributes: { material: ['Wool'], fit: ['Regular'], sleeve: ['Long sleeve'] },
  },
  {
    slug: 'terry-cloth-polo',
    title: 'Terry cloth polo',
    description:
      'A boxy polo in soft cotton terry with an open camp collar, made for the walk from the beach to dinner.',
    specSheet: sheet({
      details: [
        ['Collar', 'Open camp collar'],
        ['Closure', '3-button placket'],
        ['Fabric', 'Looped cotton terry'],
      ],
      fit: 'Boxy',
      model: 'Is 186 cm tall and wears size M',
      composition: '100% cotton',
      care: 'Machine wash at 30°C, dry flat',
      origin: 'Portugal',
    }),
    options: sizes(MENS_LETTER, ['XXL']),
    colors: [{ name: 'Terracotta', hex: '#B5603E', packshot: 3 }],
    price: usd(69),
    badges: ['limited'],
    categoryIds: ['cat-men', 'cat-mens-tops'],
    tags: ['polo', 'terry', 'summer', 'resort'],
    attributes: { material: ['Cotton'], fit: ['Oversize'], sleeve: ['Short sleeve'] },
  },
  {
    slug: 'wide-wale-corduroy-trousers',
    title: 'Wide-wale corduroy trousers',
    description:
      'Pleated trousers in chunky 8-wale corduroy with a relaxed straight leg, warm enough for November and soft enough for Sunday.',
    specSheet: sheet({
      details: [
        ['Rise', 'Mid-high'],
        ['Pleats', 'Single front pleats'],
        ['Fabric', '8-wale corduroy'],
      ],
      fit: 'Relaxed, straight leg',
      model: 'Is 185 cm tall and wears size 50',
      composition: '100% cotton corduroy',
      care: 'Machine wash at 30°C, inside out',
      origin: 'Portugal',
    }),
    options: sizes(MENS_WAIST),
    colors: [{ name: 'Chocolate', hex: '#4B3426', packshot: 3 }],
    price: usd(99),
    badges: [],
    categoryIds: ['cat-men', 'cat-mens-trousers'],
    tags: ['trousers', 'corduroy', 'pleated', 'cotton'],
    attributes: { material: ['Cotton'], fit: ['Relaxed'] },
  },
  {
    slug: 'loopback-cotton-sweatshirt',
    title: 'Loopback cotton sweatshirt',
    description:
      'A heavy crew-neck sweatshirt in loopback cotton, with a small V insert at the neck and a relaxed fit that softens with every wash.',
    specSheet: sheet({
      details: [
        ['Neckline', 'Ribbed crew neck, V insert'],
        ['Weight', '400 g/m²'],
      ],
      fit: 'Relaxed',
      model: 'Is 188 cm tall and wears size L',
      composition: '100% organic cotton',
      care: 'Machine wash at 30°C',
      origin: 'Portugal',
    }),
    options: sizes(MENS_LETTER, ['M']),
    colors: [{ name: 'Heather Gray', hex: '#A6A6A4', packshot: 3 }],
    price: usd(69),
    badges: [],
    categoryIds: ['cat-men', 'cat-mens-sweaters'],
    tags: ['sweatshirt', 'loopback', 'cotton', 'basics'],
    attributes: { material: ['Cotton'], fit: ['Relaxed'], sleeve: ['Long sleeve'] },
  },
  {
    slug: 'striped-long-sleeve-tee',
    title: 'Striped long-sleeve tee',
    description:
      'The Breton, cut for men: a sturdy cotton jersey with narrow navy stripes and a plain ecru band across the shoulders.',
    specSheet: sheet({
      details: [
        ['Neckline', 'Crew neck'],
        ['Weight', '230 g/m²'],
      ],
      fit: 'Regular',
      model: 'Is 185 cm tall and wears size M',
      composition: '100% organic cotton',
      care: 'Machine wash at 30°C',
      origin: 'Portugal',
    }),
    options: sizes(MENS_LETTER, ['S']),
    colors: [{ name: 'Navy Stripe', hex: '#2B3A5C', packshot: 3 }],
    price: usd(49),
    badges: [],
    categoryIds: ['cat-men', 'cat-mens-tops'],
    tags: ['t-shirt', 'stripes', 'breton', 'long sleeve'],
    attributes: { material: ['Cotton'], fit: ['Regular'], sleeve: ['Long sleeve'] },
  },
  {
    slug: 'brushed-mohair-blend-sweater',
    title: 'Brushed mohair-blend sweater',
    description:
      'A boxy crew neck knitted from a brushed mohair blend with a soft, fuzzy halo, in a dusty blue that goes with denim and ecru.',
    specSheet: sheet({
      details: [
        ['Neckline', 'Ribbed crew neck'],
        ['Knit', 'Brushed mohair blend, 7 gauge'],
      ],
      fit: 'Boxy, dropped shoulder',
      model: 'Is 185 cm tall and wears size M',
      composition: '45% mohair, 35% recycled polyamide, 20% wool',
      care: 'Hand wash cold, dry flat',
      origin: 'Portugal',
    }),
    options: sizes(MENS_LETTER, ['XXL']),
    colors: [{ name: 'Dusty Blue', hex: '#8EA3B8', packshot: 3 }],
    price: usd(119),
    badges: ['new'],
    categoryIds: ['cat-men', 'cat-mens-sweaters'],
    tags: ['sweater', 'knitwear', 'mohair', 'wool'],
    attributes: { material: ['Wool'], fit: ['Oversize'], sleeve: ['Long sleeve'] },
  },
]

/** The Fashion catalog, with photography read off disk. */
export const fashionProducts: Product[] = seeds.map(build)
