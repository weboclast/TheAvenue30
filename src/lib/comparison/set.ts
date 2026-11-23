import { isComparable } from '@/lib/commerce/programs/comparison'
import type { Product } from '@/lib/commerce/types'

/*
 * The 1 file in this module that is safe on the client: how many products a
 * shopper may weigh at once, and how their spec sheets line up into a table.
 *
 * The limits are here rather than in the action alone because the drawer counts
 * against them too ("Compare (3/4)"), and 2 copies of a limit is how a control
 * that reads as available refuses when it is clicked.
 */

/**
 * How many products can be compared at once. 4 columns and a label column is
 * what fits a page without the values collapsing into 2 words apiece, and it is
 * also about as many as anybody actually decides between.
 */
export const MAX_COMPARED = 4

/**
 * How many it takes before there is anything to compare. 1 product is a spec
 * sheet, which the product page already shows better, so the bar's "Compare"
 * waits for a second one and the page says so to anyone who arrives by URL.
 */
export const MIN_COMPARED = 2

/** One spec as every compared product answers it. */
export interface ComparisonRow {
  /** From {@link ProductSpec.id}, which is what lines the products up. */
  id: string
  /** What is measured, taken from the first product that carries the spec. */
  label: string
  /** What each product answers, in the order they are compared. `null` for one whose sheet omits the spec. */
  values: (string | null)[]
  /** Whether the products disagree here, which is what "only differences" keeps. */
  differs: boolean
}

/** A run of rows under one heading, from {@link ProductSpec.group}. */
export interface ComparisonSection {
  /** Absent for the specs filed under no heading, which lead the table. */
  label?: string
  rows: ComparisonRow[]
}

/**
 * The compared products' spec sheets as a table: a section per group, a row per
 * spec id, and a value per product in the order they were passed.
 *
 * Sections and rows keep the order the first product to name them lists them
 * in, so the table reads like that product's own spec sheet with columns added.
 * Identifier rows sit it out ({@link ProductSpec.comparable}), which is what
 * keeps the brand and the product line from filling the first screen with rows
 * nobody is deciding on.
 */
export function comparisonSections(products: Product[]): ComparisonSection[] {
  const sections: ComparisonSection[] = []
  // A spec id can be filed under different headings by different products, so
  // rows are tracked across the whole table and land in the section the first
  // product to carry them named.
  const rows = new Map<string, ComparisonRow>()

  products.forEach((product, index) => {
    for (const spec of product.specSheet ?? []) {
      if (!isComparable(spec)) continue

      let row = rows.get(spec.id)
      if (!row) {
        row = { id: spec.id, label: spec.label, values: Array(products.length).fill(null), differs: false }
        rows.set(spec.id, row)

        let section = sections.find((candidate) => candidate.label === spec.group)
        if (!section) {
          section = { label: spec.group, rows: [] }
          sections.push(section)
        }
        section.rows.push(row)
      }

      row.values[index] = spec.value
    }
  })

  for (const row of rows.values()) row.differs = new Set(row.values).size > 1

  return sections
}

/** The same table with every row the products agree on dropped, and any section left empty with it. */
export function differingSections(sections: ComparisonSection[]): ComparisonSection[] {
  return sections
    .map((section) => ({ ...section, rows: section.rows.filter((row) => row.differs) }))
    .filter((section) => section.rows.length > 0)
}
