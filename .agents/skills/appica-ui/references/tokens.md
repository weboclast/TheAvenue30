# Appica UI design tokens

Condensed from https://appica.dev/ui/docs/react/colors.md and
https://appica.dev/ui/docs/react/theming.md. Fetch those for the full text.

The palette is organized by **role**, not by hue. There is no `bg-gray-100` here.
Every token is a Tailwind utility (`bg-*`, `text-*`, `border-*`) and a CSS
variable (`var(--foreground)`).

## Foreground, text and icons

| Token | Use for |
| --- | --- |
| `foreground` | Default body text |
| `foreground-muted` | Secondary text, descriptions |
| `foreground-subtle` | Placeholders, disabled labels, markers |
| `foreground-strong` | Emphasized text |
| `foreground-emphasis` | Stronger emphasis |
| `foreground-intense` | Headings, highest-contrast text |
| `foreground-inverse` | Text on an inverted surface |

## Background, surfaces

| Token | Use for |
| --- | --- |
| `background` | The base page surface |
| `background-subtle` | Slightly raised areas, cards |
| `background-muted` | Hover fills, inset panels |
| `background-strong` | More prominent fills |
| `background-inverse` | Inverted surfaces, for example tooltips |

## Border

| Token | Use for |
| --- | --- |
| `border` | Default borders and dividers |
| `border-muted` | Faint separators |
| `border-strong` | Higher-contrast borders |
| `border-emphasis` | Emphasized outlines |
| `border-intense` | Strongest outlines |
| `border-inverse` | Borders on inverted surfaces |

## Accents

6 families share one scale, so they are interchangeable by intent. `primary` and
`secondary` carry the brand; `error`, `success`, `warning`, and `info` carry
status.

| Step | Role |
| --- | --- |
| `*-subtle` | Translucent tint, a soft background wash |
| `*-soft` | Slightly stronger translucent fill |
| `*-muted` | Muted solid |
| `*` | The default accent fill |
| `*-strong` | Stronger, for hover and active |
| `*-emphasis` | The vivid, on-brand value |
| `*-intense` | The boldest value |
| `*-foreground` | Text and icon color that sits legibly on the accent |

`primary` is the exception: it has no `-emphasis` or `-intense` step.

An info alert pairs `bg-info-subtle` with `text-info-foreground`. A solid primary
button pairs `bg-primary` with `text-primary-foreground`.

## Focus rings

`ring`, `ring-input`, `ring-primary`, `ring-secondary`, `ring-error`,
`ring-success`, `ring-warning`, `ring-info`, `ring-light`. Components apply the
right one on `:focus-visible` already, so you rarely write these.

## Other tokens

Radii are `var(--radius-sm)` through `var(--radius-xl)`. Never write a px radius
or a duration literal. See the theming page for shadows and typography.
