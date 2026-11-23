'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { listSavedAddresses } from '@/lib/addresses'
import { clearBook } from '@/lib/addresses/store'
import { getSession } from '@/lib/auth'
import { authAdapter } from '@/lib/auth/config'
import { clearSessionToken, readSessionToken } from '@/lib/auth/session'
import { demos } from '@/lib/demos'
import { listSavedPaymentMethods } from '@/lib/payments'
import { clearVault } from '@/lib/payments/vault'
import { validatePhone } from '@/lib/validation'
import { writeWishlistToken } from '@/lib/wishlist/token'
import { getProfile } from './index'
import {
  CONTACT_METHODS,
  type Connection,
  FIT_PREFERENCES,
  HOME_ROOMS,
  type HomeProfile,
  INTERESTS,
  MAX_DOORWAY,
  MAX_FLOORS_UP,
  MAX_HOME_NOTES,
  MAX_INTERESTS,
  MIN_DOORWAY,
  PARKING,
  SIZE_SCALES,
  STAIRS,
  type ProfilePatch,
  type ShopperProfile,
  SOCIAL_PROVIDER_LABELS,
  type StoredProfile,
  type SocialProviderId,
  isSocialProviderId,
} from './profile'
import { clearProfile, writeProfile } from './store'

/*
 * The 4 writes: edit the record, link an account, unlink one, and turn the
 * second factor on or off. Then the 2 the danger zone calls, which reach across
 * every seam that holds something about this shopper. A cookie can only be
 * written from an action, which is why they are not on the facade.
 *
 * Each hands the new profile back rather than revalidating the page, so a
 * section adopts what the store accepted without the ones around it
 * re-rendering.
 *
 * An action is a public endpoint, so everything here is validated again no
 * matter what the form already checked, and every one of these resolves the
 * session first: a forged argument on this seam means somebody else's phone
 * number.
 */

/** What a profile write gives back. A refusal is a value, never an exception. */
export type ProfileActionResult = { ok: true; profile: ShopperProfile } | { ok: false; error: string }

/** Changes what the shopper typed into the profile dialog, the sizes they keep, or their home. */
export async function updateProfileAction(patch: ProfilePatch): Promise<ProfileActionResult> {
  return mutate((profile) => {
    const { phone, fit, home, ...fields } = patch
    const merged: ShopperProfile = {
      ...profile,
      ...trim(fields),
      // `null` is what clears a value the shopper emptied; leaving the field
      // out keeps the one that is there.
      ...(phone !== undefined && { phone: phone?.trim() || undefined }),
      ...(fit !== undefined && { fit: fit ?? undefined }),
      ...(home !== undefined && { home: { ...home, notes: home.notes?.trim() || undefined } }),
    }

    return validateProfile(merged) ?? merged
  })
}

/**
 * Links a provider this account can then sign in from.
 *
 * **This is where the OAuth trip goes.** A real store sends the shopper to the
 * provider, reads the callback, and calls this with what came back; the button
 * that calls it today stands in for that round-trip. See `./AGENTS.md`.
 *
 * @param account - Who the shopper is at the provider, for the card to name.
 * Only the callback knows it, so pass what came back and nothing else.
 */
export async function connectAccountAction(provider: SocialProviderId, account?: string): Promise<ProfileActionResult> {
  return mutate((profile) => {
    if (!isSocialProviderId(provider)) return 'That is not an account this store links to.'
    if (profile.connections.some((linked) => linked.provider === provider)) {
      return `${SOCIAL_PROVIDER_LABELS[provider]} is already linked.`
    }

    const linked: Connection = { provider, ...(account?.trim() && { account: account.trim() }) }
    return { ...profile, connections: [...profile.connections, linked] }
  })
}

/** Unlinks a provider. The password is untouched, so sign-in still works without it. */
export async function disconnectAccountAction(provider: SocialProviderId): Promise<ProfileActionResult> {
  return mutate((profile) => ({
    ...profile,
    connections: profile.connections.filter((linked) => linked.provider !== provider),
  }))
}

/** Turns the second factor on or off. Enrolling one is the store's own flow; see `./AGENTS.md`. */
export async function setTwoFactorAction(on: boolean): Promise<ProfileActionResult> {
  return mutate((profile) => ({ ...profile, twoFactor: on }))
}

/** What the store holds about a shopper, as the file they are entitled to ask for. */
export type AccountExport = { ok: true; filename: string; json: string } | { ok: false; error: string }

/**
 * Everything this store holds about the signed-in shopper, as JSON they can
 * keep. What GDPR article 15 and the CCPA both ask a store to be able to hand
 * over.
 *
 * Orders are deliberately absent: those live behind the commerce adapter, 1
 * page at a time and scoped to a storefront, so a real store exports them from
 * the system that took the money rather than from a screen. Read them here to
 * add them.
 */
export async function exportAccountDataAction(): Promise<AccountExport> {
  const profile = await getProfile()
  if (!profile) return { ok: false, error: 'Sign in to download your data.' }

  const [addresses, paymentMethods] = await Promise.all([listSavedAddresses(), listSavedPaymentMethods()])
  const exported = { exportedAt: new Date().toISOString(), profile, addresses, paymentMethods }

  return {
    ok: true,
    filename: `appica-account-${profile.email.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}.json`,
    json: JSON.stringify(exported, null, 2),
  }
}

/**
 * Closes the account: the backend erases what it holds, this storefront forgets
 * everything it does, and the shopper lands back on the home page signed out.
 *
 * The cart is deliberately left alone, the way signing out leaves it: it belongs
 * to whoever is on this device, and a guest can still check out with it.
 *
 * Only ever called behind a confirmation the shopper has to type into. Redirects
 * on success, so it returns a message only when it refuses.
 */
export async function deleteAccountAction(): Promise<{ ok: false; error: string }> {
  const customer = await getSession()
  if (!customer) return { ok: false, error: 'Sign in to close your account.' }

  const token = await readSessionToken()
  if (token) await authAdapter.deleteAccount?.(token)

  await Promise.all([
    clearProfile(),
    clearBook(),
    clearVault(),
    ...demos.map(({ slug }) => writeWishlistToken(slug, null)),
    clearSessionToken(),
  ])

  // The header renders the account state and sits above every route, the same
  // reason signing out revalidates the whole tree.
  revalidatePath('/', 'layout')
  redirect('/')
}

/**
 * Runs a change against this shopper's profile and stores the result. The
 * change returns a message instead to refuse.
 */
async function mutate(change: (profile: ShopperProfile) => ShopperProfile | string): Promise<ProfileActionResult> {
  const profile = await getProfile()
  if (!profile) return { ok: false, error: 'Sign in to manage your account.' }

  const next = change(profile)
  if (typeof next === 'string') return { ok: false, error: next }

  await writeProfile(toStored(next))
  return { ok: true, profile: next }
}

/**
 * Everything but the email, which the session carries instead. Written out field
 * by field, so one added to `ShopperProfile` fails to compile until decided on.
 */
function toStored(profile: ShopperProfile): StoredProfile {
  return {
    firstName: profile.firstName,
    lastName: profile.lastName,
    phone: profile.phone,
    contactMethod: profile.contactMethod,
    interests: profile.interests,
    sizes: profile.sizes,
    fit: profile.fit,
    home: profile.home,
    connections: profile.connections,
    twoFactor: profile.twoFactor,
  }
}

/** The whitespace a form leaves behind, gone before anything is stored. */
function trim<T extends object>(values: T): T {
  const entries = Object.entries(values).map(([key, value]) => [key, typeof value === 'string' ? value.trim() : value])
  return Object.fromEntries(entries) as T
}

/**
 * The checks the dialog runs, re-run on what actually arrived. An unknown
 * interest or contact method is a refusal rather than a silent drop, so a store
 * retiring one finds out here instead of in its recommendations.
 */
function validateProfile(profile: ShopperProfile): string | undefined {
  if (!profile.firstName.trim() || !profile.lastName.trim()) return 'Enter the name your orders are addressed to.'
  if (profile.phone && validatePhone(profile.phone)) return 'Enter a valid phone number.'
  if (!CONTACT_METHODS.some(({ id }) => id === profile.contactMethod)) return 'Choose how we should get in touch.'
  if (profile.interests.length > MAX_INTERESTS) return `Pick up to ${MAX_INTERESTS} interests.`
  if (profile.interests.some((id) => !INTERESTS.some((interest) => interest.id === id))) {
    return 'One of those interests is no longer offered.'
  }
  const sizes = Object.entries(profile.sizes ?? {})
  if (sizes.some(([id, size]) => !SIZE_SCALES.find((scale) => scale.id === id)?.sizes.includes(size))) {
    return 'One of those sizes is no longer offered.'
  }
  if (profile.fit && !FIT_PREFERENCES.some(({ id }) => id === profile.fit)) return 'Choose how you like things to fit.'

  return profile.home && validateHome(profile.home)
}

/** The home profile's checks, against the same lists and limits the dialog draws. */
function validateHome(home: HomeProfile): string | undefined {
  const { floorsUp, lift, stairs, doorway, parking, rooms, notes } = home
  if (floorsUp !== undefined && !(Number.isInteger(floorsUp) && floorsUp >= 0 && floorsUp <= MAX_FLOORS_UP)) {
    return 'Choose how many floors up your door is.'
  }
  if (lift !== undefined && typeof lift !== 'boolean') return 'Say whether a lift reaches your door.'
  if (stairs && !STAIRS.some(({ id }) => id === stairs)) return 'Choose how your stairs run.'
  if (doorway !== undefined && !(Number.isFinite(doorway) && doorway >= MIN_DOORWAY && doorway <= MAX_DOORWAY)) {
    return `Enter a doorway between ${MIN_DOORWAY} and ${MAX_DOORWAY} cm.`
  }
  if (parking && !PARKING.some(({ id }) => id === parking)) return 'Choose where the van can stop.'
  if (!Array.isArray(rooms) || rooms.some((id) => !HOME_ROOMS.some((room) => room.id === id))) {
    return 'One of those rooms is no longer offered.'
  }
  if (notes && notes.length > MAX_HOME_NOTES) return `Keep the note to ${MAX_HOME_NOTES} characters.`

  return undefined
}
