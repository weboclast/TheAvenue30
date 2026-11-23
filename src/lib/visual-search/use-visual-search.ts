'use client'

import { useEffect, useRef, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { ACCEPT, MAX_SIZE, PRESETS } from '@/components/media-dropzone'
import type { VisualMatch, VisualSearchSample } from '@/lib/commerce/types'

/** Answers a shopper's own photo. The contract every visual search panel takes as `onFindSimilar`. */
export type FindSimilar = (photo: File) => VisualMatch[] | Promise<VisualMatch[]>

/** The photo a search is looking at: a sample's, or the shopper's own. */
export interface SearchPhoto {
  src: string
  width: number
  height: number
  alt: string
}

/**
 * Where a search stands. `empty` is a search that found nothing and one that
 * failed, which a shopper cannot tell apart and should not have to.
 */
export type VisualSearchStatus = 'idle' | 'reading' | 'found' | 'empty'

/**
 * The longest side a photo is sent at. An image model looks at less than this,
 * and it keeps a phone photo well under a Server Action's 1 MB body limit.
 */
const SEND_SIZE = 1280

/**
 * How long the demo pretends to look before answering. Demo scaffolding, like
 * {@link demoFindSimilar} it belongs to.
 */
const DEMO_LATENCY_MS = 1600

/**
 * Demo scaffolding: the answer to a shopper's own photo until a store wires
 * `onFindSimilar`. It cannot see the photo, so it offers a piece from each
 * sample, unplaced and no 2 alike, and the panel says so. Delete it once that is wired.
 */
async function demoFindSimilar(samples: VisualSearchSample[]): Promise<VisualMatch[]> {
  await new Promise((resolve) => setTimeout(resolve, DEMO_LATENCY_MS))

  const offered = new Set<string>()
  return samples.flatMap(({ matches }) => {
    const match = matches.find(({ label }) => !offered.has(label))
    if (!match) return []
    offered.add(match.label)
    return [{ label: match.label, products: match.products }]
  })
}

interface Search {
  status: VisualSearchStatus
  photo: SearchPhoto | null
  matches: VisualMatch[]
  /** Whether {@link demoFindSimilar} answered, which the panel has to say. */
  demo: boolean
}

const IDLE: Search = { status: 'idle', photo: null, matches: [], demo: false }

interface UseVisualSearchOptions {
  /** The photos to try, which answer from their own tags. */
  samples: VisualSearchSample[]
  /** Answers the shopper's own photo. Left out, {@link demoFindSimilar} does. */
  onFindSimilar?: FindSimilar
}

/**
 * Everything a visual search panel needs except the panel: where the search
 * stands, the match on show, and drop handling for the panel's own target.
 * Mark the control each state should take focus on with `data-search-focus`.
 *
 * A sample answers at once from its tags. A photo is scaled down in the
 * browser and sent to `onFindSimilar`, and an answer to an older photo is dropped.
 */
export function useVisualSearch({ samples, onFindSimilar }: UseVisualSearchOptions) {
  const [search, setSearch] = useState<Search>(IDLE)
  const [selected, setSelected] = useState(0)
  const [refused, setRefused] = useState<string>()
  // Counts searches, so an answer can tell whether it is still the latest.
  const ticket = useRef(0)
  // The shopper's photo, held as a blob URL until the next one replaces it.
  const preview = useRef<string>(null)

  useEffect(
    () => () => {
      if (preview.current) URL.revokeObjectURL(preview.current)
    },
    [],
  )

  const show = (next: Search, previewUrl: string | null = null) => {
    if (preview.current && preview.current !== previewUrl) URL.revokeObjectURL(preview.current)
    preview.current = previewUrl
    setSearch(next)
    setSelected(0)
  }

  const pick = (sample: VisualSearchSample) => {
    ticket.current++
    setRefused(undefined)
    const { src, width, height, alt } = sample.image
    show({ status: 'found', photo: { src, width, height, alt }, matches: sample.matches, demo: false })
  }

  const find = async (file: File) => {
    const current = ++ticket.current
    setRefused(undefined)

    let scaled: Awaited<ReturnType<typeof scaleDown>>
    try {
      scaled = await scaleDown(file)
    } catch {
      setRefused('This photo could not be opened. Try a JPG or PNG.')
      return
    }
    if (current !== ticket.current) return

    const src = URL.createObjectURL(scaled.file)
    const photo = { src, width: scaled.width, height: scaled.height, alt: 'Your photo' }
    show({ status: 'reading', photo, matches: [], demo: false }, src)

    let matches: VisualMatch[]
    try {
      matches = await (onFindSimilar ? onFindSimilar(scaled.file) : demoFindSimilar(samples))
    } catch {
      matches = []
    }
    if (current !== ticket.current) return

    const found = matches.filter(({ products }) => products.length > 0)
    show({ status: found.length ? 'found' : 'empty', photo, matches: found, demo: !onFindSimilar }, src)
  }

  const reset = () => {
    ticket.current++
    setRefused(undefined)
    show(IDLE)
  }

  // No click or keyboard of its own: the panel puts a button on it, so a dot
  // pressed on the photo never opens the file dialog.
  const dropzone = useDropzone({
    accept: ACCEPT.image,
    maxSize: MAX_SIZE.image,
    multiple: false,
    noClick: true,
    noKeyboard: true,
    getErrorMessage: (error) => {
      if (error.code === 'file-invalid-type') return PRESETS.image.wrongType
      if (error.code === 'file-too-large') return PRESETS.image.tooBig
      return 'One photo at a time'
    },
    onDrop: ([accepted], rejections) => {
      if (accepted) void find(accepted)
      else setRefused(rejections[0]?.errors[0]?.message)
    },
  })

  // The control a shopper pressed leaves with the state it belonged to. Where
  // focus falls back past the panel, it moves to the new state's `data-search-focus`.
  const shown = useRef(search.status)
  useEffect(() => {
    if (shown.current === search.status) return
    shown.current = search.status
    const root = dropzone.rootRef.current
    if (search.status === 'reading' || !root || !document.activeElement?.contains(root)) return
    root.querySelector<HTMLElement>('[data-search-focus]')?.focus({ preventScroll: true })
  }, [search.status, dropzone.rootRef])

  return {
    ...search,
    /** Index into `matches` of the one on show. */
    selected,
    select: setSelected,
    pick,
    reset,
    /** Why the last file was turned away, for the panel to say until the next try. */
    refused,
    dropzone,
  }
}

/**
 * The photo redrawn at no more than {@link SEND_SIZE} on its long side, as a
 * JPEG on white. Rejects a file the browser cannot decode.
 */
async function scaleDown(file: File): Promise<{ file: File; width: number; height: number }> {
  const bitmap = await createImageBitmap(file)
  const scale = Math.min(1, SEND_SIZE / Math.max(bitmap.width, bitmap.height))
  const width = Math.round(bitmap.width * scale)
  const height = Math.round(bitmap.height * scale)

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const context = canvas.getContext('2d')
  if (!context) throw new Error('No 2D canvas.')
  // A transparent PNG would otherwise come out of the JPEG on black.
  context.fillStyle = 'white'
  context.fillRect(0, 0, width, height)
  context.drawImage(bitmap, 0, 0, width, height)
  bitmap.close()

  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.85))
  if (!blob) throw new Error('The photo could not be encoded.')
  return { file: new File([blob], 'photo.jpg', { type: 'image/jpeg' }), width, height }
}
