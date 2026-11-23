import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Button } from '@appica/ui-react/button'
import { Separator } from '@appica/ui-react/separator'
import { AccountBenefits } from '@/components/auth/account-benefits'
import { AuthCard, AuthCardPanel } from '@/components/auth/auth-card'
import { SignInForm } from '@/components/auth/sign-in-form'
import { Logo } from '@/components/logo'
import { getSession, safeNextPath } from '@/lib/auth'

export const metadata: Metadata = {
  title: 'Sign in',
}

export default async function LoginPage({ searchParams }: PageProps<'/login'>) {
  const { next } = await searchParams
  const destination = safeNextPath(typeof next === 'string' ? next : undefined)

  if (await getSession()) redirect(destination)

  return (
    <AuthCard className="max-w-240">
      <AuthCardPanel>
        <Logo variant="mark" href="/" className="h-10 sm:h-12" />
        <div className="flex flex-col gap-2">
          <h1 className="text-foreground-intense text-2xl font-medium">Sign in to The Avenue 30</h1>
          <p className="text-foreground text-sm">Sign in to view order status, update billing, check past orders.</p>
        </div>
        <SignInForm
          redirectTo={destination}
          forgotPasswordSlot={
            <Link
              href="/forgot-password"
              className="text-foreground hover:text-foreground-intense text-sm underline transition-colors hover:no-underline motion-reduce:transition-none"
            >
              Forgot password?
            </Link>
          }
        />
      </AuthCardPanel>
      <AuthCardPanel aside>
        <div className="flex flex-col gap-1.5">
          <h2 className="text-foreground-intense text-2xl font-medium">New customer?</h2>
          <p className="text-foreground text-sm">Enjoy these benefits with your new account.</p>
        </div>
        <Separator variant="dashed" />
        <AccountBenefits />
        <Button
          variant="secondary"
          size="lg"
          className="w-full"
          nativeButton={false}
          render={<Link href="/register" />}
        >
          Create an account
        </Button>
      </AuthCardPanel>
    </AuthCard>
  )
}
