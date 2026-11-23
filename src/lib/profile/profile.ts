/*
 * A shopper's own record: what the store calls them, how to reach a person
 * there, what they are into, what size they take, how a crew gets into their
 * home, and the 2 security settings an account carries.
 *
 * Distinct from `lib/notifications.ts`, which is what the store sends
 * automatically. {@link ContactMethod} is how somebody gets back to a shopper
 * about an order they placed.
 *
 * Safe on both sides of the network. The reads and the writes are `./index.ts`
 * and `./actions.ts`, which are not.
 */

/** One way a shopper is willing to be reached. */
export interface ContactMethod {
  id: string
  label: string
}

/** How the store gets in touch, in the order the form offers them. */
export const CONTACT_METHODS: ContactMethod[] = [
  { id: 'email', label: 'By email' },
  { id: 'phone', label: 'By phone' },
  { id: 'sms', label: 'By text message' },
]

/** What an account starts on. */
export const DEFAULT_CONTACT_METHOD = 'email'

/** One thing a shopper can say they are into, which is what recommendations read. */
export interface Interest {
  id: string
  label: string
}

/** What a shopper can pick from. The form, the summary, and the validation all read it. */
export const INTERESTS: Interest[] = [
  { id: 'travel', label: 'Travel & Adventure' },
  { id: 'sustainability', label: 'Eco-friendly & Sustainability' },
  { id: 'art', label: 'Art & Culture' },
  { id: 'tech', label: 'Tech & Gadgets' },
  { id: 'home', label: 'Home & Interiors' },
  { id: 'fitness', label: 'Fitness & Outdoors' },
  { id: 'beauty', label: 'Beauty & Wellness' },
  { id: 'food', label: 'Food & Cooking' },
]

/** How many a shopper may pick, so the summary row stays a row. */
export const MAX_INTERESTS = 5

/** A kind of garment a shopper keeps a usual size for, and the run it comes in. */
export interface SizeScale {
  id: string
  label: string
  /** The sizing system a number is read in, e.g. `'EU'`. Absent for letter sizes. */
  system?: string
  /** Every size, smallest first, spelled the way the catalog labels them. */
  sizes: string[]
}

/**
 * What a size profile asks about, in the order the form lists them. Each run
 * spans both departments, since a shopper is the same shopper in either.
 */
export const SIZE_SCALES: SizeScale[] = [
  { id: 'tops', label: 'Tops & knitwear', sizes: ['XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL'] },
  {
    id: 'bottoms',
    label: 'Trousers & skirts',
    system: 'EU',
    sizes: ['34', '36', '38', '40', '42', '44', '46', '48', '50', '52', '54'],
  },
  {
    id: 'shoes',
    label: 'Shoes',
    system: 'EU',
    sizes: ['36', '37', '38', '39', '40', '41', '42', '43', '44', '45', '46'],
  },
]

/** How a shopper likes things to fit, which a size recommendation leans on. */
export const FIT_PREFERENCES = [
  { id: 'fitted', label: 'Fitted' },
  { id: 'regular', label: 'Regular' },
  { id: 'relaxed', label: 'Relaxed' },
]

/** The most floors up the form offers. The last option reads as that many or more. */
export const MAX_FLOORS_UP = 10

/** How the stairs to the door run, which decides whether a long piece makes the turn. */
export const STAIRS = [
  { id: 'none', label: 'No stairs' },
  { id: 'straight', label: 'Straight stairs' },
  { id: 'turning', label: 'Stairs with a turn' },
  { id: 'spiral', label: 'Spiral stairs' },
]

/** Where the delivery van can stop. */
export const PARKING = [
  { id: 'outside', label: 'Right outside' },
  { id: 'nearby', label: 'On the street nearby' },
  { id: 'permit', label: 'Needs a permit' },
]

/** The rooms a shopper can say they are furnishing, which recommendations read. */
export const HOME_ROOMS = [
  { id: 'living-room', label: 'Living room' },
  { id: 'bedroom', label: 'Bedroom' },
  { id: 'dining-room', label: 'Dining room' },
  { id: 'home-office', label: 'Home office' },
  { id: 'kids-room', label: "Kids' room" },
  { id: 'outdoor', label: 'Outdoor' },
]

/** The narrowest doorway the form takes, in centimeters. */
export const MIN_DOORWAY = 50

/** The widest. */
export const MAX_DOORWAY = 200

/** Where a note to the delivery crew stops. */
export const MAX_HOME_NOTES = 200

/**
 * The shopper's home as a delivery crew meets it, and the rooms they are
 * furnishing. Every field but the rooms is optional: a shopper fills in what
 * they know.
 */
export interface HomeProfile {
  /** Floors between the street and the front door, `0` at street level. */
  floorsUp?: number
  /** Whether a lift reaches the door. */
  lift?: boolean
  /** How the stairs run, by {@link STAIRS} id. */
  stairs?: string
  /** The narrowest door or passage on the way in, in centimeters. */
  doorway?: number
  /** Where the van stops, by {@link PARKING} id. */
  parking?: string
  /** Ids of the {@link HOME_ROOMS} being furnished. */
  rooms: string[]
  /** Anything else the crew should know, like a buzzer code. */
  notes?: string
}

/**
 * Where a shopper can also sign in from. A union rather than a data list:
 * adding one is an OAuth integration, not an edit to a label.
 */
export const SOCIAL_PROVIDERS = ['google', 'apple', 'facebook'] as const

export type SocialProviderId = (typeof SOCIAL_PROVIDERS)[number]

/**
 * How each provider reads on screen. A `Record` rather than a list, so adding a
 * provider fails to compile until it is named here.
 */
export const SOCIAL_PROVIDER_LABELS: Record<SocialProviderId, string> = {
  google: 'Google',
  apple: 'Apple',
  facebook: 'Facebook',
}

/** A provider linked to this account, as its callback hands it back. */
export interface Connection {
  provider: SocialProviderId
  /**
   * The account at the provider, e.g. the address Google returns. Absent for a
   * provider that hands back nothing worth printing.
   */
  account?: string
}

/** Everything the account settings page shows about the shopper. */
export interface ShopperProfile {
  firstName: string
  lastName: string
  /**
   * The address sign-in uses, which the auth backend owns. No screen here edits
   * it: changing it is a verification round-trip, not a field.
   */
  email: string
  /** Absent until a shopper adds one. */
  phone?: string
  /** Which {@link CONTACT_METHODS} entry the store reaches out on. */
  contactMethod: string
  /** Ids of the {@link INTERESTS} the shopper picked. */
  interests: string[]
  /** The shopper's usual size, by {@link SIZE_SCALES} id. Absent until they say. */
  sizes?: Record<string, string>
  /** How they like things to fit, by {@link FIT_PREFERENCES} id. Absent until they say. */
  fit?: string
  /** The way into the shopper's home, and the rooms they are furnishing. Absent until they say. */
  home?: HomeProfile
  /** Providers this account can also sign in with. */
  connections: Connection[]
  /** Whether a second factor is asked for at sign-in. */
  twoFactor: boolean
}

/** What the seam keeps. The email is missing because the session already carries it. */
export type StoredProfile = Omit<ShopperProfile, 'email'>

/** What the profile dialog may change. The email is deliberately not among them. */
export interface ProfilePatch {
  firstName?: string
  lastName?: string
  /** `null` clears a number the shopper emptied. */
  phone?: string | null
  contactMethod?: string
  interests?: string[]
  /** The whole size profile, replacing the one stored. */
  sizes?: Record<string, string>
  /** `null` clears a fit the shopper took back. */
  fit?: string | null
  /** The whole home profile, replacing the one stored. */
  home?: HomeProfile
}

/** The shopper's name as the store prints it. */
export function profileName({ firstName, lastName }: ShopperProfile): string {
  return `${firstName} ${lastName}`.trim()
}

/** How the chosen contact method reads, or `undefined` for an id the store no longer offers. */
export function contactMethodLabel(id: string): string | undefined {
  return CONTACT_METHODS.find((method) => method.id === id)?.label
}

/** The labels for what a shopper picked, in the order {@link INTERESTS} lists them. */
export function interestLabels(ids: string[]): string[] {
  return INTERESTS.filter(({ id }) => ids.includes(id)).map(({ label }) => label)
}

/** A size as the profile prints it: `"S"`, or `"EU 38"` for a numbered run. */
export function sizeLabel(scale: SizeScale, size: string): string {
  return scale.system ? `${scale.system} ${size}` : size
}

/** How a fit preference reads, or `undefined` for one the store no longer offers. */
export function fitPreferenceLabel(id: string): string | undefined {
  return FIT_PREFERENCES.find((fit) => fit.id === id)?.label
}

/** How far up the door is, e.g. `"At street level"` or `"4 floors up"`. The top of the list reads as a floor. */
export function floorsUpLabel(floors: number): string {
  if (floors === 0) return 'At street level'
  const count = floors === 1 ? '1 floor up' : `${floors} floors up`
  return floors >= MAX_FLOORS_UP ? `${count} or more` : count
}

/** The label behind a {@link STAIRS}, {@link PARKING}, or {@link HOME_ROOMS} id, or `undefined` for one retired. */
export function homeOptionLabel(options: { id: string; label: string }[], id: string): string | undefined {
  return options.find((option) => option.id === id)?.label
}

/** Whether a string names a provider this store offers, for a value that arrived from the browser. */
export function isSocialProviderId(value: string): value is SocialProviderId {
  return SOCIAL_PROVIDERS.includes(value as SocialProviderId)
}
