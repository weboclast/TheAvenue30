'use client'

import { useEffect, useId, useRef, useState } from 'react'
import { Photo, VideoPlus, X } from '@appica/icons-react'
import { useDropzone } from 'react-dropzone'
import { Button } from '@appica/ui-react/button'
import { cn } from '@/lib/utils'

/*
 * File picking, for the forms that let a shopper attach something.
 *
 * Dragging, keyboard handling, the hidden input, and the accept and size checks
 * come from `react-dropzone`. It is headless - prop getters, no markup or styles
 * of its own - so everything below is ordinary Appica UI.
 *
 * Nothing is uploaded. The files stay in the browser as `File` objects and reach
 * the form's own submit handler, which is where a store posts them to its own
 * media storage.
 */

/** What a picker takes, by kind. The keys are the MIME patterns the file dialog filters on. */
export const ACCEPT = {
  image: { 'image/*': ['.png', '.jpg', '.jpeg', '.webp', '.avif', '.gif'] },
  video: { 'video/*': ['.mp4', '.webm', '.mov'] },
} as const

/** Largest file each kind takes, in bytes. A clip is allowed more than a photo. */
export const MAX_SIZE = { image: 10 * 1024 * 1024, video: 100 * 1024 * 1024 } as const

/**
 * What each picker says it is for, and what it says when it turns something
 * away. The refusals are short because they sit in a column beside another
 * picker; `react-dropzone`'s own run to a paragraph.
 */
export const PRESETS = {
  image: {
    icon: Photo,
    label: 'Add photos',
    hint: 'PNG, JPG or WEBP',
    wrongType: 'Photos only: PNG, JPG or WEBP',
    tooBig: 'Keep photos under 10 MB',
  },
  video: {
    icon: VideoPlus,
    label: 'Add a video',
    hint: 'MP4, WEBM or MOV',
    wrongType: 'Video only: MP4, WEBM or MOV',
    tooBig: 'Keep clips under 100 MB',
  },
} as const

/** Which kind of attachment a picker takes. */
export type MediaKind = keyof typeof PRESETS

/**
 * Seeks a hair into the clip. A `<video>` given a bare source paints nothing
 * until it is played, and this is the only way to get a poster out of a file
 * nobody has uploaded anywhere yet.
 */
const FIRST_FRAME = '#t=0.1'

interface MediaDropzoneProps {
  kind: MediaKind
  /** The files picked so far. Controlled, so the form owns them. */
  files: File[]
  onFilesChange: (files: File[]) => void
  /**
   * Most files this picker holds. Reached, the tile stops taking more.
   * @default 4
   */
  maxFiles?: number
  className?: string
}

/**
 * A tile that takes files by drag, click, or paste, with a thumbnail per file
 * and a way to take each back out. It validates type, size and count, and
 * reports a refusal in place. Uploading is not its job.
 */
export function MediaDropzone({ kind, files, onFilesChange, maxFiles = 4, className }: MediaDropzoneProps) {
  const { icon: Icon, label, hint, wrongType, tooBig } = PRESETS[kind]
  const [refused, setRefused] = useState<string>()
  const hintId = useId()
  const room = maxFiles - files.length

  /*
   * A preview URL per picked file, minted the moment the file is accepted.
   * Deliberately not during a render or in an effect: React runs both more than
   * once, and a URL revoked by the second pass leaves the first pass's `<img>`
   * pointing at nothing.
   */
  const [previews, setPreviews] = useState<ReadonlyMap<File, string>>(() => new Map())

  // Read through a ref so the cleanup stays mount-scoped: tied to `previews`, it
  // would revoke a URL every time another file was added beside it.
  const held = useRef(previews)
  useEffect(() => {
    held.current = previews
  }, [previews])
  useEffect(
    () => () => {
      for (const url of held.current.values()) URL.revokeObjectURL(url)
    },
    [],
  )

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    accept: ACCEPT[kind],
    maxSize: MAX_SIZE[kind],
    maxFiles: room,
    disabled: room <= 0,
    getErrorMessage: (error) => {
      if (error.code === 'file-invalid-type') return wrongType
      if (error.code === 'file-too-large') return tooBig
      if (error.code === 'too-many-files') return `Up to ${maxFiles} at a time`
      return error.message
    },
    onDrop: (accepted, rejections) => {
      setRefused(rejections[0]?.errors[0]?.message)
      if (accepted.length === 0) return

      const taken = accepted.slice(0, room)
      setPreviews((current) => {
        const next = new Map(current)
        for (const file of taken) next.set(file, URL.createObjectURL(file))
        return next
      })
      onFilesChange([...files, ...taken])
    },
  })

  const remove = (file: File) => {
    setRefused(undefined)
    setPreviews((current) => {
      const next = new Map(current)
      const url = next.get(file)
      if (url) URL.revokeObjectURL(url)
      next.delete(file)
      return next
    })
    onFilesChange(files.filter((candidate) => candidate !== file))
  }

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <div className="flex flex-wrap gap-2">
        {files.map((file) => {
          const preview = previews.get(file)
          return preview ? (
            <MediaThumbnail
              key={preview}
              preview={preview}
              kind={kind}
              name={file.name}
              onRemove={() => remove(file)}
            />
          ) : null
        })}

        {room > 0 ? (
          // `getRootProps` supplies the drag handlers, the click target and the
          // keys, so the tile behaves as a button without being one: nesting the
          // remove buttons above inside a `<button>` is invalid.
          <div
            {...getRootProps({
              role: 'button',
              'aria-label': label,
              'aria-describedby': hintId,
              className: cn(
                'outline-ring flex size-30 cursor-pointer flex-col items-center justify-center gap-1 rounded-lg',
                'border border-dashed focus-visible:outline-2 focus-visible:outline-offset-2',
                // Presses like a tile in the reviews rail.
                'transform-gpu transition duration-250 ease-out motion-reduce:transition-none',
                'active:duration-100 active:ease-in-out motion-safe:active:translate-y-px motion-safe:active:scale-[0.98]',
                isDragReject
                  ? 'border-error-strong text-error-emphasis'
                  : isDragActive
                    ? 'border-primary bg-background-muted text-foreground-intense'
                    : 'bg-background-subtle text-foreground-muted hover:border-border-strong hover:text-foreground-intense',
              ),
            })}
          >
            <input {...getInputProps()} />
            <Icon aria-hidden className="size-8" strokeWidth={1.4} />
          </div>
        ) : null}
      </div>

      {/* Wraps rather than widening the column, which would push the picker
          beside it onto its own row. */}
      <p
        id={hintId}
        className={cn('text-xs text-pretty', refused && 'text-error-emphasis')}
        role={refused ? 'alert' : undefined}
      >
        {refused ?? hint}
      </p>
    </div>
  )
}

interface MediaThumbnailProps {
  /** The object URL for this file, owned and revoked by {@link MediaDropzone}. */
  preview: string
  kind: MediaKind
  /** Names the remove button, so it says which file it takes out. */
  name: string
  onRemove: () => void
}

/** One picked file, as a thumbnail. */
function MediaThumbnail({ preview, kind, name, onRemove }: MediaThumbnailProps) {
  return (
    <div className="bg-background-muted relative size-30 shrink-0 overflow-hidden rounded-lg">
      {kind === 'video' ? (
        // A thumbnail, not a player. See `FIRST_FRAME` for the fragment.
        <video
          src={`${preview}${FIRST_FRAME}`}
          muted
          playsInline
          preload="metadata"
          className="size-full object-cover"
        />
      ) : (
        // Not `next/image`: a blob URL from this browser is not something the
        // image optimizer can fetch.
        // eslint-disable-next-line @next/next/no-img-element
        <img src={preview} alt="" className="size-full object-cover" />
      )}

      <Button
        type="button"
        variant="light"
        size="icon-sm"
        aria-label={`Remove ${name}`}
        onClick={onRemove}
        className="absolute inset-e-1 top-1 size-6 rounded-full"
      >
        <X className="size-3.5" />
      </Button>
    </div>
  )
}
