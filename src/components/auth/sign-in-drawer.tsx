'use client'

import { type ComponentProps, type ReactNode, useState } from 'react'
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
import { AccountBenefits } from './account-benefits'
import { CreateAccountDrawer } from './create-account-drawer'
import { ForgotPasswordDrawer } from './forgot-password-drawer'
import { SignInForm } from './sign-in-form'

type ButtonVariant = ComponentProps<typeof Button>['variant']

interface SignInDrawerProps {
  /** The element that opens the drawer, e.g. the header's account button. Leave it out to open it with {@link open}. */
  trigger?: React.ReactElement
  /** Whether the drawer is open, for a caller that opens it itself. Pair it with {@link onOpenChange}. */
  open?: boolean
  /** Called when the drawer opens or closes, including on the switch to registration or a reset. */
  onOpenChange?: (open: boolean) => void
  /** The button that switches to registration. @default 'secondary' */
  createAccountVariant?: ButtonVariant
  /** The registration drawer's submit button. @default 'secondary' */
  registerVariant?: ButtonVariant
  /** Shows the brand mark above each drawer's title. @default true */
  logo?: boolean
  /** What "New customer?" lists, for a store whose account offers other perks. @default {@link AccountBenefits} */
  benefits?: ReactNode
  /**
   * Called once the shopper is signed in, by either drawer: the moment to carry
   * on with whatever the sign-in interrupted.
   */
  onSignedIn?: () => void
}

/**
 * Sign-in as a drawer, opened from the header rather than by leaving the page.
 *
 * It also hosts the register and forgot-password drawers, because the switch
 * between the three has to close one and open the next; keeping all 3 open
 * states here is what makes that a single decision.
 */
export function SignInDrawer({
  trigger,
  open: controlledOpen,
  onOpenChange,
  createAccountVariant = 'secondary',
  registerVariant,
  logo = true,
  benefits = <AccountBenefits />,
  onSignedIn,
}: SignInDrawerProps) {
  const rtl = useDirection() === 'rtl'
  const [ownOpen, setOwnOpen] = useState(false)
  const open = controlledOpen ?? ownOpen
  const setOpen = (next: boolean) => {
    setOwnOpen(next)
    onOpenChange?.(next)
  }
  const [createAccountOpen, setCreateAccountOpen] = useState(false)
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false)

  return (
    <>
      <Drawer side={rtl ? 'left' : 'right'} open={open} onOpenChange={setOpen}>
        {trigger ? <DrawerTrigger render={trigger} /> : null}
        <DrawerContent className="w-115">
          <DrawerBody className="overflow-hidden px-0">
            <ScrollArea scrollbarVisibility="auto" className="h-full">
              <div className="flex flex-col gap-12 px-6 py-1">
                <section className="flex flex-col gap-4">
                  {logo && <Logo variant="mark" href={null} className="h-10 sm:h-12" />}
                  <div className="flex flex-col gap-2">
                    <DrawerTitle className="font-medium">Sign in to The Avenue 30</DrawerTitle>
                    <DrawerDescription className="text-foreground">
                      Sign in to view order status, update billing, check past orders.
                    </DrawerDescription>
                  </div>
                  <SignInForm
                    onSuccess={() => {
                      setOpen(false)
                      onSignedIn?.()
                    }}
                    forgotPasswordSlot={
                      <button
                        type="button"
                        className="text-foreground hover:text-foreground-intense cursor-pointer text-sm underline transition-colors hover:no-underline motion-reduce:transition-none"
                        onClick={() => {
                          setOpen(false)
                          setForgotPasswordOpen(true)
                        }}
                      >
                        Forgot password?
                      </button>
                    }
                  />
                </section>
                <section className="flex flex-col gap-5">
                  <div className="flex flex-col gap-1.5">
                    <h3 className="text-foreground-intense text-2xl font-medium">New customer?</h3>
                    <p className="text-foreground text-sm">Enjoy these benefits with your new account.</p>
                  </div>
                  <Button
                    type="button"
                    variant={createAccountVariant}
                    size="lg"
                    className="w-full"
                    onClick={() => {
                      setOpen(false)
                      setCreateAccountOpen(true)
                    }}
                  >
                    Create an account
                  </Button>
                  {benefits}
                </section>
              </div>
            </ScrollArea>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
      <CreateAccountDrawer
        open={createAccountOpen}
        onOpenChange={setCreateAccountOpen}
        submitVariant={registerVariant}
        logo={logo}
        onSuccess={onSignedIn}
        onSwitchToSignIn={() => {
          setCreateAccountOpen(false)
          setOpen(true)
        }}
      />
      <ForgotPasswordDrawer
        open={forgotPasswordOpen}
        onOpenChange={setForgotPasswordOpen}
        logo={logo}
        onSwitchToSignIn={() => {
          setForgotPasswordOpen(false)
          setOpen(true)
        }}
      />
    </>
  )
}
