'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Dumbbell, Scale, Salad, User } from 'lucide-react'

const NAV = [
  { href: '/dashboard', label: 'Dashboard', Icon: LayoutDashboard },
  { href: '/workouts', label: 'Workouts', Icon: Dumbbell },
  { href: '/weight', label: 'Weight', Icon: Scale },
  { href: '/food', label: 'Food', Icon: Salad },
  { href: '/profile', label: 'Profile', Icon: User },
]

export function SidebarNav() {
  // usePathname is a client hook - which is why this is the only
  // part of the sidebar that ships JavaScript.
  const pathname = usePathname()

  return (
    <nav className="flex flex-col gap-1">
      {NAV.map(({ href, label, Icon }) => {
        const active = pathname.startsWith(href)
        return (
          <Link key={href} href={href}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors ${
              active
                ? 'bg-sidebar-hover text-white'
                : 'text-zinc-400 hover:bg-sidebar-hover hover:text-white'
            }`}>
            <Icon size={18} />
            {label}
          </Link>
        )
      })}
    </nav>
  )
}