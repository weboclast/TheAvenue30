'use client'

import Link from 'next/link'
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from '@appica/ui-react/navigation-menu'
import type { NavLink } from '@/components/fashion/link-column'
import { cn } from '@/lib/utils'

interface MainMenuProps {
  links: NavLink[]
  className?: string
}

/** The bar's links beside the logo. */
export function MainMenu({ links, className }: MainMenuProps) {
  return (
    <NavigationMenu aria-label="Main" viewport={false} className={cn('font-mono uppercase', className)}>
      <NavigationMenuList>
        {links.map(({ label, href }) => (
          <NavigationMenuItem key={label}>
            <NavigationMenuLink render={<Link href={href} />}>{label}</NavigationMenuLink>
          </NavigationMenuItem>
        ))}
      </NavigationMenuList>
    </NavigationMenu>
  )
}
