import type { Metadata } from 'next'
import { ProfileSummary } from '@/components/account/profile-summary'
import { SavedAddresses } from '@/components/account/saved-addresses'
import { SavedPaymentMethods } from '@/components/account/saved-payment-methods'
import { CIRCLE_FLAGS } from '@/components/address-fields'
import { SizeProfile } from '@/components/fashion/account/size-profile'
import { listSavedAddresses } from '@/lib/addresses'
import { listSavedPaymentMethods } from '@/lib/payments'
import { getProfile } from '@/lib/profile'

export const metadata: Metadata = {
  title: 'Profile',
}

/**
 * Who the shopper is to the store: their details, the sizes they take, and what
 * the checkout can fill in for them. Each section sits on its own seam
 * (`lib/profile`, `lib/addresses`, `lib/payments`), none of them the commerce
 * adapter, since who a shopper is does not depend on what the store sells.
 */
export default async function FashionAccountProfilePage() {
  const [profile, addresses, methods] = await Promise.all([
    getProfile(),
    listSavedAddresses(),
    listSavedPaymentMethods(),
  ])
  // The account layout gates this area, so only a signed-in shopper gets here.
  if (!profile) return null

  return (
    <>
      <h1 className="text-foreground-intense text-3xl font-medium md:text-4xl">Profile</h1>

      <ProfileSummary profile={profile} fieldVariant="outline" />
      <SizeProfile profile={profile} />
      <SavedAddresses addresses={addresses} fieldVariant="outline" flags={CIRCLE_FLAGS} />
      <SavedPaymentMethods methods={methods} heading="Payment methods" fieldVariant="outline" flags={CIRCLE_FLAGS} />
    </>
  )
}
