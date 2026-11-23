import Image from 'next/image'
import { Badge } from '@appica/ui-react/badge'
import { Eyebrow } from '@/components/fashion/eyebrow'

const DIR = '/demo/fashion/about/materials'

/** One cloth the collection is cut from, and where it comes from. */
interface Material {
  file: string
  name: string
  origin: string
  /** The standard it is certified to: the abbreviation on the label, and its full name. */
  standard: [abbreviation: string, name: string]
}

/*
 * Ordered by how much of the range each one makes up. The grid runs 4 across
 * and 2 on a phone, so a 5th entry wants a 6th beside it.
 */
const MATERIALS: Material[] = [
  {
    file: 'merino',
    name: 'Merino wool',
    origin: 'Spun and knitted in Biella, Italy',
    standard: ['RWS', 'Responsible Wool Standard'],
  },
  {
    file: 'linen',
    name: 'Linen',
    origin: 'Woven in Normandy, France',
    standard: ['European Flax', 'European Flax certified fiber'],
  },
  {
    file: 'denim',
    name: 'Denim',
    origin: 'Woven in Lombardy, Italy',
    standard: ['GOTS', 'Global Organic Textile Standard'],
  },
  {
    file: 'leather',
    name: 'Leather',
    origin: 'Vegetable-tanned in Tuscany, Italy',
    standard: ['LWG', 'Leather Working Group audited tannery'],
  },
]

/** The 4 cloths the collection keeps returning to, each named by mill and standard. */
export function Materials() {
  return (
    <section className="container flex flex-col gap-8 pb-16 md:gap-10 md:pb-20 xl:pb-24">
      <div className="flex flex-col gap-3">
        <Eyebrow>Materials</Eyebrow>
        <h2 className="text-foreground-intense text-3xl font-medium md:text-4xl">Fabric first</h2>
        <p className="max-w-xl text-pretty">
          We choose the cloth before we draw the garment. These are the 4 we keep coming back to, and the mills that
          make them.
        </p>
      </div>

      <ul className="grid grid-cols-2 gap-x-2 gap-y-8 lg:grid-cols-4">
        {MATERIALS.map(({ file, name, origin, standard: [abbreviation, standardName] }) => (
          <li key={file} className="flex flex-col gap-3">
            <div className="bg-background-muted relative aspect-square overflow-hidden rounded-sm">
              <Image
                src={`${DIR}/${file}.webp`}
                alt=""
                fill
                sizes="(min-width: 1024px) 25vw, 50vw"
                className="object-cover"
              />
              <Badge
                variant="outline"
                size="lg"
                render={<abbr title={standardName} />}
                className="absolute inset-s-3 top-3 text-[0.8125rem] tracking-wide no-underline"
              >
                {abbreviation}
              </Badge>
            </div>
            <div className="flex flex-col gap-0.5 px-4">
              <h3 className="text-foreground-intense text-lg font-medium">{name}</h3>
              <p className="text-foreground-muted text-sm">{origin}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}
