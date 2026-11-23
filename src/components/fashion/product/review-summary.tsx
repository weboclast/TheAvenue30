'use client'

import { useState } from 'react'
import { ThumbDown, ThumbDownFilled, ThumbUp, ThumbUpFilled } from '@appica/icons-react'
import { Badge } from '@appica/ui-react/badge'
import { Button } from '@appica/ui-react/button'
import {
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@appica/ui-react/drawer'
import { GradientGlow } from '@appica/ui-react/gradient-glow'
import { useDirection } from '@appica/ui-react/hooks/use-direction'
import { Meter, MeterLabel, MeterProgress, MeterValue } from '@appica/ui-react/meter'
import { ScrollArea } from '@appica/ui-react/scroll-area'
import { AiSparkle } from '@/components/ai-sparkle'
import { CaretSwap } from '@/components/fashion/caret-swap'
import { PillGroup, PillOption } from '@/components/fashion/pill-group'
import { FIT_ANSWERS, FitScale } from '@/components/fashion/product/fit-scale'
import {
  DRAWER_BODY,
  DRAWER_FOOTER,
  DRAWER_HEADER,
  DRAWER_SCROLL_INSET,
} from '@/components/fashion/product/review-drawer'
import { IconBurst, useIconBurst } from '@/components/icon-burst'
import { WIDE_OVERLAY_WIDTH } from '@/components/overlay-sheet'
import type { ProductFit, ProductReviewSummary, ReviewSentiment, ReviewTopic } from '@/lib/commerce/types'
import { cn } from '@/lib/utils'

/** The 2 sides a topic can land on, as this summary names them. */
const SIDES: Record<ReviewSentiment, string> = {
  positive: 'Loved for',
  negative: 'Worth knowing',
}

interface ReviewSummaryProps {
  summary: ProductReviewSummary
  /** Where reviewers put the fit, for the breakdown in the drawer. */
  fit?: ProductFit
  /** Called when a shopper rates the summary, for stores that log it. */
  onFeedback?: (helpful: boolean) => void
  className?: string
}

/**
 * The assistant's read on a product's reviews, in the order a clothes shopper
 * asks: the gist, how it fits and what size to take, what people love, and what
 * is worth knowing. The drawer adds the fit breakdown and reviewers' own words.
 *
 * It arrives as data with the reviews, so nothing is generated in the browser;
 * `commerce/programs/reviews.ts` is where a store plugs its own model in.
 */
export function ReviewSummary({ summary, fit, onFeedback, className }: ReviewSummaryProps) {
  const rtl = useDirection() === 'rtl'
  const [open, setOpen] = useState(false)
  const [helpful, setHelpful] = useState<boolean>()
  const { bursting, burst } = useIconBurst()

  const rate = (next: boolean) => {
    setHelpful(next)
    burst()
    onFeedback?.(next)
  }

  return (
    <>
      <GradientGlow glow={false} border borderWidth={2} className={cn('rounded-sm', className)}>
        <div data-slot="review-summary" className="bg-background flex flex-col gap-4 rounded-sm p-6">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-foreground-intense flex items-center gap-2 text-lg font-medium">
              <AiSparkle className="size-5" />
              Review summary
            </h3>
            <Button variant="ghost" className="group -me-3" onClick={() => setOpen(true)}>
              Details
              <CaretSwap data-icon="end" />
            </Button>
          </div>

          <p className="text-pretty">{summary.text}</p>

          {summary.sizing ? (
            <SummaryPart label="Sizing">
              <p className="text-pretty">{summary.sizing}</p>
            </SummaryPart>
          ) : null}
          <TopicPart topics={summary.topics} sentiment="positive" />
          <TopicPart topics={summary.topics} sentiment="negative" />
        </div>
      </GradientGlow>

      <Drawer side={rtl ? 'left' : 'right'} open={open} onOpenChange={setOpen}>
        <DrawerContent className={WIDE_OVERLAY_WIDTH} closeLabel="Close summary">
          <DrawerHeader className={DRAWER_HEADER}>
            <DrawerTitle className="flex items-center gap-2 font-medium">
              <AiSparkle className="size-7" />
              Review summary
            </DrawerTitle>
            <DrawerDescription className="text-base">
              Written from this product&rsquo;s reviews, and rewritten as new ones land.
            </DrawerDescription>
          </DrawerHeader>

          <DrawerBody className={DRAWER_BODY}>
            <ScrollArea className="h-full" scrollbarVisibility="auto">
              <div className={cn('flex flex-col gap-8', DRAWER_SCROLL_INSET)}>
                <p className="text-pretty">{summary.text}</p>

                {fit ? (
                  <section className="flex flex-col gap-4">
                    <h3 className="text-foreground-intense text-lg font-medium">Fit and sizing</h3>
                    <FitScale fit={fit} variant="labeled" />
                    <div className="flex flex-col gap-2.5">
                      {FIT_ANSWERS.map(({ value, label }) => (
                        <Meter key={value} value={(fit.counts[value] / fit.total) * 100} className="gap-y-1 text-sm">
                          <MeterLabel>{label}</MeterLabel>
                          <MeterValue className="text-foreground-intense font-medium" />
                          <MeterProgress />
                        </Meter>
                      ))}
                    </div>
                    {summary.sizing ? <p className="text-foreground-intense text-pretty">{summary.sizing}</p> : null}
                  </section>
                ) : null}

                <QuoteSection summary={summary} sentiment="positive" />
                <QuoteSection summary={summary} sentiment="negative" />
              </div>
            </ScrollArea>
          </DrawerBody>

          <DrawerFooter className={cn(DRAWER_FOOTER, 'flex-row flex-wrap items-center justify-center gap-3')}>
            <p>Was this summary helpful?</p>
            <PillGroup
              aria-label="Was this summary helpful?"
              value={helpful === undefined ? undefined : String(helpful)}
              onValueChange={(next) => rate(next === 'true')}
              className="gap-2"
            >
              <PillOption value="true" size="sm">
                {/* The burst is thrown from its positioned ancestor, so it rides the icon. */}
                <span data-icon="start" className="relative grid shrink-0">
                  {helpful === true ? <ThumbUpFilled /> : <ThumbUp />}
                  {bursting && helpful === true ? <IconBurst /> : null}
                </span>
                Yes
              </PillOption>
              <PillOption value="false" size="sm">
                <span data-icon="start" className="relative grid shrink-0">
                  {helpful === false ? <ThumbDownFilled /> : <ThumbDown />}
                  {bursting && helpful === false ? <IconBurst /> : null}
                </span>
                No
              </PillOption>
            </PillGroup>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </>
  )
}

/** A labeled line of the card. */
function SummaryPart({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <p className="text-foreground-intense font-medium">{label}</p>
      {children}
    </div>
  )
}

/** The topics on one side, as pills. Nothing renders where nobody raised one. */
function TopicPart({ topics, sentiment }: { topics: ReviewTopic[]; sentiment: ReviewSentiment }) {
  const side = topics.filter((topic) => topic.sentiment === sentiment)
  if (!side.length) return null

  return (
    <SummaryPart label={SIDES[sentiment]}>
      <TopicPills topics={side} />
    </SummaryPart>
  )
}

/** Topics with how many reviews raised each. They report rather than filter, so they are badges, not buttons. */
function TopicPills({ topics }: { topics: ReviewTopic[] }) {
  return (
    <ul className="flex flex-wrap gap-1">
      {topics.map((topic) => (
        <li key={topic.label}>
          <Badge variant="soft" size="lg" className="text-xs">
            {topic.label}
            <span className="text-foreground-subtle">{topic.count}</span>
          </Badge>
        </li>
      ))}
    </ul>
  )
}

/** One side's topics with a reviewer's own words behind each. */
function QuoteSection({ summary, sentiment }: { summary: ProductReviewSummary; sentiment: ReviewSentiment }) {
  const topics = summary.topics.filter((topic) => topic.sentiment === sentiment)
  const quotes = summary.highlights.filter((highlight) => highlight.sentiment === sentiment)
  if (!topics.length) return null

  return (
    <section className="flex flex-col gap-3">
      <h3 className="text-foreground-intense text-lg font-medium">{SIDES[sentiment]}</h3>
      <TopicPills topics={topics} />
      {quotes.length ? (
        <ul className="flex flex-col gap-2">
          {quotes.map((quote) => (
            <li key={quote.topic} className="text-pretty">
              <span className="text-foreground-intense font-medium">{quote.topic}:</span> &ldquo;{quote.quote}&rdquo;
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  )
}
