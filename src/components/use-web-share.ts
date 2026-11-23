'use client'

import { useSyncExternalStore } from 'react'

/**
 * Opens the operating system's share sheet, or `null` where the browser has
 * none, so a caller renders its Share button only where it works. `null` on the
 * server too, which keeps the first paint agreeing with itself.
 */
export function useWebShare(): ((data: ShareData) => Promise<void>) | null {
  const canShare = useSyncExternalStore(
    () => () => {},
    () => 'share' in navigator,
    () => false,
  )

  if (!canShare) return null

  return async (data) => {
    try {
      await navigator.share(data)
    } catch {
      // Dismissing the sheet rejects, and a dismissal is not a failure.
    }
  }
}
