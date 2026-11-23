'use client'

import { useId, useState } from 'react'
import { Badge } from '@appica/ui-react/badge'
import { Switch } from '@appica/ui-react/switch'
import {
  ESSENTIAL_TOPICS,
  MARKETING_TOPICS,
  NOTIFICATION_CHANNELS,
  type NotificationPreferences as Preferences,
} from '@/lib/notifications'
import { cn } from '@/lib/utils'

const ROW = 'flex items-center justify-between gap-4 py-5'

/** The dashed rule the account's order list uses. */
const LIST = 'border-border-strong border-b border-dashed'
const ITEM = 'border-border-strong border-t border-dashed'

interface NotificationPreferencesProps {
  /** What the shopper is currently signed up for. */
  preferences: Preferences
}

/**
 * The account's notification settings: what the store may send, and where it
 * arrives. `lib/notifications.ts` owns the topics, the channels, and the copy.
 *
 * Switches rather than a save button, because every control takes effect at
 * once. Marketing gets a master switch above it; the transactional topics get no
 * switch at all, so nobody can turn off the mail saying their password changed.
 */
export function NotificationPreferences({ preferences }: NotificationPreferencesProps) {
  const [prefs, setPrefs] = useState(preferences)
  const marketingHeading = useId()
  const essentialHeading = useId()
  const channelHeading = useId()

  // Local state only: this template ships no messaging backend. A real store
  // sends `next` from a Server Action here. See `lib/notifications.ts`.
  const apply = (next: Preferences) => setPrefs(next)

  const toggle = (list: string[], id: string, on: boolean) =>
    on ? [...list, id] : list.filter((entry) => entry !== id)

  // An override, not a bulk edit: off silences every topic without forgetting
  // which ones were on.
  const paused = !prefs.marketing

  return (
    <>
      <section className="flex flex-col gap-2">
        <div className="flex items-center justify-between gap-4">
          <div className="flex min-w-0 flex-col gap-1">
            <h2 id={marketingHeading} className="text-foreground-intense text-xl font-medium">
              Offers and updates
            </h2>
            <p className="text-foreground-muted text-sm">
              {paused
                ? 'Paused. Order and account messages below are not affected.'
                : 'Choose which of these are worth an interruption, or turn them all off with the switch beside this heading.'}
            </p>
          </div>
          <Switch
            checked={prefs.marketing}
            onCheckedChange={(marketing) => apply({ ...prefs, marketing })}
            aria-labelledby={marketingHeading}
            className="mt-1"
          />
        </div>

        <ul aria-labelledby={marketingHeading} data-slot="account-rule" className={LIST}>
          {MARKETING_TOPICS.map(({ id, title, description }) => (
            <li key={id} data-slot="account-rule" className={ITEM}>
              <label className={cn(ROW, 'select-none')}>
                <span className="flex min-w-0 flex-col">
                  <span className={cn('font-medium', paused ? 'text-foreground-muted' : 'text-foreground-intense')}>
                    {title}
                  </span>
                  <span className={cn('text-sm', paused ? 'text-foreground-subtle' : 'text-foreground-muted')}>
                    {description}
                  </span>
                </span>
                <Switch
                  disabled={paused}
                  checked={prefs.topics.includes(id)}
                  onCheckedChange={(on) => apply({ ...prefs, topics: toggle(prefs.topics, id, on) })}
                  className="mt-1"
                />
              </label>
            </li>
          ))}
        </ul>
      </section>

      <section className="flex flex-col gap-2 pt-4">
        <h2 id={essentialHeading} className="text-foreground-intense text-xl font-medium">
          Order and account messages
        </h2>
        <p className="text-foreground-muted text-sm">
          These answer something you did, so they are sent whatever you choose above. Where they arrive is up to you.
        </p>

        <ul aria-labelledby={essentialHeading} data-slot="account-rule" className={LIST}>
          {ESSENTIAL_TOPICS.map(({ id, title, description }) => (
            <li key={id} data-slot="account-rule" className={ITEM}>
              <div className={ROW}>
                <div className="flex min-w-0 flex-col">
                  <p className="text-foreground-intense font-medium">{title}</p>
                  <p className="text-foreground-muted text-sm">{description}</p>
                </div>
                {/* No switch on purpose: see `ESSENTIAL_TOPICS`. */}
                <Badge variant="soft" className="mt-1 shrink-0">
                  Always on
                </Badge>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="flex flex-col gap-2 pt-4">
        <h2 id={channelHeading} className="text-foreground-intense text-xl font-medium">
          Where we reach you
        </h2>
        <p className="text-foreground-muted text-sm">Applies to everything above, marketing and order updates alike.</p>

        <ul aria-labelledby={channelHeading} data-slot="account-rule" className={LIST}>
          {NOTIFICATION_CHANNELS.map(({ id, label, detail, required }) => (
            <li key={id} data-slot="account-rule" className={ITEM}>
              <label className={cn(ROW, 'select-none')}>
                <span className="flex min-w-0 flex-col">
                  <span className="text-foreground-intense font-medium">{label}</span>
                  <span className="text-foreground-muted text-sm">{detail}</span>
                </span>
                <Switch
                  disabled={required}
                  checked={required || prefs.channels.includes(id)}
                  onCheckedChange={(on) => apply({ ...prefs, channels: toggle(prefs.channels, id, on) })}
                  className="mt-1"
                />
              </label>
            </li>
          ))}
        </ul>
      </section>
    </>
  )
}
