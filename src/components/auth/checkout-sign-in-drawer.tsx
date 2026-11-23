'use client'

import { useState } from 'react'
import { Button } from '@appica/ui-react/button'
import {
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerDescription,
  DrawerTitle,
  DrawerTrigger,
} from '@appica/ui-react/drawer'
import { useDirection } from '@appica/ui-react/hooks/use-direction'
import { ScrollArea } from '@appica/ui-react/scroll-area'
import { Logo } from '@/components/logo'
import { CheckoutSignInFlow } from './checkout-sign-in-flow'

interface CheckoutSignInDrawerProps {
  trigger?: React.ReactElement
  open?: boolean
  onOpenChange?: (open: boolean) => void
  /** Called after passwordless sign-in completes (the drawer has already closed). */
  onSignedIn?: () => void
  /** Called when the shopper picks guest checkout (the drawer has already closed). */
  onContinueAsGuest?: () => void
}

/**
 * The checkout sign-in gate as a right-side drawer: the same sign-in and guest
 * choice as the /checkout-sign-in page, opened from the cart for a shopper who
 * is not signed in.
 */
export function CheckoutSignInDrawer({
  trigger,
  open,
  onOpenChange,
  onSignedIn,
  onContinueAsGuest,
}: CheckoutSignInDrawerProps) {
  const rtl = useDirection() === 'rtl'
  const [internalOpen, setInternalOpen] = useState(false)
  const isControlled = open !== undefined
  const isOpen = isControlled ? open : internalOpen

  const setOpen = (next: boolean) => {
    if (!isControlled) setInternalOpen(next)
    onOpenChange?.(next)
  }

  return (
    <Drawer side={rtl ? 'left' : 'right'} open={isOpen} onOpenChange={setOpen}>
      {trigger ? <DrawerTrigger render={trigger} /> : null}
      <DrawerContent className="w-115">
        <DrawerBody className="overflow-hidden px-0">
          <ScrollArea scrollbarVisibility="auto" className="h-full">
            <div className="flex flex-col gap-12 px-6 py-1">
              <section className="flex flex-col gap-4">
                <Logo variant="mark" href={null} className="h-10 sm:h-12" />
                <CheckoutSignInFlow
                  renderHeading={({ title, description }) => (
                    <div className="flex flex-col gap-2">
                      <DrawerTitle className="font-medium">{title}</DrawerTitle>
                      <DrawerDescription className="text-foreground">{description}</DrawerDescription>
                    </div>
                  )}
                  onComplete={() => {
                    setOpen(false)
                    onSignedIn?.()
                  }}
                />
              </section>
              <section className="flex flex-col gap-5">
                <div className="flex flex-col gap-1.5">
                  <h3 className="text-foreground-intense text-2xl font-medium">Guest checkout</h3>
                  <p className="text-foreground text-sm">Sign up at checkout to grab some awesome The Avenue 30 perks!</p>
                </div>
                <Button
                  type="button"
                  variant="secondary"
                  size="lg"
                  className="w-full"
                  onClick={() => {
                    setOpen(false)
                    onContinueAsGuest?.()
                  }}
                >
                  Continue as a guest
                </Button>
              </section>
            </div>
          </ScrollArea>
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  )
}
