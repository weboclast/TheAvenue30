/*
 * What the store may send a shopper, and where it arrives.
 *
 * Not on the commerce adapter: preferences belong to whatever sends the messages
 * (an email platform, your own subscribers table), which a store picks
 * separately from its backend. This file is the seam instead, and the page renders whatever
 * is listed here, so adding a topic is an edit here and nowhere else.
 *
 * Wiring up a real backend is 2 changes, both outside this file:
 *
 *   1. Read: each storefront's account page that renders the preferences
 *      passes {@link DEFAULT_NOTIFICATION_PREFERENCES}. Fetch the shopper's own there.
 *   2. Write: `components/account/notification-preferences.tsx` keeps changes in
 *      local state. Send them from a Server Action there.
 *
 * The ids are strings, not an enum, so they can match your provider's own keys.
 * Safe on both sides of the network.
 */

/** One way of reaching a shopper. */
export interface NotificationChannel {
  id: string
  label: string
  /** What this channel means in practice, shown under the label. */
  detail: string
  /** Whether the shopper may turn it off. Email carries receipts, so it cannot be. */
  required?: boolean
}

/** One thing the store may send. */
export interface NotificationTopic {
  id: string
  title: string
  description: string
}

/** Everything a shopper opts into. Transactional mail is {@link ESSENTIAL_TOPICS} instead. */
export const MARKETING_TOPICS: NotificationTopic[] = [
  {
    id: 'offers',
    title: 'Exclusive offers',
    description: 'Promo codes, member pricing, and early access to a sale before it opens.',
  },
  {
    id: 'recommendations',
    title: 'Product recommendations',
    description: 'New arrivals picked from what you have browsed and bought.',
  },
  {
    id: 'back-in-stock',
    title: 'Back in stock',
    description: 'A note when something you saved to a wishlist can be bought again.',
  },
  {
    id: 'price-drops',
    title: 'Price drops',
    description: 'A note when something you saved goes on sale.',
  },
  {
    id: 'events',
    title: 'Sales events',
    description: 'Flash sales, seasonal deals, and product launches, before they start.',
  },
  {
    id: 'review-reminders',
    title: 'Review reminders',
    description: 'A reminder to rate what you bought, a week after it arrives.',
  },
]

/**
 * What is sent whatever the shopper chooses, listed so the page can say so. They
 * answer something the shopper did, which is also what makes them legal to send
 * without consent in most of the world.
 *
 * Never offer a switch beside one: channel choice is the only control here.
 */
export const ESSENTIAL_TOPICS: NotificationTopic[] = [
  {
    id: 'order-updates',
    title: 'Order updates',
    description: 'Confirmations, shipping notices, delivery windows, and refunds.',
  },
  {
    id: 'support-replies',
    title: 'Support replies',
    description: 'Answers to the questions, returns, and address changes you send us.',
  },
  {
    id: 'account-security',
    title: 'Account security',
    description: 'Sign-ins from a new device, and changes to your password or email address.',
  },
]

/** Where a message can arrive, in the order the page offers them. */
export const NOTIFICATION_CHANNELS: NotificationChannel[] = [
  {
    id: 'email',
    label: 'Email',
    detail: 'Where receipts and password resets go, so it cannot be turned off.',
    required: true,
  },
  {
    id: 'sms',
    label: 'SMS',
    detail: 'Delivery-day texts to the number on your account. Message rates may apply.',
  },
  {
    id: 'whatsapp',
    label: 'WhatsApp',
    detail: 'The same delivery notes, in a chat instead of a text.',
  },
  {
    id: 'push',
    label: 'Push notifications',
    detail: 'On this browser, and on any device you allow them on.',
  },
]

/** Everything the account's notification page holds. */
export interface NotificationPreferences {
  /**
   * The single opt-out covering every {@link MARKETING_TOPICS} entry. Off
   * silences all of them whatever {@link topics} says.
   */
  marketing: boolean
  /** Ids of the {@link MARKETING_TOPICS} the shopper is opted into. */
  topics: string[]
  /** Ids of the {@link NOTIFICATION_CHANNELS} messages may arrive on. */
  channels: string[]
}

/**
 * What an account starts on. Opted into the topics tied to something the shopper
 * already did, out of the broadcast ones.
 */
export const DEFAULT_NOTIFICATION_PREFERENCES: NotificationPreferences = {
  marketing: true,
  topics: ['recommendations', 'back-in-stock', 'price-drops'],
  channels: ['email', 'push'],
}
