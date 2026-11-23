import { cn } from '@/lib/utils'

/*! Appica Store artwork. Exported from the Appica Store design file. */

/**
 * The stand-in mark for a carrier with no artwork of its own, which is most of
 * them: a backend names the courier long before anyone uploads their logo.
 *
 * Inline SVG rather than a file so it follows the theme. The body takes
 * `currentColor` from whatever it sits in, and the highlight is painted with
 * `border`, which inverts alongside it: a pale overlay on a dark mark in the
 * light theme, a dark one on a light mark in the dark theme.
 */
export function CarrierMark({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 40 40"
      fill="none"
      aria-hidden="true"
      data-slot="carrier-mark"
      className={cn('text-foreground-intense size-10 shrink-0', className)}
    >
      <path
        d="M28.345 16.928c-.06-.898-.494-1.705-1.163-2.298-1.186-1.051-2.946-1.48-4.472-1.777-2.053-.399-4.159-.58-6.244-.717-3.902-.256-10.988-.225-14.15-2.522C.809 8.521.135 6.896.02 5.073-.045 4.044.059 3.015.223 2c2.487 3.383 9.904 3.247 13.624 2.938 1.38-.115 2.791-.302 4.178-.392 7.103-.486 14.283.05 18.755 6.304.668.934 1.333 1.923 1.802 2.982 1.449 3.266 1.69 7.2 1.163 10.695-.637 4.222-2.58 8.405-6.086 10.977a12.95 12.95 0 0 1-3.418 1.783c-3.145 1.093-8.044 1.37-11.334.848-3.927-.623-7.753-2.33-10.164-5.618-2.047-2.792-2.012-5.428-2.423-8.661l-.758-6.061 8.85.526c.055.06.075.124.104.198.97.544 1.915 4.58 2.12 5.715-.95.341-1.934.768-2.893 1.122.802.657 1.76 1.567 2.547 2.27l5.589 4.992c.683-.669 1.435-1.321 2.134-1.981l5.933-5.484-3.74-1.027c.2-.592.396-1.33.571-1.937l.968-3.356c.095-.331.447-1.659.601-1.904z"
        fill="currentColor"
      />
      <path
        className="text-border"
        d="M28.345 16.928c.046.321.044.686.048 1.014l.033 4.889 6.636.002-13.359 12.839-8.535-8.209L8.34 22.83l6.688.002c.005-1.769.082-2.56-.512-4.313.97.544 1.915 4.58 2.12 5.715l-2.893 1.122 2.547 2.27 5.589 4.992 2.134-1.981 5.933-5.484-3.74-1.027.571-1.937.968-3.356.601-1.904z"
        fill="currentColor"
      />
    </svg>
  )
}
