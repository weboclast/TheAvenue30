import type { AuthAdapter } from '../adapter'
import type { Customer, Session } from '../types'
import { validateEmail, validatePassword } from '@/lib/validation'

/*
 * The bundled auth backend: any email and password that pass validation sign
 * in, so every account screen is browsable without a server.
 *
 * The token is the customer, base64url-encoded. That is not authentication and
 * is not meant to be: anyone can mint one. It exists so the session survives a
 * refresh with nothing to run. A real adapter returns a credential its backend
 * issued, and this file is the first thing to delete.
 */

function encode(customer: Customer): string {
  return Buffer.from(JSON.stringify(customer), 'utf8').toString('base64url')
}

function decode(token: string): Customer | null {
  try {
    const customer = JSON.parse(Buffer.from(token, 'base64url').toString('utf8')) as Customer
    return customer.email ? customer : null
  } catch {
    return null
  }
}

/** Turns `ada.lovelace@example.com` into `Ada Lovelace`, so a demo sign-in has a name to greet. */
function nameFromEmail(email: string): { firstName: string; lastName: string } {
  const [firstName = 'Guest', lastName = ''] = email
    .split('@')[0]
    .split(/[._+-]/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
  return { firstName, lastName }
}

function sessionFor(email: string, name?: { firstName: string; lastName: string }): Session {
  const customer: Customer = {
    id: `demo-${email.toLowerCase()}`,
    email: email.trim().toLowerCase(),
    ...(name ?? nameFromEmail(email)),
  }
  return { token: encode(customer), customer }
}

export const demoAuthAdapter: AuthAdapter = {
  async signIn({ email, password }) {
    const invalid = validateEmail(email) ?? validatePassword(password)
    if (invalid) return { ok: false, error: invalid }
    return { ok: true, session: sessionFor(email) }
  },

  async register({ email, password, firstName, lastName }) {
    const invalid = validateEmail(email) ?? validatePassword(password)
    if (invalid) return { ok: false, error: invalid }
    return { ok: true, session: sessionFor(email, { firstName, lastName }) }
  },

  async getCustomer(token) {
    return decode(token)
  },

  async signOut() {
    // Nothing to revoke: the token carries its own customer and the cookie is already cleared.
  },

  async changePassword(token, { current, next }) {
    const customer = decode(token)
    if (!customer) return { ok: false, error: 'Sign in again to change your password.' }

    // The demo token carries no credential, so the current password is only
    // checked for being there. A real backend compares it.
    if (!current) return { ok: false, error: 'Enter your current password' }

    const invalid = validatePassword(next)
    if (invalid) return { ok: false, error: invalid }
    if (current === next) return { ok: false, error: 'That is the password you already have' }

    // The same token: nothing about it depends on the password. A backend that
    // reissues one on a change returns the new session here instead.
    return { ok: true, session: { token, customer } }
  },

  async deleteAccount() {
    // Nothing to erase: the demo keeps no customer record, only a token that
    // encodes one. Clearing what the storefront holds is the whole erase here.
  },
}
