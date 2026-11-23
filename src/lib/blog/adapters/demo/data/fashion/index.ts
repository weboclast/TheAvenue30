import type { ContentDataset } from '../dataset'
import { fashionPostAuthors } from './authors'
import { fashionPostCategories } from './categories'
import { fashionPosts } from './posts'

/** The Fashion journal. */
export const fashionContent: ContentDataset = {
  posts: fashionPosts,
  categories: fashionPostCategories,
  authors: fashionPostAuthors,
}
