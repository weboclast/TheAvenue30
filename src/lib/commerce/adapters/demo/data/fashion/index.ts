import type { DemoDataset } from '../dataset'
import { fashionCategories, fashionDepartments } from './categories'
import {
  fashionCategoryCampaigns,
  fashionDepartmentCampaigns,
  fashionGridCampaigns,
  fashionPlacementCampaigns,
} from './category-campaigns'
import { fashionCategoryCover } from './category-covers'
import { fashionCollections } from './collections'
import { fashionFilters } from './filters'
import { fashionDepartmentHeroCampaigns } from './hero-campaigns'
import { fashionMenu } from './menu'
import { fashionProducts } from './products'
import { fashionReviews } from './reviews'
import { fashionVisualSearchSamples } from './visual-search'

/**
 * The Fashion dataset. It carries the 5 pieces a storefront cannot open
 * without; the merchandising a demo adds on top (hero slides, campaign banners,
 * bundles, reviews) is optional and joins as the demo is built out.
 */
export const fashionDataset: DemoDataset = {
  // A cover is a chosen shot, not a product's lead, so it is filled in here rather than by the adapter.
  categories: fashionCategories.map((category) => ({ ...category, image: fashionCategoryCover(category) })),
  products: fashionProducts,
  menu: fashionMenu,
  departments: fashionDepartments,
  filters: fashionFilters,
  departmentHeroCampaigns: fashionDepartmentHeroCampaigns,
  categoryCampaigns: fashionCategoryCampaigns,
  categoryGridCampaigns: fashionGridCampaigns,
  placementCampaigns: fashionPlacementCampaigns,
  departmentCampaigns: fashionDepartmentCampaigns,
  collections: fashionCollections,
  visualSearchSamples: fashionVisualSearchSamples,
  reviews: fashionReviews,
}
