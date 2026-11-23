import { cn } from '@/lib/utils'

/**
 * A campaign's light button, filled while its link is hovered and pressed with
 * it. Wear it on a `<span>` with `buttonVariants({ variant: 'light' })` and
 * `data-slot="button"`, inside a link marked `group`.
 */
export const CAMPAIGN_CTA = cn(
  'before:opacity-0 group-hover:before:border-white/15 group-hover:before:bg-white/15 group-hover:before:opacity-100 group-focus-visible:before:opacity-100',
  'group-active:translate-y-px group-active:scale-[0.97] group-active:duration-100 group-active:ease-in-out',
)
