import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Button } from '@appica/ui-react/button'
import { Separator } from '@appica/ui-react/separator'
import { AccountBenefits } from '@/components/auth/account-benefits'
import { AuthCard, AuthCardPanel } from '@/components/auth/auth-card'
import { CreateAccountForm } from '@/components/auth/create-account-form'
import { Logo } from '@/components/logo'
import { DEFAULT_NEXT_PATH, getSession } from '@/lib/auth'

export const metadata: Metadata = {
  title: 'Create account',
}

export default async function RegisterPage() {
  if (await getSession()) redirect(DEFAULT_NEXT_PATH)

  return (
    <AuthCard className="max-w-240">
      <AuthCardPanel>
        <Logo variant="mark" href="/" className="h-10 sm:h-12" />
        <div className="flex flex-col gap-2">
          <h1 className="text-foreground-intense text-2xl font-medium">Create your The Avenue 30 account</h1>
          <p className="text-foreground text-sm">
            Create account to view order status, update billing, check past orders.
          </p>
        </div>
        <CreateAccountForm redirectTo={DEFAULT_NEXT_PATH} />
      </AuthCardPanel>
      <AuthCardPanel aside>
        <div className="flex flex-col gap-1.5">
          <h2 className="text-foreground-intense text-2xl font-medium">Already have an account?</h2>
          <p className="text-foreground text-sm">Sign in to pick up right where you left off.</p>
        </div>
        <Separator variant="dashed" />
        <AccountBenefits />
        <Button size="lg" className="w-full" nativeButton={false} render={<Link href="/login" />}>
          Sign in
        </Button>
      </AuthCardPanel>
    </AuthCard>
  )
}
