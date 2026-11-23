import 'server-only'

import type { AuthAdapter } from './adapter'
import { demoAuthAdapter } from './adapters/demo'

/**
 * The adapter every auth call goes through. Connect your backend by writing an
 * {@link AuthAdapter} and putting it here in place of the demo sign-in.
 *
 * This module is server-only, so an adapter can read its credentials from
 * `process.env` and they never reach the client bundle.
 */
export const authAdapter: AuthAdapter = demoAuthAdapter

/**
 * Whether the demo sign-in is still the adapter in use. While it is, the account
 * pages open on the sample shopper's data; connect a real backend and they open
 * on the shopper's own.
 */
export const isDemoAuth = authAdapter === demoAuthAdapter
