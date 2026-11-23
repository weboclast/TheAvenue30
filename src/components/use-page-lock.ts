'use client'

import { useEffect } from 'react'

/** The utility in `globals.css` that holds the page still. */
const PAGE_LOCK = 'page-locked'

/** How many panels hold the lock, so the first to close leaves it on for the rest. */
let holders = 0

/**
 * Holds the page still while `locked`, for a panel the UI library doesn't lock for,
 * such as a `NavigationMenu`: what a popover's `modal` prop does for its own.
 * The lock goes on `<html>`, because Base UI locks `<body>` for modal popups,
 * and 2 locks on 1 element restore each other's styles when either closes.
 */
export function usePageLock(locked: boolean) {
  useEffect(() => {
    if (!locked) return

    const { classList } = document.documentElement
    if (holders++ === 0) classList.add(PAGE_LOCK)
    return () => {
      if (--holders === 0) classList.remove(PAGE_LOCK)
    }
  }, [locked])
}
