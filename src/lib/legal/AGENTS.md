# Legal

The store's published policies.

- **Sample copy, not legal advice.** A buyer has counsel review the 3 documents
  and replaces `legalEntity` before going live. Never put that warning on the
  rendered page: it would ship to shoppers on the day the person meant to remove
  it forgets.
- **1 entity, edited once.** No document names a company, an email, or a
  jurisdiction in its prose. They interpolate `legalEntity` from `legal.ts`.
- **1 set of documents, and a route per storefront** under its own chrome.
  `legalPath` builds the route, and nothing hardcodes a slug.
- **The table of contents is derived** by `legalTocItems` from a document's
  headings, so it cannot drift from the prose.
- **Nesting stops at 2 levels**: `LegalSection` holds `LegalSubsection`. A
  document reaching for an `h4` wants splitting into 2 sections.
- **Every `id` is unique within its document.** It is both the heading's DOM id
  and the anchor the rail targets, and a duplicate breaks the scroll spy
  silently.
- **Cookies are a section of the privacy policy.** The template ships no consent
  banner, and a cookie policy of its own would advertise a manager that doesn't
  exist. A store that adds a banner splits `cookies` out and links it there.
- **Returns are a section of the terms.** The practical policy (windows, who pays
  return shipping, exclusions) differs per storefront, and belongs beside the
  product.
- **The accessibility statement describes what ships.** It claims no audit that
  hasn't happened, and stays silent on right-to-left, which the template doesn't
  ship. Keep it honest as the template changes.
- **Plain text only.** A `LegalBlock` is a paragraph or a list, and `LegalBody`
  turns email addresses into `mailto:` links at render.
- **The footer links these pages**, so no document links to its siblings.

Adding a document: write its content file, add it to `legalDocuments` in
`index.ts`, and stop. The route is dynamic, and the footers map the registry.
