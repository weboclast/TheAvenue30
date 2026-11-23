import { SignInGate } from '@/components/auth/sign-in-gate'
import { Footer } from '@/components/fashion/footer/footer'
import { Header } from '@/components/fashion/header/header'
import { ShoppingAssistant } from '@/components/shopping-assistant'
import { getSession } from '@/lib/auth'
import { SessionProvider } from '@/lib/auth/session-context'
import { getCommerce } from '@/lib/commerce'
import { SkipTarget } from '@/components/skip-link'

/**
 * The chrome around every page except the checkout. The cart and wishlist
 * stores are the root layout's, above this one, because the checkout carries
 * them too.
 */
export default async function FashionShopLayout({ children }: LayoutProps<'/'>) {
  // The header reads it too; both reads are the same memoized request.
  const customer = await getSession()

  return (
    <SessionProvider session={customer}>
      {/* The drawer options match the header's own sign-in button. */}
      <SignInGate createAccountVariant="soft" registerVariant="primary" logo={false}>
        <Header />
        <SkipTarget />
        {children}
        <Footer />
        {/* In the layout, so the assistant survives navigation with its thread intact. */}
        <ShoppingAssistant prompts={getCommerce('fashion').getAssistantPrompts()} />
      </SignInGate>
    </SessionProvider>
  )
}
