import Link from 'next/link'
import { cn } from '@/lib/utils'

/** Which parts of the logo are drawn: the symbol, the name, or both. */
export type LogoVariant = 'full' | 'mark' | 'wordmark'

/** Props for {@link Logo}. */
export interface LogoProps {
  /** Where the logo links to; pass `null` for a plain, non-interactive logo (e.g. inside dialogs). */
  href?: string | null
  /**
   * Which parts of the logo to draw.
   * @default 'full'
   */
  variant?: LogoVariant
  /**
   * Draw the symbol for The Avenue 30 Club, the loyalty program: the same mark with a
   * star in place of its dot. The wordmark is unaffected, so this does nothing on
   * `variant="wordmark"`.
   * @default false
   */
  club?: boolean
  /**
   * Accessible name, read in place of the artwork. Change it with the brand, and
   * pass `''` where the logo sits beside copy that already names the brand.
   * @default 'The Avenue 30'
   */
  label?: string
  className?: string
}

/**
 * The store's logo, as a link home by default.
 *
 * The artwork is inline SVG rather than a file so it inherits `currentColor`
 * and follows the theme without a second asset. Swap both `<path>` sets for
 * your own brand; the height is driven by the wrapper, so the marks scale with
 * whatever `className` sets.
 */
export function Logo({ href = '/', variant = 'full', club = false, label = 'The Avenue 30', className }: LogoProps) {
  const classes = cn('outline-ring flex h-8 w-fit shrink-0 items-center gap-2 rounded-xs', className)
  const marks = (
    <>
      {label ? <span className="sr-only">{label}</span> : null}
      {variant !== 'wordmark' && (
        // Both symbols are the same square drawing at different scales, so they
        // sit in the row identically whichever one is showing.
        <svg
          className="h-full w-auto"
          xmlns="http://www.w3.org/2000/svg"
          viewBox={club ? '0 0 40 40' : '0 0 32 32'}
          fill="none"
          aria-hidden="true"
        >
          {club ? (
            <>
              <path
                className="text-primary"
                d="M20 0C34.5886 0 40 5.41145 40 20C40 34.5886 34.5886 40 20 40C5.41145 40 0 34.5886 0 20C0 5.41145 5.41145 0 20 0Z"
                fill="currentColor"
              />
              <path
                className="text-primary-foreground"
                fillRule="evenodd"
                clipRule="evenodd"
                d="M25.337 11.1809C23.0963 8.0061 18.4197 8.0061 16.179 11.1809L8.65056 21.8477C6.0028 25.5993 8.66291 30.7998 13.2296 30.7998H18.8245C17.7628 29.1733 17.1451 27.226 17.1451 25.1332C17.1451 19.4329 21.7282 14.8119 27.3817 14.8119C27.5586 14.8119 27.7345 14.8164 27.9092 14.8254L25.337 11.1809ZM27.9838 29.7879C30.4226 29.7879 32.3996 27.7945 32.3996 25.3356C32.3996 22.8766 30.4226 20.8833 27.9838 20.8833C25.545 20.8833 23.568 22.8766 23.568 25.3356C23.568 27.7945 25.545 29.7879 27.9838 29.7879Z"
                fill="currentColor"
              />
              {/* The dot is punched back out and redrawn as a star, which is the
                  only thing that separates this symbol from the one above. */}
              <circle className="text-primary" cx="27" cy="25" r="10" fill="currentColor" />
              <path
                className="text-primary-foreground"
                d="M28.8022 28.946C28.2318 28.9155 27.4847 28.5615 26.5174 27.892L26.4993 27.88L26.4827 27.892C25.5153 28.5619 24.7687 28.9159 24.1974 28.9464L24.1172 28.9486C22.8794 28.9486 22.7218 27.7672 23.3431 25.7068L23.3674 25.6271L23.3224 25.5936C20.5938 23.518 21.0488 22.0814 24.4731 21.9839L24.5641 21.9816L24.616 21.8358C25.1494 20.3456 25.709 19.5602 26.4304 19.5123L26.5007 19.51C27.255 19.51 27.833 20.2977 28.385 21.8358L28.4363 21.9816L28.5283 21.9839C31.9526 22.0814 32.4076 23.518 29.6786 25.5931L29.6326 25.6267L29.6573 25.7063C30.2656 27.7255 30.1259 28.9003 28.9563 28.9464L28.8828 28.9477L28.8022 28.946Z"
                fill="currentColor"
              />
            </>
          ) : (
            <>
              <path
                className="text-primary"
                d="M16 0c11.671 0 16 4.329 16 16s-4.329 16-16 16S0 27.671 0 16 4.329 0 16 0z"
                fill="currentColor"
              />
              <path
                className="text-primary-foreground"
                d="M20.27 8.945c-1.793-2.54-5.534-2.54-7.326 0l-6.023 8.534c-2.118 3.001.01 7.162 3.663 7.162h4.476c-.849-1.301-1.344-2.859-1.344-4.533 0-4.56 3.666-8.257 8.189-8.257.142 0 .282.004.422.011L20.27 8.945zm2.117 14.886c1.951 0 3.533-1.595 3.533-3.562s-1.582-3.562-3.533-3.562-3.533 1.595-3.533 3.562 1.582 3.562 3.533 3.562z"
                fill="currentColor"
              />
            </>
          )}
        </svg>
      )}
      {variant !== 'mark' && (
        <svg
          className="h-full w-auto"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="40 0 78 32"
          fill="none"
          aria-hidden="true"
        >
          <path
            className="text-foreground-intense"
            d="M111.328 24.236c-1.042 0-1.946-.317-2.687-.93-.764-.635-1.135-1.452-1.135-2.449v-.091c0-1.61.996-2.54 2.316-2.994.927-.34 1.784-.454 2.757-.454h1.112c.603 0 .904-.295.904-.771 0-.794-.649-1.406-1.807-1.406-1.02 0-1.807.59-2.062 1.542l-2.965-.658a3.67 3.67 0 0 1 .996-1.973 4.5 4.5 0 0 1 1.876-1.202 6.98 6.98 0 0 1 2.317-.386c2.849-.023 4.957 1.565 4.957 4.558v5.171a20.26 20.26 0 0 0 .093 1.814h-3.127c-.047-.295-.07-.748-.07-1.406h-.046c-.788 1.066-1.923 1.633-3.429 1.633zm.973-2.404c.695 0 1.251-.227 1.668-.658.417-.408.626-.93.626-1.52v-.272h-2.016a2.02 2.02 0 0 0-1.135.34c-.371.227-.556.544-.556.953 0 .748.626 1.157 1.413 1.157zm-12.093 2.426c-3.568.045-6.278-2.563-6.209-5.874 0-1.089.278-2.087.834-2.994.533-.907 1.297-1.61 2.247-2.155a6.92 6.92 0 0 1 3.197-.771c1.228 0 2.456.34 3.475.975a4.58 4.58 0 0 1 2.132 2.88l-3.082.907c-.139-.476-.44-.884-.88-1.225-.463-.34-1.019-.499-1.714-.499-.765 0-1.413.25-1.946.771s-.811 1.202-.811 2.064c0 .839.255 1.542.788 2.064.51.544 1.158.816 1.992.816 1.367 0 2.293-.771 2.641-1.746l3.081.907a4.85 4.85 0 0 1-1.251 2.155c-.625.59-1.297 1.021-2.062 1.293-.787.295-1.598.431-2.432.431zM88.41 10.243a1.88 1.88 0 0 1-.602-1.429c0-.567.185-1.066.602-1.474.417-.386.904-.59 1.46-.59a2.16 2.16 0 0 1 1.506.59 2.07 2.07 0 0 1 .602 1.474c0 .567-.209 1.021-.602 1.429a2.09 2.09 0 0 1-1.506.612 2.02 2.02 0 0 1-1.46-.612zm-.208 2.495h3.382V24.01h-3.382V12.737zm-14.774-.001h3.336v1.406h.046c.834-1.089 1.992-1.633 3.521-1.633 1.645 0 3.104.748 4.031 1.86.904 1.111 1.436 2.54 1.436 3.991a6.22 6.22 0 0 1-1.506 4.014 5.38 5.38 0 0 1-4.054 1.86c-1.46 0-2.595-.499-3.406-1.474h-.046v6.804h-3.359V12.737zm4.1 3.561c-.556.544-.811 1.225-.811 2.064s.255 1.52.811 2.064 1.228.816 2.016.816a2.79 2.79 0 0 0 2.039-.816c.533-.522.811-1.225.811-2.064s-.278-1.52-.811-2.064c-.556-.544-1.251-.794-2.039-.794-.811 0-1.483.25-2.016.794zm-18.872-3.561h3.336v1.406h.046c.834-1.089 1.992-1.633 3.521-1.633 1.645 0 3.104.748 4.031 1.86.904 1.111 1.436 2.54 1.436 3.991a6.22 6.22 0 0 1-1.506 4.014 5.38 5.38 0 0 1-4.054 1.86c-1.46 0-2.595-.499-3.405-1.474h-.046v6.804h-3.359V12.737zm4.1 3.561c-.556.544-.811 1.225-.811 2.064s.255 1.52.811 2.064 1.228.816 2.015.816a2.79 2.79 0 0 0 2.039-.816c.533-.522.811-1.225.811-2.064s-.278-1.52-.811-2.064c-.556-.544-1.251-.794-2.039-.794-.811 0-1.483.25-2.015.794zm-9.227 7.711l-1.344-3.538h-7.274l-1.344 3.538H40l6.463-16.533h4.193l6.486 16.533h-3.614zm-5.004-13.222l-2.456 6.509h4.911l-2.456-6.509z"
            fill="currentColor"
          />
        </svg>
      )}
    </>
  )

  if (href === null) {
    return <span className={classes}>{marks}</span>
  }

  return (
    <Link href={href} className={classes}>
      {marks}
    </Link>
  )
}
