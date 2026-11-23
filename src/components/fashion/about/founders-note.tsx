import Image from 'next/image'

/** The founders in their own words: a letter rather than a biography, beside the one photograph of them. */
export function FoundersNote() {
  return (
    <section className="container grid gap-10 pb-16 md:grid-cols-12 md:gap-8 md:pb-20 lg:gap-16 xl:pb-24">
      <figure className="bg-background-muted relative aspect-4/5 overflow-hidden rounded-sm md:col-span-5">
        <Image
          src="/demo/fashion/about/founders.webp"
          alt="Mette Holm and Jonas Kjær standing side by side against a plain sand backdrop"
          fill
          sizes="(min-width: 768px) 40vw, 100vw"
          className="object-cover"
        />
      </figure>

      <div className="flex flex-col gap-8 md:col-span-7 md:self-center lg:col-span-6 lg:col-start-7">
        <h2 className="text-foreground-intense text-3xl font-medium md:text-4xl">A note from the founders</h2>

        <div className="flex flex-col gap-5 text-lg text-pretty xl:text-xl">
          <p>
            We started this because we were tired of buying clothes we would not miss. Not bad clothes, exactly. Just
            clothes with nothing in them worth keeping.
          </p>
          <p>
            So we made ourselves a rule: a piece joins the collection only if we would still want to wear it in 10
            years, and only if we can mend it when it wears. That rule has cost us a lot of ideas. It has also given us
            a wardrobe we are proud of.
          </p>
          <p>If something you bought from us needs mending, bring it back. It is still ours to look after.</p>
        </div>

        <p className="flex flex-col gap-0.5">
          <span className="text-foreground-intense text-lg font-medium">Mette Holm and Jonas Kjær</span>
          <span className="text-foreground-muted">Founders</span>
        </p>
      </div>
    </section>
  )
}
