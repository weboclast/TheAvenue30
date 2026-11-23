import type { Metadata } from 'next'
import { AuthCard, AuthCardPanel } from '@/components/auth/auth-card'
import { VerifyOtpForm } from '@/components/auth/verify-otp-form'
import { Logo } from '@/components/logo'
import { DEFAULT_NEXT_PATH } from '@/lib/auth'

export const metadata: Metadata = {
  title: 'Verify code',
}

export default function VerifyOtpPage() {
  return (
    <AuthCard className="max-w-120">
      <AuthCardPanel>
        <Logo variant="mark" href="/" className="h-10 sm:h-12" />
        <div className="flex flex-col gap-2">
          <h1 className="text-foreground-intense text-2xl font-medium">Verify it&apos;s you</h1>
          <p className="text-foreground text-sm">
            Enter the 6-digit code we&apos;ve just sent to your email to continue.
          </p>
        </div>
        <VerifyOtpForm redirectTo={DEFAULT_NEXT_PATH} />
      </AuthCardPanel>
    </AuthCard>
  )
}
