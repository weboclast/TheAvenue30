import type { AuthResult, Credentials, Customer, PasswordChange, Registration } from './types'

/**
 * The contract between the storefront and whatever issues its sessions: 4
 * methods, plus 2 optional ones. The template ships the demo sign-in in
 * `./adapters/demo.ts`, and a real backend is another implementation selected in
 * `./config.ts`.
 *
 * The storefront never sees a password after {@link signIn} and stores nothing
 * but the token the adapter hands back, so swapping adapters changes what the
 * token means, not who holds it. Every method is async, so loading and error
 * states behave the same against fixtures and a network.
 */
export interface AuthAdapter {
  /** Exchanges credentials for a session. Returns the reason on failure, never throws for a bad password. */
  signIn(credentials: Credentials): Promise<AuthResult>

  /**
   * Creates a customer and signs them in. Backends that require email
   * confirmation before a first sign-in should return `{ ok: false }` with a
   * message saying so.
   */
  register(registration: Registration): Promise<AuthResult>

  /** Resolves a token from a previous {@link signIn} back to its customer, or `null` once it stops being valid. */
  getCustomer(token: string): Promise<Customer | null>

  /** Invalidates a token. A no-op for stateless backends, which only need the cookie cleared. */
  signOut(token: string): Promise<void>

  /**
   * Swaps the signed-in shopper's password for a new one. Optional: a backend
   * where somebody else owns sign-in (SSO, a passwordless provider) leaves it
   * out, and the account's settings page drops the control rather than
   * offering one that cannot work.
   *
   * Returns a session because some backends reissue the token on a password
   * change. Hand the one that came in back where yours does not.
   */
  changePassword?(token: string, change: PasswordChange): Promise<AuthResult>

  /**
   * Erases the customer behind a token. Optional, and more often absent than
   * present: most commerce platforms leave self-service deletion to an admin
   * call, so a store that has to offer it points this at its own endpoint or its
   * support queue.
   *
   * The storefront clears what it holds either way, so this is the backend half
   * of the erase and never the whole of it.
   */
  deleteAccount?(token: string): Promise<void>
}
