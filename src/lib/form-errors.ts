/*
 * How every form in the template answers a failed submit: it points at the
 * first thing to fix.
 *
 * The nudge is a class rather than React state, so a form keeps no `shake` flag
 * of its own and every screen gets the same behavior for 1 line.
 */

/** Plays the nudge once, and skips it for a shopper who asked for less motion. */
const SHAKE = ['animate-shake', 'motion-reduce:animate-none']

/**
 * Plays that nudge on any element, and hands back the way to take it off again.
 * Re-adding the class is what replays it, so a second refusal in a row still
 * shakes; a caller that unmounts mid-animation calls what it returns.
 *
 * Not only for fields: the compare bar shakes itself when it refuses a 5th
 * product, which is the same "no, and here is why" the forms give.
 */
export function shakeOnce(element: HTMLElement): () => void {
  element.classList.add(...SHAKE)

  const settle = () => element.classList.remove(...SHAKE)
  element.addEventListener('animationend', settle, { once: true })

  return () => {
    element.removeEventListener('animationend', settle)
    settle()
  }
}

/** Whether a form's messages, by field, hold at least 1. */
export function hasError(errors: Record<string, string | undefined>): boolean {
  return Object.values(errors).some(Boolean)
}

/**
 * Re-runs the checks but reports only on fields already flagged, so a form
 * re-validating as the shopper types never lights up the empty fields below.
 */
export function keepFlagged<T extends Record<string, string | undefined>>(flagged: T, next: T): T {
  return Object.fromEntries(Object.keys(next).map((key) => [key, flagged[key] ? next[key] : undefined])) as T
}

/** A field's control, matched in document order, so the clear button never wins. */
const CONTROL = 'input:not([type="hidden"]), select, textarea, button, [tabindex]:not([tabindex="-1"])'

/**
 * Points the shopper at the first invalid field inside `container`: brings it
 * into view, focuses its control, and shakes it once.
 *
 * Call it from a submit handler once the error state is set, passing the form.
 * The DOM is read on the next frame, by which time React has flushed those
 * errors and the fields carry `data-invalid`.
 *
 * 1 field rather than all of them: on a long form the others are off screen, and
 * a panel where everything shakes at once has stopped pointing anywhere.
 */
export function revealFirstInvalidField(container: HTMLElement | null): void {
  if (!container) return

  requestAnimationFrame(() => {
    const field = container.querySelector<HTMLElement>('[data-slot="field"][data-invalid]')
    if (!field) return

    // Instant, rather than the smooth scrolling the site sets: the nudge below
    // is over in half a second, and a field still travelling plays it off screen.
    field.scrollIntoView({ block: 'nearest', behavior: 'instant' })
    field.querySelector<HTMLElement>(CONTROL)?.focus({ preventScroll: true })

    shakeOnce(field)
  })
}
