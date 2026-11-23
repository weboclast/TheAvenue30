import type { DemoSlug } from '@/lib/demos'
import type { ContentDataset } from './dataset'
import { fashionContent } from './fashion'

/**
 * Demo blogs, keyed by {@link DemoSlug}. A `Partial` map: a demo with no blog
 * serves an empty listing rather than throwing, because a storefront without a
 * blog is a normal storefront.
 *
 * Adding a demo's blog: create a sibling folder exporting a {@link ContentDataset},
 * add its artwork under `/public/demo/<slug>/blog/`, and register the slug here.
 */
export const contentDatasets: Partial<Record<DemoSlug, ContentDataset>> = {
  fashion: fashionContent,
}

export type { ContentDataset, PostSource } from './dataset'
