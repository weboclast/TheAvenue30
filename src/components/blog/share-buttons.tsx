'use client'

import { BrandFacebook, BrandLinkedin, BrandWhatsapp, BrandX, Link } from '@appica/icons-react'
import { Button } from '@appica/ui-react/button'
import { CopyButton } from '@appica/ui-react/copy-button'
import { useToastManager } from '@appica/ui-react/toast'
import { errorToast } from '@/lib/toast'
import { cn } from '@/lib/utils'

/** One network, and the intent URL it takes a shared page on. */
const NETWORKS = [
  {
    label: 'X',
    icon: BrandX,
    href: (url: string, title: string) =>
      `https://x.com/intent/post?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
  },
  {
    label: 'Facebook',
    icon: BrandFacebook,
    href: (url: string) => `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
  },
  {
    label: 'LinkedIn',
    icon: BrandLinkedin,
    href: (url: string) => `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
  },
  {
    label: 'WhatsApp',
    icon: BrandWhatsapp,
    href: (url: string, title: string) => `https://wa.me/?text=${encodeURIComponent(`${title} ${url}`)}`,
  },
]

/**
 * A row of buttons passing the page on: 1 per network, then copy link. Buttons
 * rather than links, because the page's own address is the thing shared and
 * only the browser knows it: the template ships without a configured site URL.
 * The caller titles the row.
 */
export function ShareButtons({ title, className }: { title: string; className?: string }) {
  const toast = useToastManager()

  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      {NETWORKS.map(({ label, icon: Icon, href }) => (
        <Button
          key={label}
          variant="outline"
          size="icon-md"
          aria-label={`Share on ${label}`}
          onClick={() => window.open(href(window.location.href, title), '_blank', 'noopener,noreferrer')}
        >
          <Icon />
        </Button>
      ))}

      <CopyButton
        value={() => window.location.href}
        icon={<Link />}
        variant="outline"
        size="icon-md"
        label="Copy link"
        copiedLabel="Link copied"
        onCopyError={() => toast.add(errorToast('Could not copy the link'))}
      />
    </div>
  )
}
