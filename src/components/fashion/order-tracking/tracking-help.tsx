import Link from 'next/link'
import { buttonVariants } from '@appica/ui-react/button'
import type { Order } from '@/lib/commerce/types'
import { cn } from '@/lib/utils'
import { StartReturnAction } from './order-actions'

/**
 * The 1 thing worth offering at this stage: a return while one can be opened, a
 * repair once it cannot, and customer care before then. Whether a return is open
 * is `OrderTracking.returnable`, the store's answer.
 *
 * The promises are the care FAQ's, in `contact/care-faq.tsx`: keep the 2 in step.
 */
export function TrackingHelp({ order, className }: { order: Order; className?: string }) {
  const { status, returnable } = order.tracking
  const contact = (
    <Link href="/contact" data-slot="button" className={buttonVariants({ variant: 'primary' })}>
      Contact us
    </Link>
  )

  let title = 'Need to change something?'
  let body = 'We can still catch your order until it leaves Porto, usually by the next business morning.'
  let action = contact

  if (returnable) {
    title = 'Not quite right?'
    body =
      'Send it back within 30 days of delivery, free within the EU and the UK. For another size, write to us and we send it straight away.'
    action = <StartReturnAction order={order} />
  } else if (status === 'delivered') {
    title = 'Needs a mend?'
    body = 'We mend anything we have ever sold, free for as long as you own it: seams, buttons, zips, moth holes.'
    action = (
      <Link href="/contact#repairs" data-slot="button" className={buttonVariants({ variant: 'primary' })}>
        Book a repair
      </Link>
    )
  } else if (status === 'out-for-delivery' && !order.delivery.pickup) {
    title = 'Parcel not moving?'
    body = 'If the tracking has not moved for 3 days, tell us and we send a replacement or a refund.'
  } else if (status === 'out-for-delivery') {
    body = 'Write to us with your order number and we sort it out. A chat is answered in under 2 minutes.'
  }

  return (
    <section
      className={cn(
        'flex flex-col items-start justify-between gap-4 rounded-sm border p-6 sm:flex-row sm:items-center md:gap-6',
        className,
      )}
    >
      <div className="flex flex-col gap-1">
        <h2 className="text-foreground-intense text-xl font-medium">{title}</h2>
        <p className="text-sm text-pretty">{body}</p>
      </div>
      {action}
    </section>
  )
}
