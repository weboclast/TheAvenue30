/*
 * What the Fashion storefront offers on top of its catalog: the shopping
 * assistant's prompts, and nothing else yet. Protection plans, trade-in, and
 * spec comparison are device programs a clothing store has no use for.
 */

/**
 * Prompts for the shopping assistant widget, written in the shopper's voice and
 * kept short: each sits in a chip in a row that scrolls. The widget is on every
 * page, so a prompt may not assume the one the shopper is reading.
 */
const assistant: string[] = [
  'Help me find my size',
  'What is new this week?',
  'Style an outfit for a wedding',
  'Find a gift under $100',
  'How do free repairs work?',
  'Can I collect in store?',
  'Where is my order?',
  'What is your return policy?',
]

/** The Fashion storefront's merchandising programs. */
export const fashionPrograms = { assistant }
