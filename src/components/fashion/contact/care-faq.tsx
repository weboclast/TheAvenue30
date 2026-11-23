import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@appica/ui-react/accordion'
import { Eyebrow } from '@/components/fashion/eyebrow'

/** One topic people write in about: what it covers, and the answers under it. */
interface CareTopic {
  /** Also the anchor the topic tiles scroll to. */
  id: string
  title: string
  description: string
  questions: { question: string; answer: string }[]
}

/*
 * The terms here are the store's, so they have to stay in step with the returns
 * and repair copy on the product page, the rules on the About page, and the
 * delivery, change-of-order, and returns promises on the order confirmation
 * and order tracking.
 */
export const CARE_TOPICS: CareTopic[] = [
  {
    id: 'returns',
    title: 'Returns and exchanges',
    description:
      '30 days to decide, free within the EU and the UK, and a size swap that ships before the first one is back.',
    questions: [
      {
        question: 'How long do I have to return something?',
        answer:
          '30 days from delivery, unworn and with the tags still on. Returns are free within the EU and the UK. Elsewhere we deduct the return postage from the refund.',
      },
      {
        question: 'Can I exchange for another size?',
        answer:
          'Yes. Book the exchange through the form on this page or in a store, and we send the new size straight away rather than waiting for the first one to come back.',
      },
      {
        question: 'When will I see the refund?',
        answer:
          'Within 3 business days of the parcel reaching Porto, to the card or account you paid with. Your bank can add 2 or 3 more.',
      },
    ],
  },
  {
    id: 'repairs',
    title: 'Repairs',
    description:
      'Anything we have ever sold, mended free for as long as you own it. How to book one and how long it takes.',
    questions: [
      {
        question: 'What does the repair promise cover?',
        answer:
          'Anything we have ever sold, for as long as you own it: seams, buttons, zips, moth holes, worn cuffs. Alterations are a separate job and quoted first.',
      },
      {
        question: 'How do I book a repair?',
        answer:
          'Pick "A repair" on the form on this page, or bring the piece to either store. If you are posting it, we send a prepaid label.',
      },
      {
        question: 'How long does a repair take?',
        answer:
          'Most are back with you in 2 to 3 weeks. Knitwear that needs re-knitting can take 6, and we tell you before we start.',
      },
    ],
  },
  {
    id: 'fit',
    title: 'Fit and care',
    description: 'How our sizes run, what to send us if you are unsure, and how to wash what you bought.',
    questions: [
      {
        question: 'How do your sizes run?',
        answer:
          'True to the measurements on each product page, with a relaxed fit through the body. Between sizes, take the smaller one in knitwear and the larger one in shirting.',
      },
      {
        question: 'Which size should I order if I am unsure?',
        answer:
          'Send us your height and your usual size in a brand you wear, through the form on this page, and someone who has tried the piece on will tell you.',
      },
      {
        question: 'How should I wash it?',
        answer:
          'Wool and cashmere: a cold hand wash or a wool cycle, laid flat to dry. Linen and cotton: 30 degrees, no tumble dryer. The care label on each piece says the same.',
      },
    ],
  },
  {
    id: 'delivery',
    title: 'Orders and delivery',
    description: 'Where we ship, how long it takes, and what to do when a parcel is late.',
    questions: [
      {
        question: 'Where do you ship, and how fast?',
        answer:
          'Everywhere in the EU and the UK in 2 to 4 business days, the US and Canada in 4 to 7, and the rest of the world in 5 to 10. Delivery is free on orders over $150.',
      },
      {
        question: 'Can I change or cancel an order?',
        answer:
          'Until it leaves Porto, which is usually the next business morning. Write to us with the order number and we catch it.',
      },
      {
        question: 'My parcel is late or missing. What now?',
        answer:
          'Check the tracking link in your dispatch email first. If it has not moved for 3 days, tell us and we send a replacement or a refund rather than leaving you to wait on the courier.',
      },
    ],
  },
]

/** The answers worth reading before writing in, grouped by topic, each group carrying the id its tile links to. */
export function CareFaq() {
  return (
    <section
      id="faq"
      className="container grid gap-10 pb-16 md:pb-20 lg:grid-cols-[minmax(0,21rem)_minmax(0,1fr)] lg:gap-16 xl:pb-24"
    >
      <div className="flex flex-col gap-3 lg:sticky lg:top-22 lg:self-start">
        <Eyebrow>Answers</Eyebrow>
        <h2 className="text-foreground-intense text-3xl font-medium md:text-4xl">Questions we get a lot</h2>
        <p className="text-pretty">Returns, repairs, fit, and delivery, answered before you have to ask.</p>
      </div>

      <div className="flex flex-col gap-8 sm:gap-10 md:gap-12">
        {CARE_TOPICS.map(({ id, title, questions }) => (
          <div key={id} id={id} className="flex scroll-mt-8 flex-col gap-4 md:scroll-mt-10">
            <h3 className="text-foreground-intense text-xl font-medium">{title}</h3>
            <Accordion variant="flush" icon="plus" iconPosition="start" className="border-border border-t">
              {questions.map(({ question, answer }) => (
                <AccordionItem key={question} value={question}>
                  <AccordionTrigger>{question}</AccordionTrigger>
                  <AccordionContent className="text-pretty">{answer}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        ))}
      </div>
    </section>
  )
}
