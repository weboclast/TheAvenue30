import 'server-only'

import type { CommerceAdapter } from './adapter'
import { demoAdapter } from './adapters/demo'

/**
 * The adapter every commerce read and write goes through. Connect your backend
 * by writing a {@link CommerceAdapter} and putting it here in place of the demo
 * data; the `commerce-adapter` skill walks through it.
 *
 * This module is server-only, so an adapter can read its credentials from
 * `process.env` and they never reach the client bundle.
 */
export const adapter: CommerceAdapter = demoAdapter

/**
 * Whether the demo data is still the adapter in use. Sample account data that
 * names its products, such as the demo offers, shows only while it is.
 */
export const isDemoCommerce = adapter === demoAdapter
