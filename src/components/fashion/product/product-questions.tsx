'use client'

import { type SubmitEvent, useEffect, useId, useRef, useState } from 'react'
import { ArrowUp } from '@appica/icons-react'
import { Button } from '@appica/ui-react/button'
import { Chip } from '@appica/ui-react/chip'
import { Input } from '@appica/ui-react/input'
import { Spinner } from '@appica/ui-react/spinner'
import { AiSparkle } from '@/components/ai-sparkle'
import { useProductSelection } from '@/components/fashion/product/product-selection'
import type { Product } from '@/lib/commerce/types'
import { cn } from '@/lib/utils'

/** What a question is asked about: the product, and the color and size the shopper has on screen. */
export interface QuestionContext {
  productSlug: string
  color?: string
  size?: string
}

/** One turn in the thread. */
interface Turn {
  from: 'shopper' | 'assistant'
  text: string
}

/** The reply in place of an answer `onAsk` failed to give, so the shopper can ask again. */
const NO_ANSWER = "Sorry, I couldn't answer that just now. Please try again in a moment."

/**
 * The questions offered before the shopper types one, each paired with the spec
 * that answers it. Only those the spec sheet can answer are offered.
 */
const STARTERS = [
  { spec: 'care', question: 'How should I wash it?' },
  { spec: 'fit', question: 'How does it fit?' },
  { spec: 'origin', question: 'Where is it made?' },
  { spec: 'composition', question: 'What is it made of?' },
]

/**
 * Demo scaffolding: answers from the product's own spec sheet and the reviews'
 * sizing advice, the way a model grounded in them would, until a store wires
 * {@link ProductQuestionsProps.onAsk}. Delete it once that is wired.
 */
async function demoAnswer(question: string, product: Product, sizing?: string, model?: string): Promise<string> {
  await new Promise((resolve) => setTimeout(resolve, 900))

  const spec = (id: string) => product.specSheet?.find((entry) => entry.id === id)?.value
  const lowerFirst = (text: string) => text.charAt(0).toLowerCase() + text.slice(1)
  const asked = question.toLowerCase()
  const [care, fit, origin, composition] = ['care', 'fit', 'origin', 'composition'].map(spec)

  if (care && /wash|clean|care|dry|iron/.test(asked)) {
    return `${care}. If it ever needs mending, our free repairs cover it for as long as you own it.`
  }
  if (composition && /material|fabric|made of|composition|wool|cotton|linen|itch/.test(asked)) {
    return `Composition: ${composition}.`
  }
  if (origin && /where|made in|manufactur|origin|country/.test(asked)) {
    return `It's made in ${origin}.`
  }
  if (fit && /fit|size|sizing|runs|tall|length|big|small/.test(asked)) {
    return [`The fit is ${lowerFirst(fit)}.`, sizing, model && `The model ${lowerFirst(model)}.`]
      .filter(Boolean)
      .join(' ')
  }
  return 'Thanks for asking. A stylist is picking this up and will reply here shortly.'
}

interface ProductQuestionsProps {
  /** The reviews' sizing advice, which the demo answer to a fit question quotes. */
  sizing?: string
  /**
   * Answers a question about the product. Return the reply and it lands in the
   * thread; throw, and the thread apologizes instead. Pass a Server Action taking
   * `(question, context)`, which looks the product up by slug and asks the
   * store's model.
   */
  onAsk?: (question: string, context: QuestionContext) => string | Promise<string>
  className?: string
}

/**
 * "Questions?" on the product page: a few questions the product can answer, a
 * field for the shopper's own, and the thread they grow into, all in place.
 *
 * The template ships the surface, not a model. Wire {@link ProductQuestionsProps.onAsk}
 * and its reply is what the shopper reads. Each question carries the color and
 * size on screen, since "will it shrink?" can depend on the dye.
 */
export function ProductQuestions({ sizing, onAsk, className }: ProductQuestionsProps) {
  const { product, color, colorIndex, size } = useProductSelection()
  const titleId = useId()
  const [question, setQuestion] = useState('')
  // Append-only, so a turn's index is a stable key.
  const [thread, setThread] = useState<Turn[]>([])
  const [pending, setPending] = useState(false)
  const threadRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    threadRef.current?.scrollTo({ top: threadRef.current.scrollHeight, behavior: 'smooth' })
  }, [thread, pending])

  const asked = new Set(thread.filter((turn) => turn.from === 'shopper').map((turn) => turn.text))
  const starters = STARTERS.filter(
    ({ spec, question: starter }) => !asked.has(starter) && product.specSheet?.some((entry) => entry.id === spec),
  ).slice(0, 3)

  const ask = async (text: string) => {
    setThread((turns) => [...turns, { from: 'shopper', text }])
    setPending(true)
    const context = { productSlug: product.slug, color: color?.name, size: size?.label }
    // The spec sheet's model line describes whoever wears the first color.
    const model = colorIndex === 0 ? product.specSheet?.find((spec) => spec.id === 'model')?.value : undefined
    let answer = NO_ANSWER
    try {
      answer = await (onAsk?.(text, context) ?? demoAnswer(text, product, sizing, model))
    } catch (error) {
      console.error('The product question got no answer, so the thread apologized instead.', error)
    }
    setThread((turns) => [...turns, { from: 'assistant', text: answer }])
    setPending(false)
  }

  const handleSubmit = (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault()
    const text = question.trim()
    if (!text || pending) return
    setQuestion('')
    void ask(text)
  }

  return (
    <div data-slot="product-questions" className={cn('flex flex-col gap-2', className)}>
      <section aria-labelledby={titleId} className="bg-background-muted flex flex-col gap-4 rounded-sm p-5">
        <h2 id={titleId} className="text-foreground-intense text-lg font-medium">
          Questions?
        </h2>

        {thread.length ? (
          <div
            ref={threadRef}
            aria-live="polite"
            className="flex max-h-80 scrollbar-none flex-col gap-3 overflow-y-auto"
          >
            {thread.map((turn, index) =>
              turn.from === 'shopper' ? (
                <p
                  key={index}
                  className="bg-background text-foreground-intense rounded-ee-3xs max-w-[85%] self-end rounded-lg px-3.5 py-2"
                >
                  {turn.text}
                </p>
              ) : (
                <p key={index} className="flex max-w-[92%] gap-2 text-pretty">
                  <AiSparkle className="mt-px size-4 shrink-0" />
                  {turn.text}
                </p>
              ),
            )}
            {pending ? (
              <span className="text-foreground-muted inline-flex items-center gap-2 text-xs">
                <Spinner variant="sparkle" currentColor className="text-[1.4em]" />
                Thinking
              </span>
            ) : null}
          </div>
        ) : null}

        {starters.length ? (
          <div className="flex flex-col items-start gap-1.5">
            {starters.map(({ question: starter }) => (
              <Chip
                key={starter}
                variant="outline"
                size="lg"
                disabled={pending}
                onClick={() => void ask(starter)}
                className="font-mono text-sm"
              >
                {starter}
              </Chip>
            ))}
          </div>
        ) : null}
      </section>

      <form onSubmit={handleSubmit}>
        <Input
          variant="soft"
          inputSize="lg"
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
          placeholder="Ask AI a question..."
          aria-label="Ask a question about this product"
          startSlot={<AiSparkle className="size-5" />}
          endSlot={
            // Pulled into the frame's padding, so the button sits as far from the end as from the top and bottom.
            <Button
              type="submit"
              variant="ghost"
              size="icon-md"
              aria-label="Send question"
              disabled={!question.trim() || pending}
              focusableWhenDisabled
              className="-me-2.25"
            >
              <ArrowUp />
            </Button>
          }
        />
      </form>
    </div>
  )
}
