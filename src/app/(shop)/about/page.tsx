import type { Metadata } from 'next'
import { AtelierBand } from '@/components/fashion/about/atelier-band'
import { FoundersNote } from '@/components/fashion/about/founders-note'
import { HouseRules } from '@/components/fashion/about/house-rules'
import { Materials } from '@/components/fashion/about/materials'
import { Milestones } from '@/components/fashion/about/milestones'
import { Stores } from '@/components/fashion/stores'
import { WhereNext } from '@/components/fashion/about/where-next'
import { Eyebrow } from '@/components/fashion/eyebrow'

export const metadata: Metadata = {
  title: 'Our story',
  description:
    'Why we make fewer pieces, who sews them, what they are made of, and the promise to repair every one of them for life.',
}

/* Merchandising copy, not catalog data: a store edits these to its own figures. */
const FIGURES = [
  { figure: '2016', label: 'Founded in Copenhagen' },
  { figure: '12', label: 'Original styles still in the range' },
  { figure: '3', label: 'Family-run ateliers in Portugal' },
  { figure: '14,200', label: 'Repairs made, free of charge' },
]

/**
 * The store's story, told the way a fashion house tells it: a statement, the
 * photographs, the founders, then the rules, the cloth, and the doors. Every
 * section is merchandising copy a buyer rewrites.
 */
export default function FashionAboutPage() {
  return (
    <main className="flex flex-1 flex-col pt-10 md:pt-14 xl:pt-16">
      <section className="container flex flex-col gap-10 pb-12 md:gap-14 md:pb-16">
        <div className="flex flex-col gap-3">
          <Eyebrow>Our story</Eyebrow>
          <h1 className="text-foreground-intense max-w-5xl text-4xl font-medium text-balance md:text-5xl xl:text-6xl">
            Fewer pieces, made to be worn for years.
            <span className="text-foreground-subtle block">Cut in Copenhagen, sewn in Porto, repaired for life.</span>
          </h1>
        </div>

        <div className="grid gap-10 lg:grid-cols-12 lg:items-end lg:gap-8">
          <p className="max-w-md text-lg text-pretty lg:col-span-4">
            We opened in 2016 with 12 styles and one promise: each would still be in the collection, and still
            repairable, 10 years on. All 12 are still here. So is the atelier that sewed the first run.
          </p>

          <dl className="grid grid-cols-2 items-start gap-x-6 gap-y-8 md:grid-cols-4 lg:col-span-8">
            {FIGURES.map(({ figure, label }) => (
              <div key={label} className="border-border flex flex-col-reverse gap-2 border-t pt-4">
                <dt className="text-foreground-muted text-pretty">{label}</dt>
                <dd className="text-foreground-intense font-mono text-3xl md:text-4xl">{figure}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <AtelierBand />
      <FoundersNote />
      <Milestones />
      <HouseRules />
      <Materials />
      <Stores />
      <WhereNext />
    </main>
  )
}
