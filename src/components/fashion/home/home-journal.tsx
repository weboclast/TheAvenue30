import { Suspense } from 'react'
import { BLOG_PATH } from '@/components/fashion/blog/blog-paths'
import { PostRow, PostRowSkeleton, ROW_LENGTH } from '@/components/fashion/blog/post-row'
import { getBlog } from '@/lib/blog'

const TITLE = 'From the journal'

/**
 * The journal's handpicked stories, 4 across the page from `xl`, closing the
 * home page. Every department's home shows the same picks, so each should read
 * for anyone. Renders nothing until a story is picked.
 */
export function HomeJournal() {
  return (
    <Suspense fallback={<PostRowSkeleton title={TITLE} href={BLOG_PATH} />}>
      <FeaturedStories />
    </Suspense>
  )
}

async function FeaturedStories() {
  const posts = await getBlog('fashion').listFeatured(ROW_LENGTH)
  return <PostRow title={TITLE} href={BLOG_PATH} posts={posts} />
}
