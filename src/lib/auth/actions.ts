'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { authAdapter } from './config'
import { clearSessionToken, readSessionToken, writeSessionToken } from './session'
import type { PasswordChange } from './types'

/*
 * The 4 mutations, as Server Actions. Forms call these directly; a cookie can
 * only be written from an action, which is why they are not on the facade.
 *
 * Each one revalidates the whole layout tree on success, because the header
 * renders the account state and sits above every route.
 */

/** What a form gets back. Never throws for bad credentials: a wrong password is an answer, not an error. */
export type AuthActionResult = { ok: true } | { ok: false; error: string }

/** Signs in with the `email` and `password` fields of a submitted form. */
export async function signInAction(formData: FormData): Promise<AuthActionResult> {
  const result = await authAdapter.signIn({
    email: String(formData.get('email') ?? ''),
    password: String(formData.get('password') ?? ''),
  })
  if (!result.ok) return result

  await writeSessionToken(result.session.token)
  revalidatePath('/', 'layout')
  return { ok: true }
}

/** Creates an account from a submitted form and signs it in. */
export async function registerAction(formData: FormData): Promise<AuthActionResult> {
  const result = await authAdapter.register({
    email: String(formData.get('email') ?? ''),
    password: String(formData.get('password') ?? ''),
    firstName: String(formData.get('firstName') ?? '').trim(),
    lastName: String(formData.get('lastName') ?? '').trim(),
  })
  if (!result.ok) return result

  await writeSessionToken(result.session.token)
  revalidatePath('/', 'layout')
  return { ok: true }
}

/**
 * Swaps the signed-in shopper's password. Refused rather than hidden where the
 * adapter has no `changePassword`, since a screen that renders the control has
 * already asked `canChangePassword` in `./index.ts`.
 */
export async function changePasswordAction(change: PasswordChange): Promise<AuthActionResult> {
  const token = await readSessionToken()
  if (!token) return { ok: false, error: 'Sign in to change your password.' }
  if (!authAdapter.changePassword) return { ok: false, error: 'Passwords are managed outside this store.' }

  const result = await authAdapter.changePassword(token, change)
  if (!result.ok) return result

  // Stored either way: a backend that reissues the token on a change returns a
  // new one, and a shopper whose cookie still holds the old one is signed out.
  await writeSessionToken(result.session.token)
  revalidatePath('/', 'layout')
  return { ok: true }
}

/**
 * Ends the session and lands on `home`. Clears the cookie even when the backend
 * rejects the token, so a shopper can always sign out.
 *
 * It redirects rather than leaving the shopper where they were, because half the
 * places this is offered are guarded: revalidating alone re-renders the account
 * page they are on, which paints an empty shell for a frame before its layout
 * bounces them to `/login`. Callers pass their own storefront's home.
 */
export async function signOutAction(home: string): Promise<void> {
  const token = await readSessionToken()
  await clearSessionToken()
  if (token) await authAdapter.signOut(token)
  revalidatePath('/', 'layout')
  redirect(home)
}
