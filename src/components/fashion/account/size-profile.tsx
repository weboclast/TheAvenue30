'use client'

import { useId, useState, useTransition } from 'react'
import { CircleXFilled } from '@appica/icons-react'
import { Alert, AlertIcon, AlertTitle } from '@appica/ui-react/alert'
import { Button } from '@appica/ui-react/button'
import { useToastManager } from '@appica/ui-react/toast'
import { PillGroup, PillOption } from '@/components/fashion/pill-group'
import {
  Overlay,
  OverlayBody,
  OverlayContent,
  OverlayDescription,
  OverlayFooter,
  OverlayHeader,
  OverlayTitle,
} from '@/components/overlay-sheet'
import { updateProfileAction } from '@/lib/profile/actions'
import { FIT_PREFERENCES, SIZE_SCALES, type ShopperProfile, fitPreferenceLabel, sizeLabel } from '@/lib/profile/profile'
import { successToast } from '@/lib/toast'

/**
 * The shopper's usual sizes and how they like things to fit, and the dialog that
 * changes them. Kept on the profile through `lib/profile`, which is where a
 * size suggestion on the product page would read them.
 */
export function SizeProfile({ profile }: { profile: ShopperProfile }) {
  const [current, setCurrent] = useState(profile)
  const [editing, setEditing] = useState(false)
  const fit = current.fit && fitPreferenceLabel(current.fit)

  return (
    <section aria-labelledby="size-profile" className="bg-background-muted flex flex-col gap-2 rounded-sm p-1.5">
      <div className="flex items-center gap-2 px-2 py-1">
        <h2 id="size-profile" className="text-foreground-intense min-w-0 flex-1 text-lg font-medium">
          Your sizes
        </h2>
        <Button variant="outline" onClick={() => setEditing(true)}>
          Edit
        </Button>
      </div>

      <dl className="bg-background rounded-3xs grid grid-cols-2 gap-5 p-4 sm:grid-cols-4">
        {SIZE_SCALES.map((scale) => {
          const size = current.sizes?.[scale.id]
          return (
            <div key={scale.id} className="flex flex-col gap-1">
              <dt>{scale.label}</dt>
              <dd className={size ? 'text-foreground-intense font-mono text-lg' : 'text-foreground-subtle'}>
                {size ? sizeLabel(scale, size) : 'Not set'}
              </dd>
            </div>
          )
        })}
        <div className="flex flex-col gap-1">
          <dt>Fit</dt>
          <dd className={fit ? 'text-foreground-intense text-lg' : 'text-foreground-subtle'}>{fit || 'Not set'}</dd>
        </div>
      </dl>

      <SizeProfileDialog open={editing} profile={current} onOpenChange={setEditing} onSaved={setCurrent} />
    </section>
  )
}

interface SizeProfileDialogProps {
  open: boolean
  profile: ShopperProfile
  onOpenChange: (open: boolean) => void
  /** The profile the store accepted, for the section to adopt. */
  onSaved: (profile: ShopperProfile) => void
}

/** Picks a size per garment and a fit. The form goes with the panel once it has closed, so a cancel discards the picks. */
function SizeProfileDialog({ open, profile, onOpenChange, onSaved }: SizeProfileDialogProps) {
  return (
    <Overlay open={open} onOpenChange={onOpenChange}>
      <OverlayContent className="w-140" closeLabel="Close">
        <SizeForm profile={profile} onClose={() => onOpenChange(false)} onSaved={onSaved} />
      </OverlayContent>
    </Overlay>
  )
}

function SizeForm({
  profile,
  onClose,
  onSaved,
}: Omit<SizeProfileDialogProps, 'open' | 'onOpenChange'> & { onClose: () => void }) {
  const id = useId()
  const toast = useToastManager()
  const [pending, startTransition] = useTransition()
  const [sizes, setSizes] = useState(profile.sizes ?? {})
  const [fit, setFit] = useState(profile.fit)
  const [refused, setRefused] = useState<string>()

  const save = () =>
    startTransition(async () => {
      setRefused(undefined)
      const result = await updateProfileAction({ sizes, fit: fit ?? null })
      if (!result.ok) {
        setRefused(result.error)
        return
      }

      onSaved(result.profile)
      toast.add(successToast('Sizes saved'))
      onClose()
    })

  return (
    <>
      <OverlayHeader>
        <OverlayTitle className="font-medium">Your sizes</OverlayTitle>
        <OverlayDescription>The sizes you usually take, kept with your account.</OverlayDescription>
      </OverlayHeader>

      <OverlayBody className="flex flex-col gap-6 pb-1">
        {refused ? (
          <Alert variant="error" role="alert">
            <AlertIcon>
              <CircleXFilled />
            </AlertIcon>
            <AlertTitle as="div" className="text-sm font-normal">
              {refused}
            </AlertTitle>
          </Alert>
        ) : null}

        {SIZE_SCALES.map((scale) => (
          <div key={scale.id} className="flex flex-col gap-3">
            <p id={`${id}-${scale.id}`} className="text-foreground-intense font-medium">
              {scale.label}
              {scale.system ? <span className="ms-1 font-normal">({scale.system})</span> : null}
            </p>
            <PillGroup
              aria-labelledby={`${id}-${scale.id}`}
              value={sizes[scale.id]}
              onValueChange={(size) => setSizes((picked) => ({ ...picked, [scale.id]: size }))}
            >
              {scale.sizes.map((size) => (
                <PillOption key={size} value={size} size="sm" className="min-w-11">
                  {size}
                </PillOption>
              ))}
            </PillGroup>
          </div>
        ))}

        <div className="flex flex-col gap-3">
          <p id={`${id}-fit`} className="text-foreground-intense font-medium">
            How you like things to fit
          </p>
          <PillGroup aria-labelledby={`${id}-fit`} value={fit} onValueChange={setFit}>
            {FIT_PREFERENCES.map((option) => (
              <PillOption key={option.id} value={option.id} size="sm">
                {option.label}
              </PillOption>
            ))}
          </PillGroup>
        </div>
      </OverlayBody>

      <OverlayFooter>
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="button" disabled={pending} focusableWhenDisabled onClick={save}>
          Save sizes
        </Button>
      </OverlayFooter>
    </>
  )
}
