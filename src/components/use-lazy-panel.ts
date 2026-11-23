'use client'

import { type ComponentType, useCallback, useEffect, useState } from 'react'
import { flushSync } from 'react-dom'

/** How long after `load` a panel's code waits before loading on its own. */
const AFTER_LOAD_MS = 3000

/**
 * A panel whose code loads after the page instead of with it: at an idle moment
 * a few seconds after `load`, or on the first `whenLoaded`. Returns the component once it is in and
 * `undefined` until then, so render it, closed, as soon as it arrives. Pass a
 * `load` declared at module scope, so it keeps 1 identity.
 *
 * `whenLoaded` runs its callback with the panel mounted, so a panel opened
 * before its code arrived first spends a frame closed and still plays its
 * entrance. Not `next/dynamic`: its component suspends on first render, and a
 * panel that mounts already open skips its entrance.
 */
export function useLazyPanel<P extends object>(load: () => Promise<ComponentType<P>>) {
  const [Panel, setPanel] = useState<ComponentType<P>>()

  const whenLoaded = useCallback(
    (then?: () => void) => {
      if (Panel) {
        then?.()
        return
      }
      void load().then((component) => {
        flushSync(() => setPanel(() => component))
        if (then) requestAnimationFrame(then)
      })
    },
    [Panel, load],
  )

  // Well after `load`, so the panel's code never competes with the page's own
  // images, or with a hero still animating into its largest paint.
  useEffect(() => {
    if (Panel) return
    let timer = 0
    let idle = 0
    const schedule = () => {
      timer = window.setTimeout(() => {
        // Safari has no `requestIdleCallback`.
        if (typeof requestIdleCallback === 'function') idle = requestIdleCallback(() => whenLoaded())
        else whenLoaded()
      }, AFTER_LOAD_MS)
    }

    if (document.readyState === 'complete') schedule()
    else window.addEventListener('load', schedule, { once: true })
    return () => {
      window.removeEventListener('load', schedule)
      window.clearTimeout(timer)
      if (idle) cancelIdleCallback(idle)
    }
  }, [Panel, whenLoaded])

  return { Panel, whenLoaded }
}
