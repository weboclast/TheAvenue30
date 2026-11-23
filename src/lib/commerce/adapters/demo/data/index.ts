import type { DemoSlug } from '@/lib/demos'
import type { DemoDataset } from './dataset'
import { fashionDataset } from './fashion'

/**
 * Demo datasets, keyed by {@link DemoSlug}. A demo can exist in the registry
 * (routes, theming) before it supplies content, so this is a `Partial` map. The
 * adapter throws a clear error if a demo without a dataset is requested.
 *
 * Adding a demo's content: create a sibling folder exporting a {@link DemoDataset},
 * list its product photos in the folder's `photos.json`, and register the slug here.
 */
export const datasets: Partial<Record<DemoSlug, DemoDataset>> = {
  fashion: fashionDataset,
}

export type {
  BundleOffer,
  BundleOfferItem,
  CollectionSource,
  DemoDataset,
  FilterGroup,
  FilterSource,
  FilterSourceKind,
  SceneTagSource,
  ShoppableSceneSource,
  VisualSearchSampleSource,
} from './dataset'
