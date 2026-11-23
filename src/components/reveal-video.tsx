'use client'

import { type ComponentProps, useEffect, useRef, useSyncExternalStore } from 'react'
import { useReducedMotion } from '@appica/ui-react/hooks/use-reduced-motion'
import { ClipSources, type TransparentClip } from './clip-sources'
import { useNearViewport } from './use-near-viewport'

interface RevealVideoProps extends Omit<ComponentProps<'video'>, 'children' | 'poster' | 'src'> {
  /** Path to the clip, served from `/public`, or the 2 encodes of a transparent one. */
  src: string | TransparentClip
}

const subscribeToNothing = () => () => {}

/**
 * A muted clip that plays once when it scrolls fully into view and then holds
 * its last frame, replaying only after it has left the viewport and come back.
 * It is decoration, so it carries no controls and is hidden from assistive
 * technology, and whatever it shows has to be said in the copy beside it.
 *
 * Lay it over an image of its first frame, which is all a visitor sees under
 * reduced motion, and until iOS lets the clip start, which can take the page's
 * first tap. The clip mounts after hydration, so the server HTML carries only
 * the image, and loads as it nears the viewport. It gains `data-ready` once it
 * has a frame of its own to show, which is when the image under a transparent
 * clip has to step aside.
 */
export function RevealVideo({ src, className, ...props }: RevealVideoProps) {
  const reduce = useReducedMotion()
  const hydrated = useSyncExternalStore(
    subscribeToNothing,
    () => true,
    () => false,
  )
  const ref = useRef<HTMLVideoElement>(null)
  const near = useNearViewport(ref, hydrated && !reduce)

  useEffect(() => {
    const video = ref.current
    if (!video) return

    let inView = false
    let played = false
    let observer: IntersectionObserver | undefined

    const play = () => {
      if (!inView || played) return
      played = true
      video.play().catch(() => {
        played = false
      })
    }

    // Measured once laid out, never at mount. A clip taller than the viewport
    // never reaches a ratio of 1, so the cue is the most of itself it can show.
    const sizer = new ResizeObserver(([{ contentRect }]) => {
      const full = Math.max(0, Math.min(1, window.innerHeight / contentRect.height) - 0.02)
      observer?.disconnect()
      observer = new IntersectionObserver(
        ([entry]) => {
          inView = entry.intersectionRatio >= full
          if (inView) play()
          else if (entry.intersectionRatio === 0) {
            played = false
            video.pause()
            if (video.currentTime > 0) video.currentTime = 0
          }
        },
        { threshold: [0, full] },
      )
      observer.observe(video)
    })
    sizer.observe(video)

    // iOS can refuse to start any video, muted or not, until the page has had a tap.
    const listening = new AbortController()
    for (const type of ['touchend', 'click', 'keydown']) {
      window.addEventListener(type, play, { passive: true, signal: listening.signal })
    }

    const ready = () => video.setAttribute('data-ready', '')
    if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) ready()
    else video.addEventListener('loadeddata', ready, { once: true, signal: listening.signal })

    return () => {
      sizer.disconnect()
      observer?.disconnect()
      listening.abort()
    }
  }, [hydrated, reduce])

  if (!hydrated || reduce) return null

  return (
    <video ref={ref} muted playsInline preload={near ? 'auto' : 'none'} aria-hidden className={className} {...props}>
      <ClipSources src={src} />
    </video>
  )
}
