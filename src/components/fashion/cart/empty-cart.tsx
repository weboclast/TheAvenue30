import type { Ref } from 'react'
import Link from 'next/link'
import { buttonVariants } from '@appica/ui-react/button'
import { HangerArtwork } from './hanger-artwork'

interface EmptyCartProps {
  /** Where "Continue shopping" goes. */
  shopHref: string
  /** The `<h1>`, which takes focus when the last line is taken out. */
  headingRef?: Ref<HTMLHeadingElement>
}

/** The empty bag page, worded like the drawer's. It carries the page's `<h1>`, since nothing else does. */
export function EmptyCart({ shopHref, headingRef }: EmptyCartProps) {
  return (
    <section className="container flex flex-col items-center gap-4 py-16 text-center md:py-20 xl:py-24">
      <HangerArtwork />
      <div className="flex flex-col items-center gap-2">
        <h1
          ref={headingRef}
          tabIndex={-1}
          className="text-foreground-intense text-3xl font-medium outline-none md:text-4xl"
        >
          Your bag is empty
        </h1>
        <p className="max-w-72">When you add products to your shopping bag, they will appear here.</p>
      </div>
      <Link href={shopHref} data-slot="button" className={buttonVariants({ size: 'lg' })}>
        Continue shopping
      </Link>
    </section>
  )
}
