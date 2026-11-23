---
name: appica-ui
description: >-
  Picks the right @appica/ui-react component, composes it without the traps that
  fail silently, and restyles a storefront through its tokens and stylesheet.
  Use when building or changing any interface in this template: a page, a
  section, a form, a storefront's look, or any UI element. Applies even when the
  request never names Appica UI, Tailwind, or a component, such as "add a filter
  drawer", "make this a modal", "style the order summary", or "brand this in
  purple". Not for animation (the motion skill), or for data fetching and
  rendering performance (react-best-practices).
license: MIT
---

# Appica UI

`AGENTS.md` at the repo root holds the rules every change follows: imports,
tokens, and the `@source` directive. This skill is what matters once you are
inside a component.

## Find the component before writing one

Stop at the first step that answers:

1. **Look it up in [references/components.md](references/components.md).** It
   is generated from the installed package, so it is the truth for this
   project's version: every importable subpath, with its docs URL. What you want
   probably exists under a name you did not guess. A "filter drawer" is
   `drawer`, and a "dropdown" might be `select`, `combobox`, `autocomplete`, or
   `dropdown-menu`.
2. **Fetch that component's docs URL** before writing the first line. Each page
   is about 8 KB of markdown with the real prop names and examples, and guessing
   props costs more than the fetch.
3. **Compose from what exists** only when nothing fits, and from library
   primitives rather than raw `div`s.

Never fork a library component into the repo to change its look. Restyle it
through tokens, `className`, or a `data-slot` rule.

## Composition traps

These type-check, render, and are wrong.

- **A link that looks like a button is not a `Button`.** Put
  `buttonVariants({ variant, size })` on the `<a>` or `next/link`. A `Button`
  rendering an `<a>` gives a link button semantics and misleads screen readers.
  `inputVariants` and `navigationLinkVariants` exist for the same reason.
- **`className` goes on the wrapper, not on the JSX inside `render`.** Visual
  overrides go on the wrapper, and structural props (`href`, `type`, `variant`,
  `size`) on the rendered element. Backwards, the class is silently dropped.
- **`render` keeps the role while changing the element**, which is how to
  compose with `next/link`. It is not for repainting 1 component as another.
- **Interactive components carry their own `'use client'` boundary**, so they
  import straight into a Server Component. What cannot cross the boundary is a
  non-serializable prop, such as an `onClick` or
  `render={<SomeClientComponent />}`. That needs a `'use client'` component of
  your own, not `'use client'` on the page.
- **Derive a variant union from the component**, not from an internal type:
  `ComponentProps<typeof Button>['variant']`.
- **An icon in a text button needs `data-icon`.** Mark the glyph
  `data-icon="start"` or `data-icon="end"`, and the button tightens that side's
  padding. Without it, a leading icon is inset like a word. `icon-*` sizes hold
  1 glyph and need nothing.

## Tokens and theming

[references/tokens.md](references/tokens.md) lists every role, offline:
`foreground-*` for text, `background-*` for surfaces, `border-*` for lines, and
6 accent families (`primary`, `secondary`, `error`, `success`, `warning`,
`info`) on 1 scale from `-subtle` to `-intense`, each with a `-foreground` that
sits legibly on it.

[references/theming.md](references/theming.md) covers the store's look:
where its tokens live, restyling a component everywhere through `data-slot`,
fonts, and brand colors. Read it before restyling the store or touching
`--primary`.

## Right-to-left

Every screen has to mirror, but the template ships left-to-right and sets no
`dir`, so nothing fails visibly when you get it wrong. Direction reaches
components through 2 channels that must agree: `dir` on `<html>` for CSS, and
Appica UI's `DirectionProvider` for the components that place themselves in
JavaScript (carousel, slider, switch, and floating surfaces). The template ships
neither. Don't add them unasked, and don't tell a reader the attribute alone is
enough.

4 traps survive the logical utilities, and they are the only class names a
comment may explain:

- **Transforms are physical.** `translate-x`, `-scale-x`, and a Motion `x` keep
  their sign under `dir="rtl"`. Mirror the wrapper with `rtl:-scale-x-100`, the
  way `category-card.tsx` mirrors its arrow.
- **Gradient angles are physical.** `bg-linear-to-r` and
  `linear-gradient(90deg, ...)` need a paired `rtl:` rule at the mirrored angle,
  as in `banner-slide.tsx`.
- **Directional icons point the wrong way.** An icon that means forward or back
  (`ChevronRight`, `ArrowRight`, `ArrowUpRight`) takes `rtl:rotate-180`. An icon
  that means a thing does not.
- **A mirrored pair needs no `rtl:`.** Where `left-0` and `right-0` are 2 halves
  of 1 symmetric effect, say so in a comment, since a reader cannot tell.

## After a version bump

`references/components.md` is generated. Regenerate it whenever the Appica
packages change, and `--check` exits 1 while it is stale:

```bash
pnpm sync:components
```

`node_modules/@appica/ui-react/agent-rules.md` always describes the installed
version. If it disagrees with this skill or with `AGENTS.md`, it wins, and the
disagreement is worth fixing here.

## Before you call it done

- [ ] `pnpm verify` passes.
- [ ] The screen renders styled. Unstyled means the `@source` path is wrong.
- [ ] It works in dark mode, including any token you redeclared.
- [ ] No physical left or right crept in, and the 4 traps above are handled.
