'use client'

import { useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { buttonVariants } from '@appica/ui-react/button'
import { useDirection } from '@appica/ui-react/hooks/use-direction'
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuPositioner,
  NavigationMenuTrigger,
} from '@appica/ui-react/navigation-menu'
import { accountPath } from '@/components/account/account-paths'
import { AccountLink } from '@/components/auth/sign-in-gate'
import { CAMPAIGN_CTA } from '@/components/fashion/campaign-cta'
import { CaretSwap } from '@/components/fashion/caret-swap'
import { LinkColumn, type NavColumn } from '@/components/fashion/link-column'
import { type DepartmentLink, useCurrentDepartment } from '@/components/fashion/use-current-department'
import { Logo } from '@/components/logo'
import { useCloseOnNavigate } from '@/components/use-close-on-navigate'
import { useMenuBackdrop } from '@/components/use-menu-backdrop'
import { usePageLock } from '@/components/use-page-lock'
import { usePanelFrame } from '@/components/use-panel-frame'
import { formatMoney } from '@/lib/commerce/format'
import { REWARDS } from '@/lib/commerce/programs/rewards'
import type { CampaignBanner } from '@/lib/commerce/types'
import { cn } from '@/lib/utils'

/** The campaign's share of the panel's width, which `DepartmentPanel` sets. */
const CAMPAIGN_SIZES = '(min-width: 1400px) 50vw, 40vw'

/** A department's mega-menu: its link columns, and the campaign beside them. */
export interface DepartmentPanel {
  columns: NavColumn[]
  campaign?: CampaignBanner
}

/** A department with the panel its trigger opens. */
export interface MenuDepartment extends DepartmentLink {
  panel: DepartmentPanel
}

interface DepartmentMenuProps {
  /** The store's departments, in the order to offer them. */
  departments: MenuDepartment[]
  /** The department opened last, shown as current on a page whose URL names none. */
  remembered: string
  className?: string
}

/**
 * The Women and Men switch: each trigger links to its department's home and
 * opens its mega-menu on hover, over a backdrop, with the page held still.
 */
export function DepartmentMenu({ departments, remembered, className }: DepartmentMenuProps) {
  const { current, isHome } = useCurrentDepartment(departments, remembered)
  const triggers = useRef(new Map<string, HTMLElement>())
  const rtl = useDirection() === 'rtl'
  const frame = usePanelFrame(triggers, rtl)
  const [open, setOpen] = useCloseOnNavigate<string | null>(null)
  usePageLock(open != null)
  const backdrop = useMenuBackdrop(open != null)

  return (
    <NavigationMenu
      aria-label="Departments"
      backdrop
      {...backdrop}
      viewport={false}
      value={open}
      // Every item's value is its department's slug.
      onValueChange={(value) => setOpen(value as string | null)}
      className={className}
    >
      <NavigationMenuList className="grid auto-cols-fr grid-flow-col gap-1">
        {departments.map(({ slug, name, panel }) => (
          <NavigationMenuItem key={slug} value={slug}>
            <NavigationMenuTrigger
              ref={(node) => {
                if (node) triggers.current.set(slug, node)
              }}
              nativeButton={false}
              render={(props) => (
                <Link
                  {...props}
                  href={`/${slug}`}
                  // The trigger announces a button by default, but pressing this navigates.
                  role={undefined}
                  aria-current={slug === current ? (isHome ? 'page' : true) : undefined}
                  data-slot="button"
                  // No color fade: halfway through, the label matches its background.
                  className={cn(
                    buttonVariants({ variant: slug === current ? 'primary' : 'soft' }),
                    'w-full transition-transform before:transition-none',
                  )}
                />
              )}
            >
              {name}
            </NavigationMenuTrigger>
            <NavigationMenuContent className="p-0">
              <DepartmentPanel panel={panel} width={frame?.width} onNavigate={() => setOpen(null)} />
            </NavigationMenuContent>
          </NavigationMenuItem>
        ))}
      </NavigationMenuList>

      <NavigationMenuPositioner
        sideOffset={frame?.sideOffset}
        alignOffset={frame && open != null ? -frame.offsets[open] : undefined}
        className="origin-center rounded-none border-0 bg-transparent shadow-none"
      />
    </NavigationMenu>
  )
}

interface DepartmentPanelProps {
  panel: DepartmentPanel
  /** The panel's width in pixels, once measured. */
  width?: number
  /** Called on every link, since one into the page already open leaves the route as it is. */
  onNavigate: () => void
}

/**
 * The link columns over the membership on a tile of their own, and the campaign
 * on another beside them. A short screen trims the height to the space under
 * the header's strip and bar.
 */
function DepartmentPanel({ panel: { columns, campaign }, width, onNavigate }: DepartmentPanelProps) {
  return (
    <div
      style={{ width }}
      className={cn(
        'grid h-135 max-h-[calc(100svh-var(--header-height)-3rem)] gap-2 xl:h-150 2xl:h-170',
        campaign && 'grid-cols-[3fr_2fr] 2xl:grid-cols-2',
      )}
    >
      <div className="bg-background flex min-h-0 flex-col overflow-hidden rounded-sm">
        {/* Equal columns where they fit, and never narrower than a link, which would truncate. */}
        <div className="grid flex-1 auto-cols-[minmax(max-content,1fr)] grid-flow-col content-start gap-8 p-8 xl:p-10 2xl:gap-10 2xl:p-14">
          {columns.map((column) => (
            <LinkColumn key={column.heading} column={column} onNavigate={onNavigate} />
          ))}
        </div>
        <MembershipStripe onNavigate={onNavigate} />
      </div>
      {campaign ? <PanelCampaign campaign={campaign} onNavigate={onNavigate} /> : null}
    </div>
  )
}

/** The membership, pitched along the foot of the links. A guest signs in on the way to its page. */
function MembershipStripe({ onNavigate }: { onNavigate: () => void }) {
  return (
    <div className="border-border-strong flex items-center gap-6 border-t px-8 py-3 xl:gap-10 xl:px-10">
      <div className="flex flex-1 items-center gap-4">
        <Logo href={null} variant="mark" club label="" className="h-12" />
        <p className="text-foreground-intense max-w-105 py-3 text-pretty">
          Join <strong className="font-semibold">{REWARDS.name}</strong>: everything we sell, delivered faster, rewarded
          more, and kept longer.
        </p>
      </div>
      <AccountLink
        href={accountPath('fashion', 'appica-club')}
        onClick={onNavigate}
        data-slot="button"
        className={buttonVariants()}
      >
        Join for {formatMoney(REWARDS.price)}/month
      </AccountLink>
    </div>
  )
}

/** The campaign as a still, its line and call to action centered over it. The whole tile is the link. */
function PanelCampaign({ campaign, onNavigate }: { campaign: CampaignBanner; onNavigate: () => void }) {
  const { title, image, focus, href, ctaLabel = 'Explore' } = campaign

  return (
    <Link
      href={href}
      onClick={onNavigate}
      className={cn(
        'group bg-background-muted relative isolate flex flex-col items-center justify-center gap-3 overflow-hidden rounded-sm p-6 text-center text-white',
        'outline-ring-light focus-visible:outline-2 focus-visible:-outline-offset-4',
      )}
    >
      <div className="absolute inset-0 -z-10 transition-transform duration-700 ease-out motion-safe:group-hover:scale-[1.03] motion-reduce:transition-none">
        <Image
          src={image.src}
          alt=""
          fill
          sizes={CAMPAIGN_SIZES}
          style={{ objectPosition: focus && `${focus.x}% ${focus.y}%` }}
          className="object-cover"
        />
        <span className="absolute inset-0 bg-black/25" />
      </div>
      <span className="max-w-80 font-mono text-lg text-balance uppercase">{title}</span>
      <span data-slot="button" className={cn(buttonVariants({ variant: 'light' }), CAMPAIGN_CTA)}>
        {ctaLabel}
        <CaretSwap data-icon="end" />
      </span>
    </Link>
  )
}
