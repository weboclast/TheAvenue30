'use client'

import { useState } from 'react'
import { Mail, Phone, Puzzle, Send, UserCircle } from '@appica/icons-react'
import { Button } from '@appica/ui-react/button'
import { ProfileDialog } from '@/components/account/profile-dialog'
import type { FieldVariant } from '@/components/address-fields'
import { type ShopperProfile, contactMethodLabel, interestLabels, profileName } from '@/lib/profile/profile'

/** One line of the card: what it asks, and what the shopper answered. */
interface ProfileRow {
  icon: typeof UserCircle
  label: string
  /** Empty where the shopper has not answered, which the row says instead. */
  values: string[]
}

interface ProfileSummaryProps {
  profile: ShopperProfile
  /** How the edit dialog's fields are drawn. @default 'soft' */
  fieldVariant?: FieldVariant
}

/**
 * The card at the top of the account settings: everything the store knows about
 * this shopper, and the 1 button that changes it.
 *
 * It owns the profile, because the dialog hands back what the store accepted.
 * `lib/profile` is the seam; nothing here knows what is behind it.
 */
export function ProfileSummary({ profile, fieldVariant }: ProfileSummaryProps) {
  const [current, setCurrent] = useState(profile)
  const [editing, setEditing] = useState(false)

  const rows: ProfileRow[] = [
    { icon: UserCircle, label: 'Full name', values: [profileName(current)] },
    { icon: Mail, label: 'Email address', values: [current.email] },
    { icon: Phone, label: 'Phone number', values: current.phone ? [current.phone] : [] },
    {
      icon: Send,
      label: 'Get in touch',
      values: [contactMethodLabel(current.contactMethod)].filter((label) => label !== undefined),
    },
    { icon: Puzzle, label: 'Hobbies and interests', values: interestLabels(current.interests) },
  ]

  return (
    <section data-slot="account-panel" className="bg-background-muted flex flex-col gap-2 rounded-xl p-2">
      <div className="flex items-center gap-2 px-2 py-1">
        <h2 data-slot="account-title" className="text-foreground-intense min-w-0 flex-1 font-medium">
          Profile information
        </h2>
        <Button variant="outline" onClick={() => setEditing(true)}>
          Edit
        </Button>
      </div>

      <dl data-slot="account-panel-item" className="bg-background flex flex-col gap-2 rounded-lg p-4 text-sm">
        {rows.map(({ icon: Icon, label, values }) => (
          <div key={label} data-slot="account-copy" className="flex flex-wrap items-center gap-x-1.5 gap-y-1">
            <Icon aria-hidden className="size-4.5 shrink-0" />
            <dt>{label}:</dt>
            {values.length === 0 ? (
              <dd className="text-foreground-subtle">Not added yet</dd>
            ) : (
              values.map((value) => (
                <dd
                  key={value}
                  className="text-foreground-intense not-last:after:text-foreground-muted font-medium not-last:after:ms-1.5 not-last:after:content-['/']"
                >
                  {value}
                </dd>
              ))
            )}
          </div>
        ))}
      </dl>

      <ProfileDialog
        open={editing}
        profile={current}
        onOpenChange={setEditing}
        onSaved={setCurrent}
        fieldVariant={fieldVariant}
      />
    </section>
  )
}
