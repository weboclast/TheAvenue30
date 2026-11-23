import { accessibilityStatement } from './accessibility-statement'
import type { LegalDocument } from './legal'
import { privacyPolicy } from './privacy-policy'
import { termsOfService } from './terms-of-service'
import type { DemoSlug } from '@/lib/demos'

export type { LegalBlock, LegalDocument, LegalSection, LegalSubsection, LegalTocItem } from './legal'
export { legalLinkLabel, legalSectionNumber, legalTocItems } from './legal'

/**
 * Every legal document the store publishes, in the order the footers list them.
 * The single source of truth: adding a document is 1 entry here plus its content
 * file, and the route and both footers pick it up.
 *
 * Safe to import from a Client Component; this module is plain data.
 */
export const legalDocuments = [privacyPolicy, termsOfService, accessibilityStatement] satisfies LegalDocument[]

/**
 * The slug of a document that exists. Derived from the registry the way
 * `DemoSlug` is derived from `demos`, so a link pointing at a policy this store
 * does not publish fails to compile rather than 404ing.
 */
export type LegalSlug = (typeof legalDocuments)[number]['slug']

/** The document served at a slug, or `undefined` for one that does not exist. */
export function getLegalDocument(slug: string): LegalDocument | undefined {
  return legalDocuments.find((doc) => doc.slug === slug)
}

/**
 * Where a legal document lives in the storefront named. Every storefront serves
 * the same documents under a route of its own, so this is the 1 place a link
 * into them is built.
 */
export function legalPath(demo: DemoSlug, slug: LegalSlug): string {
  return `/legal/${slug}`
}
