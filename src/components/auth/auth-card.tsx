import type { Ref } from 'react'
import { cn } from '@/lib/utils'

interface AuthCardProps {
  className?: string
  children: React.ReactNode
}

/**
 * The two-panel shell every auth screen sits in: the form on one side, a
 * companion panel on the other. Stacks on phones and splits from `md`.
 */
export function AuthCard({ className, children }: AuthCardProps) {
  return (
    <div
      className={cn(
        'bg-background-muted/60 dark:bg-background-subtle flex w-full flex-col gap-4 rounded-2xl p-2 md:flex-row md:gap-0',
        className,
      )}
    >
      {children}
    </div>
  )
}

interface AuthCardPanelProps {
  /** Render as the plain companion panel instead of the white form card. */
  aside?: boolean
  className?: string
  children: React.ReactNode
}

/**
 * One side of an {@link AuthCard}. The default is the raised white card that
 * holds the form; {@link AuthCardPanelProps.aside} makes it the flat companion.
 */
export function AuthCardPanel({ aside = false, className, children }: AuthCardPanelProps) {
  return (
    <div
      className={cn(
        'flex w-full flex-col gap-5 rounded-xl p-5 sm:p-6 md:p-8 lg:flex-1',
        aside ? '' : 'bg-background border-border-muted border',
        className,
      )}
    >
      {children}
    </div>
  )
}

interface AuthCardHeadingProps {
  title: string
  description: string
  /** Lands on the `<h1>` and makes it focusable, for a step that replaces the controls holding focus. */
  titleRef?: Ref<HTMLHeadingElement>
  className?: string
}

/** Title and supporting line at the top of an {@link AuthCardPanel}. */
export function AuthCardHeading({ title, description, titleRef, className }: AuthCardHeadingProps) {
  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <h1
        ref={titleRef}
        tabIndex={titleRef ? -1 : undefined}
        className="text-foreground-intense text-2xl font-medium outline-none"
      >
        {title}
      </h1>
      <p className="text-foreground text-sm">{description}</p>
    </div>
  )
}
