'use client'

import { type SubmitEvent, useEffect, useRef, useState } from 'react'
import { CircleCheckFilled, Paperclip, X } from '@appica/icons-react'
import { Button } from '@appica/ui-react/button'
import { Field, FieldDescription, FieldError, FieldLabel } from '@appica/ui-react/field'
import { Form } from '@appica/ui-react/form'
import { Input, type InputProps } from '@appica/ui-react/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@appica/ui-react/select'
import { Textarea } from '@appica/ui-react/textarea'
import { revealFirstInvalidField } from '@/lib/form-errors'
import { validateEmail, validateRequired } from '@/lib/validation'
import { cn } from '@/lib/utils'

/** An extra field a reason asks for, on top of the name, email, and message every message carries. */
export interface ContactDetailField {
  label: string
  placeholder: string
  description?: string
  required: boolean
  /** The browser's autofill hint, such as `organization`. */
  autoComplete?: string
}

/** One thing a shopper can write in about, and the extra fields it asks for. */
export interface ContactReason<Detail extends string = string> {
  id: string
  label: string
  details: Detail[]
}

interface ContactFormProps<Detail extends string> {
  /** What the first field offers, in the order to list it. */
  reasons: ContactReason<Detail>[]
  /** The extra fields, by the id the reasons name them with. */
  details: Record<Detail, ContactDetailField>
  /** The hint in the empty message box. */
  messagePlaceholder: string
  /**
   * How the fields and the attachment button are drawn: `soft` on a plain
   * panel, `outline` on a tinted one.
   * @default 'outline'
   */
  fieldVariant?: InputProps['variant']
  /** The reason already chosen when the form first renders, by id, so a link can name one. Ignored when no reason has that id. */
  defaultReason?: string
  /** What the extra fields open with, so a link can name the order or the piece it is about. */
  defaultDetails?: Partial<Record<Detail, string>>
}

/** How many files one message carries. Enough for a few photos of the same fault. */
const MAX_FILES = 3

/**
 * The contact form every storefront's contact page composes. The reason comes
 * first and decides the rest: each storefront says what can be written in
 * about and which extra fields that asks for, and the form does the same job
 * with either set.
 *
 * Validation runs in the browser and the submit goes nowhere. Replace the
 * success branch of `handleSubmit` with a Server Action posting to your
 * helpdesk, and show the reference it returns in the panel beside it.
 */
export function ContactForm<Detail extends string>({
  reasons,
  details,
  messagePlaceholder,
  fieldVariant = 'outline',
  defaultReason,
  defaultDetails,
}: ContactFormProps<Detail>) {
  type FieldName = 'reason' | 'name' | 'email' | 'message' | Detail

  const [reasonId, setReasonId] = useState<string | null>(
    reasons.some((reason) => reason.id === defaultReason) ? (defaultReason ?? null) : null,
  )
  // Keyed by string rather than by `FieldName`: a mapped type over the generic
  // detail union is one TypeScript cannot check an object literal against.
  const [errors, setErrors] = useState<Record<string, string | undefined>>({})
  const [files, setFiles] = useState<File[]>([])
  const [sentTo, setSentTo] = useState<string>()
  const filePicker = useRef<HTMLInputElement>(null)
  const sentHeading = useRef<HTMLHeadingElement>(null)

  // The form, and the button that held focus, are gone once it sends.
  useEffect(() => {
    if (sentTo) sentHeading.current?.focus({ preventScroll: true })
  }, [sentTo])

  const asked = reasons.find((reason) => reason.id === reasonId)?.details ?? []

  const check = (field: FieldName, value: string) => {
    if (field === 'email') return validateEmail(value)
    if (field === 'reason') return value ? undefined : 'Choose what you need help with'
    if (field === 'message') return validateRequired(value, 'Message')
    if (field === 'name') return validateRequired(value, 'Name')
    return details[field].required ? validateRequired(value, details[field].label) : undefined
  }

  // Only once a field has been flagged, or the form deadlocks: `Form` refuses to
  // submit while a field is marked invalid, and submitting is what would clear it.
  const revalidate = (field: FieldName, value: string) => {
    setErrors((previous) => (previous[field] ? { ...previous, [field]: check(field, value) } : previous))
  }

  const addFiles = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFiles((previous) => [...previous, ...Array.from(event.target.files ?? [])].slice(0, MAX_FILES))
    // Clearing it lets the same file be picked again after a removal.
    event.target.value = ''
  }

  const handleSubmit = (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = event.currentTarget
    const data = new FormData(form)
    const read = (field: FieldName) => String(data.get(field) ?? '').trim()

    const next: Record<string, string | undefined> = {
      reason: check('reason', reasonId ?? ''),
      name: check('name', read('name')),
      email: check('email', read('email')),
      message: check('message', read('message')),
    }
    for (const detail of asked) next[detail] = check(detail, read(detail))

    setErrors(next)
    if (Object.values(next).some(Boolean)) {
      revealFirstInvalidField(form)
      return
    }

    setSentTo(read('email'))
    setFiles([])
    setReasonId(null)
    form.reset()
  }

  if (sentTo) {
    return (
      <div
        className={cn(
          'flex translate-y-0 flex-col items-start gap-5 opacity-100',
          'transition-[opacity,translate] duration-350 ease-out motion-reduce:transition-none',
          // Interpolates from the mounted element's first style, so the panel rises
          // in without a keyframe. `translate: none` has nothing to interpolate from.
          'starting:translate-y-2 starting:opacity-0',
        )}
      >
        <span className="bg-success-subtle text-success-emphasis grid size-12 place-items-center rounded-md">
          <CircleCheckFilled aria-hidden className="size-6" />
        </span>
        <div className="flex flex-col gap-2">
          <h3 ref={sentHeading} tabIndex={-1} className="text-foreground-intense text-xl font-medium outline-none">
            Message sent
          </h3>
          <p className="text-pretty">
            We have it. Someone on the support team will reply to{' '}
            <span className="text-foreground-intense font-medium">{sentTo}</span> within 1 business day, and sooner if
            it is about a delivery.
          </p>
        </div>
        <Button variant="outline" size="lg" onClick={() => setSentTo(undefined)}>
          Send another message
        </Button>
      </div>
    )
  }

  return (
    <Form noValidate onSubmit={handleSubmit} className="flex flex-col gap-5">
      <Field name="reason" invalid={Boolean(errors.reason)}>
        <FieldLabel>What do you need help with?</FieldLabel>
        <Select
          size="lg"
          variant={fieldVariant}
          value={reasonId}
          // Clears every error, not just this field's: a reason change hides
          // fields, and an error left on a hidden one deadlocks the submit.
          onValueChange={(next) => {
            setReasonId(typeof next === 'string' ? next : null)
            setErrors({})
          }}
          items={reasons.map(({ id, label }) => ({ value: id, label }))}
        >
          <SelectTrigger aria-required="true" className="w-full">
            <SelectValue placeholder="Choose a reason" />
          </SelectTrigger>
          <SelectContent>
            {reasons.map(({ id, label }) => (
              <SelectItem key={id} value={id}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <FieldError match={Boolean(errors.reason)}>{errors.reason}</FieldError>
      </Field>

      <div className="grid gap-5 lg:grid-cols-2">
        <Field name="name" invalid={Boolean(errors.name)}>
          <FieldLabel>Full name</FieldLabel>
          <Input
            inputSize="lg"
            variant={fieldVariant}
            autoComplete="name"
            aria-required="true"
            onChange={(event) => revalidate('name', event.target.value)}
          />
          <FieldError match={Boolean(errors.name)}>{errors.name}</FieldError>
        </Field>

        <Field name="email" invalid={Boolean(errors.email)}>
          <FieldLabel>Email</FieldLabel>
          <Input
            inputSize="lg"
            variant={fieldVariant}
            type="email"
            autoComplete="email"
            aria-required="true"
            onChange={(event) => revalidate('email', event.target.value)}
          />
          <FieldError match={Boolean(errors.email)}>{errors.email}</FieldError>
        </Field>
      </div>

      {asked.map((detail) => (
        <Field key={detail} name={detail} invalid={Boolean(errors[detail])}>
          <FieldLabel>
            {details[detail].label}
            {!details[detail].required && <span className="text-foreground-muted font-normal">&nbsp;(optional)</span>}
          </FieldLabel>
          <Input
            inputSize="lg"
            variant={fieldVariant}
            placeholder={details[detail].placeholder}
            autoComplete={details[detail].autoComplete}
            aria-required={details[detail].required || undefined}
            defaultValue={defaultDetails?.[detail]}
            onChange={(event) => revalidate(detail, event.target.value)}
          />
          {details[detail].description && <FieldDescription>{details[detail].description}</FieldDescription>}
          <FieldError match={Boolean(errors[detail])}>{errors[detail]}</FieldError>
        </Field>
      ))}

      <Field name="message" invalid={Boolean(errors.message)}>
        <FieldLabel>How can we help?</FieldLabel>
        <Textarea
          inputSize="lg"
          variant={fieldVariant}
          rows={5}
          placeholder={messagePlaceholder}
          aria-required="true"
          onChange={(event) => revalidate('message', event.target.value)}
        />
        <FieldError match={Boolean(errors.message)}>{errors.message}</FieldError>
      </Field>

      <div className="flex flex-col items-start gap-2">
        <span data-slot="field-label" className="text-foreground-intense text-sm font-medium">
          Attachments (optional)
        </span>
        <p className="text-foreground-muted text-sm">
          A photo of the problem usually saves a round trip. Up to {MAX_FILES} files.
        </p>
        <input
          ref={filePicker}
          type="file"
          multiple
          accept="image/*,application/pdf"
          onChange={addFiles}
          tabIndex={-1}
          aria-hidden
          className="sr-only"
        />
        <Button
          type="button"
          variant={fieldVariant}
          disabled={files.length >= MAX_FILES}
          onClick={() => filePicker.current?.click()}
        >
          <Paperclip data-icon="start" />
          Add files
        </Button>

        {files.length > 0 && (
          <ul className="flex w-full flex-col gap-1">
            {files.map((file) => (
              <li
                key={file.name}
                className="bg-background-subtle flex items-center gap-3 rounded-md border border-dashed py-2 ps-4 pe-2 text-sm"
              >
                <span className="text-foreground-emphasis min-w-0 flex-1 truncate">{file.name}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  aria-label={`Remove ${file.name}`}
                  onClick={() => setFiles((previous) => previous.filter((entry) => entry !== file))}
                >
                  <X />
                </Button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <Button type="submit" size="lg" className="self-start">
        Send message
      </Button>
    </Form>
  )
}
