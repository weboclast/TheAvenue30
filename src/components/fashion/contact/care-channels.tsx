import { Badge } from '@appica/ui-react/badge'
import { Button, buttonVariants } from '@appica/ui-react/button'
import { Eyebrow } from '@/components/fashion/eyebrow'
import { AgentAvatar } from '@/components/support-chat-button'

/** One way to reach a person, as the panel presents it. */
interface CareChannel {
  id: string
  label: string
  /** The speed, number, or address worth pulling out of the paragraph. */
  detail: string
  /** The job this channel is best at. */
  bestFor: string
  hours: string
  /** Where the action leads. Absent leaves it an inert button, for a channel nothing is wired to yet. */
  href?: string
  action: string
  /** Marks the channel the store would rather people used. Only 1 should carry it. */
  fastest?: boolean
}

const CHANNELS: CareChannel[] = [
  {
    id: 'chat',
    label: 'Live chat',
    detail: 'Answered in under 2 minutes',
    bestFor: 'A size, a return, or anything about an order already placed.',
    hours: 'Mon to Fri, 9:00 to 18:00 CET. Sat, 10:00 to 16:00 CET.',
    // No chat widget ships, so the button does nothing. Give it an `onClick`
    // that opens your provider's launcher, which makes this a client component.
    action: 'Start a chat',
    fastest: true,
  },
  {
    id: 'phone',
    label: 'Phone',
    detail: '+45 33 12 34 56',
    bestFor: 'Anything urgent: a parcel gone missing, or a repair you need back by a date.',
    hours: 'Mon to Fri, 10:00 to 16:00 CET.',
    href: 'tel:+4533123456',
    action: 'Call us',
  },
  {
    id: 'email',
    label: 'Email',
    detail: 'care@appica.com',
    bestFor: 'Anything with photos or paperwork attached, and anything that can wait a day.',
    hours: 'Answered within 1 business day.',
    href: 'mailto:care@appica.com',
    action: 'Write to us',
  },
]

/** The addresses that are not customer care, so a journalist or a buyer is not routed through it. */
const DESKS = [
  { label: 'Press', email: 'press@appica.com' },
  { label: 'Wholesale', email: 'wholesale@appica.com' },
  { label: 'Careers', email: 'jobs@appica.com' },
]

/**
 * The 3 ways to reach a person, each saying what it is best at and when it is
 * staffed. The other desks a fashion house keeps close the section.
 */
export function CareChannels() {
  return (
    <section className="container flex flex-col gap-8 pb-16 md:gap-10 md:pb-20 xl:pb-24">
      <div className="flex flex-col gap-3">
        <Eyebrow>Contact us</Eyebrow>
        <h2 className="text-foreground-intense text-3xl font-medium md:text-4xl">Talk to a person</h2>
      </div>

      <ul className="grid gap-10 md:grid-cols-3 md:gap-6 lg:gap-8">
        {CHANNELS.map(({ id, label, detail, bestFor, hours, href, action, fastest }) => (
          <li key={id} className="border-border flex flex-col gap-4 border-t pt-5">
            <div className="flex items-center justify-between gap-3">
              <Eyebrow>{label}</Eyebrow>
              {fastest ? (
                <Badge variant="outline" className="tracking-wide">
                  Fastest reply
                </Badge>
              ) : null}
            </div>

            <p className="text-foreground-intense text-xl font-medium">{detail}</p>
            <p className="text-pretty">{bestFor}</p>
            <p className="text-foreground-muted text-sm text-pretty">{hours}</p>

            {/* Pushed to the bottom, so the 3 actions share a baseline however the copy above them wraps. */}
            <div className="mt-auto pt-1">
              {href ? (
                <a href={href} data-slot="button" className={buttonVariants({ variant: 'primary-outline' })}>
                  {action}
                </a>
              ) : (
                <Button>
                  <AgentAvatar />
                  {action}
                </Button>
              )}
            </div>
          </li>
        ))}
      </ul>

      <ul className="border-border flex flex-wrap gap-x-10 gap-y-4 border-t pt-5">
        {DESKS.map(({ label, email }) => (
          <li key={label} className="flex flex-col gap-1">
            <Eyebrow>{label}</Eyebrow>
            <a
              href={`mailto:${email}`}
              className="text-foreground-intense outline-ring rounded-4xs hover:underline focus-visible:outline-2 focus-visible:outline-offset-2"
            >
              {email}
            </a>
          </li>
        ))}
      </ul>
    </section>
  )
}
