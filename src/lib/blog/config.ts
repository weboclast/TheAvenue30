import 'server-only'

import type { ContentAdapter } from './adapter'
import { demoContentAdapter } from './adapters/demo'

/**
 * The adapter every blog read goes through. Connect your CMS by writing a
 * {@link ContentAdapter} and putting it here in place of the demo posts. It is
 * chosen apart from the commerce adapter, because a store's blog and its catalog
 * often live in different backends.
 *
 * This module is server-only, so an adapter can read its credentials from
 * `process.env` and they never reach the client bundle.
 */
export const contentAdapter: ContentAdapter = demoContentAdapter
