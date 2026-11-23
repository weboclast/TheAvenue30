import { FIT_POINTS, fitLean } from '../fit'
import type {
  ProductFit,
  ProductReview,
  ProductReviewSummary,
  Review,
  ReviewAspectSummary,
  ReviewFit,
  ReviewHighlight,
  ReviewSentiment,
  ReviewTopic,
} from '../types'

/*
 * The review summary: the paragraph a shopper reads instead of the first 10
 * reviews, and the structure behind it.
 *
 * This is the fallback, not the feature. A backend that generates its own
 * returns it on `ProductReviewList.summary` and the facade leaves this alone; a
 * store wiring an AI endpoint does the same, generating it during a catalog sync
 * rather than per page view.
 *
 * The one rule this follows is that it invents nothing: scores come from what
 * reviewers scored, counts from what they raised, and every pull-quote is a
 * sentence a reviewer actually wrote.
 */

/** Reviews needed before a summary says anything the page doesn't already show in full. */
const MIN_REVIEWS = 4

/** At or above this rating a review counts as a recommendation in the verdict. */
const RECOMMENDING_RATING = 4

/** Topics the widget lists, about as many as a badge row holds before it wraps twice. */
const MAX_TOPICS = 6

/** Pull-quotes per sentiment, enough to make a case without becoming a second review list. */
const MAX_HIGHLIGHTS = 3

/** Longest a quote may run before it stops being a pull-quote. */
const MAX_QUOTE_LENGTH = 140

/**
 * The assistant's read on a product's reviews, or `undefined` where there are too
 * few to draw one from. Called by the facade for any adapter that returned no
 * summary of its own. `title` names the product in the prose.
 */
export function summarizeReviews(title: string, reviews: ProductReview[]): ProductReviewSummary | undefined {
  if (reviews.length < MIN_REVIEWS) return undefined

  const aspects = averageAspects(reviews)
  const topics = countTopics(reviews)
  const fit = summarizeFit(reviews)

  return {
    text: writeSummary(title, reviews, topics),
    ...(fit && { sizing: sizingAdvice(fit) }),
    aspects,
    topics: topics.slice(0, MAX_TOPICS),
    highlights: pullQuotes(reviews, topics),
  }
}

/** The fit answers `reviews` carry, averaged, or `undefined` where none answered. */
export function summarizeFit(reviews: ProductReview[]): ProductFit | undefined {
  const answers = reviews.flatMap((review) => (review.fit === undefined ? [] : [review.fit]))
  if (!answers.length) return undefined

  const counts = Object.fromEntries(FIT_POINTS.map((point) => [point, 0])) as Record<ReviewFit, number>
  for (const answer of answers) counts[answer] += 1

  const average = answers.reduce<number>((sum, answer) => sum + answer, 0) / answers.length
  return { average, counts, total: answers.length }
}

/** The mean rating over `reviews`, rounded to 1 decimal the way a star cluster shows it. */
export function averageRating(reviews: Review[]): number {
  const total = reviews.reduce((sum, review) => sum + review.rating, 0)
  return Math.round((total / reviews.length) * 10) / 10
}

/** How many reviews awarded each star, keyed `1` to `5`. Stars nobody gave count `0`. */
export function ratingHistogram(reviews: ProductReview[]): Record<number, number> {
  const histogram: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
  for (const review of reviews) histogram[review.rating] += 1
  return histogram
}

/**
 * Each scored dimension as a share of 5, best first. Averaged over its own
 * scorers rather than every review, so a skipped question isn't a zero.
 */
function averageAspects(reviews: ProductReview[]): ReviewAspectSummary[] {
  const totals = new Map<string, { label: string; sum: number; count: number }>()

  for (const review of reviews) {
    for (const aspect of review.aspects ?? []) {
      const entry = totals.get(aspect.id) ?? { label: aspect.label, sum: 0, count: 0 }
      entry.sum += aspect.score
      entry.count += 1
      totals.set(aspect.id, entry)
    }
  }

  return [...totals]
    .map(([id, { label, sum, count }]) => ({ id, label, rate: sum / count / 5 }))
    .sort((a, b) => b.rate - a.rate)
}

/**
 * Every topic reviewers raised, most-mentioned first, leaning whichever way more
 * of them came down on. The leaning is the point: "Battery life (4)" alone says
 * nothing a shopper can act on.
 */
function countTopics(reviews: ProductReview[]): ReviewTopic[] {
  const totals = new Map<string, { praise: number; criticism: number }>()

  const tally = (label: string, side: 'praise' | 'criticism') => {
    const entry = totals.get(label) ?? { praise: 0, criticism: 0 }
    entry[side] += 1
    totals.set(label, entry)
  }

  for (const review of reviews) {
    for (const label of review.praises ?? []) tally(label, 'praise')
    for (const label of review.criticisms ?? []) tally(label, 'criticism')
  }

  return [...totals]
    .map(([label, { praise, criticism }]) => ({
      label,
      count: praise + criticism,
      // A tie goes to praise.
      sentiment: (praise >= criticism ? 'positive' : 'negative') as ReviewSentiment,
    }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label))
}

/**
 * One reviewer's own words per topic, so the claims above can be checked rather
 * than taken on trust.
 *
 * Praise is drawn only from reviewers who praised the topic and criticism only
 * from those who criticized it, so a quote can never contradict its heading. A
 * topic nobody put into words is left out rather than illustrated with an
 * unrelated sentence. Rating breaks the tie among the rest.
 */
function pullQuotes(reviews: ProductReview[], topics: ReviewTopic[]): ReviewHighlight[] {
  const highlights: ReviewHighlight[] = []

  const collect = (sentiment: ReviewSentiment) => {
    // Scoped to one list, so a mixed review can be quoted under both headings.
    const quoted = new Set<string>()

    for (const topic of topics.filter((candidate) => candidate.sentiment === sentiment)) {
      if (highlights.filter((entry) => entry.sentiment === sentiment).length >= MAX_HIGHLIGHTS) break

      const quote = reviews
        .filter((review) => {
          const raised = sentiment === 'positive' ? review.praises : review.criticisms
          return !quoted.has(review.id) && raised?.includes(topic.label)
        })
        .sort((a, b) => (sentiment === 'positive' ? b.rating - a.rating : a.rating - b.rating))
        .flatMap((review) => {
          const sentence = quoteFor(review, topic.label)
          return sentence ? [{ review, sentence }] : []
        })[0]
      if (!quote) continue

      quoted.add(quote.review.id)
      highlights.push({ topic: topic.label, sentiment, quote: quote.sentence })
    }
  }

  collect('positive')
  collect('negative')
  return highlights
}

/**
 * The sentence in which this reviewer named `topic`, or `undefined` where they
 * never did. Matched on the topic's own words, so `'Battery life'` finds the
 * sentence about the battery rather than the one about the screen.
 */
function quoteFor(review: ProductReview, topic: string): string | undefined {
  const sentences = review.body.match(/[^.!?]+[.!?]*/g)?.map((sentence) => sentence.trim()) ?? [review.body]
  const words = topic
    .toLowerCase()
    .split(/[^a-z]+/)
    .filter((word) => word.length > 3)

  const named = sentences.find((sentence) => words.some((word) => sentence.toLowerCase().includes(word)))
  return named && trimQuote(named)
}

/** A sentence cut to something quotable, at a word boundary rather than mid-word. */
function trimQuote(sentence: string): string {
  if (sentence.length <= MAX_QUOTE_LENGTH) return sentence

  const cut = sentence.slice(0, MAX_QUOTE_LENGTH)
  return `${cut.slice(0, cut.lastIndexOf(' '))}…`
}

/**
 * The paragraph itself: how the set scored, what it was mostly about, and what
 * the dissenters said. The one sentence that could read as spin ("customers
 * recommend it") is spent only where the ratings earn it, so a product reviewers
 * are lukewarm about gets a lukewarm paragraph.
 */
function writeSummary(title: string, reviews: ProductReview[], topics: ReviewTopic[]): string {
  const rating = averageRating(reviews)
  const recommended = reviews.filter((review) => review.rating >= RECOMMENDING_RATING).length / reviews.length

  const verdict =
    recommended >= 0.8
      ? `customers recommend the ${title} without much reservation`
      : recommended >= 0.5
        ? `most customers are happy with the ${title}, with a few clear reservations`
        : `customers are split on the ${title}`

  const praised = topics.filter((topic) => topic.sentiment === 'positive').slice(0, 3)
  const raised = topics.filter((topic) => topic.sentiment === 'negative').slice(0, 2)

  const sentences = [`Based on ${reviews.length} reviews averaging ${rating} stars, ${verdict}.`]

  if (praised.length) {
    const labels = joinLabels(praised.map((topic) => topic.label.toLowerCase()))
    sentences.push(`${labels} ${praised.length > 1 ? 'come' : 'comes'} up most often in their favor.`)
  }
  if (raised.length) {
    const labels = joinLabels(raised.map((topic) => topic.label.toLowerCase()))
    sentences.push(`${labels} ${raised.length > 1 ? 'are' : 'is'} where the criticism lands.`)
  }

  const verified = reviews.filter((review) => review.verified).length
  if (verified) sentences.push(`${verified} of these reviews are from verified purchases.`)

  return sentences.join(' ')
}

/**
 * The sizing advice, leaning the way the fit scale on the page does. It says
 * "most" only where most reviewers picked true to size.
 */
function sizingAdvice({ average, counts, total }: ProductFit): string {
  const lean = fitLean(average)
  if (lean === 0) {
    return counts[0] * 2 > total
      ? 'Most reviewers found it true to size, so take your usual one.'
      : 'On balance it fits true to size, so take your usual one.'
  }

  const degree = Math.abs(average) < 1 ? 'a little ' : ''
  return lean < 0
    ? `Reviewers found it runs ${degree}small, so consider a size up.`
    : `Reviewers found it runs ${degree}large, so consider a size down.`
}

/** `['a', 'b', 'c']` → `'a, b, and c'`, with the sentence's own capital left to the caller. */
function joinLabels(labels: string[]): string {
  const list = new Intl.ListFormat('en-US', { style: 'long', type: 'conjunction' }).format(labels)
  return list.charAt(0).toUpperCase() + list.slice(1)
}
