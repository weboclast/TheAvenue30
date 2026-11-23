/**
 * The demo registry: the single source of truth for which storefronts exist.
 * `DemoSlug` and `Demo` are derived from this array, so adding or removing a
 * demo is one edit here, and TypeScript carries it everywhere a slug is used:
 * the data registries and every other map keyed by demo.
 */
export const demos = [
  {
    slug: 'fashion',
    name: 'The Avenue 30',
    description: 'Clothing, shoes, bags & accessories.',
  },
] as const

/** One entry in the {@link demos} registry. */
export type Demo = (typeof demos)[number]

/** The URL segment a demo lives under, e.g. `'electronics'`. */
export type DemoSlug = Demo['slug']

/**
 * Whether a string is a demo that exists. Anything arriving from a client (a
 * Server Action argument, a route parameter) is narrowed with this before it
 * reaches the commerce layer, which throws for a slug it has no dataset for.
 */
export function isDemoSlug(value: string): value is DemoSlug {
  return demos.some((demo) => demo.slug === value)
}

/**
 * The storefront the shared entry points lead into: auth, which lives once at
 * the root, lands here. Every demo owns its screens, so this is a default, not a
 * shared implementation.
 */
export const REFERENCE_DEMO: DemoSlug = 'fashion'
