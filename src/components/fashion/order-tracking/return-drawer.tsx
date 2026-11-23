'use client'

import { type SubmitEvent, useId, useState, useTransition } from 'react'
import Image from 'next/image'
import { CircleXFilled } from '@appica/icons-react'
import { Alert, AlertIcon, AlertTitle } from '@appica/ui-react/alert'
import { Button } from '@appica/ui-react/button'
import { Checkbox } from '@appica/ui-react/checkbox'
import { CheckboxGroup } from '@appica/ui-react/checkbox-group'
import {
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@appica/ui-react/drawer'
import { Field, FieldDescription, FieldError, FieldLabel } from '@appica/ui-react/field'
import { Form } from '@appica/ui-react/form'
import { useDirection } from '@appica/ui-react/hooks/use-direction'
import { ScrollArea } from '@appica/ui-react/scroll-area'
import { Textarea } from '@appica/ui-react/textarea'
import { useToastManager } from '@appica/ui-react/toast'
import { PillGroup, PillOption } from '@/components/fashion/pill-group'
import { Price } from '@/components/price'
import { useHeldWhileClosing } from '@/components/use-held-while-closing'
import type { Order } from '@/lib/commerce/types'
import { hasError, revealFirstInvalidField } from '@/lib/form-errors'
import { requestReturnAction } from '@/lib/orders/actions'
import { MAX_RETURN_NOTES, returnReasons } from '@/lib/orders/returns'
import { successToast } from '@/lib/toast'

const REASONS = returnReasons('fashion')

interface ReturnDrawerProps {
  /** The order to open a return against. `null` closes the drawer. */
  order: Order | null
  onOpenChange: (open: boolean) => void
}

/**
 * Opening a return: which pieces are going back, and why. Takes the order rather
 * than an `open` flag so it can stay mounted, since a drawer first rendered open
 * skips its entrance. Nothing is priced or refunded here; that is
 * `requestReturnAction`.
 */
export function ReturnDrawer({ order, onOpenChange }: ReturnDrawerProps) {
  const rtl = useDirection() === 'rtl'
  const shown = useHeldWhileClosing(order, order !== null)

  return (
    <Drawer side={rtl ? 'left' : 'right'} open={order !== null} onOpenChange={onOpenChange}>
      <DrawerContent className="w-115" closeLabel="Close return">
        {/* Keyed on the order, so a second one starts with nothing picked. */}
        {shown ? <ReturnForm key={shown.number} order={shown} onOpenChange={onOpenChange} /> : null}
      </DrawerContent>
    </Drawer>
  )
}

function ReturnForm({ order, onOpenChange }: { order: Order; onOpenChange: (open: boolean) => void }) {
  const id = useId()
  const toast = useToastManager()
  const [pending, startTransition] = useTransition()
  const [selected, setSelected] = useState<string[]>([])
  const [reason, setReason] = useState<string>()
  const [notes, setNotes] = useState('')
  const [errors, setErrors] = useState<{ lines?: string; reason?: string }>({})
  const [refused, setRefused] = useState<string>()

  const handleSubmit = (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault()

    const next = {
      lines: selected.length === 0 ? 'Pick at least 1 piece to send back.' : undefined,
      reason: reason ? undefined : 'Tell us why it is going back.',
    }
    setErrors(next)
    setRefused(undefined)
    if (hasError(next) || !reason) {
      revealFirstInvalidField(event.currentTarget)
      return
    }

    startTransition(async () => {
      const result = await requestReturnAction('fashion', {
        orderNumber: order.number,
        lineIds: selected,
        reason,
        ...(notes.trim() && { notes: notes.trim() }),
      })
      if (!result.ok) {
        setRefused(result.error)
        return
      }

      toast.add(successToast('Return requested', `We will email the return label to ${order.email}.`))
      onOpenChange(false)
    })
  }

  return (
    <>
      <DrawerHeader>
        <DrawerTitle className="font-medium">Start a return</DrawerTitle>
        <DrawerDescription>
          Unworn, with the tags on, within 30 days of delivery. Free within the EU and the UK.
        </DrawerDescription>
      </DrawerHeader>

      <Form noValidate onSubmit={handleSubmit} className="contents">
        <DrawerBody className="overflow-hidden px-0">
          <ScrollArea className="h-full" scrollbarVisibility="auto">
            <div className="flex flex-col gap-8 px-6 py-1">
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

              <Field name="return-lines" invalid={Boolean(errors.lines)} className="gap-3">
                <p id={`${id}-lines`} className="text-foreground-intense font-medium">
                  What is going back?
                </p>
                <CheckboxGroup
                  aria-labelledby={`${id}-lines`}
                  value={selected}
                  onValueChange={(next) => {
                    setSelected(next)
                    if (next.length) setErrors((previous) => ({ ...previous, lines: undefined }))
                  }}
                  className="flex flex-col gap-4"
                >
                  {order.lines.map((line) => (
                    <label key={line.id} className="flex cursor-pointer items-center gap-4">
                      <Checkbox name={line.id} />
                      <span className="bg-background-muted rounded-2xs relative aspect-4/5 w-16 shrink-0 overflow-hidden">
                        <Image src={line.image.src} alt="" fill sizes="64px" className="object-cover" />
                      </span>
                      <span className="flex min-w-0 flex-1 flex-col gap-1">
                        <span className="text-foreground-intense line-clamp-2">{line.title}</span>
                        <span className="text-xs">
                          {[...(line.options?.map((option) => option.value) ?? []), `Qty ${line.quantity}`].join(' · ')}
                        </span>
                        <Price
                          money={line.lineTotal}
                          scaleFraction={false}
                          className="text-foreground-intense font-mono text-sm font-semibold"
                        />
                      </span>
                    </label>
                  ))}
                </CheckboxGroup>
                <FieldError match={Boolean(errors.lines)}>{errors.lines}</FieldError>
              </Field>

              <Field name="return-reason" invalid={Boolean(errors.reason)} className="gap-3">
                <p id={`${id}-reason`} className="text-foreground-intense font-medium">
                  Why is it going back?
                </p>
                <PillGroup
                  aria-labelledby={`${id}-reason`}
                  value={reason}
                  onValueChange={(next) => {
                    setReason(next)
                    setErrors((previous) => ({ ...previous, reason: undefined }))
                  }}
                >
                  {REASONS.map((option) => (
                    <PillOption key={option.id} value={option.id}>
                      {option.label}
                    </PillOption>
                  ))}
                </PillGroup>
                <FieldError match={Boolean(errors.reason)}>{errors.reason}</FieldError>
              </Field>

              <Field name="return-notes">
                <FieldLabel>Anything else we should know?</FieldLabel>
                <Textarea
                  variant="outline"
                  inputSize="lg"
                  rows={4}
                  maxLength={MAX_RETURN_NOTES}
                  placeholder="The size you would rather have, or what was wrong with it"
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                />
                <FieldDescription>Optional. Photos of any damage can follow by email.</FieldDescription>
              </Field>
            </div>
          </ScrollArea>
        </DrawerBody>

        <DrawerFooter>
          <Button type="submit" size="lg" className="w-full" disabled={pending} focusableWhenDisabled>
            {pending ? 'Sending…' : 'Request return'}
          </Button>
        </DrawerFooter>
      </Form>
    </>
  )
}
