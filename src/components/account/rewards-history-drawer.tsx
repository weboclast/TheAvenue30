'use client'

import { useState } from 'react'
import { Badge } from '@appica/ui-react/badge'
import { Button } from '@appica/ui-react/button'
import {
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@appica/ui-react/drawer'
import { useDirection } from '@appica/ui-react/hooks/use-direction'
import { ScrollArea } from '@appica/ui-react/scroll-area'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@appica/ui-react/table'
import { WIDE_OVERLAY_WIDTH } from '@/components/overlay-sheet'
import { formatDate } from '@/lib/commerce/format'
import { REWARDS_EVENT_LABELS, type RewardsEntry, formatPointsChange } from '@/lib/rewards/ledger'
import { cn } from '@/lib/utils'

/** Narrower than the drawer, so the columns keep their shape instead of collapsing onto each other. */
const TABLE_WIDTH = 'min-w-120'

interface RewardsHistoryDrawerProps {
  /** The ledger to list, newest first. */
  entries: RewardsEntry[]
  /**
   * How the Points column is set: a tinted badge, or plain text.
   * @default 'badge'
   */
  pointsAs?: 'badge' | 'text'
}

/**
 * Every point this account has earned or spent, as a table in a panel. The
 * balance above it is a number; this is where a shopper checks it.
 *
 * It owns nothing but whether it is open: the ledger arrives already ordered and
 * already totaled, from `lib/rewards`.
 */
export function RewardsHistoryDrawer({ entries, pointsAs = 'badge' }: RewardsHistoryDrawerProps) {
  const rtl = useDirection() === 'rtl'
  const [open, setOpen] = useState(false)

  return (
    <Drawer side={rtl ? 'left' : 'right'} open={open} onOpenChange={setOpen}>
      {/* The trigger renames the slot; this takes it back for a storefront styling buttons by it. */}
      <DrawerTrigger
        render={
          <Button data-slot="button" variant="outline">
            Rewards history
          </Button>
        }
      />

      <DrawerContent className={WIDE_OVERLAY_WIDTH} closeLabel="Close rewards history">
        <DrawerHeader className="pe-14">
          <DrawerTitle className="font-medium">Rewards history</DrawerTitle>
          <DrawerDescription>Every point earned and spent on this account</DrawerDescription>
        </DrawerHeader>

        {/* The body gives up its padding and scrolling to the scroller, so the
            scrollbar keeps the panel edge. As in the other account drawers. */}
        <DrawerBody className="overflow-hidden px-0">
          {entries.length === 0 ? (
            <p className="px-6">Nothing yet. Points land here as soon as your first order is delivered.</p>
          ) : (
            <ScrollArea orientation="both" scrollbarVisibility="auto" className="h-full px-6">
              <Table size="sm" hoverableRows className={TABLE_WIDTH}>
                <TableHeader>
                  <TableRow>
                    <TableHead>Activity</TableHead>
                    <TableHead>Details</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-end">Points</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {entries.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell className="text-foreground-intense whitespace-nowrap">
                        {REWARDS_EVENT_LABELS[entry.kind]}
                      </TableCell>
                      <TableCell className="max-w-52 truncate">{entry.detail}</TableCell>
                      <TableCell className="whitespace-nowrap">{formatDate(entry.at)}</TableCell>
                      <TableCell className="text-end whitespace-nowrap">
                        {pointsAs === 'badge' ? (
                          <Badge variant={entry.points > 0 ? 'info' : 'soft'} size="sm">
                            {formatPointsChange(entry.points)}
                          </Badge>
                        ) : (
                          <span className={cn(entry.points > 0 && 'text-foreground-intense')}>
                            {formatPointsChange(entry.points)}
                          </span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          )}
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  )
}
