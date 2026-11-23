# Reviews

A shopper's own reviews: what they wrote, and what they bought and haven't
reviewed yet. Client-safe: `reviews.ts`, with the tabs, the sorts, and the URL
helpers.

- **A `ShopperReview` is not a `ProductReview`.** The commerce type is a review as
  the catalog publishes it, and this one is the same review as its author sees
  it, with the order behind it and what it paid. A backend answers the 2 with
  different queries.
- **Not on the commerce adapter**, but the reads still take a `demo`, because the
  orders a review hangs off are a storefront's.
- **What awaits a review is derived, never stored.** `listReviewable` takes the
  delivered orders and subtracts what was written about, so a prompt cannot
  outlive its review.
- **Only a delivered order is offered**, the same rule that holds an order's
  points back until delivery.
- **The tab, the sort, and the page live in the query string**, and only
  `reviews.ts` knows `?tab=`, `?sort=`, and `?page=`. Switching tab drops the
  sort, since the 2 tabs offer different orders.
- **A written review is stored nowhere, on purpose.** Every storefront's panel
  hands the same `ReviewDraft`, checked by `validateReview`, to its
  `onReviewSubmit` prop, and a store posts it to its reviews backend. So there is
  no `actions.ts` and no cookie: a body runs to 2,000 characters, and a cookie
  holds 4,096 bytes.
  - Photos and clips arrive as `File` objects. Upload them to a media store
    first, then post the review with what came back.
  - What a review pays is `REWARDS.reviewPoints`, in
    `commerce/programs/rewards.ts`.
- **The rewards ledger reads this module.** `getRewardsBalance` turns each
  published review into a `review` entry, and a review still being checked
  carries no `points`.

Demo stand-in: `demo-reviews.ts`. Its samples name a line of a sample order, so
keep its order numbers in step with `commerce/adapters/demo/order-book.ts`.
