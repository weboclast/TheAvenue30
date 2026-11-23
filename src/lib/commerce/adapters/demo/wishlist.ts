import type {
  Product,
  Wishlist,
  WishlistInput,
  WishlistItem,
  WishlistItemInput,
  WishlistItemRef,
  WishlistPatch,
  WishlistState,
} from '../../types'

/*
 * The demo wishlists: state, like the cart next door, and with nowhere to write
 * it either. So they ride in the token as base64url JSON, which `lib/wishlist`
 * puts in a cookie: the lists a shopper opened, and the slug and date of what is
 * in them. Products are resolved from the catalog on every read, so a list saved
 * months ago shows today's price and today's stock.
 *
 * That is what caps the feature: a cookie holds 4 KB in every browser, so the
 * counts below are what the token can carry rather than what a shopper deserves.
 * A real backend keeps the lists in a table and deletes this file with every cap
 * in it.
 *
 * Every function takes the catalog to resolve against rather than the dataset,
 * so the adapter can attach ratings first.
 */

/** How many lists fit in the token. */
const MAX_LISTS = 5

/** How many products fit across all of them, matching the cap the cart puts on its own lines. */
const MAX_ITEMS = 25

/** Where a list's name and its description stop, so neither can crowd the products out of the token. */
const MAX_NAME = 40
const MAX_DESCRIPTION = 120

/**
 * The last line of defense on the cookie, in encoded characters. The counts
 * above are chosen so it never fires (5 maxed-out lists holding 25 products
 * encode to about 3.7 KB), so it is here for the store whose slugs run longer,
 * and it is why those counts are revisited together rather than 1 at a time.
 */
const MAX_TOKEN_LENGTH = 3800

/** What a heart opens a list as, for a shopper who saved something before naming anything. */
const FIRST_LIST_NAME = 'My wishlist'

/** One saved product as the token carries it: what was saved and when, never what it costs. */
interface StoredItem {
  slug: string
  /** `YYYY-MM-DD`. */
  addedAt: string
}

/** One list as the token carries it. Only the list saves land in carries `default`. */
interface StoredWishlist {
  id: string
  name: string
  description?: string
  default?: true
  /** Newest first, which is what makes "by date added" the order they arrive in. */
  items: StoredItem[]
}

/** The lists a token addresses. An unreadable token is treated as no lists, never as an error. */
export function readWishlists(products: Product[], token: string | null): WishlistState {
  return { wishlists: buildWishlists(products, decodeWishlists(token)), token }
}

/**
 * Opens a list, and points new saves at it. Somebody who just named a list is
 * about to fill it, and it spares them a second trip to say so. Throws with a
 * message the shopper sees for a name already in use, or one list too many.
 */
export function createWishlist(products: Product[], token: string | null, input: WishlistInput): WishlistState {
  const stored = decodeWishlists(token)
  if (stored.length >= MAX_LISTS) throw new Error(`You can keep ${MAX_LISTS} wishlists at a time.`)

  const opened = newWishlist(stored, input)
  stored.push(opened)
  promote(stored, opened)

  return settle(products, stored)
}

/** Renames a list, rewrites its description, or points new saves at it. */
export function updateWishlist(
  products: Product[],
  token: string | null,
  id: string,
  patch: WishlistPatch,
): WishlistState {
  const stored = decodeWishlists(token)
  const list = stored.find((candidate) => candidate.id === id)

  if (list) {
    if (patch.name !== undefined) {
      list.name = wishlistName(
        stored.filter((candidate) => candidate !== list),
        patch.name,
      )
    }
    if (patch.description !== undefined) {
      list.description = patch.description?.trim().slice(0, MAX_DESCRIPTION) || undefined
    }
    if (patch.default) promote(stored, list)
  }

  return settle(products, stored)
}

/** Deletes a list and everything in it. A list that is already gone is not an error. */
export function deleteWishlist(products: Product[], token: string | null, id: string): WishlistState {
  return settle(
    products,
    decodeWishlists(token).filter((list) => list.id !== id),
  )
}

/**
 * Saves a product into the list the input names, the one new saves are pointed
 * at otherwise, and opens a first list for a shopper who has none.
 */
export function addWishlistItem(products: Product[], token: string | null, input: WishlistItemInput): WishlistState {
  const product = products.find((candidate) => candidate.slug === input.productSlug)
  if (!product) throw new Error('That product is no longer available.')

  const stored = decodeWishlists(token)
  let list = stored.find((candidate) => candidate.id === input.wishlistId) ?? defaultList(stored)

  if (!list) {
    // Nothing saved yet, so the first list opens itself: a heart has to work
    // before a shopper has thought about lists at all.
    list = newWishlist(stored, { name: FIRST_LIST_NAME })
    stored.push(list)
    promote(stored, list)
  }

  // Saving something twice leaves it where it is, rather than moving it to the
  // top of a list the shopper arranged.
  if (!list.items.some((item) => item.slug === product.slug)) {
    if (countItems(stored) >= MAX_ITEMS) throw new Error(`Your wishlists hold ${MAX_ITEMS} products at a time.`)
    list.items.unshift({ slug: product.slug, addedAt: today() })
  }

  return settle(products, stored)
}

/** Takes items out, across as many lists as the refs name. */
export function removeWishlistItems(
  products: Product[],
  token: string | null,
  items: WishlistItemRef[],
): WishlistState {
  const stored = decodeWishlists(token)

  for (const list of stored) {
    const dropped = items.filter((ref) => ref.wishlistId === list.id)
    if (dropped.length > 0) list.items = list.items.filter((item) => !dropped.some((ref) => ref.itemId === item.slug))
  }

  return settle(products, stored)
}

/** Moves items into another list. One already there stays put rather than being doubled. */
export function moveWishlistItems(
  products: Product[],
  token: string | null,
  items: WishlistItemRef[],
  wishlistId: string,
): WishlistState {
  const stored = decodeWishlists(token)
  const target = stored.find((list) => list.id === wishlistId)
  if (!target) throw new Error('That wishlist no longer exists.')

  const moved: StoredItem[] = []
  for (const list of stored) {
    // Items already in the destination are left alone, so a selection spanning
    // it and another list moves the half that has somewhere to go.
    if (list === target) continue

    const taken = items.filter((ref) => ref.wishlistId === list.id)
    if (taken.length === 0) continue

    const leaving = (item: StoredItem) => taken.some((ref) => ref.itemId === item.slug)
    moved.push(...list.items.filter(leaving))
    list.items = list.items.filter((item) => !leaving(item))
  }

  for (const item of moved) {
    if (!target.items.some((existing) => existing.slug === item.slug)) target.items.unshift(item)
  }

  return settle(products, stored)
}

/**
 * Re-encodes mutated lists. A shopper left with no lists has nothing to address,
 * so the token goes with them and the next save opens a fresh one.
 */
function settle(products: Product[], stored: StoredWishlist[]): WishlistState {
  return { wishlists: buildWishlists(products, stored), token: stored.length > 0 ? encodeWishlists(stored) : null }
}

/** Resolves stored lists against the catalog. A product no longer sold drops out rather than rendering as a gap. */
function buildWishlists(products: Product[], stored: StoredWishlist[]): Wishlist[] {
  return stored.map((list) => ({
    id: list.id,
    name: list.name,
    ...(list.description && { description: list.description }),
    default: list === defaultList(stored),
    items: list.items.flatMap((item): WishlistItem[] => {
      const product = products.find((candidate) => candidate.slug === item.slug)
      // The slug is the handle within the list: it is what a screen sends back
      // to remove or move the item, and it is unique inside one list.
      return product ? [{ id: item.slug, product, addedAt: item.addedAt }] : []
    }),
  }))
}

/**
 * A name no other list is using. The shopper's own wording wins; a repeat is
 * refused rather than quietly numbered, since 2 lists called "Gifts" is a list
 * picker nobody can use.
 */
function wishlistName(stored: StoredWishlist[], name: string): string {
  const wanted = name.trim().slice(0, MAX_NAME)
  if (!wanted) throw new Error('Give your wishlist a name.')
  if (stored.some((list) => list.name.toLowerCase() === wanted.toLowerCase())) {
    throw new Error(`You already have a wishlist called "${wanted}".`)
  }
  return wanted
}

/** A list as it starts out: named, described, and empty. Promotion is the caller's, since only some paths do it. */
function newWishlist(stored: StoredWishlist[], input: WishlistInput): StoredWishlist {
  return {
    id: Math.random().toString(36).slice(2, 8),
    name: wishlistName(stored, input.name),
    ...(input.description?.trim() && { description: input.description.trim().slice(0, MAX_DESCRIPTION) }),
    items: [],
  }
}

/**
 * The list a heart saves into: the one flagged, or the first, which is what a
 * shopper who has never thought about lists has. `undefined` only for a shopper
 * with no lists at all.
 */
function defaultList(stored: StoredWishlist[]): StoredWishlist | undefined {
  return stored.find((list) => list.default) ?? stored[0]
}

/** Points new saves at one list, and takes the flag off whichever list held it. */
function promote(stored: StoredWishlist[], wanted: StoredWishlist): StoredWishlist {
  for (const list of stored) delete list.default
  wanted.default = true
  return wanted
}

function countItems(stored: StoredWishlist[]): number {
  return stored.reduce((total, list) => total + list.items.length, 0)
}

/** Today, as `YYYY-MM-DD`. A real backend stamps this from its own clock. */
function today(): string {
  return new Date().toISOString().slice(0, 10)
}

function encodeWishlists(stored: StoredWishlist[]): string {
  const token = Buffer.from(JSON.stringify(stored), 'utf8').toString('base64url')
  if (token.length > MAX_TOKEN_LENGTH) {
    throw new Error('Your wishlists are full. Remove something, or shorten a description, to save more.')
  }
  return token
}

/** Anything unreadable (a hand-edited cookie, an older token) is no lists, never a crash. */
function decodeWishlists(token: string | null): StoredWishlist[] {
  if (!token) return []

  try {
    const parsed: unknown = JSON.parse(Buffer.from(token, 'base64url').toString('utf8'))
    if (!Array.isArray(parsed)) return []

    const lists = parsed.filter(isStoredWishlist).slice(0, MAX_LISTS)
    // Normalized here, so every operation below works against exactly 1 default:
    // a token written before this field existed carries none, and deleting the
    // default list leaves none behind.
    const wanted = defaultList(lists)
    if (wanted) promote(lists, wanted)
    return lists
  } catch {
    return []
  }
}

function isStoredWishlist(value: unknown): value is StoredWishlist {
  if (typeof value !== 'object' || value === null) return false
  const list = value as Partial<StoredWishlist>
  if (typeof list.id !== 'string' || typeof list.name !== 'string' || !Array.isArray(list.items)) return false

  list.items = list.items.filter(isStoredItem).slice(0, MAX_ITEMS)
  return true
}

function isStoredItem(value: unknown): value is StoredItem {
  if (typeof value !== 'object' || value === null) return false
  const item = value as Partial<StoredItem>
  return typeof item.slug === 'string' && typeof item.addedAt === 'string'
}
