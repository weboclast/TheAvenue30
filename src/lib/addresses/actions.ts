'use server'

import { getSession } from '@/lib/auth'
import type { Address } from '@/lib/commerce/types'
import { validateAddress } from '@/lib/validation'
import {
  type AddressDraft,
  type AddressPatch,
  MAX_LABEL,
  MAX_SAVED_ADDRESSES,
  type SavedAddress,
  sortAddresses,
} from './book'
import { listSavedAddresses } from './index'
import { writeBook } from './store'

/*
 * The 3 writes: save one, edit one, delete one. A cookie can only be written
 * from an action, which is why they are not on the facade.
 *
 * Each hands the new book back rather than revalidating the page, so an address
 * appears in the list without the sections around it re-rendering.
 *
 * An action is a public endpoint, so everything here is validated again no
 * matter what the form already checked, and every one of these resolves the
 * session first: a forged argument on this seam means somebody else's home
 * address.
 */

/** What an address write gives back. A refusal is a value, never an exception. */
export type AddressActionResult = { ok: true; addresses: SavedAddress[] } | { ok: false; error: string }

/**
 * Adds an address to the book. The first one saved becomes the default, since a
 * shopper with 1 address has chosen it.
 */
export async function saveAddressAction(draft: AddressDraft): Promise<AddressActionResult> {
  return mutate((addresses) => {
    if (addresses.length >= MAX_SAVED_ADDRESSES) {
      return `You can keep ${MAX_SAVED_ADDRESSES} addresses. Delete one to add another.`
    }

    const invalid = validateSaved(draft)
    if (invalid) return invalid

    const added: SavedAddress = { ...trim(draft), id: crypto.randomUUID(), addedAt: new Date().toISOString() }

    return withDefault([...addresses, added], draft.default || addresses.length === 0 ? added.id : undefined)
  })
}

/** Changes a saved address, or promotes it to the one the checkout offers first. */
export async function updateAddressAction(id: string, patch: AddressPatch): Promise<AddressActionResult> {
  return mutate((addresses) => {
    const target = addresses.find((saved) => saved.id === id)
    if (!target) return 'That address is no longer saved.'

    const { label, ...fields } = patch
    const merged: SavedAddress = {
      ...target,
      ...trim(fields),
      // `null` is what clears a label the shopper emptied; leaving the field out
      // keeps the one that is there.
      ...(label !== undefined && { label: label?.trim() || undefined }),
    }

    const invalid = validateSaved(merged)
    if (invalid) return invalid

    return withDefault(
      addresses.map((saved) => (saved.id === id ? merged : saved)),
      patch.default ? id : undefined,
    )
  })
}

/**
 * Deletes an address. Deleting the default one hands the flag to whatever is
 * left, because the checkout always needs something to offer first.
 */
export async function forgetAddressAction(id: string): Promise<AddressActionResult> {
  return mutate((addresses) => withDefault(addresses.filter((saved) => saved.id !== id)))
}

/**
 * Runs a change against this shopper's book and stores the result. The change
 * returns a message instead to refuse.
 */
async function mutate(change: (addresses: SavedAddress[]) => SavedAddress[] | string): Promise<AddressActionResult> {
  if (!(await getSession())) return { ok: false, error: 'Sign in to manage your addresses.' }

  const next = change(await listSavedAddresses())
  if (typeof next === 'string') return { ok: false, error: next }

  await writeBook(next)
  return { ok: true, addresses: sortAddresses(next) }
}

/**
 * Keeps the 1 invariant this module has: exactly 1 saved address leads, as long
 * as there is one to. Names the id to promote, or lets the flag fall to whatever
 * already carries it and then to the first row.
 */
function withDefault(addresses: SavedAddress[], promote?: string): SavedAddress[] {
  const leader = promote ?? addresses.find((saved) => saved.default)?.id ?? addresses[0]?.id
  return addresses.map((saved) => ({ ...saved, default: saved.id === leader }))
}

/** The whitespace a form leaves behind, gone before anything is stored. */
function trim<T extends object>(values: T): T {
  const entries = Object.entries(values).map(([key, value]) => [key, typeof value === 'string' ? value.trim() : value])
  return Object.fromEntries(entries) as T
}

/** The dialog's checks, re-run on what actually arrived: the address, then the name it is saved under. */
function validateSaved(address: Partial<Address> & { label?: string | null }): string | undefined {
  if (address.label && address.label.length > MAX_LABEL) return `Keep the name to ${MAX_LABEL} characters.`
  return validateAddress(address)
}
