'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Menu, X } from '@appica/icons-react'
import { Button } from '@appica/ui-react/button'
import {
  Drawer,
  DrawerBody,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@appica/ui-react/drawer'
import { useDirection } from '@appica/ui-react/hooks/use-direction'
import { ScrollArea } from '@appica/ui-react/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@appica/ui-react/tabs'
import { LinkColumn } from '@/components/fashion/link-column'
import { useCurrentDepartment } from '@/components/fashion/use-current-department'
import { useCloseOnNavigate } from '@/components/use-close-on-navigate'
import { cn } from '@/lib/utils'
import type { MenuDepartment } from './department-menu'

const TAB_SHELL = 'bg-background-muted flex items-center gap-0.5 rounded-full p-0.5'

const TAB_LIST = cn(
  'w-auto flex-1 bg-transparent p-0',
  '**:data-[slot=tabs-indicator]:top-0! **:data-[slot=tabs-indicator]:h-full!',
)

const TAB_TRIGGER = 'flex-1 shrink *:w-full *:min-w-0'

interface MenuDrawerProps {
  /** The store's departments, a tab each, listing the columns of its mega-menu. */
  departments: MenuDepartment[]
  /** The department opened last, for the tab to open on where the URL names none. */
  remembered?: string
  className?: string
}

/**
 * The whole menu below `lg`: a tab per department with the link columns its
 * mega-menu shows. A department tab loads its home and stays open.
 */
export function MenuDrawer({ departments, remembered, className }: MenuDrawerProps) {
  const router = useRouter()
  const [open, setOpen, stayOpenOn] = useCloseOnNavigate(false)
  const rtl = useDirection() === 'rtl'
  const { current } = useCurrentDepartment(departments, remembered)
  // Controlled: `current` changes while a department tab keeps the drawer open.
  const [picked, setPicked] = useState<string>()

  const tabs = departments.map(({ slug, name }) => ({ value: slug, label: name }))
  // A link into the page already open leaves the route as it is, so it closes the drawer itself.
  const close = () => setOpen(false)

  return (
    <Drawer
      side={rtl ? 'right' : 'left'}
      open={open}
      onOpenChange={(next) => {
        setPicked(undefined)
        setOpen(next)
      }}
    >
      <DrawerTrigger
        render={
          // Triggers rename the slot; this takes it back for `globals.css`.
          <Button data-slot="button" variant="ghost" size="icon-md" aria-label="Open menu" className={className}>
            <Menu />
          </Button>
        }
      />
      <DrawerContent closeButton={false}>
        <Tabs
          value={picked ?? current ?? departments[0]?.slug}
          onValueChange={(value, { reason }) => {
            setPicked(value)
            if (reason !== 'none' || value === current || !departments.some(({ slug }) => slug === value)) return
            const home = `/${value}`
            stayOpenOn(home)
            router.push(home)
          }}
          className="min-h-0 flex-1 gap-0"
        >
          <DrawerHeader className="pt-0 pb-4">
            <DrawerTitle className="sr-only">Menu</DrawerTitle>
            <div className={TAB_SHELL}>
              <TabsList className={TAB_LIST}>
                {tabs.map(({ value, label }) => (
                  <TabsTrigger key={value} value={value} className={TAB_TRIGGER}>
                    {label}
                  </TabsTrigger>
                ))}
              </TabsList>
              <DrawerClose
                render={
                  <Button data-slot="button" variant="soft" size="icon-md" aria-label="Close menu">
                    <X />
                  </Button>
                }
              />
            </div>
          </DrawerHeader>

          <DrawerBody className="overflow-hidden px-0">
            <ScrollArea scrollbarVisibility="auto" className="h-full">
              {departments.map(({ slug, panel }) => (
                <TabsContent key={slug} value={slug} className="flex flex-col gap-8 px-6 pt-2 pb-6">
                  {panel.columns.map((column) => (
                    <LinkColumn key={column.heading} column={column} onNavigate={close} />
                  ))}
                </TabsContent>
              ))}
            </ScrollArea>
          </DrawerBody>
        </Tabs>
      </DrawerContent>
    </Drawer>
  )
}
