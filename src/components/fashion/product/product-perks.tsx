import { NeedleThread, ShipmentTracking, TruckReturn } from '@appica/icons-react'
import { cn } from '@/lib/utils'

/**
 * The store's promises, the same on every product and on the home page. Each
 * names the care topic that spells out its terms (`CARE_TOPICS` in
 * `contact/care-faq.tsx`), and the threshold is the one the demo adapter charges
 * by (`FASHION_FREE_DELIVERY_FROM` in `adapters/demo/delivery.ts`): keep all 3 in step.
 */
export const STORE_PROMISES = [
  { icon: ShipmentTracking, label: 'Free delivery on orders over $150', topic: 'delivery' },
  { icon: TruckReturn, label: '30 days to return, free within the EU and the UK', topic: 'returns' },
  { icon: NeedleThread, label: 'Free repairs for life on everything we make', topic: 'repairs' },
]

/** What every order comes with, as 3 lines under the buy box. */
export function ProductPerks({ className }: { className?: string }) {
  return (
    <ul className={cn('text-foreground-emphasis flex flex-col gap-2', className)}>
      {STORE_PROMISES.map(({ icon: Icon, label }) => (
        <li key={label} className="flex items-start gap-2">
          <Icon aria-hidden className="mt-0.5 size-5 shrink-0" />
          {label}
        </li>
      ))}
    </ul>
  )
}
