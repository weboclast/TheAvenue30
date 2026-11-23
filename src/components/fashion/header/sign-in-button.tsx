'use client'

import { Button } from '@appica/ui-react/button'
import { useSignInTrigger } from '@/components/auth/sign-in-gate'

/** Opens the sign-in drawer the storefront's `SignInGate` holds. */
export function SignInButton({ className }: { className?: string }) {
  return (
    <Button variant="ghost" size="sm" className={className} {...useSignInTrigger()}>
      Sign in
    </Button>
  )
}
