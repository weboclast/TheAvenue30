import { SlimFooter } from '@/components/slim-footer'
import { REFERENCE_DEMO } from '@/lib/demos'
import { SkipTarget } from '@/components/skip-link'

/**
 * Shared shell for the auth collection: login, register, password reset, and
 * OTP verification. Pages render as a centered card.
 */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-1 flex-col">
      <SkipTarget />
      <main className="container flex flex-1 items-center justify-center py-10">{children}</main>
      <SlimFooter demo={REFERENCE_DEMO} />
    </div>
  )
}
