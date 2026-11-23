'use client'

import { type Dispatch, type SetStateAction, useState } from 'react'
import { usePathname } from 'next/navigation'

/**
 * Open state for a header panel whose links navigate the page underneath it,
 * closing it when the route changes. A client-side navigation leaves a panel
 * standing over the page it just loaded otherwise.
 *
 * The reset runs during render rather than in an effect, so the new route is
 * never painted with the old panel over it. To navigate without closing, pass
 * the target path to the third entry first.
 *
 * @param closed The value that means closed, which is also the initial state.
 */
export function useCloseOnNavigate<T>(
  closed: T,
): [T, Dispatch<SetStateAction<T>>, (pathname: string | undefined) => void] {
  const pathname = usePathname()
  const [open, setOpen] = useState<T>(closed)
  const [route, setRoute] = useState(pathname)
  const [staysOpenOn, setStaysOpenOn] = useState<string>()

  if (route !== pathname) {
    setRoute(pathname)
    setStaysOpenOn(undefined)
    if (pathname !== staysOpenOn) setOpen(closed)
  }

  return [open, setOpen, setStaysOpenOn]
}
