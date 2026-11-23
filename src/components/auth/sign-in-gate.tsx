'use client'

import { type ComponentProps, type MouseEvent, createContext, use, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useLazyPanel } from '@/components/use-lazy-panel'
import { useSession } from '@/lib/auth/session-context'
import type { SignInDrawer } from './sign-in-drawer'

interface SignInGateValue {
  /** Opens the drawer, and lands on `next` once the shopper is signed in. */
  openSignIn: (next?: string) => void
  /** Whether the drawer is open. */
  open: boolean
}

/** `null` outside a {@link SignInGate}. */
const SignInGateContext = createContext<SignInGateValue | null>(null)

/** The drawer's code, loaded after the page: no shopper needs it before they sign in. */
const loadSignInDrawer = () => import('./sign-in-drawer').then((module) => module.SignInDrawer)

type DrawerOptions = Pick<
  ComponentProps<typeof SignInDrawer>,
  'createAccountVariant' | 'registerVariant' | 'logo' | 'benefits'
>

interface SignInGateProps extends DrawerOptions {
  children: React.ReactNode
}

/**
 * The sign-in drawer every {@link AccountLink} and {@link useSignInTrigger}
 * below it opens for a guest, and the page it lands on once they are in. Mount
 * it once per storefront, inside the `SessionProvider`.
 *
 * The destination outlives the drawer, so switching to registration or a reset
 * and back still lands the shopper where they were going.
 */
export function SignInGate({ children, ...drawer }: SignInGateProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [next, setNext] = useState<string>()
  const { Panel: Drawer, whenLoaded } = useLazyPanel(loadSignInDrawer)

  const openSignIn = (destination?: string) => {
    setNext(destination)
    whenLoaded(() => setOpen(true))
  }

  return (
    <SignInGateContext value={{ openSignIn, open }}>
      {children}
      {Drawer && (
        <Drawer
          {...drawer}
          open={open}
          onOpenChange={setOpen}
          onSignedIn={() => {
            if (next) router.push(next)
          }}
        />
      )}
    </SignInGateContext>
  )
}

/**
 * Props for a button that opens the {@link SignInGate} drawer, standing in for a
 * `DrawerTrigger`: it reads as one and is marked `data-popup-open` while the
 * drawer is open, so it styles alike. Signed in, the shopper lands where they are.
 */
export function useSignInTrigger() {
  const gate = use(SignInGateContext)

  return {
    'aria-haspopup': 'dialog' as const,
    'aria-expanded': gate?.open ?? false,
    'data-popup-open': gate?.open ? '' : undefined,
    onClick: () => gate?.openSignIn(),
  }
}

/** A click the browser would otherwise follow in this tab: no modifier, the main button. */
function isPlainClick(event: MouseEvent) {
  return event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey
}

/**
 * A link into the account area. A signed-in shopper follows it; a guest gets
 * the {@link SignInGate} drawer instead and lands on `href` once signed in.
 *
 * It stays a link either way, so it keeps the styling of whatever it sits in, and
 * a new tab or a visit with no script still gets the account layout's redirect
 * to `/login`.
 */
export function AccountLink({ href, onClick, ...props }: Omit<ComponentProps<typeof Link>, 'href'> & { href: string }) {
  const session = useSession()
  const gate = use(SignInGateContext)

  return (
    <Link
      href={href}
      onClick={(event) => {
        onClick?.(event)
        if (session || !gate || event.defaultPrevented || !isPlainClick(event)) return
        event.preventDefault()
        gate.openSignIn(href)
      }}
      {...props}
    />
  )
}
