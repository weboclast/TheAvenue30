import type { BannerPlacement, CampaignBanner, GridCampaign, ProductImage } from '@/lib/commerce/types'

/*
 * Campaigns for each department: across the top of its listing, in cells of its
 * grid, and on its home. The account runs the grid ones. To give a subcategory a
 * listing campaign, add an entry under its id. Filter tokens in `href` must
 * match values the catalog carries.
 */

/** A photograph from `/public/demo/fashion/banners/`, or a clip's first frame. */
const photo = (file: string, alt: string, width: number, height: number): ProductImage => ({
  src: `/demo/fashion/banners/${file}.webp`,
  alt,
  width,
  height,
})

/* The first campaign across each department's listing, named because its menu runs it too. */
const woolKnits: CampaignBanner = {
  id: 'campaign-womens-wool-knits',
  title: 'Wool knits, soft enough for spring',
  image: photo(
    'womens-wool-knits',
    'A woman in a powder blue cable-knit sweater, standing in a field of orange poppies',
    2206,
    530,
  ),
  clip: '/demo/fashion/banners/womens-wool-knits.mp4',
  href: '/catalog/women?material=wool',
}

const shortSleeves: CampaignBanner = {
  id: 'campaign-mens-short-sleeves',
  title: 'Short sleeves for the long summer',
  image: photo(
    'mens-short-sleeves',
    'A man in a striped knit polo, resting in a deck chair above a misty rainforest',
    3336,
    1536,
  ),
  focus: { x: 43, y: 24 },
  href: '/catalog/men?sleeve=short-sleeve',
}

/**
 * Campaigns across the top, by category id. Not inherited. Photos keep the
 * full shot height for the near-square crop on phones.
 */
export const fashionCategoryCampaigns: Record<string, CampaignBanner[]> = {
  'cat-women': [
    woolKnits,
    {
      id: 'campaign-womens-relaxed-shapes',
      title: 'Relaxed shapes for slower days',
      image: photo(
        'womens-relaxed-shapes',
        'A woman in an oversized camel sweater, seated before white drapes',
        3068,
        1751,
      ),
      focus: { x: 50, y: 27 },
      href: '/catalog/women?fit=relaxed,oversize',
    },
  ],

  'cat-men': [shortSleeves],
}

/* The in-grid campaigns, named because the account's sidebar runs them too. */
const gardenColors: CampaignBanner = {
  id: 'grid-womens-garden-colors',
  title: 'Garden colors for the first warm days',
  image: photo(
    'womens-garden-colors',
    'A woman with gold hoop earrings, half hidden behind pink and yellow flowers',
    1000,
    1500,
  ),
  href: '/catalog/women?color=sage,powder-blue,dusty-blue,butter,wildflower',
}

const sleeveless: CampaignBanner = {
  id: 'grid-womens-sleeveless',
  title: 'Sleeveless cuts for the heat of the day',
  image: photo('womens-sleeveless', 'A woman in a sleeveless cream maxi dress, walking over sand dunes', 720, 1080),
  clip: '/demo/fashion/banners/womens-sleeveless.mp4',
  href: '/catalog/women?sleeve=sleeveless',
}

const linen: CampaignBanner = {
  id: 'grid-mens-linen',
  title: 'Linen for evenings by the sea',
  image: photo(
    'mens-linen',
    'A man in a linen shirt with a cable-knit sweater over his shoulders, on a terrace above the sea at sunset',
    800,
    1200,
  ),
  clip: '/demo/fashion/banners/mens-linen.mp4',
  href: '/catalog/men?material=linen',
}

const relaxedCuts: CampaignBanner = {
  id: 'grid-mens-relaxed-cuts',
  title: 'Relaxed cuts for doing very little',
  image: photo(
    'mens-relaxed-cuts',
    'A man in an open-knit shirt, reclining on a lounge chair by sheer curtains',
    926,
    1389,
  ),
  href: '/catalog/men?fit=relaxed',
}

/**
 * Campaigns in the grid, by category id. Not inherited. Cell 6 ends a row at 2
 * and 3 columns, cell 16 at 2 and 4. Photos are 2:3, about the shape a cell
 * takes beside cards carrying a name and price under the photograph.
 */
export const fashionGridCampaigns: Record<string, GridCampaign[]> = {
  'cat-women': [
    { position: 6, campaign: gardenColors },
    { position: 16, campaign: sleeveless },
  ],

  'cat-men': [
    { position: 6, campaign: linen },
    { position: 16, campaign: relaxedCuts },
  ],
}

/** Campaigns on the pages that are not a listing. The account alternates the 2 departments'. */
export const fashionPlacementCampaigns: Partial<Record<BannerPlacement, CampaignBanner[]>> = {
  account: [gardenColors, linen, sleeveless, relaxedCuts],
}

/**
 * Campaigns on a department's home and in its menu, by department id. A home
 * clip plays once, so end it on the frame worth holding. The menu shows a still
 * 540-680px tall, from portrait at 1024px to about 7:5 at 1920px, so its
 * photographs are 3:2 with the subject near the middle.
 */
export const fashionDepartmentCampaigns: Record<string, Partial<Record<BannerPlacement, CampaignBanner[]>>> = {
  'cat-women': {
    menu: [
      {
        ...woolKnits,
        id: 'menu-womens-wool-knits',
        image: photo('womens-wool-knits-menu', woolKnits.image.alt, 2040, 1360),
        clip: undefined,
      },
    ],
    home: [
      {
        id: 'home-womens-dresses',
        title: 'Dresses cut to catch the breeze',
        image: photo('womens-dresses', 'A woman in a white sleeveless dress against a clear blue sky', 1440, 1080),
        clip: '/demo/fashion/banners/womens-dresses.mp4',
        href: '/catalog/womens-dresses',
      },
    ],
  },

  'cat-men': {
    menu: [
      {
        ...shortSleeves,
        id: 'menu-mens-short-sleeves',
        image: photo('mens-short-sleeves-menu', shortSleeves.image.alt, 2040, 1360),
        focus: { x: 40, y: 50 },
      },
    ],
    home: [
      {
        id: 'home-mens-evening-knits',
        title: 'Knits for when the sun goes down',
        image: photo(
          'mens-evening-knits',
          'A man in sunglasses with a cable-knit sweater over his shoulders, on a terrace above the sea at sunset',
          1080,
          1080,
        ),
        clip: '/demo/fashion/banners/mens-evening-knits.mp4',
        href: '/catalog/mens-sweaters',
      },
    ],
  },
}
