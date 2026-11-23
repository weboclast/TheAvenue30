'use server'

import { getSession } from '@/lib/auth'
import { validatePostcode } from '@/lib/validation'
import { listSavedPaymentMethods } from './index'
import {
  MAX_NICKNAME,
  MAX_SAVED_METHODS,
  type PaymentMethodDraft,
  type PaymentMethodPatch,
  type SavedPaymentMethod,
  isPaymentMethodId,
  sortPaymentMethods,
} from './methods'
import { writeVault } from './vault'

/*
 * The 3 writes: save one, edit one, forget one. Replacing a reissued card is the
 * first with `replaces` set, not a 4th. A cookie can only be written
 * from an action, which is why they are not on the facade.
 *
 * Each hands the new set back rather than revalidating the page, so a card
 * appears in the list without the sections around it re-rendering.
 *
 * An action is a public endpoint, so everything here is validated again no
 * matter what the form already checked. What arrives is whatever the caller
 * sent, and on this seam that includes somebody else's saved cards: every one
 * of these resolves the session first and only ever edits what it owns.
 */

/** What a payment write gives back. A refusal is a value, never an exception. */
export type PaymentActionResult = { ok: true; methods: SavedPaymentMethod[] } | { ok: false; error: string }

/**
 * Saves a card the provider has already vaulted, or connects a wallet. The first
 * one saved becomes the default, since a shopper with 1 way to pay has chosen it.
 *
 * Only ever called with what a provider handed back. There is no card number in
 * {@link PaymentMethodDraft} and there must never be one: see `./AGENTS.md`.
 *
 * @param replaces - The id this one stands in for, for a card an issuer
 * reissued under a new number. Dropped in the same write, so the shopper is
 * never briefly holding both and never briefly holding neither.
 */
export async function savePaymentMethodAction(
  draft: PaymentMethodDraft,
  replaces?: string,
): Promise<PaymentActionResult> {
  return mutate((saved) => {
    const methods = replaces ? saved.filter((method) => method.id !== replaces) : saved

    if (methods.length >= MAX_SAVED_METHODS) {
      return `You can keep ${MAX_SAVED_METHODS} payment methods. Remove one to add another.`
    }

    const invalid = validateDraft(draft)
    if (invalid) return invalid

    // A wallet is an account, not a card: connecting the same one twice would
    // list it twice with nothing to tell the rows apart.
    if (!draft.card && methods.some((method) => method.method === draft.method)) {
      return 'That wallet is already connected.'
    }

    const added: SavedPaymentMethod = {
      id: crypto.randomUUID(),
      method: draft.method,
      ...(draft.card && { card: { ...draft.card, holder: draft.card.holder.trim() } }),
      ...(draft.account && { account: draft.account.trim() }),
      ...(draft.nickname?.trim() && { nickname: draft.nickname.trim() }),
      ...(draft.billing && { billing: draft.billing }),
      addedAt: new Date().toISOString(),
    }

    return withDefault([...methods, added], draft.default || methods.length === 0 ? added.id : undefined)
  })
}

/** Changes what an edit may change: the expiry, the name on the card, its nickname, where it bills. */
export async function updatePaymentMethodAction(id: string, patch: PaymentMethodPatch): Promise<PaymentActionResult> {
  return mutate((methods) => {
    const target = methods.find((saved) => saved.id === id)
    if (!target) return 'That payment method is no longer saved.'

    const invalid = validatePatch(target, patch)
    if (invalid) return invalid

    const next = methods.map((saved) =>
      saved.id === id
        ? {
            ...saved,
            ...(saved.card && {
              card: {
                ...saved.card,
                ...(patch.holder !== undefined && { holder: patch.holder.trim() }),
                ...(patch.expiryMonth !== undefined && { expiryMonth: patch.expiryMonth }),
                ...(patch.expiryYear !== undefined && { expiryYear: patch.expiryYear }),
              },
            }),
            ...(patch.billing !== undefined && { billing: patch.billing }),
            // `null` is what clears a nickname the shopper emptied; leaving the
            // field out keeps the one that is there.
            ...(patch.nickname !== undefined && { nickname: patch.nickname?.trim() || undefined }),
          }
        : saved,
    )

    return withDefault(next, patch.default ? id : undefined)
  })
}

/**
 * Forgets a card or disconnects a wallet. Forgetting the default one hands the
 * flag to whatever is left, because the checkout always needs something to offer
 * first.
 */
export async function forgetPaymentMethodAction(id: string): Promise<PaymentActionResult> {
  return mutate((methods) => withDefault(methods.filter((saved) => saved.id !== id)))
}

/**
 * Runs a change against what this shopper has saved and stores the result. The
 * change returns a message instead to refuse.
 */
async function mutate(
  change: (methods: SavedPaymentMethod[]) => SavedPaymentMethod[] | string,
): Promise<PaymentActionResult> {
  if (!(await getSession())) return { ok: false, error: 'Sign in to manage your payment methods.' }

  const next = change(await listSavedPaymentMethods())
  if (typeof next === 'string') return { ok: false, error: next }

  await writeVault(next)
  return { ok: true, methods: sortPaymentMethods(next) }
}

/**
 * Keeps the 1 invariant this module has: exactly 1 saved method leads, as long
 * as there is one to. Names the id to promote, or lets the flag fall to whatever
 * already carries it and then to the first row.
 */
function withDefault(methods: SavedPaymentMethod[], promote?: string): SavedPaymentMethod[] {
  const leader = promote ?? methods.find((saved) => saved.default)?.id ?? methods[0]?.id
  return methods.map((saved) => ({ ...saved, default: saved.id === leader }))
}

/** How far ahead a card may be dated. Issuers run to 10 years; anything beyond it is a typo. */
const MAX_EXPIRY_YEARS = 12

function validateDraft(draft: PaymentMethodDraft): string | undefined {
  if (!isPaymentMethodId(draft.method)) return 'That payment method is not one we take.'
  if (draft.method === 'card' && !draft.card) return 'That card is missing its details.'

  if (draft.card) {
    const { brand, last4, holder, expiryMonth, expiryYear } = draft.card
    if (!brand.trim() || !/^\d{4}$/.test(last4)) return 'That card is missing its details.'
    if (!holder.trim()) return 'Enter the name on the card.'

    const expiry = validateExpiry(expiryMonth, expiryYear)
    if (expiry) return expiry
  }

  return validateNickname(draft.nickname) ?? validateBilling(draft)
}

function validatePatch(target: SavedPaymentMethod, patch: PaymentMethodPatch): string | undefined {
  if (patch.holder !== undefined && !patch.holder.trim()) return 'Enter the name on the card.'

  if (patch.expiryMonth !== undefined || patch.expiryYear !== undefined) {
    const expiry = validateExpiry(
      patch.expiryMonth ?? target.card?.expiryMonth ?? 0,
      patch.expiryYear ?? target.card?.expiryYear ?? 0,
    )
    if (expiry) return expiry
  }

  return validateNickname(patch.nickname ?? undefined) ?? validateBilling(patch)
}

function validateExpiry(month: number, year: number): string | undefined {
  const thisYear = new Date().getFullYear()
  if (!Number.isInteger(month) || month < 1 || month > 12) return 'Use MM / YY.'
  if (!Number.isInteger(year) || year < thisYear || year > thisYear + MAX_EXPIRY_YEARS) return 'Use MM / YY.'
  return undefined
}

function validateNickname(nickname: string | undefined): string | undefined {
  return nickname && nickname.trim().length > MAX_NICKNAME ? `Keep the name to ${MAX_NICKNAME} characters.` : undefined
}

function validateBilling({ billing }: { billing?: { countryCode: string; postcode: string } }): string | undefined {
  if (!billing) return undefined
  if (!/^[A-Z]{2}$/.test(billing.countryCode)) return 'Choose the country the card is billed in.'
  return validatePostcode(billing.postcode)
}
