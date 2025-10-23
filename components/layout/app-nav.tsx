'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Dumbbell, History, TrendingUp, LayoutTemplate } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/app/log', label: 'Log', icon: Dumbbell },
  { href: '/app/history', label: 'History', icon: History },
  { href: '/app/progress', label: 'Progress', icon: TrendingUp },
  { href: '/app/templates', label: 'Templates', icon: LayoutTemplate },
]

export function AppNav() {
  const pathname = usePathname()

  const handleNavClick = () => {
    // Dispatch instant loading event
    window.dispatchEvent(new Event('navigation-start'))
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-950 border-t border-gray-200 dark:border-gray-800 md:relative md:border-t-0 md:border-b">
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={handleNavClick}
              className={cn(
                'flex flex-col items-center justify-center flex-1 h-full space-y-1 transition-colors',
                isActive
                  ? 'text-blue-600 dark:text-blue-400'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}


