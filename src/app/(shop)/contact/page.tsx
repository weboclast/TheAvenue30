import type { Metadata } from 'next'
import { CareChannels } from '@/components/fashion/contact/care-channels'
import { CareFaq } from '@/components/fashion/contact/care-faq'
import { CareTopics } from '@/components/fashion/contact/care-topics'
import { MessagePanel } from '@/components/fashion/contact/message-panel'
import { Eyebrow } from '@/components/fashion/eyebrow'
import { Stores } from '@/components/fashion/stores'

export const metadata: Metadata = {
  title: 'Customer care',
  description:
    'Reach a person by chat, phone, or email, book a repair or a fitting, or read the answers on returns, fit, and delivery first.',
}

/**
 * Customer care, in the order it serves people: the topics most arrivals come
 * about, the ways to reach a person, the form, the answers that would have
 * saved the message, then the doors.
 *
 * The headline sits close to the topics, the 1 section with no heading of its
 * own, and stays here rather than inside them so deleting that row cannot take
 * the page's `h1` with it.
 */
export default function FashionContactPage() {
  return (
    <main className="flex flex-1 flex-col pt-10 md:pt-14 xl:pt-16">
      <section className="container flex flex-col gap-3 pb-6 md:pb-8 lg:pb-10">
        <Eyebrow>Customer care</Eyebrow>
        <h1 className="text-foreground-intense text-4xl font-medium text-balance md:text-5xl">How can we help?</h1>
      </section>

      <CareTopics />
      <CareChannels />
      <MessagePanel />
      <CareFaq />
      <Stores />
    </main>
  )
}
