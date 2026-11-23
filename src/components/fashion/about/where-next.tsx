import Image from 'next/image'
import Link from 'next/link'
import { getDepartment } from '@/lib/departments'
import { cn } from '@/lib/utils'

const DIR = '/demo/fashion/about'

/** A place to go next: where it leads, what it is called, and the photograph behind it. */
interface Destination {
  href: string
  label: string
  detail: string
  image: string
}

/**
 * Where a reader goes once they are convinced: the whole range, or the
 * collections it is cut into.
 */
export async function WhereNext() {
  const department = await getDepartment('fashion')
  const destinations: Destination[] = [
    {
      href: '/catalog',
      label: 'Shop the range',
      detail: 'Every style we make, in the sizes we still have.',
      image: `${DIR}/collection.webp`,
    },
    {
      // The bare route only redirects here, and its redirect blanks the page while it runs.
      href: department ? `/${department.slug}/collections` : '/collections',
      label: 'See the collections',
      detail: 'The range in edits: linen, dresses, tailoring, and the rest.',
      image: `${DIR}/collections.webp`,
    },
  ]

  return (
    <section className="container pb-16 md:pb-20 xl:pb-24">
      <ul className="grid gap-2 md:grid-cols-2">
        {destinations.map(({ href, label, detail, image }) => (
          <li key={href}>
            <Link
              href={href}
              className={cn(
                'group outline-ring relative isolate flex aspect-square flex-col items-center justify-between overflow-hidden rounded-sm p-6 text-center text-white sm:p-8',
                'focus-visible:outline-2 focus-visible:outline-offset-2',
              )}
            >
              <Image
                src={image}
                alt=""
                fill
                sizes="(min-width: 768px) 50vw, 100vw"
                className="-z-20 object-cover transition-transform duration-700 ease-out motion-safe:group-hover:scale-[1.03] motion-reduce:transition-none"
              />
              {/* The wash sits on artwork, so it is black in both themes. */}
              <span aria-hidden className="absolute inset-0 -z-10 bg-black/30" />
              <span className="font-mono text-lg uppercase sm:text-xl">{label}</span>
              <span className="max-w-xs text-pretty">{detail}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}
