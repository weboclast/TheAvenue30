'use client'

import { type ComponentProps, useCallback, useRef } from 'react'
import { useReducedMotion } from '@appica/ui-react/hooks/use-reduced-motion'
import { ClipSources, type TransparentClip } from './clip-sources'
import { useNearViewport } from './use-near-viewport'

interface LoopingVideoProps extends Omit<ComponentProps<'video'>, 'children' | 'poster' | 'src'> {
  /** Path to the clip, served from `/public`, or the 2 encodes of a transparent one. */
  src: string | TransparentClip
  /** Still frame held until the clip plays, and under reduced motion. Omit it when a still already sits underneath. */
  poster?: string
}

/**
 * A muted clip that loops as decoration. It carries no controls and is hidden
 * from assistive technology, so whatever it shows has to be said in the copy
 * beside it. The clip loads as it nears the viewport, and under
 * `prefers-reduced-motion` it holds its {@link poster} and never asks for it.
 */
export function LoopingVideo({ src, poster, ref, ...props }: LoopingVideoProps) {
  const reduce = useReducedMotion()
  const videoRef = useRef<HTMLVideoElement>(null)
  const loads = useNearViewport(videoRef, !reduce) && !reduce

  // Keeps the element for the observer as well as handing it to `ref`.
  const attach = useCallback(
    (video: HTMLVideoElement | null) => {
      videoRef.current = video
      if (typeof ref === 'function') ref(video)
      else if (ref) ref.current = video
    },
    [ref],
  )

  // Keyed on a preference only the client knows, so turning it on drops a clip
  // already loading or playing.
  return (
    <video
      key={reduce ? 'still' : 'looping'}
      ref={attach}
      poster={poster}
      // Autoplay fetches the clip whatever `preload` says, so it waits as well.
      autoPlay={loads}
      loop
      muted
      playsInline
      preload={loads ? 'auto' : 'none'}
      aria-hidden
      {...props}
    >
      {reduce ? null : <ClipSources src={src} />}
    </video>
  )
}
