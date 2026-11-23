# Appica Store

A multipurpose e-commerce template for Next.js, built on the
[Appica UI](https://appica.dev/ui) design system. Buyers read this source to
learn from it and adapt it, so it doubles as the template's documentation:
every change has to be code worth copying.

## Commands

- `pnpm dev` serves http://localhost:3000, and `pnpm build` is the production
  build. Both first save the Fontshare fonts a layout names under
  `fonts/fontshare/` (`scripts/fontshare.mjs`): their license forbids
  committing the files.
- The sample photos and videos are not in the repo. `/demo/` paths load from
  Appica's media server through a rewrite in `next.config.ts`, and
  `pnpm download-media` saves them into `public/demo/`, which Git ignores, for
  offline work. Product photos are listed in each store's `photos.json`.
- `pnpm verify` runs ESLint, `tsc --noEmit`, a Prettier check, and the skill
  checks. Run it before you finish. `pnpm lint:fix && pnpm format` fixes most of
  what it reports.
- After adding, moving, or deleting a route, run `pnpm build` before
  `pnpm verify`. Typed routes are checked against `.next/types/routes.d.ts`,
  which only a build or `next dev` regenerates, and a stale copy passes.
- `pnpm sync:skills` after adding, renaming, or removing a skill, or editing its
  `description`. `pnpm sync:components` after `pnpm update '@appica/*'`.

## Stack

Next.js (App Router, RSC) · React 19 · Tailwind CSS v4 · TypeScript ·
`@appica/ui-react`, `@appica/icons-react`, and `@appica/country-flags-react`,
installed from npm.

`typescript` is an alias of `@typescript/typescript6`, which typescript-eslint
and `next build` load, while `pnpm typecheck` runs TypeScript 7 from
`@typescript/native`. Drop the alias once typescript-eslint supports TypeScript 7.

## Appica UI

The canonical rules ship in `node_modules/@appica/ui-react/agent-rules.md`, and
they win if this list disagrees. The `appica-ui` skill covers choosing a
component, composing it, and theming.

- Tailwind CSS v4 only. No `tailwind.config.js`: config lives in CSS via `@theme`.
- `@source '../../node_modules/@appica/ui-react/dist';` in
  [src/app/globals.css](src/app/globals.css) is what styles the library. The
  path is relative to that file, and a wrong one renders everything unstyled
  with no error.
- 1 component per subpath import: `import { Button } from '@appica/ui-react/button'`.
  Icons and flags import from the package root.
- `ref` is a plain prop (React 19). Never `forwardRef`.
- Role tokens only: `bg-background-muted`, `text-foreground-intense`,
  `border-border-strong`, `var(--radius-md)`. Never hex colors, px radii,
  duration literals, or hue utilities such as `bg-gray-100`.
- Never restate a class the element already carries: `text-foreground` on body
  text and `border border-border` say nothing. Name a color only to override one
  coming down from a parent.
- Prefer v4 variants (`*:`, `**:`, `data-*:`, `not-*:`) over `[&_...]` selectors.
- A link styled as a button takes `buttonVariants(...)` on the `<a>`, never
  `<Button render={<a/>}>`. `className` goes on the wrapper component, not on
  the JSX passed to `render`.
- Don't hand-roll what the library has.
  [components.md](.agents/skills/appica-ui/references/components.md) lists every
  component in the installed version, and each docs page is markdown at
  `<url>.md`.
- Every screen works in dark mode and right-to-left. Use logical properties and
  `rtl:` variants, never physical left and right. Light is the default theme,
  set through `ThemeProvider` with `enableSystem` off.

## Project structure

Routes live in [src/app](src/app), under 1 root layout,
[src/app/layout.tsx](src/app/layout.tsx). It owns `<html>`, loads the store's
fonts, imports [src/app/globals.css](src/app/globals.css), and mounts the stores
a shopper carries (cart, wishlist, comparison) above the route groups below it.
Mounted any lower, they would remount on the way from the cart to the checkout.

- **`(shop)/`**: everything under the header and footer. Its `not-found.tsx`,
  also reached through the `[...unmatched]` catch-all beside it, is the
  store's 404.
- **`(checkout)/`**: the checkout and its confirmation, in a stripped shell
  with no store navigation.
- **`(auth)/`**: sign-in, register, password reset, and OTP, in the store's
  fonts and tokens but outside its chrome. The store opens sign-in in an
  overlay, and these are the full-page versions a link lands on.

Supporting code: `src/components/` for shared building blocks, with the
store's own chrome in `src/components/fashion/`, and
`src/lib/` for everything that is not markup. Each module in
`src/lib/` owns 1 concern: `commerce` is the data layer, and `cart`, `wishlist`,
`comparison`, `checkout`, `orders`, `auth`, `profile`, `addresses`, `payments`,
`reviews`, `rewards`, `search`, `visual-search`, `departments`, `legal`, and
`blog` are the rest. Each carries an `AGENTS.md` with its invariants, and
`src/lib/AGENTS.md` holds the rules they share. Most agents load those on their
own when they open a file there; if yours doesn't, read them before changing a
module.

**The data comes through adapters, and the template ships 1: the demo data.**
`src/lib/commerce/`, `src/lib/blog/`, and `src/lib/auth/` each define an adapter
interface and bind the demo implementation in their `config.ts`. A real backend
is a new adapter bound there instead: no screen changes, and there is no
registry or environment switch. The blog has an adapter of its own because a
store's CMS and its commerce backend are often 2 products, and the 2 meet only
where an article page resolves the product slugs a post names. Shared code names
a seam by what it needs, never by which platform fills it.

**The store's look is its tokens.** Its typeface is declared in the root
layout, and its token overrides close `globals.css` after the shared base, so
they win on source order. Restyle through those, never by forking a component:
[theming.md](.agents/skills/appica-ui/references/theming.md) in the `appica-ui`
skill covers how.

**A screen is markup around shared logic.** Session handling, cart state, and
totals exist exactly once, and so does the logic behind each screen:
`useCheckoutForm`, `useReviewDraft`, `useCartLine`, `useDiscountCode`,
`useDeliveryChoice`, `useReviewBrowser`, and `useWishlistBoard`. Redraw a
screen by changing the markup around its hook.

**Every data call names the store.** The template this store was cut from runs
several storefronts side by side, so every read takes a `demo` slug, and
[src/lib/demos.ts](src/lib/demos.ts) registers this store's. Shared sections
take it as a prop, and link into the store's routes through `accountPath`
(`components/account/account-paths.ts`), `orderTrackingPath`
(`components/orders/order-paths.ts`), and `legalPath` (`lib/legal`). The
sections in `components/account/` also take a `fieldVariant`, and are restyled
through their `data-slot` hooks. A real backend maps the slug to the one store,
or uses it to pick a channel.

## Conventions

- **Prefer `@appica/ui-react` components.** Extend by wrapping, never by forking.
- **Compose sections flat.** A section brings its own container, spacing, and
  empty state, so a page reads as a list of sections. Don't wrap your own
  sections in a component that only forwards props, applies the same class to
  each child, or repeats a check the children make. The home page in
  `src/app/(shop)/` is the shape to copy.
- **Screens never call a backend.** Data flows through the typed facades in
  `src/lib/`, so adapters change and screens don't.
- **Page states are not routes.** An empty cart, an empty wishlist, and an
  out-of-stock product are baked into their page and driven by the data.
- **Catalog filters are data.** The sidebar renders whatever `Filter` values
  `listProducts` returns, so a new filter is a change to the dataset.
  [src/lib/catalog-filters.ts](src/lib/catalog-filters.ts) is the only place
  that knows what a catalog query parameter means: never build a catalog URL by
  hand.
- **A failed submit calls `revealFirstInvalidField`** from
  [src/lib/form-errors.ts](src/lib/form-errors.ts). It scrolls to, focuses, and
  shakes the first invalid field, never more than 1, and no component keeps a
  `shake` flag of its own.
- **Never put `:has()` on `html`, `:root`, or `body`**, including variants like
  `in-[:root:has(...)]`. Beside the library's own `:has()` rules, each check
  restyles the whole page. Put it on the nearest element that can see what it
  checks, or derive the state from the route or React state.
- **Strings stay i18n-ready.** Copy stays centralized, and prices and dates are
  formatted through the commerce layer and `Intl`, never by hand.
- **No documentation route.** Setup lives in [README.md](README.md), conventions
  here, the API in JSDoc, and an integration's setup at the top of its own file,
  the way [src/lib/instagram.ts](src/lib/instagram.ts) does.

## Writing

For interface copy, JSDoc, comments, markdown, and commit messages alike.

- **Sentence case.** Headings, buttons, labels, toasts, and `aria-label`s: "Add
  to cart", "New customer?". Capitals only for names: brands, product titles,
  category and collection names as authored, and named programs. A policy is
  not a name: "Privacy policy".
- **Plain hyphens, never `—` or `–`.** Prefer a comma, a colon, brackets, or 2
  sentences. Ranges take a hyphen: `0-100`.
- **Short, plain sentences** in the active voice. Many readers have English as
  a second language.
- **American spelling**: `color`, `behavior`, `canceled`, `gray`.
- **Counts as digits**, even below 10: `3 sizes`. Words where a number is not a
  count: `one folder per demo`, `single-page checkout`.

## Comments

Write the shortest comment that survives, and none where none works.

- **Every export gets JSDoc** (component, hook, function, type): 1 to 2
  sentences on what it is for, and the 1 thing a caller would otherwise get
  wrong. A second paragraph only on a seam a buyer re-implements, never a third.
- **Every declared prop gets 1 line**, plus `@default` when it has one. No "The
  prop that…", no restated type, nothing on inherited props.
- **Say what the code is, not why it won.** Name a rejected approach only where
  a reader would otherwise try it and break something.
- **Inline comments are rare, 1 line and 2 at most**: a constraint not visible
  locally (a browser behavior, a library quirk), something deliberately not
  done, demo scaffolding a backend replaces, or 2 things that must stay in step
  (say so in both places).
- **Never explain a class name**, except the 4 cases the `appica-ui` skill lists:
  transforms, gradient angles, directional icons, and a mirrored `left`/`right`
  pair.
- **No section banners.** A file that wants one wants splitting.
- **`/** … */` binds to the next declaration**, even across a blank line, and
  only it renders `{@link}`. Module overviews take a plain `/* … */`. Only
  `/*! … */` survives minification.
- Strip editor cruft from SVGs in `public/`.

## Before you finish

- `pnpm build` if you touched a route, then `pnpm verify`.
- Reread every comment you added, and cut each to the shortest version that
  survives.

## Skills

Procedures live in `.agents/skills/`, and load only when a task needs them:

- `appica-ui`: building or restyling any interface, a demo's stylesheet included.
- `commerce-adapter`: connecting a real backend in place of the demo data.
- `react-best-practices`: performance work, such as waterfalls, bundle size, and re-renders.
- `motion`: animation beyond what CSS or an Appica UI component already does.

`.claude/skills/` holds generated pointers so Claude Code finds them. Never edit
those: edit the skill in `.agents/skills/` and run `pnpm sync:skills`.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
