import 'server-only'

import { cookies } from 'next/headers'

/*
 * The cookies the storefront keeps, all set 1 way: `httpOnly`, so no script on
 * the page reads a token or an address, and `secure` everywhere but
 * development. Reads are safe while rendering; writes only work in a Server
 * Action or Route Handler.
 */

/** A cookie's value, or `null` where it is not set. */
export async function readCookie(name: string): Promise<string | null> {
  return (await cookies()).get(name)?.value ?? null
}

/** Stores a value for `maxAge` seconds, or deletes the cookie when the value is empty. */
export async function writeCookie(name: string, value: string | null, maxAge: number): Promise<void> {
  const jar = await cookies()
  if (!value) {
    jar.delete(name)
    return
  }

  jar.set(name, value, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge,
  })
}

/**
 * A cookie holding base64url JSON, or `null` where it is not set, does not
 * parse, or fails `isValid`. A visitor can edit a cookie, so nothing comes back
 * unchecked.
 */
export async function readJsonCookie<T>(name: string, isValid: (value: unknown) => boolean): Promise<T | null> {
  const stored = await readCookie(name)
  if (!stored) return null

  try {
    const value: unknown = JSON.parse(Buffer.from(stored, 'base64url').toString('utf8'))
    return isValid(value) ? (value as T) : null
  } catch {
    return null
  }
}

/** Stores a value as base64url JSON for `maxAge` seconds. */
export async function writeJsonCookie(name: string, value: unknown, maxAge: number): Promise<void> {
  await writeCookie(name, Buffer.from(JSON.stringify(value), 'utf8').toString('base64url'), maxAge)
}
