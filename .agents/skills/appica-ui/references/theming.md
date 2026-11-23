# Theming

How a storefront takes its own look without forking a component: a typeface,
token overrides, and restyles keyed on `data-slot`.

## Where the tokens live

The store's token overrides close `src/app/globals.css`, after the shared base,
so they win on source order. The rules no utility can express close it too, such
as the ones keyed on what a page puts under the header. Being unlayered, they
beat Tailwind's utilities without `!important`, and `@apply` reaches the same
utilities the markup uses.

## Restyle a component everywhere

A component's `data-slot` hook lets 1 rule restyle every instance:
`[data-slot='button']` with `@apply` reaches every `Button`. A link wearing
`buttonVariants(...)` carries no slot, so give it `data-slot="button"` by hand
where it should match.

The shared account sections in `components/account/` have hooks for the same
purpose: `account-panel`, `account-panel-item`, `account-card`, `account-rule`,
`account-title`, `account-copy`, and `account-empty-icon`.

## Fonts

A storefront declares its typeface with `next/font` in its root layout, and
points `--font-sans` at it on `:root`:

```css
:root {
  --font-sans: var(--font-satoshi), ui-sans-serif, system-ui, sans-serif;
}
```

`<body>` carries `font-sans`, which is where the variable is substituted, and
`font-family` inherits as a resolved value. Redeclaring `--font-sans` anywhere
below `:root` changes nothing.

## Brand colors

- **The default `primary` is achromatic**, a neutral that inverts with the theme.
  Branding is not a matter of overriding `--primary`: a chromatic palette
  follows a different recipe, where `-subtle` and `-soft` become alpha tints
  instead of solid stops. The palette is the unit of customization, so read
  https://appica.dev/ui/docs/react/theming.md#custom-brand-colors first.
- **Keep the alpha on `*-subtle` and `*-soft`.** They composite over whatever
  surface they land on, and an opaque replacement stops adapting between themes.
- **Name every token you change twice**: in a `:root, .light` block, and again
  in `.dark`. A storefront's overrides load after the library at the same
  specificity, so a token declared on `:root` alone beats Appica UI's own `.dark`
  value and keeps its light value in dark mode.
