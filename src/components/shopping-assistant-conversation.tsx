'use client'

import { type SubmitEvent, useEffect, useRef, useState } from 'react'
import { ArrowUp, Sparkles, X } from '@appica/icons-react'
import { Avatar, AvatarBadge, AvatarFallback } from '@appica/ui-react/avatar'
import { Button } from '@appica/ui-react/button'
import { Chip } from '@appica/ui-react/chip'
import { Drawer, DrawerBody, DrawerContent, DrawerFooter, DrawerHeader, DrawerTitle } from '@appica/ui-react/drawer'
import { GradientGlow } from '@appica/ui-react/gradient-glow'
import { Spinner } from '@appica/ui-react/spinner'
import { Toolbar, ToolbarButton, ToolbarInput } from '@appica/ui-react/toolbar'
import { cn } from '@/lib/utils'

/** One turn in the thread. */
interface Message {
  from: 'shopper' | 'assistant'
  text: string
}

const GREETING = 'Hi, I can help you find a product, compare 2 of them, or check on an order.'

/** The reply in place of an answer `onAsk` failed to give, so the shopper can ask again. */
const NO_ANSWER = "Sorry, I couldn't answer that just now. Please try again in a moment."

/** A glow's layers, held still while the panel is closed and out of view. */
const GLOW_PAUSED = '*:data-[slot]:[animation-play-state:paused]'

/**
 * Demo scaffolding: what the widget answers until a store wires `onAsk` to its
 * own assistant. Delete it once that is wired.
 */
async function demoAnswer(): Promise<string> {
  await new Promise((resolve) => setTimeout(resolve, 900))
  return 'Thanks for asking. A product specialist is picking this up and will reply here shortly.'
}

interface AssistantConversationProps {
  /** Whether the conversation is open. */
  open: boolean
  /** Called when its close button or the drawer closes it. */
  onOpenChange: (open: boolean) => void
  /** Whether it floats over the launcher. Off, it is a bottom drawer. */
  floats: boolean
  /** The floating panel's id, which the launcher controls. */
  panelId: string
  /** Starter prompts, sent as written when tapped. */
  prompts: string[]
  /** Answers a question. Return the reply and it lands in the thread; throw, and the thread apologizes instead. */
  onAsk?: (question: string) => string | Promise<string>
}

/**
 * The shopping assistant's conversation, in the shell the screen gets: a panel
 * that grows out of the launcher's footprint, or a bottom drawer. The 3 pieces,
 * the thread, the starters, and the composer, fill both. `ShoppingAssistant`
 * loads it after the page and holds whether it is open.
 */
export function AssistantConversation({
  open,
  onOpenChange,
  floats,
  panelId,
  prompts,
  onAsk,
}: AssistantConversationProps) {
  const [question, setQuestion] = useState('')
  // Append-only, so a message's index is a stable key.
  const [messages, setMessages] = useState<Message[]>([{ from: 'assistant', text: GREETING }])
  const [pending, setPending] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const threadRef = useRef<HTMLDivElement>(null)

  // Into the composer on open. The panel is `inert` until this commit lands, so
  // it cannot happen in the handler that opens it. The drawer moves focus
  // itself, and reaching for the composer there would throw the keyboard up
  // before the sheet finished sliding in.
  useEffect(() => {
    if (floats && open) inputRef.current?.focus()
  }, [floats, open])

  // `open` is in here for the drawer, whose thread mounts with the sheet.
  useEffect(() => {
    threadRef.current?.scrollTo({ top: threadRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, open, pending])

  const ask = async (text: string) => {
    setMessages((thread) => [...thread, { from: 'shopper', text }])
    setPending(true)
    let answer = NO_ANSWER
    try {
      answer = await (onAsk?.(text) ?? demoAnswer())
    } catch (error) {
      console.error('The shopping assistant got no answer, so it apologized instead.', error)
    }
    setMessages((thread) => [...thread, { from: 'assistant', text: answer }])
    setPending(false)
  }

  const handleSubmit = (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault()
    const asked = question.trim()
    if (!asked) return
    setQuestion('')
    void ask(asked)
  }

  const avatar = (
    <Avatar size="sm">
      <AvatarFallback className="bg-background-inverse text-foreground-inverse">
        <Sparkles className="size-4.5" />
        <AvatarBadge animate />
      </AvatarFallback>
    </Avatar>
  )

  const thread = (
    <>
      {messages.map((message, index) => (
        <p
          key={index}
          data-slot="shopping-assistant-message"
          data-from={message.from}
          className={cn(
            'max-w-[85%] rounded-lg px-3.5 py-2 text-sm',
            message.from === 'shopper'
              ? 'bg-secondary-soft text-foreground-emphasis rounded-ee-3xs self-end'
              : 'bg-background-muted text-foreground rounded-es-3xs self-start',
          )}
        >
          {message.text}
        </p>
      ))}
      {pending ? (
        <span className="text-foreground-muted inline-flex items-center gap-2 px-1 text-xs">
          <Spinner variant="sparkle" currentColor className="text-[1.4em]" />
          Thinking
        </span>
      ) : null}
    </>
  )

  const starters = (
    <div className="flex min-w-0 scrollbar-none gap-1.5 overflow-x-auto">
      {prompts.map((prompt) => (
        <Chip key={prompt} variant="outline" size="sm" className="shrink-0" onClick={() => void ask(prompt)}>
          {prompt}
        </Chip>
      ))}
    </div>
  )

  const composer = (
    <form data-slot="shopping-assistant-composer" onSubmit={handleSubmit}>
      <Toolbar aria-label="Message composer" className="w-full">
        <ToolbarInput
          ref={inputRef}
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
          placeholder="Ask anything..."
          aria-label="Ask the shopping assistant"
          className="placeholder:text-foreground-subtle h-10 min-w-0 flex-1 ps-3.5 text-sm outline-none pointer-coarse:text-base"
        />
        <ToolbarButton
          className="group me-1"
          aria-label="Send message"
          render={
            // Focusable while disabled: sending clears the field, and a press on it keeps focus there.
            <Button type="submit" size="icon-sm" disabled={!question.trim()} focusableWhenDisabled>
              {/* The arrow leaves through the top while its twin arrives
                  from below. The travel is vertical only, so unlike the
                  newsletter's diagonal twin it needs no RTL mirroring.

                  The window takes its size from the icon rather than
                  naming one: `translate-y-full` is a share of the icon's
                  own height, so a window any taller than the icon leaves
                  a sliver of the twin showing at rest. */}
              <span className="relative grid shrink-0 overflow-hidden">
                <ArrowUp
                  className={cn(
                    'col-start-1 row-start-1 transition-transform duration-350 ease-out motion-reduce:transition-none',
                    'motion-safe:group-hover:-translate-y-full',
                    'motion-safe:group-focus-visible:-translate-y-full',
                  )}
                />
                <ArrowUp
                  className={cn(
                    'col-start-1 row-start-1 translate-y-full',
                    'transition-transform duration-350 ease-out motion-reduce:transition-none',
                    'motion-safe:group-hover:translate-y-0',
                    'motion-safe:group-focus-visible:translate-y-0',
                  )}
                />
              </span>
            </Button>
          }
        />
      </Toolbar>
    </form>
  )

  if (floats) {
    return (
      <GradientGlow
        border
        blur="md"
        data-slot="shopping-assistant-panel"
        id={panelId}
        inert={!open}
        role="dialog"
        aria-label="Shopping assistant"
        className={cn(
          'absolute inset-e-0 bottom-0 rounded-2xl',
          'transition-[width,height,opacity] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none',
          open ? 'h-(--assistant-height) w-(--assistant-width)' : cn('size-12 opacity-0', GLOW_PAUSED),
        )}
      >
        <div className="bg-background absolute inset-0 overflow-hidden rounded-[inherit] shadow-lg">
          <div className="absolute inset-e-0 bottom-0 flex h-(--assistant-height) w-(--assistant-width) flex-col gap-3 p-4">
            <div className="flex items-center gap-2.5">
              {avatar}
              <span className="text-foreground-intense flex-1 text-sm font-semibold">Shopping assistant</span>
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label="Close the shopping assistant"
                onClick={() => onOpenChange(false)}
              >
                <X />
              </Button>
            </div>

            <div
              ref={threadRef}
              role="log"
              aria-label="Conversation"
              className="flex min-h-0 flex-1 scrollbar-none flex-col gap-3 overflow-y-auto"
            >
              {thread}
            </div>
            {starters}
            {composer}
          </div>
        </div>
      </GradientGlow>
    )
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      {/* Tall enough to read a thread in, short enough that the page behind
          still frames it. `--drawer-height` is what the popup sizes on. */}
      <DrawerContent closeLabel="Close the shopping assistant" className="[--drawer-height:min(36rem,80dvh)]">
        <DrawerHeader className="flex-row items-center gap-2.5 p-4 pe-14">
          {avatar}
          <DrawerTitle className="text-sm font-medium">Shopping assistant</DrawerTitle>
        </DrawerHeader>

        <DrawerBody
          ref={threadRef}
          role="log"
          aria-label="Conversation"
          className="flex scrollbar-none flex-col gap-3 px-4"
        >
          {thread}
        </DrawerBody>

        <DrawerFooter className="gap-3 p-4">
          {starters}
          {composer}
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}
