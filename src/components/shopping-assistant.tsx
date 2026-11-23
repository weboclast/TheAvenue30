'use client'

import { useEffect, useId, useRef, useState } from 'react'
import { Message2Sparkle } from '@appica/icons-react'
import { Button } from '@appica/ui-react/button'
import { GradientGlow } from '@appica/ui-react/gradient-glow'
import { useMediaQuery } from '@appica/ui-react/hooks/use-media-query'
import { useLazyPanel } from '@/components/use-lazy-panel'
import { cn } from '@/lib/utils'

/**
 * Where the panel stops floating and becomes a bottom drawer.
 *
 * A floating panel is placed against the layout viewport, which the on-screen
 * keyboard does not shrink: it opens over the composer, and the browser scrolls
 * the page to chase the caret. A drawer is anchored to the sheet the browser
 * keeps in view, and it is the pattern a phone shopper expects anyway. Keep in
 * step with the `md:` classes on the launcher.
 */
const PANEL_FLOATS = '(min-width: 48rem)'

/** The launcher's glow, held still while the conversation covers it. */
const GLOW_PAUSED = '*:data-[slot]:[animation-play-state:paused]'

/** The conversation's code, loaded after the page: until it opens, the launcher is all there is. */
const loadConversation = () =>
  import('./shopping-assistant-conversation').then((module) => module.AssistantConversation)

interface ShoppingAssistantProps {
  /** Starter prompts, from the storefront's assistant program. Sent as written when tapped. */
  prompts: string[]
  /** Answers a question. Return the reply and it lands in the thread; throw, and the thread apologizes instead. */
  onAsk?: (question: string) => string | Promise<string>
  className?: string
}

/**
 * The store's shopping assistant: a launcher fixed to the bottom corner of every
 * page, and the conversation that opens out of it.
 *
 * The template ships the surface, not a model. Wire {@link ShoppingAssistantProps.onAsk}
 * to wherever the store answers questions (an AI endpoint, a support inbox) and
 * its reply is what the shopper reads.
 *
 * From `md` the conversation is a panel that grows out of the launcher's
 * footprint while the launcher shrinks away beneath it, so both stay mounted and
 * whichever is out of view is `inert`. Under `md` it is a bottom drawer, for the
 * reasons on {@link PANEL_FLOATS}.
 *
 * A demo restyles it through `data-slot`: `shopping-assistant` is the fixed
 * corner, whose `--assistant-clearance` is how much of the bottom edge a bar
 * covers; `shopping-assistant-panel` the floating conversation;
 * `shopping-assistant-composer` the field and its send button; and
 * `shopping-assistant-message` 1 turn, with `data-from` naming whose.
 */
export function ShoppingAssistant({ prompts, onAsk, className }: ShoppingAssistantProps) {
  const [open, setOpen] = useState(false)
  // The floating panel is the safe default: it is closed and transparent at
  // hydration, so a phone correcting itself here has nothing on screen to flicker.
  const floats = useMediaQuery(PANEL_FLOATS, { defaultValue: true })
  const panelId = useId()
  const launcherRef = useRef<HTMLButtonElement>(null)
  const wasOpen = useRef(false)
  const { Panel: Conversation, whenLoaded } = useLazyPanel(loadConversation)

  // Back to the launcher once the floating panel closes. The launcher is `inert`
  // until this commit lands, so it cannot happen in the handler that closes it.
  // The drawer restores focus itself.
  useEffect(() => {
    const reopened = wasOpen.current
    wasOpen.current = open
    if (floats && !open && reopened) launcherRef.current?.focus()
  }, [floats, open])

  return (
    <aside
      data-slot="shopping-assistant"
      aria-label="Shopping assistant"
      className={cn(
        'fixed inset-e-4 z-40 [--assistant-width:min(23rem,calc(100vw-2rem))]',
        // Rides above the compare bar or a buy bar, which publish what they
        // cover and are `0px` on a page without one. The `max` in `bottom`
        // keeps a tighter gap over a bar than over the bare edge, and the panel
        // gives the room back, or a tall one would run off the top.
        '[--assistant-clearance:max(var(--compare-bar-height,0px),var(--buy-bar-height,0px))]',
        'bottom-[max(--spacing(4),calc(var(--assistant-clearance)+(--spacing(2))))]',
        '[--assistant-height:min(32rem,calc(100dvh-6rem-var(--assistant-clearance)))]',
        'transition-[bottom] duration-300 ease-out motion-reduce:transition-none',
        className,
      )}
      onKeyDown={(event) => {
        if (event.key === 'Escape') setOpen(false)
      }}
    >
      <GradientGlow
        border
        blur="md"
        className={cn(
          'rounded-full transition-[scale,opacity] duration-300 ease-out motion-reduce:transition-none',
          open && cn('scale-50 opacity-0', GLOW_PAUSED),
        )}
      >
        <Button
          ref={launcherRef}
          variant="outline"
          size="icon-lg"
          // Only under the floating panel: the drawer hands focus back to it on close.
          inert={open && floats}
          aria-expanded={floats ? open : undefined}
          aria-controls={floats && Conversation ? panelId : undefined}
          aria-label="Open the shopping assistant"
          onClick={() => whenLoaded(() => setOpen(true))}
          className="rounded-full max-md:size-11"
        >
          <Message2Sparkle className="size-5 md:size-5.5" />
        </Button>
      </GradientGlow>

      {Conversation && (
        <Conversation
          open={open}
          onOpenChange={setOpen}
          floats={floats}
          panelId={panelId}
          prompts={prompts}
          onAsk={onAsk}
        />
      )}
    </aside>
  )
}
