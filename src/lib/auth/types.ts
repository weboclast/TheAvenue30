/** A signed-in shopper, as every screen sees them. */
export interface Customer {
  id: string
  email: string
  firstName: string
  lastName: string
}

/** What a password sign-in submits. */
export interface Credentials {
  email: string
  password: string
}

/** What a password change submits. The shopper proves the old one before choosing the new one. */
export interface PasswordChange {
  current: string
  next: string
}

/** What a registration submits, on top of {@link Credentials}. */
export interface Registration extends Credentials {
  firstName: string
  lastName: string
}

/**
 * A signed-in session. `token` is opaque to the storefront: only the adapter
 * that issued it can read it back (a customer access token, a JWT, a session
 * id). It is all that goes in the cookie.
 */
export interface Session {
  token: string
  customer: Customer
}

/** The outcome of a sign-in or a registration. */
export type AuthResult = { ok: true; session: Session } | { ok: false; error: string }
