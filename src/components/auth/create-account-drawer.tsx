'use client'

import type { ComponentProps } from 'react'
import { Drawer, DrawerBody, DrawerContent, DrawerDescription, DrawerTitle } from '@appica/ui-react/drawer'
import { useDirection } from '@appica/ui-react/hooks/use-direction'
import { ScrollArea } from '@appica/ui-react/scroll-area'
import { Logo } from '@/components/logo'
import { CreateAccountForm } from './create-account-form'

interface CreateAccountDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Close this drawer and bring the sign-in drawer back. */
  onSwitchToSignIn: () => void
  /** The submit button's variant. @default 'secondary' */
  submitVariant?: ComponentProps<typeof CreateAccountForm>['submitVariant']
  /** Shows the brand mark above the title. @default true */
  logo?: boolean
  /** Called once the account exists and the shopper is signed in, after the drawer closes. */
  onSuccess?: () => void
}

/** Registration as a drawer, reached from {@link SignInDrawer} rather than as its own page. */
export function CreateAccountDrawer({
  open,
  onOpenChange,
  onSwitchToSignIn,
  submitVariant,
  logo = true,
  onSuccess,
}: CreateAccountDrawerProps) {
  const rtl = useDirection() === 'rtl'

  return (
    <Drawer side={rtl ? 'left' : 'right'} open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="w-115">
        <DrawerBody className="overflow-hidden px-0">
          <ScrollArea scrollbarVisibility="auto" className="h-full">
            <div className="flex flex-col gap-4 px-6 py-1">
              {logo && <Logo variant="mark" href={null} className="h-10 sm:h-12" />}
              <div className="flex flex-col gap-2">
                <DrawerTitle className="font-medium">Create your The Avenue 30 account</DrawerTitle>
                <DrawerDescription className="text-foreground">
                  Create account to view order status, update billing, check past orders.
                </DrawerDescription>
              </div>
              <CreateAccountForm
                submitVariant={submitVariant}
                onSuccess={() => {
                  onOpenChange(false)
                  onSuccess?.()
                }}
                footer={
                  <p className="text-foreground text-center text-sm">
                    Already have an account?{' '}
                    <button
                      type="button"
                      className="text-foreground-intense cursor-pointer font-medium underline hover:no-underline"
                      onClick={onSwitchToSignIn}
                    >
                      Sign in
                    </button>
                  </p>
                }
              />
            </div>
          </ScrollArea>
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  )
}
