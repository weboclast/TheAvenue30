'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { Camera, InfoCircle } from '@appica/icons-react'
import { Button } from '@appica/ui-react/button'
import { Spinner } from '@appica/ui-react/spinner'
import { COLUMN_HEADING } from '@/components/fashion/link-column'
import { PillGroup, PillOption } from '@/components/fashion/pill-group'
import { TEXT_ACTION } from '@/components/fashion/text-action'
import { PRESETS } from '@/components/media-dropzone'
import { VisualSearchPhoto } from '@/components/visual-search-photo'
import { SearchResultCard } from './search-result-card'
import type { VisualMatch, VisualSearchSample } from '@/lib/commerce/types'
import { visualSearchSamplesAction } from '@/lib/visual-search/actions'
import { useVisualSearch } from '@/lib/visual-search/use-visual-search'
import { cn } from '@/lib/utils'

/**
 * The photo's column: a portrait frame beside the results from `md`, a band
 * across the sheet below it. Below `sm` the drop prompt is as tall as it needs.
 */
const PHOTO_FRAME = 'bg-background-muted rounded-2xs relative self-stretch overflow-hidden md:h-auto md:aspect-4/5'

/** The photo's width: its column from `md`, the sheet's below. */
const PHOTO_SIZES = '(min-width: 48rem) 400px, 100vw'

/** 3 across from `lg`, 2 below it. */
const GRID = 'grid grid-cols-2 gap-x-2 gap-y-7 lg:grid-cols-3'

interface PhotoSearchProps {
  /** The department on screen, by slug, which the samples and the answers come from. */
  department?: string
  /** Its name, for saying where nothing was found. */
  departmentName?: string
  /** Called as a result is followed, so the dialog can close. */
  onNavigate: () => void
  /**
   * Answers a shopper's own photo from the department on screen. Wire it to
   * the store's image search (a Server Action taking the `File` and the slug
   * is the usual shape); left out, the demo answers and says so.
   */
  onFindSimilar?: (photo: File, department?: string) => VisualMatch[] | Promise<VisualMatch[]>
}

/**
 * The search dialog's camera view: a photo of an outfit, or a sample, answered
 * with a dot on each piece and the products like the one picked. The samples
 * load as it opens rather than with the page, since a header ships on every page.
 */
export function PhotoSearch({ department, departmentName, onNavigate, onFindSimilar }: PhotoSearchProps) {
  const [samples, setSamples] = useState<VisualSearchSample[]>([])

  useEffect(() => {
    let live = true
    void visualSearchSamplesAction('fashion', department).then((loaded) => {
      if (live) setSamples(loaded)
    })
    return () => {
      live = false
    }
  }, [department])

  const { status, photo, matches, demo, selected, select, pick, reset, refused, dropzone } = useVisualSearch({
    samples,
    onFindSimilar: onFindSimilar && ((file) => onFindSimilar(file, department)),
  })
  const match = matches[selected]

  return (
    <div {...dropzone.getRootProps({ className: 'grid gap-6 md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]' })}>
      {/* A 0 by 0 block as react-dropzone renders it, which the grid would still give a gap. */}
      <input {...dropzone.getInputProps({ className: 'absolute' })} />

      <div className="flex flex-col items-start gap-3">
        <div className={cn(PHOTO_FRAME, photo ? 'h-[45svh]' : 'sm:h-[45svh]')}>
          {photo ? (
            <>
              <VisualSearchPhoto
                photo={photo}
                matches={matches}
                selected={selected}
                onSelect={select}
                reading={status === 'reading'}
                sizes={PHOTO_SIZES}
                className="size-full"
              />
              {demo && status === 'found' ? (
                <p className="rounded-2xs absolute inset-x-3 top-3 mx-auto flex w-fit items-center gap-1.5 bg-black/60 px-3 py-1.5 text-xs text-pretty text-white">
                  <InfoCircle aria-hidden className="size-4 shrink-0" />
                  Demo results. Connect an image search service to match your photo.
                </p>
              ) : null}
              {status === 'reading' ? (
                <p className="bg-background text-foreground-intense absolute inset-x-0 bottom-4 mx-auto flex h-10 w-fit items-center gap-2 rounded-full px-4 font-mono text-sm uppercase">
                  <Spinner variant="sparkle" aria-hidden className="text-xl" />
                  Looking for similar pieces
                </p>
              ) : null}
            </>
          ) : (
            <div
              className={cn(
                'flex size-full flex-col items-center justify-center gap-4 rounded-[inherit] border border-dashed p-6 text-center',
                'transition-colors duration-300 motion-reduce:transition-none',
                dropzone.isDragActive ? 'border-primary bg-background-strong' : 'border-border-strong',
              )}
            >
              <Camera aria-hidden className="text-foreground-intense size-8" strokeWidth={1.4} />
              <p className="text-foreground-intense text-lg font-medium text-balance">
                {dropzone.isDragActive ? (
                  'Drop it to search'
                ) : (
                  <>
                    <span className="hover-none:hidden">Drop a photo of an outfit you love</span>
                    <span className="hover-none:inline hidden">Add a photo of an outfit you love</span>
                  </>
                )}
              </p>
              <Button data-search-focus variant="outline" onClick={dropzone.open}>
                Upload a photo
              </Button>
              <p
                className={cn('text-xs text-pretty', refused && 'text-error-emphasis')}
                role={refused ? 'alert' : undefined}
              >
                {refused ?? PRESETS.image.hint}
              </p>
            </div>
          )}
        </div>
        {/* Under the photo rather than on it, where it would cover the dot on a pair of shoes. */}
        {photo && status !== 'reading' ? (
          <Button
            data-search-focus={status === 'empty' || undefined}
            variant="ghost"
            size="sm"
            onClick={reset}
            className={TEXT_ACTION}
          >
            Try another photo
          </Button>
        ) : null}
      </div>

      <div className="flex flex-col gap-4">
        {status === 'idle' && samples.length > 0 ? (
          <section className="flex flex-col gap-3">
            <h3 className={COLUMN_HEADING}>Or try one of ours</h3>
            <ul className="grid grid-cols-3 gap-2">
              {samples.map((sample) => (
                <li key={sample.id}>
                  <button
                    type="button"
                    onClick={() => pick(sample)}
                    className="group outline-ring rounded-2xs flex w-full flex-col gap-2 text-start focus-visible:outline-2 focus-visible:outline-offset-2"
                  >
                    <span className="bg-background-muted rounded-2xs relative aspect-4/5 overflow-hidden">
                      <Image
                        src={sample.image.src}
                        alt=""
                        fill
                        sizes="(min-width: 48rem) 200px, 33vw"
                        className="object-cover transition-transform duration-500 ease-out motion-safe:group-hover:scale-[1.04] motion-reduce:transition-none"
                      />
                    </span>
                    <span className="text-foreground-intense px-1 text-sm">{sample.title}</span>
                  </button>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {status === 'reading' ? (
          <div aria-hidden className={GRID}>
            {Array.from({ length: 6 }, (_, index) => (
              <div key={index} className="bg-background-muted rounded-2xs aspect-324/406 motion-safe:animate-pulse" />
            ))}
          </div>
        ) : null}

        {status === 'found' && match ? (
          <section className="flex flex-col gap-4">
            <h3 className={COLUMN_HEADING}>Pieces found</h3>
            <PillGroup
              aria-label="Pieces found"
              value={String(selected)}
              onValueChange={(value) => select(Number(value))}
            >
              {matches.map(({ label }, index) => (
                <PillOption
                  key={`${label}-${index}`}
                  value={String(index)}
                  data-search-focus={index === selected || undefined}
                >
                  {label}
                </PillOption>
              ))}
            </PillGroup>
            <div className={GRID}>
              {match.products.map((product) => (
                <SearchResultCard key={product.slug} product={product} onNavigate={onNavigate} />
              ))}
            </div>
          </section>
        ) : null}

        {status === 'empty' ? (
          <div className="flex flex-col gap-1">
            <p className="text-foreground-intense text-lg font-medium">
              Nothing like this{departmentName ? ` in ${departmentName}` : null} yet
            </p>
            <p>Try another photo, or one of ours.</p>
          </div>
        ) : null}
      </div>

      <p role="status" className="sr-only">
        {status === 'reading'
          ? 'Looking for similar pieces'
          : status === 'found'
            ? `Found ${matches.length} ${matches.length === 1 ? 'piece' : 'pieces'}`
            : status === 'empty'
              ? 'No similar pieces found'
              : ''}
      </p>
    </div>
  )
}
