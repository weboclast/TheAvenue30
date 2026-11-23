import { Eyebrow } from '@/components/fashion/eyebrow'

/** One year that changed something, and what it changed. */
interface Milestone {
  year: string
  title: string
  detail: string
}

/* The row lays out whatever it is given, so a 6th year is an entry here and nothing else. */
const MILESTONES: Milestone[] = [
  {
    year: '2016',
    title: 'The first 12',
    detail: '12 styles, cut in a Copenhagen basement and sewn by one atelier in Porto.',
  },
  {
    year: '2018',
    title: 'Repairs for life',
    detail: 'We start mending anything we have ever sold, at no charge. We have not stopped.',
  },
  {
    year: '2019',
    title: 'Bredgade opens',
    detail: "A former bookbinder's becomes the first store, with a repairs counter at the back.",
  },
  {
    year: '2021',
    title: 'Porto follows',
    detail: 'A second door, 3 streets from the atelier that sews our shirts.',
  },
  {
    year: '2026',
    title: 'Still all 12',
    detail: 'The first collection is still in the range, and still made by the atelier that sewed it.',
  },
]

/** How the store got here, as one row of years: a title and a sentence each. */
export function Milestones() {
  return (
    <section className="container flex flex-col gap-8 pb-16 md:gap-10 md:pb-20 xl:pb-24">
      <div className="flex flex-col gap-3">
        <Eyebrow>Milestones</Eyebrow>
        <h2 className="text-foreground-intense text-3xl font-medium md:text-4xl">How we got here</h2>
      </div>

      <ol className="grid grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-3 lg:grid-cols-5 lg:gap-x-8">
        {MILESTONES.map(({ year, title, detail }) => (
          <li key={year} className="relative flex flex-col gap-4 border-t pt-5">
            <span aria-hidden className="bg-background-inverse absolute inset-s-0 -top-px h-0.5 w-8" />
            <time dateTime={year} className="text-foreground-muted font-mono text-sm">
              {year}
            </time>
            <div className="flex flex-col gap-1.5">
              <h3 className="text-foreground-intense text-lg font-medium">{title}</h3>
              <p className="text-pretty">{detail}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  )
}
