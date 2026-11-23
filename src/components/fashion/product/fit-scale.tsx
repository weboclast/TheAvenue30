import { Badge } from '@appica/ui-react/badge'
import { FIT_POINTS, fitLean } from '@/lib/commerce/fit'
import type { ProductFit, ReviewFit } from '@/lib/commerce/types'
import { cn } from '@/lib/utils'

/** What each answer to "How did it fit?" is called, small to large. */
const ANSWERS = ['Very small', 'Small', 'True to size', 'Large', 'Very large']

/** What a product's fit reads as overall, by its lean from small to large. */
const VERDICTS = ['Runs small', 'True to size', 'Runs large']

/** One answer on the fit scale, as a reviewer picked it. */
export function fitAnswer(fit: ReviewFit): string {
  return ANSWERS[fit + 2]
}

/** The answers in scale order, for a form asking the question. */
export const FIT_ANSWERS = FIT_POINTS.map((point) => ({ value: point, label: fitAnswer(point) }))

/** A product's fit in 3 words. */
function fitVerdict(fit: ProductFit): string {
  return VERDICTS[fitLean(fit.average) + 1]
}

/** Where an answer sits along the track, as a share of its length. */
function position(average: number): number {
  return (average + 2) / 4
}

/** The answer a mean sits nearest, kept on its verdict's side of the middle so marker and badge agree. */
function nearestAnswer(average: number): number {
  return fitLean(average) * Math.min(2, Math.max(1, Math.round(Math.abs(average))))
}

interface FitScaleProps {
  fit: ProductFit
  /**
   * `compact` hangs the verdict under a marker at the mean, for the buy box.
   * `labeled` names both ends and the middle, and sets the marker on the answer
   * nearest the mean, so a true-to-size fit lines up with its label.
   * @default 'compact'
   */
  variant?: 'compact' | 'labeled'
  className?: string
}

/**
 * Where reviewers put the fit, on a track from small to large marked where
 * their answers land. A picture of a number, so it is named as one image: the
 * verdict and how many answered.
 */
export function FitScale({ fit, variant = 'compact', className }: FitScaleProps) {
  const at = position(variant === 'labeled' ? nearestAnswer(fit.average) : fit.average)
  const lean = fitLean(fit.average)
  const verdict = fitVerdict(fit)

  return (
    <div
      role="img"
      aria-label={`Fit: ${verdict.toLowerCase()}, from ${fit.total} ${fit.total === 1 ? 'review' : 'reviews'}`}
      className={cn('flex flex-col gap-2', className)}
    >
      <div aria-hidden className="bg-background-strong relative h-1 rounded-full">
        {variant === 'labeled'
          ? FIT_POINTS.map((point) => (
              <span
                key={point}
                className="bg-foreground-subtle absolute top-0 size-1 -translate-x-1/2 rounded-full rtl:translate-x-1/2"
                style={{ insetInlineStart: `${position(point) * 100}%` }}
              />
            ))
          : null}
        <span
          className="bg-primary absolute inset-y-0 w-6 -translate-x-1/2 rounded-full rtl:translate-x-1/2"
          // Held on the track at either end: `0.75rem` is half the marker's `w-6`.
          style={{ insetInlineStart: `clamp(0.75rem, ${at * 100}%, calc(100% - 0.75rem))` }}
        />
      </div>

      {variant === 'labeled' ? (
        <div aria-hidden className="flex items-center justify-between gap-2">
          {VERDICTS.map((label, index) => (
            <Badge key={label} variant={index === lean + 1 ? 'primary' : 'outline'}>
              {label}
            </Badge>
          ))}
        </div>
      ) : (
        // Clamped, so a verdict near either end stays on the track.
        <div aria-hidden className="relative h-5">
          <Badge
            variant="primary"
            className="absolute -translate-x-1/2 rtl:translate-x-1/2"
            style={{ insetInlineStart: `${Math.min(Math.max(at, 0.15), 0.85) * 100}%` }}
          >
            {verdict}
          </Badge>
        </div>
      )}
    </div>
  )
}
