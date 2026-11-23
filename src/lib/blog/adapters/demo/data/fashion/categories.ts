import type { PostCategory } from '@/lib/blog/blog'

/**
 * The Fashion journal's sections, in the order the listing offers them. A post
 * names one by slug; the adapter drops any section nothing is filed under.
 *
 * Named for what a reader comes to do, the way clothing journals file theirs:
 * wear it, look after it, see where it is made, hear from the people behind it.
 */
export const fashionPostCategories: PostCategory[] = [
  {
    slug: 'style-notes',
    name: 'Style notes',
    description: 'How to wear it, what to wear it with, and how it should fit.',
  },
  {
    slug: 'care-and-repair',
    name: 'Care & repair',
    description: 'Washing, storing, and mending, so what you own outlasts the season you bought it in.',
  },
  {
    slug: 'the-making',
    name: 'The making',
    description: 'Where the cloth comes from, who sews it, and why it is made the way it is.',
  },
  {
    slug: 'conversations',
    name: 'Conversations',
    description: 'The people who make, mend, and wear what we sell, in their own words.',
  },
]
