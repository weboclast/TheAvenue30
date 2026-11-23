'use client'

import { useSyncExternalStore } from 'react'

/** `hourCycle` rather than `hour12`, so midnight reads `00:12` and never `24:12`. */
function formatNow(timeZone: string) {
  return new Intl.DateTimeFormat('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
    timeZone,
  }).format(new Date())
}

/** Polls once a second; React re-renders only when the formatted minute changes. */
function subscribe(onTick: () => void) {
  const interval = setInterval(onTick, 1000)
  return () => clearInterval(interval)
}

/**
 * The time of day in a store's time zone, kept to the minute and rendered on
 * the server too. A minute can turn between that render and hydration, which
 * is the mismatch suppressed here.
 */
export function LocalTime({ timeZone, className }: { timeZone: string; className?: string }) {
  const now = useSyncExternalStore(
    subscribe,
    () => formatNow(timeZone),
    () => formatNow(timeZone),
  )

  return (
    <time dateTime={now} suppressHydrationWarning className={className}>
      {now}
    </time>
  )
}
