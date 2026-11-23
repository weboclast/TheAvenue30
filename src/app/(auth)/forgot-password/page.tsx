import type { Metadata } from 'next'
import { AuthCard, AuthCardPanel } from '@/components/auth/auth-card'
import { PasswordResetFlow } from '@/components/auth/password-reset-flow'
import { Logo } from '@/components/logo'

export const metadata: Metadata = {
  title: 'Reset password',
}

export default function ForgotPasswordPage() {
  return (
    <AuthCard className="max-w-120">
      <AuthCardPanel>
        <Logo variant="mark" href="/" className="h-10 sm:h-12" />
        <PasswordResetFlow />
      </AuthCardPanel>
    </AuthCard>
  )
}
