import type { LegalBlock, LegalDocument, LegalSubsection } from '@/lib/legal'
import { legalSectionNumber } from '@/lib/legal'
import { cn } from '@/lib/utils'

/**
 * Where a heading lands when the table of contents jumps to it: a fixed gap from
 * the top of the viewport.
 */
const HEADING_OFFSET = 'scroll-mt-6'

/**
 * The only thing these documents link, matched in body copy rather than marked
 * up in it. The domain is matched label by label so a sentence's closing period
 * stays out of the address.
 */
const EMAIL = /([\w.+-]+@[\w-]+(?:\.[\w-]+)+)/g

/**
 * A legal document's prose. Every heading carries the `id` the table of contents
 * targets and the number a reader cites, both taken from the document data, so
 * the rail beside this cannot drift from it.
 */
export function LegalBody({ doc, className }: { doc: LegalDocument; className?: string }) {
  return (
    <div className={cn('flex flex-col gap-10', className)}>
      {doc.sections.map((section, sectionIndex) => (
        <section key={section.id} className="flex flex-col gap-4">
          <h2 id={section.id} className={cn(HEADING_OFFSET, 'text-foreground-intense text-xl font-medium md:text-2xl')}>
            {legalSectionNumber(sectionIndex)}. {section.title}
          </h2>

          {section.blocks.map((block, index) => (
            // Keyed by index: a block carries no identity, and a document is
            // rendered whole rather than reordered.
            <Block key={index} block={block} />
          ))}

          {section.subsections?.map((subsection, subsectionIndex) => (
            <Subsection
              key={subsection.id}
              subsection={subsection}
              number={legalSectionNumber(sectionIndex, subsectionIndex)}
            />
          ))}
        </section>
      ))}
    </div>
  )
}

function Subsection({ subsection, number }: { subsection: LegalSubsection; number: string }) {
  return (
    <div className="mt-2 flex flex-col gap-4">
      <h3 id={subsection.id} className={cn(HEADING_OFFSET, 'text-foreground-emphasis text-lg font-medium md:text-xl')}>
        {number} {subsection.title}
      </h3>

      {subsection.blocks.map((block, index) => (
        <Block key={index} block={block} />
      ))}
    </div>
  )
}

function Block({ block }: { block: LegalBlock }) {
  switch (block.type) {
    case 'paragraph':
      return (
        <p className="text-base leading-relaxed text-pretty">
          <Text text={block.text} />
        </p>
      )

    case 'list':
      return (
        <ul className="flex list-disc flex-col gap-2 ps-6 text-base leading-relaxed">
          {block.items.map((item, index) => (
            <li key={index} className="ps-1 text-pretty">
              <Text text={item} />
            </li>
          ))}
        </ul>
      )
  }
}

/** Body copy with its email addresses turned into `mailto:` links. */
function Text({ text }: { text: string }) {
  return (
    <>
      {text.split(EMAIL).map((part, index) =>
        // `split` on a capturing pattern puts the matches at the odd indexes.
        index % 2 === 1 ? (
          <a
            key={index}
            href={`mailto:${part}`}
            className="text-foreground-intense rounded-4xs underline hover:no-underline"
          >
            {part}
          </a>
        ) : (
          part
        ),
      )}
    </>
  )
}
