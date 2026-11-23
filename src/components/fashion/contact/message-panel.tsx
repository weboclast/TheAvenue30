import Image from 'next/image'
import { Badge } from '@appica/ui-react/badge'
import { ContactForm, type ContactDetailField, type ContactReason } from '@/components/contact-form'
import { Eyebrow } from '@/components/fashion/eyebrow'

/** The extra fields a Fashion reason can ask for. */
type ContactDetail = 'orderNumber' | 'item' | 'garment' | 'usualSize' | 'store' | 'company'

const DETAILS: Record<ContactDetail, ContactDetailField> = {
  orderNumber: {
    label: 'Order number',
    placeholder: 'APC-000000',
    description: 'On your confirmation email. Sending it saves us asking.',
    required: false,
  },
  item: { label: 'Item and size', placeholder: 'Oversized cable-knit sweater, M', required: true },
  garment: { label: 'The piece', placeholder: 'Oversized cable-knit sweater, navy', required: true },
  usualSize: { label: 'Your usual size', placeholder: 'M, or EU 38', required: false },
  store: { label: 'Preferred store and time', placeholder: 'Copenhagen, a Saturday morning', required: true },
  company: {
    label: 'Publication or company',
    placeholder: 'Mode Weekly',
    required: true,
    autoComplete: 'organization',
  },
}

/* A return asks which piece, a repair which garment, a fitting which store. */
const REASONS: ContactReason<ContactDetail>[] = [
  { id: 'order', label: 'An order or delivery', details: ['orderNumber'] },
  { id: 'return', label: 'A return or exchange', details: ['orderNumber', 'item'] },
  { id: 'repair', label: 'A repair', details: ['garment', 'orderNumber'] },
  { id: 'fit', label: 'Fit and sizing advice', details: ['item', 'usualSize'] },
  { id: 'appointment', label: 'A fitting appointment in store', details: ['store'] },
  { id: 'press', label: 'Press and wholesale', details: ['company'] },
  { id: 'other', label: 'Something else', details: [] },
]

const STEPS = [
  'A person reads it, not a bot.',
  'You hear back within 1 business day, sooner about a late parcel.',
  'A repair, exchange, or refund is arranged for you, not handed back as a form to fill in.',
]

/**
 * The form, beside the counter it lands on: the photograph answers who reads
 * this and when. It carries the `contact-form` anchor the answers point at.
 */
export function MessagePanel() {
  return (
    <section
      id="contact-form"
      className="container flex scroll-mt-8 flex-col gap-8 pb-16 md:scroll-mt-12 md:gap-10 md:pb-20 xl:pb-24"
    >
      <div className="flex flex-col gap-3">
        <Eyebrow>Write to us</Eyebrow>
        <h2 className="text-foreground-intense text-3xl font-medium md:text-4xl">Send us a message</h2>
        <p className="max-w-2xl text-pretty">Tell us what happened and we take it from there.</p>
      </div>

      <div className="grid gap-2 md:grid-cols-[minmax(0,17rem)_minmax(0,1fr)] lg:grid-cols-[minmax(0,26rem)_minmax(0,1fr)]">
        <div className="relative isolate flex min-h-96 flex-col justify-end overflow-hidden rounded-sm p-6 text-white sm:p-8">
          <Image
            src="/demo/fashion/contact/counter.webp"
            alt=""
            fill
            sizes="(min-width: 1024px) 26rem, (min-width: 768px) 17rem, 100vw"
            className="-z-20 object-cover"
          />
          {/* Fades the photograph under the copy. Vertical, so it needs no mirrored pair for RTL. */}
          <span aria-hidden className="absolute inset-0 -z-10 bg-linear-to-t from-black/70 via-black/25 to-black/10" />
          <Badge variant="outline" size="lg" className="absolute inset-s-3 top-3 text-[0.8125rem] tracking-wide">
            What happens next
          </Badge>

          <ol className="flex flex-col gap-4">
            {STEPS.map((step, index) => (
              <li key={step} className="flex items-start gap-3 text-sm text-pretty">
                <span className="font-mono text-white/70">{String(index + 1).padStart(2, '0')}</span>
                {step}
              </li>
            ))}
          </ol>
        </div>

        <div className="bg-background-muted rounded-sm p-6 sm:p-8">
          <ContactForm
            reasons={REASONS}
            details={DETAILS}
            messagePlaceholder="Tell us what happened, or what you are looking for. Dates and photos help."
          />
        </div>
      </div>
    </section>
  )
}
