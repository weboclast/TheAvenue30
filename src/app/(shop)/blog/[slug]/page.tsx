import { Suspense } from 'react'
import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from '@appica/ui-react/breadcrumb'
import { Skeleton } from '@appica/ui-react/skeleton'
import { PostBody } from '@/components/blog/post-body'
import { ShareButtons } from '@/components/blog/share-buttons'
import { BLOG_PATH, blogCategoryPath } from '@/components/fashion/blog/blog-paths'
import { PostRow, PostRowSkeleton, ROW_LENGTH } from '@/components/fashion/blog/post-row'
import { Eyebrow } from '@/components/fashion/eyebrow'
import { ProductShelf, ProductShelfSkeleton } from '@/components/fashion/product/product-shelf'
import { getBlog } from '@/lib/blog'
import { readingMinutes } from '@/lib/blog/blog'
import { getCommerce } from '@/lib/commerce'
import { formatDate } from '@/lib/commerce/format'
import { getDepartment } from '@/lib/departments'
import { cn } from '@/lib/utils'
import { toCardProduct } from '@/lib/commerce/card-product'

/** The reading column, and the figures in it. */
const READING = 'mx-auto w-full max-w-2xl'
const FIGURE_SIZES = '(min-width: 42rem) 672px, 92vw'

/** The cover runs wider than the text, and stops short of the container so a 4:3 photograph stays under a screen tall. */
const COVER = 'mx-auto h-auto w-full max-w-5xl rounded-sm'
const COVER_SIZES = '(min-width: 64rem) 1024px, 92vw'

const ARTICLE = 'container flex flex-col gap-10 pt-6 pb-16 md:gap-12 md:pt-8 md:pb-20 lg:pt-10 xl:pb-24'

const SHOP_TITLE = 'Shop the story'
const RELATED_TITLE = 'Keep reading'

export async function generateMetadata({ params }: PageProps<'/blog/[slug]'>): Promise<Metadata> {
  const post = await getBlog('fashion').getPost((await params).slug)
  if (!post) notFound()

  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      type: 'article',
      title: post.title,
      description: post.excerpt,
      images: post.image ? [post.image.src] : undefined,
      publishedTime: post.publishedAt,
      authors: [post.author.name],
    },
  }
}

/**
 * One story: a centered head, the cover, and the body in a reading column, then
 * the products it names and what to read next. The story streams behind a
 * skeleton so the chrome paints first; the products and the related row stream
 * separately, since neither is on the way to reading it.
 */
export default async function FashionPostPage({ params }: PageProps<'/blog/[slug]'>) {
  const { slug } = await params

  return (
    <main className="flex flex-1 flex-col">
      <Suspense fallback={<ArticleSkeleton />}>
        <Article slug={slug} />
      </Suspense>

      <Suspense fallback={<PostRowSkeleton title={RELATED_TITLE} />}>
        <RelatedStories slug={slug} />
      </Suspense>
    </main>
  )
}

async function Article({ slug }: { slug: string }) {
  const [post, department] = await Promise.all([getBlog('fashion').getPost(slug), getDepartment('fashion')])
  if (!post) notFound()

  const productSlugs = post.productSlugs ?? []

  return (
    <>
      <article className={ARTICLE}>
        <header className="flex flex-col items-center gap-4 text-center md:gap-6">
          <Breadcrumb>
            <BreadcrumbList className="justify-center">
              <BreadcrumbItem>
                <BreadcrumbLink render={<Link href={department ? `/${department.slug}` : '/'} />}>Home</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink render={<Link href={BLOG_PATH} />}>Journal</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink render={<Link href={blogCategoryPath(post.category.slug)} />}>
                  {post.category.name}
                </BreadcrumbLink>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <div className="flex max-w-4xl flex-col items-center gap-4">
            <h1 className="text-foreground-intense text-3xl font-medium text-balance md:text-5xl">{post.title}</h1>
            <p className="max-w-2xl text-lg text-pretty md:text-xl">{post.excerpt}</p>
          </div>

          <Eyebrow className="flex flex-wrap justify-center gap-x-4 gap-y-1">
            <span>By {post.author.name}</span>
            <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>
            <span>{readingMinutes(post.body)} min read</span>
          </Eyebrow>
        </header>

        {/* Uncropped: the photograph is published at the ratio it is shown at. */}
        {post.image ? (
          <Image
            src={post.image.src}
            alt={post.image.alt}
            width={post.image.width}
            height={post.image.height}
            preload
            sizes={COVER_SIZES}
            className={COVER}
          />
        ) : null}

        <PostBody blocks={post.body} figureSizes={FIGURE_SIZES} className={READING} />

        <footer className={cn(READING, 'flex flex-col gap-8 border-t pt-8')}>
          <div className="flex flex-col gap-3">
            <Eyebrow>Share this story</Eyebrow>
            <ShareButtons title={post.title} />
          </div>

          {post.author.bio ? (
            <div className="flex flex-col gap-1">
              <Eyebrow className="mb-2">Written by</Eyebrow>
              <p className="text-foreground-intense text-lg font-medium">{post.author.name}</p>
              <p className="text-foreground-muted">{post.author.role}</p>
              <p className="mt-2 text-pretty">{post.author.bio}</p>
            </div>
          ) : null}
        </footer>
      </article>

      {productSlugs.length > 0 ? (
        <Suspense
          fallback={
            <section className="pb-16 md:pb-20 xl:pb-24">
              <ProductShelfSkeleton title={SHOP_TITLE} />
            </section>
          }
        >
          <ShopTheStory slugs={productSlugs} />
        </Suspense>
      ) : null}
    </>
  )
}

/** The products the story names, in the order it names them. A slug that has left the catalog is skipped. */
async function ShopTheStory({ slugs }: { slugs: string[] }) {
  const { products } = await getCommerce('fashion').listProducts({ slugs, inStock: true })
  if (products.length === 0) return null

  return (
    <section className="pb-16 md:pb-20 xl:pb-24">
      <ProductShelf title={SHOP_TITLE} products={products.map(toCardProduct)} />
    </section>
  )
}

async function RelatedStories({ slug }: { slug: string }) {
  const posts = await getBlog('fashion').getRelatedPosts(slug, ROW_LENGTH)
  return <PostRow title={RELATED_TITLE} posts={posts} />
}

/** The story while it streams, on the same column widths, each block at its type ramp's height. */
function ArticleSkeleton() {
  return (
    <div className={ARTICLE}>
      <div className="flex flex-col items-center gap-6">
        <Skeleton className="h-5 w-56" />
        <div className="flex w-full max-w-4xl flex-col items-center gap-4">
          <Skeleton className="h-9 w-full md:h-12" />
          <Skeleton className="h-9 w-2/3 md:h-12" />
          <Skeleton className="h-7 w-full max-w-2xl" />
        </div>
        <Skeleton className="h-5 w-72" />
      </div>

      <Skeleton className={cn(COVER, 'aspect-4/3')} />

      <div className={cn(READING, 'flex flex-col gap-4')}>
        {Array.from({ length: 8 }, (_, index) => (
          <Skeleton key={index} className="h-6 w-full last:w-1/2 md:h-7" />
        ))}
      </div>
    </div>
  )
}
