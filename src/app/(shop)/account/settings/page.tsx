import type { Metadata } from 'next'
import { AccountSecurity } from '@/components/account/account-security'
import { ConnectedAccounts } from '@/components/account/connected-accounts'
import { DangerZone } from '@/components/account/danger-zone'
import { NotificationPreferences } from '@/components/account/notification-preferences'
import { canChangePassword } from '@/lib/auth'
import { DEFAULT_NOTIFICATION_PREFERENCES } from '@/lib/notifications'
import { getProfile } from '@/lib/profile'

export const metadata: Metadata = {
  title: 'Settings',
}

/**
 * How the account behaves: what the store sends and where, what the shopper
 * signs in with, what guards it, and how to take a copy of it or close it. The
 * notification defaults stand in for a read a real store makes here; see
 * `lib/notifications.ts`.
 */
export default async function FashionAccountSettingsPage() {
  const profile = await getProfile()
  // The account layout gates this area, so only a signed-in shopper gets here.
  if (!profile) return null

  return (
    <>
      <h1 className="text-foreground-intense text-3xl font-medium md:text-4xl">Settings</h1>

      <NotificationPreferences preferences={DEFAULT_NOTIFICATION_PREFERENCES} />
      <ConnectedAccounts connections={profile.connections} email={profile.email} />
      <AccountSecurity twoFactor={profile.twoFactor} canChangePassword={canChangePassword()} fieldVariant="outline" />
      <DangerZone email={profile.email} fieldVariant="outline" />
    </>
  )
}
