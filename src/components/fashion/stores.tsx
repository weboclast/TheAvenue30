import Image from 'next/image'
import { buttonVariants } from '@appica/ui-react/button'
import { CaretSwap } from '@/components/fashion/caret-swap'
import { LocalTime } from '@/components/fashion/local-time'
import { Eyebrow } from '@/components/fashion/eyebrow'
import { cn } from '@/lib/utils'

const DIR = '/demo/fashion/about/stores'

/** A door a shopper can walk through, and what is behind it. */
export interface Store {
  id: string
  city: string
  /** What this address is for, in the shopper's terms. */
  role: string
  address: string[]
  /** The store's own line, in the format a shopper would dial it. */
  phone: string
  hours: string
  /** IANA zone, for the clock beside the city. */
  timeZone: string
}

/** A store's photograph, by {@link Store.id}. Shot for the About page and reused in the footer. */
export function storeImage(id: string): string {
  return `${DIR}/${id}.webp`
}

/*
 * The stores. Empty this array and both the section and the footer's "find us"
 * column render nothing, so an online-only label has no code to delete. The
 * checkout's collection points are the demo adapter's copy of them
 * (`FASHION_STORES` in `adapters/demo/delivery.ts`): keep the 2 in step.
 */
export const STORES: Store[] = [
  {
    id: 'copenhagen',
    city: 'Copenhagen',
    role: 'Flagship and repairs counter',
    address: ['Bredgade 34', '1260 København K', 'Denmark'],
    phone: '+45 33 12 34 56',
    hours: 'Mon to Fri, 10:00 to 18:00. Sat, 10:00 to 16:00',
    timeZone: 'Europe/Copenhagen',
  },
  {
    id: 'porto',
    city: 'Porto',
    role: 'Store, 3 streets from the atelier',
    address: ['Rua de Cedofeita 218', '4050-174 Porto', 'Portugal'],
    phone: '+351 22 208 14 90',
    hours: 'Mon to Sat, 10:00 to 19:00',
    timeZone: 'Europe/Lisbon',
  },
]

/**
 * Where to see the collection in person, on the About and the Contact page. A
 * live clock beside each store's hours says whether the door is open now, and
 * directions are a plain Google Maps search: no map library, no API key.
 */
export function Stores() {
  if (STORES.length === 0) return null

  return (
    <section className="container flex flex-col gap-8 pb-16 md:gap-10 md:pb-20 xl:pb-24">
      <div className="flex flex-col gap-3">
        <Eyebrow>Visit us</Eyebrow>
        <h2 className="text-foreground-intense text-3xl font-medium md:text-4xl">Where to find us</h2>
        <p className="max-w-xl text-pretty">
          Try the collection on, hand a repair over the counter, or see how the cloth behaves in daylight. Both stores
          take online returns.
        </p>
      </div>

      <ul className="grid gap-10 md:grid-cols-2 md:gap-2">
        {STORES.map(({ id, city, role, address, phone, hours, timeZone }) => (
          /* Anchored per store: stacked, a section anchor lands on the wrong door. */
          <li key={id} id={id} className="flex scroll-mt-8 flex-col gap-4 md:scroll-mt-10">
            <div className="bg-background-muted relative aspect-4/3 overflow-hidden rounded-sm">
              <Image src={storeImage(id)} alt="" fill sizes="(min-width: 768px) 50vw, 100vw" className="object-cover" />
            </div>

            <div className="flex flex-col gap-4 px-4">
              <div className="flex flex-col gap-1">
                <div className="flex items-baseline justify-between gap-4">
                  <h3 className="text-foreground-intense text-xl font-medium md:text-2xl">{city}</h3>
                  <p className="text-foreground-muted font-mono text-sm">
                    <LocalTime timeZone={timeZone} /> local
                  </p>
                </div>
                <p className="text-foreground-muted">{role}</p>
              </div>

              <div className="mb-1 flex flex-col gap-1">
                <address className="not-italic">
                  {address.map((line) => (
                    <span key={line} className="block">
                      {line}
                    </span>
                  ))}
                </address>
                <p className="text-foreground-muted">{hours}</p>
                <a
                  href={`tel:${phone.replace(/\s/g, '')}`}
                  className="text-foreground-muted outline-ring rounded-4xs w-fit underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2"
                >
                  {phone}
                </a>
              </div>

              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address.join(', '))}`}
                target="_blank"
                rel="noreferrer"
                data-slot="button"
                className={cn(buttonVariants({ variant: 'primary-outline' }), 'group self-start')}
              >
                Get directions
                <span className="sr-only"> (opens in a new tab)</span>
                <CaretSwap data-icon="end" />
              </a>
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}
