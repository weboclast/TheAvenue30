/*
 * Sample legal copy, and not legal advice. The 3 documents in this folder are
 * written to read sensibly for any store, but a policy has to describe what a
 * store actually does. Have counsel review them, and replace `legalEntity`
 * below, before going live.
 */

/** A piece of body copy: 1 paragraph, or 1 bulleted list. */
export type LegalBlock = { type: 'paragraph'; text: string } | { type: 'list'; items: string[] }

/** A subsection, rendered as an `h3` and indented 1 level in the table of contents. */
export interface LegalSubsection {
  /** The heading's DOM id, and what the table of contents links to. Unique within its document. */
  id: string
  /** Heading text. */
  title: string
  /** Body copy, in order. */
  blocks: LegalBlock[]
}

/** A top-level section, rendered as an `h2`. */
export interface LegalSection extends LegalSubsection {
  /** Nesting stops here, because the table of contents indents 2 levels and no further. */
  subsections?: LegalSubsection[]
}

/** One legal document, served at `/legal/<slug>`. */
export interface LegalDocument {
  /** URL segment under `/legal`. */
  slug: string
  /** The document's name, which keeps its capitals under the house sentence-case rule. */
  title: string
  /**
   * What the footers call it, where the full name is too long for a row of
   * links. Omitted where the name is already short enough.
   */
  shortTitle?: string
  /** One sentence under the title, reused as the page's meta description. */
  summary: string
  /** ISO date this version took effect, shown under the title. */
  effectiveDate: string
  /** The body, in reading order. */
  sections: LegalSection[]
}

/** One entry in a document's table of contents. */
export interface LegalTocItem {
  id: string
  title: string
  /** The section number, as it is cited. */
  number: string
  /** Heading level, which is how `TocLink` picks its indent. */
  depth: 2 | 3
}

/**
 * How a section is numbered and cited: `'2'` for a section, `'2.3'` for its 3rd
 * subsection. The prose and the table of contents both number through here, so
 * a reader quoting "section 7" from the rail lands on the 7 in the document.
 */
export function legalSectionNumber(sectionIndex: number, subsectionIndex?: number): string {
  const section = `${sectionIndex + 1}`
  return subsectionIndex === undefined ? section : `${section}.${subsectionIndex + 1}`
}

/**
 * Who a policy is talking about. Every legal document reads from here rather
 * than naming a company in its prose, so rebranding the 3 of them is 1 edit.
 * A real store replaces all 5 values; the addresses are not routed anywhere.
 */
export const legalEntity = {
  /** Trading name, as it should appear in a contract. */
  name: 'The Avenue 30',
  /** Where privacy requests and data-protection questions go. */
  privacyEmail: 'privacy@example.com',
  /** Where everything else goes, matching the address in the storefront footer. */
  supportEmail: 'hello@example.com',
  /** Registered postal address, which a privacy notice has to state. */
  address: '1 Example Street, Suite 100, San Francisco, CA 94103, United States',
  /** Whose law governs the terms, and whose courts hear a dispute. */
  jurisdiction: 'the State of California, United States',
} as const

/** What a link calls a document: its short name where it has one, its full name otherwise. */
export function legalLinkLabel(doc: LegalDocument): string {
  return doc.shortTitle ?? doc.title
}

/**
 * A document's headings flattened into the list the table of contents renders.
 * Derived rather than authored, so the rail can never drift from the prose
 * beside it.
 */
export function legalTocItems(doc: LegalDocument): LegalTocItem[] {
  return doc.sections.flatMap((section, sectionIndex) => [
    { id: section.id, title: section.title, number: legalSectionNumber(sectionIndex), depth: 2 as const },
    ...(section.subsections ?? []).map((subsection, subsectionIndex) => ({
      id: subsection.id,
      title: subsection.title,
      number: legalSectionNumber(sectionIndex, subsectionIndex),
      depth: 3 as const,
    })),
  ])
}
