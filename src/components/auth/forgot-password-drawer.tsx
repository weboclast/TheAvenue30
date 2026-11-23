'use client'

import { Drawer, DrawerBody, DrawerContent, DrawerDescription, DrawerTitle } from '@appica/ui-react/drawer'
import { useDirection } from '@appica/ui-react/hooks/use-direction'
import { ScrollArea } from '@appica/ui-react/scroll-area'
import { Logo } from '@/components/logo'
import { ForgotPasswordForm } from './forgot-password-form'

interface ForgotPasswordDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Close this drawer and bring the sign-in drawer back. */
  onSwitchToSignIn: () => void
  /** Shows the brand mark above the title. @default true */
  logo?: boolean
}

/** Password recovery as a drawer, reached from {@link SignInDrawer} rather than as its own page. */
export function ForgotPasswordDrawer({ open, onOpenChange, onSwitchToSignIn, logo = true }: ForgotPasswordDrawerProps) {
  const rtl = useDirection() === 'rtl'

  return (
    <Drawer side={rtl ? 'left' : 'right'} open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="w-115">
        <DrawerBody className="overflow-hidden px-0">
          <ScrollArea scrollbarVisibility="auto" className="h-full">
            <div className="flex flex-col gap-4 px-6 py-1">
              {logo && <Logo variant="mark" href={null} className="h-10 sm:h-12" />}
              <div className="flex flex-col gap-2">
                <DrawerTitle className="font-medium">Forgot your password?</DrawerTitle>
                <DrawerDescription className="text-foreground">
                  Enter the email you use for The Avenue 30 and we&apos;ll send you a link to reset your password.
                </DrawerDescription>
              </div>
              <ForgotPasswordForm
                onSuccess={() => onOpenChange(false)}
                footer={
                  <p className="text-foreground text-center text-sm">
                    Remembered your password?{' '}
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
