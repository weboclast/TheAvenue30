import { DEMO_ADDRESS } from '@/lib/demo-customer'
import type { StoredProfile } from './profile'

/*
 * What the sample customer has filled in, for a settings page that would
 * otherwise open on nothing but a name and an email.
 *
 * Only the parts an auth adapter cannot know: the name comes from the session,
 * whoever signs in. The phone is the one on the sample home address, so this
 * page and the address book agree. Delete this file with the demo adapters.
 */

/**
 * The sample profile: a number to call, 3 interests, a size profile, the way
 * into the apartment on the sample address, and 2 accounts already linked.
 */
export function demoProfile(): Partial<StoredProfile> {
  return {
    phone: DEMO_ADDRESS.phone,
    contactMethod: 'email',
    interests: ['travel', 'sustainability', 'art'],
    sizes: { tops: 'S', bottoms: '36', shoes: '38' },
    fit: 'regular',
    home: {
      floorsUp: 4,
      lift: true,
      stairs: 'none',
      doorway: 81,
      parking: 'nearby',
      rooms: ['living-room', 'bedroom'],
      notes: 'Buzzer 4B. The lift is 2 m deep, so a sofa goes up on its end.',
    },
    connections: [
      { provider: 'google', account: 'sarah.jenkins@gmail.com' },
      { provider: 'apple', account: 'sarah.jenkins@icloud.com' },
    ],
    twoFactor: true,
  }
}
