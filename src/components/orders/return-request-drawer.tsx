'use client'

import { type SubmitEvent, useState, useTransition } from 'react'
import Image from 'next/image'
import { CircleXFilled, ShieldCheck } from '@appica/icons-react'
import { Alert, AlertIcon, AlertTitle } from '@appica/ui-react/alert'
import { Button } from '@appica/ui-react/button'
import { Badge } from '@appica/ui-react/badge'
import { Checkbox } from '@appica/ui-react/checkbox'
import {
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@appica/ui-react/drawer'
import { Field, FieldLabel } from '@appica/ui-react/field'
import { Form } from '@appica/ui-react/form'
import { useDirection } from '@appica/ui-react/hooks/use-direction'
import { Radio } from '@appica/ui-react/radio'
import { ScrollArea } from '@appica/ui-react/scroll-area'
import { RadioGroup } from '@appica/ui-react/radio-group'
import { Textarea } from '@appica/ui-react/textarea'
import { useToastManager } from '@appica/ui-react/toast'
import { Price } from '@/components/price'
import { useHeldWhileClosing } from '@/components/use-held-while-closing'
import type { CartLine, Order } from '@/lib/commerce/types'
import type { DemoSlug } from '@/lib/demos'
import { requestReturnAction } from '@/lib/orders/actions'
import { MAX_RETURN_NOTES, returnReasons } from '@/lib/orders/returns'
import { successToast } from '@/lib/toast'

interface ReturnRequestDrawerProps {
  demo: DemoSlug
  /** The order to open a return against. `null` closes the drawer. */
  order: Order | null
  onOpenChange: (open: boolean) => void
}

/**
 * Opening a return: which lines are going back, and why. A side drawer at every
 * width, like the sign-in drawer, so its horizontal dismiss never fights the
 * vertical scroll.
 *
 * Takes the order rather than an `open` flag so it can stay mounted: a drawer
 * first rendered open skips its entrance and appears rather than slides.
 *
 * Nothing is priced or refunded here; `requestReturnAction` is where a store
 * hooks that up.
 */
export function ReturnRequestDrawer({ demo, order, onOpenChange }: ReturnRequestDrawerProps) {
  const rtl = useDirection() === 'rtl'
  const shown = useHeldWhileClosing(order, order !== null)

  return (
    <Drawer side={rtl ? 'left' : 'right'} open={order !== null} onOpenChange={onOpenChange}>
      <DrawerContent className="md:w-140">
        {/* Keyed on the order, so opening a second one starts with nothing
            selected rather than the last one's lines and reason. */}
        {shown ? <ReturnRequestForm key={shown.number} demo={demo} order={shown} onOpenChange={onOpenChange} /> : null}
      </DrawerContent>
    </Drawer>
  )
}

/**
 * The form itself, mounted only while the drawer holds an order, so its state is
 * thrown away with the panel and the `key` above is enough to reset it.
 */
function ReturnRequestForm({ demo, order, onOpenChange }: ReturnRequestDrawerProps & { order: Order }) {
  const toast = useToastManager()
  const [pending, startTransition] = useTransition()
  const [selected, setSelected] = useState<string[]>([])
  const reasons = returnReasons(demo)
  const [reason, setReason] = useState(reasons[0].id)
  const [notes, setNotes] = useState('')
  const [refused, setRefused] = useState<string>()

  const toggle = (lineId: string, checked: boolean) => {
    setRefused(undefined)
    setSelected((previous) => (checked ? [...previous, lineId] : previous.filter((id) => id !== lineId)))
  }

  const handleSubmit = (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault()

    startTransition(async () => {
      const result = await requestReturnAction(demo, {
        orderNumber: order.number,
        lineIds: selected,
        reason,
        ...(notes.trim() && { notes: notes.trim() }),
      })

      if (!result.ok) {
        setRefused(result.error)
        return
      }

      toast.add(successToast('Return requested', `We will email the next steps to ${order.email}.`))
      onOpenChange(false)
    })
  }

  return (
    <>
      <DrawerHeader>
        <DrawerTitle className="font-medium">Request return</DrawerTitle>
        <DrawerDescription>Select the items you&apos;d like to return and tell us why</DrawerDescription>
      </DrawerHeader>

      <Form noValidate onSubmit={handleSubmit} className="contents">
        <DrawerBody className="flex flex-col overflow-hidden px-0">
          <ScrollArea className="min-h-0 flex-1" scrollbarVisibility="auto">
            <div className="flex flex-col gap-6 px-6">
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

              <ul className="flex flex-col gap-1">
                {order.lines.map((line) => (
                  <li key={line.id}>
                    <ReturnLine
                      line={line}
                      checked={selected.includes(line.id)}
                      onCheckedChange={(checked) => toggle(line.id, checked)}
                    />
                  </li>
                ))}
              </ul>

              <section className="flex flex-col gap-3">
                <h3 className="text-foreground-intense font-medium">Reason for return</h3>
                <RadioGroup
                  aria-label="Reason for return"
                  value={reason}
                  onValueChange={(next) => setReason(String(next))}
                  className="flex flex-col gap-2"
                >
                  {reasons.map((option) => (
                    <label key={option.id} className="flex w-fit cursor-pointer items-center gap-2 text-sm">
                      <Radio value={option.id} />
                      {option.label}
                    </label>
                  ))}
                </RadioGroup>
              </section>

              <Field name="return-notes">
                <FieldLabel>Other reason for return</FieldLabel>
                <Textarea
                  variant="soft"
                  rows={5}
                  maxLength={MAX_RETURN_NOTES}
                  placeholder="Tell us what went wrong…"
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                />
              </Field>
            </div>
          </ScrollArea>
        </DrawerBody>

        <DrawerFooter className="pb-0">
          <Button
            type="submit"
            size="lg"
            className="w-full"
            disabled={pending || selected.length === 0}
            focusableWhenDisabled
          >
            {pending ? 'Sending…' : 'Submit return'}
          </Button>
        </DrawerFooter>
      </Form>
    </>
  )
}

interface ReturnLineProps {
  line: CartLine
  checked: boolean
  onCheckedChange: (checked: boolean) => void
}

/**
 * One order line, offered for return. The whole row is the checkbox's label:
 * picking what goes back is the only thing to do here, and the product links a
 * receipt carries would walk a shopper out of a half-filled form.
 */
function ReturnLine({ line, checked, onCheckedChange }: ReturnLineProps) {
  return (
    <label className="hover:bg-background-subtle flex cursor-pointer items-start gap-3 rounded-lg p-2 transition-colors motion-reduce:transition-none">
      <span className="flex h-16 shrink-0 items-center">
        <Checkbox checked={checked} onCheckedChange={(next) => onCheckedChange(Boolean(next))} />
      </span>

      {/* The badge sits outside the clipping box, or `overflow-hidden` would cut it off. */}
      <span className="relative shrink-0">
        <span className="bg-background-muted relative block size-16 overflow-hidden rounded-sm">
          <Image src={(line.packshot ?? line.image).src} alt="" fill sizes="64px" className="object-contain p-1" />
        </span>
        <Badge variant="outline" size="icon-sm" className="bg-background absolute -inset-e-2 -top-2 text-xs">
          {line.quantity}
        </Badge>
      </span>

      <span className="flex min-w-0 flex-1 flex-col gap-1">
        <span className="text-foreground-intense line-clamp-2 text-sm">{line.title}</span>

        {line.options ? (
          <span className="text-xs">{line.options.map((option) => option.value).join(' / ')}</span>
        ) : null}

        <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <Price money={line.lineTotal} className="text-foreground-intense text-sm font-semibold" />
          {line.compareAtTotal ? (
            <Price
              money={line.compareAtTotal}
              compareAt
              scaleFraction={false}
              className="text-foreground-subtle text-xs line-through"
            />
          ) : null}
          {line.protectionPlan ? (
            <Badge variant="soft" size="sm" className="ms-auto">
              <ShieldCheck aria-hidden className="size-3.5" />
              Protection: <Price money={line.protectionPlan.price} scaleFraction={false} />
            </Badge>
          ) : null}
        </span>
      </span>
    </label>
  )
}
