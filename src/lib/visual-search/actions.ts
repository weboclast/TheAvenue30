'use server'

import { getCommerce } from '@/lib/commerce'
import type { VisualSearchSample } from '@/lib/commerce/types'
import { type DemoSlug, isDemoSlug } from '@/lib/demos'

/**
 * The photos to try, for a panel that opens on demand and so cannot be handed
 * them by the page, like a search dialog in a header. Never throws: a refused
 * demo slug or a failed read is no samples, and the panel still takes a photo.
 *
 * @param department Its own samples and those of no department.
 */
export async function visualSearchSamplesAction(demo: DemoSlug, department?: string): Promise<VisualSearchSample[]> {
  if (!isDemoSlug(demo)) return []

  try {
    return await getCommerce(demo).getVisualSearchSamples(department)
  } catch {
    return []
  }
}
