import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@appica/ui-react/accordion'
import type { Product, ProductSpec } from '@/lib/commerce/types'

/*
 * The spec sheet's groups become the panels, in the order the catalog files
 * them (`sheet()` in the Fashion dataset), and the store's own terms close the
 * list. Those terms repeat the contact page's `CARE_TOPICS`, so keep them in step.
 */
const SHIPPING_AND_RETURNS = [
  'Everywhere in the EU and the UK in 2 to 4 business days, the US and Canada in 4 to 7, and the rest of the world in 5 to 10.',
  '30 days to return anything unworn, with the tags on. Returns are free within the EU and the UK.',
]

/** Label and value pairs as a bordered table, one row each. */
function SpecTable({ specs }: { specs: ProductSpec[] }) {
  return (
    <div className="overflow-hidden rounded-sm border">
      <table className="w-full">
        <tbody className="divide-y align-top">
          {specs.map((spec) => (
            <tr key={spec.id}>
              <th scope="row" className="text-foreground-intense w-1/3 border-e px-4 py-2.5 text-start font-medium">
                {spec.label}
              </th>
              <td className="px-4 py-2.5">{spec.value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

/**
 * Everything about the garment past the buy box, folded into panels that open
 * one at a time: its details and description, size and fit, materials and
 * care, then delivery and returns.
 */
export function ProductInfo({ product, className }: { product: Product; className?: string }) {
  const groups = Map.groupBy(product.specSheet ?? [], (spec) => spec.group ?? 'Product details')
  const details = groups.get('Product details') ?? []

  const panels = [
    {
      title: 'Product details',
      body: (
        <>
          <p className="text-pretty">{product.description}</p>
          {details.length ? <SpecTable specs={details} /> : null}
        </>
      ),
    },
    ...[...groups]
      .filter(([title]) => title !== 'Product details')
      .map(([title, specs]) => ({ title, body: <SpecTable specs={specs} /> })),
    {
      title: 'Shipping & returns',
      body: SHIPPING_AND_RETURNS.map((line) => (
        <p key={line} className="text-pretty">
          {line}
        </p>
      )),
    },
  ]

  return (
    <>
      <h2 className="sr-only">Product information</h2>
      <Accordion variant="flush" icon="plus" className={className}>
        {panels.map(({ title, body }) => (
          // The item rings when anything inside takes focus; move the ring to the trigger.
          <AccordionItem key={title} value={title} className="pb-0 has-focus-visible:ring-0">
            <AccordionTrigger className="focus-visible:ring-ring mb-0 rounded-sm focus-visible:ring-3">
              {title}
            </AccordionTrigger>
            <AccordionContent className="*:pt-0">
              <div className="flex flex-col gap-3 pb-3.5">{body}</div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </>
  )
}
