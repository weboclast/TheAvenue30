import Link from 'next/link'
import { Lock } from '@appica/icons-react'
import { Badge } from '@appica/ui-react/badge'
import { NavigationLink } from '@appica/ui-react/navigation'
import { getDepartment } from '@/lib/departments'

/**
 * The Fashion checkout header: the house name and a way to reach care, with the
 * reassurance at the far end. No navigation, search, or bag: the summary's
 * "Edit bag" is the one way back a shopper needs.
 */
export async function CheckoutHeader() {
  const department = await getDepartment('fashion')

  return (
    <header className="container flex h-16 items-center gap-2">
      {/* The bare `/` only redirects to a department, and blanks the page while it does. */}
      <Link
        href={department ? `/${department.slug}` : '/'}
        className="outline-ring text-foreground-intense font-mono text-lg font-semibold uppercase"
      >
        The Avenue 30
      </Link>
      <NavigationLink render={<Link href="/contact" />} className="ms-4 font-mono whitespace-nowrap uppercase">
        Need help?
      </NavigationLink>
      <Badge variant="outline" size="lg" className="ms-auto">
        <Lock aria-hidden className="size-3.5" />
        <span className="max-sm:sr-only">Payment 100% secure</span>
      </Badge>
    </header>
  )
}
