# Blog

The seam to whatever publishes posts. Client-safe: `blog.ts`, with the page
size, the category parameter, and the URL helpers.

- **`ContentAdapter` is not the commerce adapter, on purpose.** A store's CMS and
  its commerce backend are often 2 products, so each is bound in its own
  `config.ts` and swapped without the other. A `listPosts` on the commerce
  adapter would make every commerce backend implement a CMS.
- **Nothing here imports from `@/lib/commerce`**, which keeps the module liftable
  onto a site that sells nothing. That is why `PostImage` restates the 4 fields
  of `ProductImage`. Don't "fix" it.
- **The blog meets the catalog in 1 place: `Post.productSlugs`**, resolved by the
  article page through `getCommerce(demo).listProducts({ slugs })`. A slug the
  catalog dropped comes back as nothing, and the row shrinks.
- **A post files under exactly 1 `category`**, which the chip row and the
  breadcrumb name. `tags` are free labels a card may show, and nothing filters
  by them: a tag that deserves a listing is a category.
- **A listing returns `PostSummary`, and an article returns `Post`**, so a card
  never asks a CMS for a body.
- **A body is `PostBlock[]`, not HTML**, rendered with the storefront's own
  components, so dark mode, RTL, and the type scale hold. A backend that only
  hands out markup returns 1 `html` block. Use `html` only in an adapter, never
  in demo data or for anything a visitor typed.
- **`image` is optional, and that is the ordinary case.** `PostMedia` fills the
  same 4:3 frame with a gradient of 2 neutral tokens, so listings are plain grids
  and no placeholder files ship. Only `listFeatured` insists on a photo, through
  `PostQuery.withImage`.
- **`listFeatured` has no fallback, and `getRelatedPosts` is all fallback.** The
  homepage row is handpicked posts with an image, and renders nothing until one
  is picked. Related posts take `relatedSlugs`, then the section, then the blog,
  each step only topping the row up. `getLead` sits between: the handpicked
  lead, or else the newest.
- **Derived reads compose `listPosts`** rather than sitting on the adapter, where
  every backend would have to implement them. Add the next one here too.
- **A section is a route, and the page is a parameter.** `/blog/category/guides`
  gives the breadcrumb a name and is crawlable, and `category/` keeps a section
  from colliding with an article at the blog root. Each demo's
  `components/<demo>/blog/blog-paths.ts` builds its URLs, and only `blog.ts`
  knows how `?page=` is spelled.
- **A demo with no blog returns an empty listing** rather than throwing.
- **No `products` block yet.** It is the natural next `PostBlock`, for picks
  placed between paragraphs, and is left out so there is 1 way to show them.

Demo stand-in: `adapters/demo/`. A real backend implements `ContentAdapter` and
binds it in `config.ts`.
