'use client'

import { useId, useState, useTransition } from 'react'
import { CreditCard, Plus, ShieldCheck, ShieldCheckFilled } from '@appica/icons-react'
import {
  AlertDialog,
  AlertDialogClose,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@appica/ui-react/alert-dialog'
import { Badge } from '@appica/ui-react/badge'
import { Button } from '@appica/ui-react/button'
import { useToastManager } from '@appica/ui-react/toast'
import { PaymentMethodDialog, type PaymentMethodFormTarget } from '@/components/account/payment-method-dialog'
import type { FieldLook } from '@/components/address-fields'
import {
  type PaymentMarkName,
  PaymentMark,
  PaymentMethods,
  hasPaymentMark,
  paymentMarkSlot,
  paymentMethodMark,
} from '@/components/payment-methods'
import { type PaymentActionResult, forgetPaymentMethodAction, updatePaymentMethodAction } from '@/lib/payments/actions'
import { errorToast } from '@/lib/toast'
import {
  MASK,
  PAYMENT_METHOD_LABELS,
  type SavedPaymentMethod,
  expiryStatus,
  formatExpiry,
  maskAccount,
} from '@/lib/payments/methods'

/**
 * What this store promises about the card details it holds. The name is here
 * once, so renaming the store is 1 edit.
 */
const PROTECTION = {
  store: 'The Avenue 30',
  points: [
    'The Avenue 30 sticks to the Payment Card Industry Data Security Standard (PCI DSS).',
    'We keep all your data protected.',
    'Your card details are safe and sound with us.',
    "The Avenue 30 won't ever sell your card info.",
  ],
}

/**
 * The marks advertised here, which is a shorter list than the footer's: a wallet
 * is linked at its own provider, so nothing on this page can add one.
 */
const SAVABLE_MARKS: PaymentMarkName[] = ['Visa', 'Mastercard', 'Maestro', 'American Express', 'Diners Club', 'PayPal']

interface SavedPaymentMethodsProps extends FieldLook {
  /** What the shopper has saved, the default first. */
  methods: SavedPaymentMethod[]
  /**
   * A heading shown at the top of the panel, for a page that lists more than
   * this. Left out, the list is named for assistive tech only.
   */
  heading?: string
}

/**
 * The account's payment methods: a card each, then the panel that adds another.
 *
 * It owns the set, because every panel below it edits the same list and each
 * action hands the new one back. `lib/payments` is the seam; nothing here knows
 * what is behind it.
 */
export function SavedPaymentMethods({ methods: saved, heading, fieldVariant, flags }: SavedPaymentMethodsProps) {
  const [methods, setMethods] = useState(saved)
  const [form, setForm] = useState<PaymentMethodFormTarget>(null)
  const [deleting, setDeleting] = useState<SavedPaymentMethod | null>(null)
  const [working, startTransition] = useTransition()
  const toast = useToastManager()
  const listHeading = useId()
  const protectionHeading = useId()

  /** Runs a change and adopts what came back. A refusal is the store's answer, so it is toasted. */
  const run = (title: string, action: () => Promise<PaymentActionResult>) =>
    startTransition(async () => {
      const result = await action()
      if (!result.ok) {
        toast.add(errorToast(title, result.error))
        return
      }

      setMethods(result.methods)
    })

  return (
    <>
      {heading ? null : (
        <h2 id={listHeading} className="sr-only">
          Saved payment methods
        </h2>
      )}

      <div data-slot="account-panel" className="bg-background-muted flex flex-col gap-2 rounded-xl p-2">
        {heading ? (
          <h2 id={listHeading} data-slot="account-title" className="text-foreground-intense px-2 py-1 font-medium">
            {heading}
          </h2>
        ) : null}

        <ul aria-labelledby={listHeading} className="grid gap-2 sm:grid-cols-2">
          {methods.map((method) => (
            <li key={method.id}>
              <MethodCard
                method={method}
                working={working}
                onEdit={() => setForm({ mode: 'edit', method })}
                onMakeDefault={() =>
                  run('Could not change your default method', () =>
                    updatePaymentMethodAction(method.id, { default: true }),
                  )
                }
                onDelete={() => setDeleting(method)}
              />
            </li>
          ))}
        </ul>

        {/* Doubles as the empty state: a shopper with nothing saved sees this alone. */}
        <div
          data-slot="account-panel-item"
          className="bg-background flex flex-col items-center gap-3 rounded-xl px-2 py-10 text-center"
        >
          <Badge variant="outline">
            <ShieldCheck aria-hidden className="size-3.5" />
            Secure payment
          </Badge>
          <p data-slot="account-copy" className="text-foreground-intense text-sm">
            Add payment methods for a faster checkout
          </p>
          <Button onClick={() => setForm({ mode: 'add' })}>
            <Plus data-icon="start" />
            Add payment method
          </Button>
          <PaymentMethods names={SAVABLE_MARKS} boxed className="justify-center" />
        </div>
      </div>

      <section aria-labelledby={protectionHeading} className="flex flex-col gap-2">
        <h2
          id={protectionHeading}
          data-slot="account-title"
          className="text-foreground-intense flex items-center gap-1 font-medium"
        >
          <ShieldCheckFilled aria-hidden className="size-4" />
          {PROTECTION.store} protects your card information
        </h2>
        <ul
          data-slot="account-copy"
          className="text-foreground-muted marker:text-foreground-subtle flex list-disc flex-col gap-1.5 ps-5 text-sm"
        >
          {PROTECTION.points.map((point) => (
            <li key={point}>{point}</li>
          ))}
        </ul>
      </section>

      <PaymentMethodDialog
        target={form}
        onTargetChange={setForm}
        onSaved={setMethods}
        fieldVariant={fieldVariant}
        flags={flags}
      />

      <AlertDialog open={deleting !== null} onOpenChange={() => setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="font-medium">Delete this payment method?</AlertDialogTitle>
            <AlertDialogDescription>
              You can add it again whenever you like. Orders already paid for with it are not affected.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            {/* The close renames the slot; this takes it back for a storefront styling buttons by it. */}
            <AlertDialogClose
              render={
                <Button data-slot="button" variant="soft">
                  Keep it
                </Button>
              }
            />
            <AlertDialogClose
              render={
                <Button
                  data-slot="button"
                  variant="destructive"
                  onClick={() => deleting && run('Could not delete that', () => forgetPaymentMethodAction(deleting.id))}
                >
                  Delete
                </Button>
              }
            />
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

interface MethodCardProps {
  method: SavedPaymentMethod
  /** Whether a change is in flight. The card's actions rest rather than queueing a second one. */
  working: boolean
  onEdit: () => void
  onMakeDefault: () => void
  onDelete: () => void
}

/**
 * One saved method: its mark, what it is, and what can be done with it. A wallet
 * takes the same card, minus the expiry and the edit, since there is nothing on
 * one a shopper can retype.
 */
function MethodCard({ method, working, onEdit, onMakeDefault, onDelete }: MethodCardProps) {
  const { card } = method
  const mark = card?.brand ?? paymentMethodMark(method.method)
  const expiry = expiryStatus(method)
  const detail = card ? `Expires ${formatExpiry(card)}` : (method.account && maskAccount(method.account)) || 'Connected'

  return (
    <article data-slot="account-panel-item" className="bg-background flex h-full flex-col gap-6 rounded-lg p-4">
      <div className="flex items-start justify-between gap-3">
        <span className="flex h-10 w-15 shrink-0 items-center justify-center rounded-sm border">
          {mark && hasPaymentMark(mark) ? (
            <span className={paymentMarkSlot(mark)}>
              <PaymentMark name={mark} />
            </span>
          ) : (
            <CreditCard className="text-foreground-muted size-5" />
          )}
        </span>

        {method.default ? (
          <Badge variant="secondary">Default</Badge>
        ) : (
          <Button variant="ghost" size="sm" disabled={working} onClick={onMakeDefault} className="-me-2">
            Set as default
          </Button>
        )}
      </div>

      <div className="flex min-w-0 flex-col gap-2">
        <p className="text-foreground-intense truncate font-medium">
          {card ? `${card.brand} ${MASK} ${card.last4}` : PAYMENT_METHOD_LABELS[method.method]}
        </p>
        <p className="text-foreground-muted flex flex-wrap items-center gap-2 text-sm">
          {[method.nickname, detail].filter(Boolean).join(' · ')}
          {expiry === 'expiring' ? (
            <Badge variant="warning" size="sm">
              Expires soon
            </Badge>
          ) : null}
          {expiry === 'expired' ? (
            <Badge variant="error" size="sm">
              Expired
            </Badge>
          ) : null}
        </p>
      </div>

      {/* Pushed to the bottom, so 2 cards of different heights line their buttons up. */}
      <div className="mt-auto flex flex-wrap justify-end gap-1">
        {card ? (
          <Button variant="outline" size="sm" disabled={working} onClick={onEdit}>
            Edit
          </Button>
        ) : null}
        <Button variant="outline" size="sm" disabled={working} onClick={onDelete}>
          Delete
        </Button>
      </div>
    </article>
  )
}
