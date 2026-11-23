'use client'

import { useId, useState, useTransition } from 'react'
import { BrandAppleFilled, Link, LinkOff } from '@appica/icons-react'
import { Button } from '@appica/ui-react/button'
import { useToastManager } from '@appica/ui-react/toast'
import { FacebookMark, GoogleMark } from '@/components/social-marks'
import { type ProfileActionResult, connectAccountAction, disconnectAccountAction } from '@/lib/profile/actions'
import { SOCIAL_PROVIDER_LABELS, SOCIAL_PROVIDERS, type Connection, type SocialProviderId } from '@/lib/profile/profile'
import { errorToast } from '@/lib/toast'
import { cn } from '@/lib/utils'

/** What a mark is called with, which is all the 2 kinds below have in common. */
interface MarkProps {
  className?: string
  'aria-hidden'?: boolean
}

/**
 * The mark each provider is recognized by. Google and Facebook publish theirs
 * in fixed colors, so those 2 are inline SVGs; see `components/social-marks.tsx`.
 */
const PROVIDER_MARKS: Record<SocialProviderId, React.ComponentType<MarkProps>> = {
  google: GoogleMark,
  apple: BrandAppleFilled,
  facebook: FacebookMark,
}

interface ConnectedAccountsProps {
  /** What is linked now, 1 entry per provider. */
  connections: Connection[]
  /** The shopper's own address, which stands in for what a callback would name. */
  email: string
}

/**
 * The accounts a shopper can also sign in from, 1 card each.
 *
 * **The buttons stand in for the provider's own consent screen.** A real store
 * sends the shopper there and links on the callback; see `lib/profile/AGENTS.md`.
 */
export function ConnectedAccounts({ connections, email }: ConnectedAccountsProps) {
  const [linked, setLinked] = useState(connections)
  const [working, startTransition] = useTransition()
  const toast = useToastManager()
  const heading = useId()

  /** Runs a change and adopts what came back. A refusal is the store's answer, so it is toasted. */
  const run = (title: string, action: () => Promise<ProfileActionResult>) =>
    startTransition(async () => {
      const result = await action()
      if (!result.ok) {
        toast.add(errorToast(title, result.error))
        return
      }

      setLinked(result.profile.connections)
    })

  return (
    <section className="flex flex-col gap-3 pt-4">
      <div className="flex flex-col gap-1">
        <h2 id={heading} className="text-foreground-intense text-xl font-medium">
          Third-party accounts
        </h2>
        <p className="text-foreground-muted text-sm">
          Link an account you already have, and sign in with it instead of a password. Unlinking one never changes the
          password on this store.
        </p>
      </div>

      <ul aria-labelledby={heading} className="grid gap-2 sm:grid-cols-3">
        {SOCIAL_PROVIDERS.map((provider) => {
          const Mark = PROVIDER_MARKS[provider]
          const label = SOCIAL_PROVIDER_LABELS[provider]
          const connection = linked.find((entry) => entry.provider === provider)

          return (
            <li key={provider} data-slot="account-card" className="flex flex-col gap-3 rounded-xl border p-4">
              <div className="flex items-start gap-2">
                <div className="flex min-w-0 flex-1 flex-col">
                  <p data-slot="account-copy" className="text-foreground-intense truncate text-sm font-medium">
                    {label}
                  </p>
                  <p className="text-foreground-muted truncate text-sm">
                    {connection ? (connection.account ?? 'Connected') : 'Not linked'}
                  </p>
                </div>
                <Mark
                  aria-hidden
                  // The filled disc reads heavier than an outline, so it sits a step smaller.
                  className={cn('text-foreground-intense shrink-0', provider === 'facebook' ? 'size-5.5' : 'size-6')}
                />
              </div>

              {/* Pushed to the bottom, so 3 cards of different heights line their buttons up. */}
              {connection ? (
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-auto w-fit"
                  disabled={working}
                  onClick={() => run(`Could not unlink ${label}`, () => disconnectAccountAction(provider))}
                >
                  <LinkOff data-icon="start" />
                  Disconnect
                </Button>
              ) : (
                <Button
                  size="sm"
                  className="mt-auto w-fit"
                  disabled={working}
                  // The shopper's own address stands in for the one the callback
                  // would return. Drop it once a real provider answers.
                  onClick={() => run(`Could not link ${label}`, () => connectAccountAction(provider, email))}
                >
                  <Link data-icon="start" />
                  Connect
                </Button>
              )}
            </li>
          )
        })}
      </ul>
    </section>
  )
}
