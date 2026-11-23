# The Avenue 30

A multipurpose eCommerce storefront for Next.js and React. The cart,
checkout, accounts, and order tracking already work, on sample data you
replace when you're ready.

This file is the quick guide. The full documentation sits next to this folder
in your download, in `documentation/`: open its `index.html` in your browser. It
works offline.

## Requirements

- Node.js 20.19+, 22.13+, or 24+
- pnpm 9+. npm works too, with `npm run` in place of `pnpm` in the commands
  below. Yarn is not tested.
- An internet connection: the sample photos load from the media server, and
  fonts from Fontshare download on the first run. `pnpm download-media` saves
  the photos for working offline.

## Quick start

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) for the store.

Everything runs on sample data, so you can shop the way a customer would:

| To try         | Use                                                                              |
| -------------- | -------------------------------------------------------------------------------- |
| Signing in     | Any email and a password of 8 characters or more                                 |
| Sample shopper | `sarah.jenkins@example.com`, password `appicademo`                               |
| Paying by card | `4242 4242 4242 4242`, any future expiry date, any 3 digits. No money moves.     |
| Discount codes | `APPICA10`, `WELCOME5`, `COZY15`, `SPRING10`, `UPGRADE50`, `SUMMER15`, `KNITS20` |
| Order tracking | `APC-058291` with the sample shopper's email                                     |

Commit the template to Git before you change anything. Git is your undo button.

## What's inside

- **The store** in `src/app/`, with its own components in
  `src/components/fashion/`.
- **Flows written once and shared**: search, filters, cart, checkout, wishlists,
  accounts, sign-in, and order tracking without an account.
- **A typed data layer** in `src/lib/commerce/`, with sample data for 204
  products. Screens read from an interface, never from a platform's API.
- **7 AI features**, fully built and answering with sample replies until you
  connect the AI service you choose.
- **Instructions for AI coding agents**: `AGENTS.md`, a guide in each `src/lib`
  folder, and 5 Agent Skills.

Pages live in `src/app`, components in `src/components`, and everything that
isn't markup in `src/lib`. Every exported component, hook, and type documents
itself in JSDoc, so hover it in your editor.

## Make it yours

**Colors, fonts, and corners.** The look comes from the design tokens,
such as `--primary` for the brand color and `--radius` for corners. The store's
tokens close `src/app/globals.css`, and its fonts are set in
`src/app/layout.tsx`. To get a brand palette for light and dark mode, open
[appica.dev/ui](https://appica.dev/ui), go to Settings, choose Custom under
Primary color, and paste the CSS it gives you at the end of the stylesheet.
The theming guide covers the rest. A font from Fontshare, such as Satoshi, is downloaded by `pnpm dev` and `pnpm build` rather than shipped, because its license doesn't allow sharing the file.

**Sample data.** Products, categories, filters, and banners are TypeScript files
in `src/lib/commerce/adapters/demo/data/<demo>/`. Their photos and videos aren't
in the download: they load from the media server, and
`pnpm download-media` saves them into `public/demo/`. Catalog filters are data:
add one to the store's `filters.ts`, and the sidebar shows it, with no component
to change.

**Your backend.** The data reaches the screens through a typed adapter, and the
sample data is the one adapter this store ships. To connect your platform or
API, write an adapter against the interface and bind it in `config.ts`. No
screen changes.

- **Catalog, cart, wishlists, and orders**: the interface is
  [src/lib/commerce/adapter.ts](src/lib/commerce/adapter.ts), and
  [src/lib/commerce/config.ts](src/lib/commerce/config.ts) binds the adapter, in
  a single line.
- **Blog**: the same pieces under `src/lib/blog/`, kept apart because a store's
  blog often lives in a CMS of its own.
- **Sign-in**: the same under `src/lib/auth/`.

Only the catalog, the cart, the wishlists, and the orders are required. A section
with nothing behind it renders nothing. Saved addresses, cards, the profile,
reviews, and loyalty points are kept by a small store in each `src/lib` folder,
and that folder's `AGENTS.md` names the file to replace. The `commerce-adapter`
skill walks an AI agent, or you, through all of it.

**AI features.** The shopping assistant, review summaries, smart comparison, the
AI verdict, specs in plain English, product questions, and search by photo each
take a single function, such as `onAsk`, to connect the AI service you choose.
Pass a Server Action that calls your service. No AI service is called and no AI
SDK is bundled until you do.

**Settings.** All optional, in `.env.local`:

| Variable                                     | What it does                                                                   |
| -------------------------------------------- | ------------------------------------------------------------------------------ |
| `INSTAGRAM_ACCESS_TOKEN`, `INSTAGRAM_HANDLE` | The live Instagram feed. Setup is at the top of `src/lib/instagram.ts`.        |
| `NEXT_PUBLIC_KLARNA_CLIENT_ID`               | Klarna's own payment messaging, in place of a plain line of text               |
| `DEMO_COMMERCE_LATENCY_MS`                   | The sample catalog's wait before it answers, 600 by default. `0` turns it off. |

## Right to left

The store ships left to right, but every screen is written so it mirrors.
Layout uses logical properties (`ms-`, `pe-`, `inset-s-`) instead of physical
left and right, and directional icons carry `rtl:rotate-180`.

Serving the store right to left takes 2 changes in its root layout,
`src/app/layout.tsx`. Set the language and direction on `<html>`, then wrap the
tree in the `DirectionProvider`:

```tsx
import { DirectionProvider } from '@appica/ui-react/providers/direction-provider'

<html lang="ar" dir="rtl" ...>
  <body ...>
    <DirectionProvider dir="rtl">
      {/* the existing providers, unchanged */}
    </DirectionProvider>
  </body>
</html>
```

Both are needed. The attribute drives the CSS, and the provider drives the
components that place themselves in JavaScript: carousels, sliders, switches,
and menus. Finish with a font that covers your script, since neither Geist nor
Satoshi covers Arabic or Hebrew.

## Working with AI agents

Open the project in your coding agent and start asking. It picks up the rules on
its own:

- **[AGENTS.md](AGENTS.md)** carries the conventions, the UI rules, and
  the project layout. [CLAUDE.md](CLAUDE.md) points Claude Code at it, so there's
  only ever a single copy. Each folder in `src/lib` has an `AGENTS.md` of its
  own, which an agent reads when it works in that folder.
- **`.agents/skills/`** holds longer procedures in the open
  [Agent Skills](https://agentskills.io) format, loaded only when a task needs
  one. `.claude/skills/` holds a small generated pointer to each, for Claude Code.

| Skill                  | Ask for something like                      |
| ---------------------- | ------------------------------------------- |
| `appica-ui`            | "Add a size filter to the catalog sidebar"  |
| `commerce-adapter`     | "Connect this to my Shopify store"          |
| `react-best-practices` | "Review this page for render performance"   |
| `motion`               | "Give the hero a parallax effect on scroll" |

Agents write better UI code when they can read its documentation, which
is published as plain text for that reason. If yours can fetch web pages, allow
`appica.dev`. To add a skill of your own, create `.agents/skills/<name>/SKILL.md`
and run `pnpm sync:skills`.

## Scripts

| Script                              | What it does                                                                            |
| ----------------------------------- | --------------------------------------------------------------------------------------- |
| `pnpm dev`                          | Start the dev server on http://localhost:3000                                           |
| `pnpm build`                        | Production build. Also regenerates the typed route definitions                          |
| `pnpm start`                        | Serve the production build, after `pnpm build`                                          |
| `pnpm verify`                       | Lint, type-check, format-check, and skill pointers, in 1 command. Run before committing |
| `pnpm lint` / `pnpm lint:fix`       | ESLint, report / autofix                                                                |
| `pnpm typecheck`                    | Type-check with `tsc --noEmit`                                                          |
| `pnpm format` / `pnpm format:check` | Prettier, write / report                                                                |
| `pnpm sync:skills`                  | Regenerate `.claude/skills/` from `.agents/skills/`, after adding or renaming a skill   |
| `pnpm sync:components`              | Regenerate the component list agents read, after `pnpm update '@appica/*'`    |
| `pnpm download-media`               | Save the sample photos and videos into `public/demo/`, to work offline                  |

`pnpm lint:fix && pnpm format` fixes most of what `pnpm verify` reports. After
adding, moving, or deleting a route, run `pnpm build` first: typed routes are
checked against `.next/types/routes.d.ts`, which only a build or `next dev`
regenerates.

## Deployment

A standard Next.js App Router application: anywhere Next.js runs, this runs. On
Vercel, import and deploy with no configuration. Self-hosted, `pnpm build`
followed by `pnpm start` serves the production build with Node.js.

Before going live, put your brand in the titles, descriptions, and icons, and
add an Open Graph image. The documentation has the full checklist.

## Updating UI packages

```bash
pnpm update '@appica/*'
pnpm sync:components
```

The second command refreshes the component list agents read, so it matches the
version you just installed.

## Support

Questions or a bug? Write to support@theavenuethirty.com.
Your purchase includes 6 months of support from the purchase date: answers about
the store's features and code, and fixes for its bugs. Customization and
connecting your own services aren't included.
