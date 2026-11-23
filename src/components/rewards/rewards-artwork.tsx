import { useId } from 'react'
import { cn } from '@/lib/utils'

/*! Store artwork. Exported from the store design file. */

/**
 * The pair of loyalty cards beside the program's pitch (see `RewardsPitch`).
 * `REWARDS.memberRate` is drawn into the front card, so changing that rate means
 * a re-export.
 *
 * Every paint is a role token or `currentColor`, so the drawing inverts with the
 * theme. The `id`s are unique per instance because `url(#…)` resolves
 * document-wide.
 */
export function RewardsArtwork({ className }: { className?: string }) {
  const prefix = useId().replace(/[^a-zA-Z0-9]/g, '')
  const id = (name: string) => `${prefix}-${name}`
  const url = (name: string) => `url(#${id(name)})`

  return (
    <svg
      viewBox="0 0 96 96"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      data-slot="rewards-artwork"
      className={cn('text-background-inverse size-24 shrink-0', className)}
    >
      <use href={`#${id('back-face')}`} fill="currentColor" />
      <g strokeWidth=".198">
        <use href={`#${id('back-face')}`} stroke={url('back-edge')} />
        <use href={`#${id('back-face')}`} stroke={url('back-sheen')} />
      </g>
      <path
        d="M66.09 32.934c-1.181 2.015-.648 4.812 1.191 6.251-1.841-1.436-4.29-.969-5.474 1.043 1.181-2.015.648-4.812-1.191-6.251 1.841 1.436 4.29.969 5.474-1.043z"
        fill="var(--color-background)"
      />
      <g transform="rotate(336 .201 24.793)">
        <rect x=".201" y="24.793" width="46.784" height="72.555" rx="5.385" fill="currentColor" />
        <g strokeWidth=".198">
          <rect x=".201" y="24.793" width="46.784" height="72.555" rx="5.385" stroke={url('front-edge')} />
          <rect x=".201" y="24.793" width="46.784" height="72.555" rx="5.385" stroke={url('front-sheen')} />
        </g>
      </g>
      <g clipPath={url('tile-clip')}>
        <rect
          x="2.428"
          y="25.647"
          width="43.414"
          height="43.414"
          rx="3.965"
          transform="rotate(336 2.428 25.647)"
          fill="var(--color-background-strong)"
        />
        <g clipPath={url('blob-clip')}>
          <rect
            x="19.76"
            y="66.895"
            width="45.069"
            height="45.069"
            rx="4.693"
            transform="rotate(246.229 19.76 66.895)"
            fill="var(--color-foreground-strong)"
          />
          <path
            d="M35.324 35.454a4.42 4.42 0 0 0-2.262 5.823 4.42 4.42 0 0 0-5.823-2.262 4.42 4.42 0 0 0 2.262-5.823 4.42 4.42 0 0 0 5.823 2.262z"
            fill="var(--color-background)"
          />
          <g filter={url('blur-1')} fill="var(--color-background)">
            <ellipse
              cx="9.228"
              cy="17.562"
              rx="9.228"
              ry="17.562"
              transform="matrix(.96063 .282738 .666042 -.744498 11.7598 76.4128)"
            />
          </g>
          <g filter={url('blur-2')}>
            <ellipse
              cx="11.103"
              cy="22.481"
              rx="11.103"
              ry="22.481"
              transform="matrix(.749186 -.661132 -.896849 -.445433 24.457 55.515)"
              fill="var(--color-warning-muted)"
            />
          </g>
          <g filter={url('blur-3')} fill="var(--color-background)">
            <ellipse
              cx="10.951"
              cy="22.993"
              rx="10.951"
              ry="22.993"
              transform="matrix(.998523 -.06873 .329537 -.942666 22.8105 30.8292)"
            />
          </g>
          <g filter={url('blur-4')}>
            <ellipse
              cx="7.715"
              cy="10.119"
              rx="7.715"
              ry="10.119"
              transform="matrix(.96063 .282738 .666042 -.744498 33.2461 48.1929)"
              fill="var(--color-warning-muted)"
            />
          </g>
          <g filter={url('blur-5')}>
            <ellipse
              cx="7.715"
              cy="20.002"
              rx="7.715"
              ry="20.002"
              transform="matrix(.96063 .282738 .666042 -.744498 35.4355 28.1997)"
              fill="var(--color-foreground-emphasis)"
            />
          </g>
          <g filter={url('blur-6')}>
            <ellipse
              cx="8.28"
              cy="16.429"
              rx="8.28"
              ry="16.429"
              transform="matrix(-.566422 .822596 .991166 .141744 54.0742 45.4449)"
              fill="var(--color-border-strong)"
            />
          </g>
          <g style={{ mixBlendMode: 'hard-light' }}>
            <g filter={url('blur-7')} fill="var(--color-background)">
              <ellipse
                cx="9.228"
                cy="17.562"
                rx="9.228"
                ry="17.562"
                transform="matrix(.96063 .282738 .666042 -.744498 11.7578 76.4148)"
              />
            </g>
            <g filter={url('blur-8')} fill="currentColor">
              <ellipse
                cx="9.228"
                cy="8.404"
                rx="9.228"
                ry="8.404"
                transform="matrix(.96063 .282738 .666042 -.744498 25.1621 57.2668)"
              />
            </g>
            <g filter={url('blur-9')}>
              <ellipse
                cx="20.494"
                cy="28.04"
                rx="20.494"
                ry="28.04"
                transform="matrix(.837855 -.545065 -.733557 -.681123 10.4336 72.7079)"
                fill="var(--color-background-strong)"
              />
            </g>
            <g filter={url('blur-10')} fill="var(--color-background)">
              <ellipse
                cx="7.715"
                cy="14.973"
                rx="7.715"
                ry="14.973"
                transform="matrix(.96063 .282738 .666042 -.744498 33.2441 48.1935)"
              />
            </g>
            <g filter={url('blur-11')}>
              <ellipse
                cx="7.715"
                cy="20.002"
                rx="7.715"
                ry="20.002"
                transform="matrix(.96063 .282738 .666042 -.744498 38.8691 35.9995)"
                fill="var(--color-foreground-emphasis)"
              />
            </g>
            <g filter={url('blur-12')} fill="currentColor">
              <ellipse
                cx="8.28"
                cy="20.105"
                rx="8.28"
                ry="20.105"
                transform="matrix(-.566422 .822596 .991166 .141744 46.7871 44.4034)"
              />
            </g>
          </g>
        </g>
      </g>
      <path
        d="M38.428 79.58l-4.583-10.294-.263.117-.163 4.723-1.825.813.279-6.232L35.03 67.3l5.125 11.511-1.727.769zm7.331-2.988c-1.337.596-2.575.693-3.712.293-1.131-.416-2.038-1.391-2.721-2.926l-1.245-2.795c-.669-1.502-.782-2.818-.339-3.947.454-1.135 1.349-2 2.687-2.595 1.348-.6 2.59-.687 3.726-.26 1.147.422 2.055 1.384 2.723 2.886l1.245 2.795c.683 1.535.796 2.864.337 3.988-.453 1.108-1.353 1.962-2.701 2.562zm-.688-1.546c.91-.405 1.469-.963 1.678-1.673.204-.721.096-1.553-.323-2.496l-1.318-2.96c-.42-.943-.978-1.561-1.673-1.856-.701-.305-1.473-.27-2.317.106-.855.381-1.396.937-1.622 1.668-.231.72-.142 1.541.268 2.462l1.318 2.96c.43.965.978 1.607 1.646 1.927.674.304 1.455.259 2.343-.137zm7.316-1.425l-1.433-.387 4.06-15.088 1.433.386-4.06 15.088zm7.106-3.203c-.811.361-1.553.422-2.224.182-.676-.251-1.188-.765-1.534-1.543l-.044-.099c-.351-.789-.392-1.514-.12-2.173.266-.67.805-1.186 1.616-1.547.8-.356 1.544-.412 2.231-.166.682.235 1.199.747 1.551 1.536l.044.099c.347.778.381 1.505.104 2.18-.271.659-.812 1.17-1.624 1.531zm-.513-1.151c.395-.176.648-.433.76-.772.123-.344.096-.713-.079-1.107l-.102-.23c-.181-.406-.44-.678-.777-.816-.327-.144-.687-.127-1.082.048-.384.171-.637.428-.76.772-.112.339-.078.711.103 1.117l.103.23c.176.395.427.664.753.807.338.139.698.123 1.082-.048zm-8.765-2.738c-.811.361-1.558.424-2.241.19-.676-.251-1.188-.765-1.534-1.543l-.051-.115c-.351-.789-.392-1.514-.12-2.173.282-.664.829-1.177 1.64-1.538.8-.356 1.536-.415 2.208-.175.682.235 1.199.747 1.551 1.536l.051.115c.346.778.387 1.503.12 2.173-.271.659-.813 1.17-1.624 1.531zm-.513-1.151c.384-.171.632-.426.743-.764.118-.355.089-.729-.087-1.124l-.102-.23c-.176-.395-.432-.661-.77-.8-.327-.143-.682-.13-1.065.041-.395.176-.653.435-.776.779-.112.339-.08.706.096 1.1l.102.23c.176.395.429.669.761.824.338.139.704.12 1.098-.056z"
        fill={url('figure')}
      />
      <defs>
        <filter
          id={id('blur-1')}
          x=".106"
          y="35.074"
          width="64.432"
          height="61.746"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity="0" />
          <feBlend in="SourceGraphic" />
          <feGaussianBlur stdDeviation="8.769" />
        </filter>
        <filter
          id={id('blur-2')}
          x="-26.741"
          y="8.206"
          width="78.709"
          height="59.91"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity="0" />
          <feBlend in="SourceGraphic" />
          <feGaussianBlur stdDeviation="8.769" />
        </filter>
        <filter
          id={id('blur-3')}
          x="-4.208"
          y="-45.511"
          width="91.06"
          height="107.827"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity="0" />
          <feBlend in="SourceGraphic" />
          <feGaussianBlur stdDeviation="16.113" />
        </filter>
        <filter
          id={id('blur-4')}
          x="5.153"
          y="2.77"
          width="84.488"
          height="80.142"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity="0" />
          <feBlend in="SourceGraphic" />
          <feGaussianBlur stdDeviation="16.113" />
        </filter>
        <filter
          id={id('blur-5')}
          x="23.384"
          y="-17.101"
          width="65.572"
          height="65.181"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity="0" />
          <feBlend in="SourceGraphic" />
          <feGaussianBlur stdDeviation="8.769" />
        </filter>
        <filter
          id={id('blur-6')}
          x="16.493"
          y="15.159"
          width="98.351"
          height="78.851"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity="0" />
          <feBlend in="SourceGraphic" />
          <feGaussianBlur stdDeviation="16.113" />
        </filter>
        <filter
          id={id('blur-7')}
          x="-14.583"
          y="20.389"
          width="93.806"
          height="91.121"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity="0" />
          <feBlend in="SourceGraphic" />
          <feGaussianBlur stdDeviation="16.113" />
        </filter>
        <filter
          id={id('blur-8')}
          x="7.655"
          y="25.355"
          width="63.938"
          height="56.529"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity="0" />
          <feBlend in="SourceGraphic" />
          <feGaussianBlur stdDeviation="10.742" />
        </filter>
        <filter
          id={id('blur-9')}
          x="-37.296"
          y="2.772"
          width="88.664"
          height="79.334"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity="0" />
          <feBlend in="SourceGraphic" />
          <feGaussianBlur stdDeviation="8.769" />
        </filter>
        <filter
          id={id('blur-10')}
          x="16.72"
          y="6.384"
          width="67.817"
          height="65.689"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity="0" />
          <feBlend in="SourceGraphic" />
          <feGaussianBlur stdDeviation="10.742" />
        </filter>
        <filter
          id={id('blur-11')}
          x="26.817"
          y="-9.301"
          width="65.572"
          height="65.181"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity="0" />
          <feBlend in="SourceGraphic" />
          <feGaussianBlur stdDeviation="8.769" />
        </filter>
        <filter
          id={id('blur-12')}
          x="9.323"
          y="14.454"
          width="105.402"
          height="79.222"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity="0" />
          <feBlend in="SourceGraphic" />
          <feGaussianBlur stdDeviation="16.113" />
        </filter>
        <linearGradient
          id={id('back-edge')}
          x1="57.576"
          y1="19.157"
          x2="58.199"
          y2="40.969"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="var(--color-foreground-muted)" />
          <stop offset="1" stopColor="var(--color-foreground-muted)" stopOpacity="0" />
        </linearGradient>
        <radialGradient
          id={id('back-sheen')}
          cx="0"
          cy="0"
          r="1"
          gradientTransform="matrix(-24.2931,-0.994501,-2.37412,-14.212,76.7745,50.8205)"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="var(--color-background)" />
          <stop offset="1" stopColor="var(--color-background)" stopOpacity="0" />
        </radialGradient>
        <linearGradient
          id={id('front-edge')}
          x1="23.625"
          y1="24.843"
          x2="23.625"
          y2="97.2"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="var(--color-foreground-emphasis)" />
          <stop offset="1" stopColor="var(--color-foreground-muted)" stopOpacity="0" />
        </linearGradient>
        <radialGradient
          id={id('front-sheen')}
          cx="0"
          cy="0"
          r="1"
          gradientTransform="matrix(-16.2763 -13.9021 9.00911 -10.442 36.6442 87.7826)"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="var(--color-background)" />
          <stop offset="1" stopColor="var(--color-background)" stopOpacity="0" />
        </radialGradient>
        <linearGradient
          id={id('figure')}
          x1="26.314"
          y1="72.026"
          x2="66.471"
          y2="63.827"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="var(--color-background)" />
          <stop offset="1" stopColor="var(--color-foreground-muted)" />
        </linearGradient>
        <clipPath id={id('tile-clip')}>
          <rect
            x="2.428"
            y="25.647"
            width="43.414"
            height="43.414"
            rx="3.965"
            transform="rotate(336 2.428 25.647)"
            fill="var(--color-background)"
          />
        </clipPath>
        <clipPath id={id('blob-clip')}>
          <rect
            x="19.76"
            y="66.895"
            width="45.069"
            height="45.069"
            rx="4.693"
            transform="rotate(246.229 19.76 66.895)"
            fill="var(--color-background)"
          />
        </clipPath>
        <path
          id={id('back-face')}
          d="M85.4459 23.5295C87.3346 25.0051 87.7776 27.6814 86.4649 29.6867L65.4193 61.8361C63.9417 64.0932 60.85 64.605 58.7241 62.9441L41.3324 49.3563C39.4438 47.8807 39.0014 45.2036 40.3141 43.1983L61.3596 11.0489C62.8373 8.792 65.9284 8.28101 68.0543 9.94166L85.4459 23.5295Z"
        />
      </defs>
    </svg>
  )
}
