import { Certificate, DropletHalf2, HeartHandshake, type IconComponent, NeedleThread, Users } from '@appica/icons-react'
import { Eyebrow } from '@/components/fashion/eyebrow'

/** One rule the collection is held to, and what it means in practice. */
interface Rule {
  icon: IconComponent
  title: string
  detail: string
}

/* The list lays out whatever it is given, so a 6th rule is an entry here and nothing else. */
const RULES: Rule[] = [
  {
    icon: Certificate,
    title: 'Certified before it is cut',
    detail:
      'Every bolt arrives with its certificate and a mill we can name. A fabric we cannot trace does not get cut, however good it looks.',
  },
  {
    icon: Users,
    title: 'Made by people we know',
    detail:
      '3 family-run ateliers in northern Portugal, visited more often than our own head office. We pay on delivery, not 90 days later.',
  },
  {
    icon: DropletHalf2,
    title: 'Less water, less waste',
    detail:
      'Undyed where we can, low-impact dyes where we cannot. Offcuts go back to the mill as fiber, not to landfill.',
  },
  {
    icon: NeedleThread,
    title: 'Repaired, not replaced',
    detail:
      'Anything we have ever sold, we mend for free. Seams, buttons, moth holes. Hand it in at a store or post it to Porto.',
  },
  {
    icon: HeartHandshake,
    title: 'A share goes further',
    detail:
      '1% of every order funds primary schooling in the villages our cotton is grown in. It is printed on the receipt.',
  },
]

/** What the store holds itself to, on the same muted panel the home page's categories sit on. */
export function HouseRules() {
  return (
    <section className="px-2 pb-16 md:pb-20 xl:pb-24">
      <div className="bg-background-muted rounded-sm">
        <div className="container grid gap-10 py-16 md:py-20 lg:grid-cols-12 lg:gap-8 xl:py-24">
          <div className="flex flex-col gap-3 lg:col-span-5">
            <Eyebrow>What we hold to</Eyebrow>
            <h2 className="text-foreground-intense text-3xl font-medium text-balance md:text-4xl">
              The rules we do not bend
            </h2>
            <p className="max-w-md text-pretty">
              Written down before the first collection, and unchanged since. Every piece we have made has had to pass
              all 5.
            </p>
          </div>

          <ul className="border-border border-t lg:col-span-7">
            {RULES.map(({ icon: Icon, title, detail }) => (
              <li key={title} className="border-border flex items-start gap-4 border-b py-6 sm:gap-6">
                <Icon aria-hidden className="text-foreground-intense mt-0.5 size-6 shrink-0" />
                <div className="flex flex-col gap-2">
                  <h3 className="text-foreground-intense text-xl font-medium">{title}</h3>
                  <p className="text-pretty">{detail}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
