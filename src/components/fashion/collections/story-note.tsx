import Image from 'next/image'
import Link from 'next/link'
import { buttonVariants } from '@appica/ui-react/button'
import { CaretSwap } from '@/components/fashion/caret-swap'
import { cn } from '@/lib/utils'

/** The rule the collections are cut to, and the way to the story behind it. Merchandising copy a store rewrites. */
export function StoryNote() {
  return (
    <section className="container flex flex-col items-center gap-6 pb-16 text-center md:pb-20 xl:pb-24">
      <blockquote className="text-foreground-intense max-w-2xl text-2xl text-balance md:text-3xl">
        “We make fewer pieces so that each one can be worn for years, mended when it wears, and still be in the range a
        decade on.”
      </blockquote>
      <Link href="/about" data-slot="button" className={cn(buttonVariants({ variant: 'outline' }), 'group')}>
        Read our story
        <CaretSwap data-icon="end" />
      </Link>
      <Image
        src="/demo/fashion/about/founders.webp"
        alt="Mette Holm and Jonas Kjær standing side by side against a plain sand backdrop"
        width={160}
        height={200}
        className="bg-background-muted rounded-sm"
      />
    </section>
  )
}
