'use client'

import { useState } from 'react'

/**
 * Props for a `NavigationMenu` with a `backdrop`, marking the menu
 * `data-backdrop-open` from opening until its close animation ends, when Base UI
 * unmounts the backdrop. The backdrop portals to `<body>`, so a header that has
 * to stay above it keys on this mark instead: `has-data-backdrop-open:z-50`.
 */
export function useMenuBackdrop(open: boolean) {
  const [shown, setShown] = useState(open)
  if (open && !shown) setShown(true)

  return {
    'data-backdrop-open': shown || undefined,
    onOpenChangeComplete: (stillOpen: boolean) => {
      if (!stillOpen) setShown(false)
    },
  }
}
