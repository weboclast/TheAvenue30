import { buttonVariants } from '@appica/ui-react/button'
import { CARD_RAIL_4, CARD_RAIL_4_ITEM } from '@/components/card-rail'
import { CaretSwap } from '@/components/fashion/caret-swap'
import { CARE_TOPICS } from '@/components/fashion/contact/care-faq'
import { cn } from '@/lib/utils'

/*
 * The glyph reads as a button but the tile is the link, so `pointer-events-none`
 * keeps it from becoming a second thing to aim at.
 */
const JUMP = cn(
  buttonVariants({ variant: 'outline', size: 'icon-sm' }),
  'pointer-events-none duration-350 ease-out before:duration-350 before:ease-out',
  'group-hover:text-primary-foreground group-hover:before:bg-primary group-hover:before:border-primary',
  'group-focus-visible:text-primary-foreground group-focus-visible:before:bg-primary group-focus-visible:before:border-primary',
)

/** The 4 things people most often open this page about, as tiles landing on the answers further down. */
export function CareTopics() {
  return (
    <section className="container pb-16 md:pb-20 xl:pb-24">
      <ul className={CARD_RAIL_4}>
        {CARE_TOPICS.map(({ id, title, description }, index) => (
          <li key={id} className={CARD_RAIL_4_ITEM}>
            <a
              href={`#${id}`}
              className={cn(
                'group bg-background-muted outline-ring flex h-full flex-col gap-6 rounded-sm p-5',
                'focus-visible:outline-2 focus-visible:outline-offset-2',
                'transition-transform duration-250 ease-out motion-reduce:transition-none',
                'active:duration-100 active:ease-in-out motion-safe:active:translate-y-px motion-safe:active:scale-[0.98]',
              )}
            >
              <span className="flex items-start justify-between gap-3">
                <span className="text-foreground-muted font-mono text-sm">{String(index + 1).padStart(2, '0')}</span>
                <span aria-hidden data-slot="button" className={JUMP}>
                  <CaretSwap direction="down" />
                </span>
              </span>

              <span className="flex flex-col gap-2">
                <h2 className="text-foreground-intense text-lg font-medium">{title}</h2>
                <p className="text-sm text-pretty">{description}</p>
              </span>
            </a>
          </li>
        ))}
      </ul>
    </section>
  )
}
