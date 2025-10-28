'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Dumbbell, History, TrendingUp, Users } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/app/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/app/log', label: 'Log', icon: Dumbbell },
  { href: '/app/history', label: 'History', icon: History },
  { href: '/app/progress', label: 'Progress', icon: TrendingUp },
  { href: '/app/social', label: 'Social', icon: Users },
]

export function AppNav() {
  const pathname = usePathname()

  const handleNavClick = () => {
    // Dispatch instant loading event
    window.dispatchEvent(new Event('navigation-start'))
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-gray-950 border-t border-gray-200 dark:border-gray-800 md:relative md:border-t-0 md:border-b">
      <div className="flex justify-around items-center h-16 px-1">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href

          const tourId = 
            item.href === '/app/history' ? 'nav-history' :
            item.href === '/app/progress' ? 'nav-progress' :
            item.href === '/app/social' ? 'nav-social' :
            undefined

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={handleNavClick}
              data-tour={tourId}
              className={cn(
                'flex flex-col items-center justify-center flex-1 h-full space-y-0.5 sm:space-y-1 transition-colors px-1',
                isActive
                  ? 'text-blue-600 dark:text-blue-400'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
              )}
            >
              <Icon className="h-5 w-5 flex-shrink-0" />
              <span className="text-[10px] sm:text-xs font-medium truncate max-w-full">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}


