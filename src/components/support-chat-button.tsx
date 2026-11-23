import Image from 'next/image'
import { Avatar, AvatarFallback, AvatarImage } from '@appica/ui-react/avatar'
import { Button } from '@appica/ui-react/button'

/**
 * The agent on duty, as a portrait rather than a headset icon: a face is what
 * makes a support button feel answered. Swap the file for your own team's, or
 * point it at whoever your help desk reports as online.
 */
const AGENT = { src: '/demo/shared/agent.webp', alt: '', size: 40 }

/**
 * The agent's portrait at icon size. Exported so the contact page's chat card
 * shows the same face as this button rather than its own copy of it.
 */
export function AgentAvatar() {
  return (
    // Sized in CSS pixels rather than by the `size` scale, so it lines up with
    // the button's text the way an icon in the same slot would.
    <Avatar size={20} data-icon="start">
      <AvatarImage render={<Image src={AGENT.src} alt={AGENT.alt} width={AGENT.size} height={AGENT.size} />} />
      <AvatarFallback />
    </Avatar>
  )
}

/**
 * Opens a conversation with support. Shown wherever a shopper is between
 * ordering and receiving: the order confirmation, and order tracking.
 *
 * No help desk ships, so the button does nothing. Give it an `onClick` that
 * opens your provider's widget, which makes this a client component.
 */
export function SupportChatButton({ className }: { className?: string }) {
  return (
    <Button variant="outline" className={className}>
      <AgentAvatar />
      Chat with support
    </Button>
  )
}
