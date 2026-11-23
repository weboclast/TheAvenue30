import type { PostAuthor } from '@/lib/blog/blog'

/**
 * Who writes the Fashion journal. Keyed by id, which is what a post carries.
 * Demo content: the names and bios go when a real journal replaces them, and
 * none carries a portrait because the journal's bylines are text.
 */
export const fashionPostAuthors: Record<string, PostAuthor> = {
  'ida-lund': {
    id: 'ida-lund',
    name: 'Ida Lund',
    role: 'Style editor',
    bio: 'Dresses the lookbooks and writes about how the pieces go together. Owns 3 coats and wears 1 of them.',
  },
  'nora-vang': {
    id: 'nora-vang',
    name: 'Nora Vang',
    role: 'Head of repairs',
    bio: 'Runs the repairs counter at the back of the Bredgade store. Has mended thousands of sweaters and remembers most of them.',
  },
  'rui-teixeira': {
    id: 'rui-teixeira',
    name: 'Rui Teixeira',
    role: 'Production lead, Porto',
    bio: 'Works between our 3 ateliers in northern Portugal and the mills that supply them. Knows every machine by the sound it makes.',
  },
  'mette-holm': {
    id: 'mette-holm',
    name: 'Mette Holm',
    role: 'Co-founder',
    bio: 'Started the company with Jonas Kjær in 2016, in a Copenhagen basement with 12 patterns and 1 borrowed sewing machine.',
  },
}
