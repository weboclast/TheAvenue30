import type { Viewport } from 'next'

/**
 * The viewport every root layout re-exports.
 *
 * `resizes-content` makes the on-screen keyboard shrink the layout viewport, not
 * just the visual one. Under the default `resizes-visual` the keyboard opens over
 * anything placed against the layout viewport and the browser scrolls the page to
 * chase the caret, dragging fixed chrome along with it. `dvh` measures that same
 * viewport, so this is also what keeps a full-height sheet from overshooting once
 * an input inside it takes focus. Browsers that do not know the key ignore it and
 * behave as before.
 */
export const viewport: Viewport = {
  interactiveWidget: 'resizes-content',
}
