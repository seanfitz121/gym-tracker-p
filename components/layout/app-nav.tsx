'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Dumbbell, History, TrendingUp, Users } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/app/history', label: 'History', icon: History },
  { href: '/app/log', label: 'Log', icon: Dumbbell },
  { href: '/app/dashboard', label: 'Dashboard', icon: LayoutDashboard },
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
          const isDashboard = item.href === '/app/dashboard'

          const tourId = 
            item.href === '/app/history' ? 'nav-history' :
            item.href === '/app/progress' ? 'nav-progress' :
            item.href === '/app/social' ? 'nav-social' :
            undefined

          // Dashboard gets special raised styling
          if (isDashboard) {
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={handleNavClick}
                className={cn(
                  'flex flex-col items-center justify-center flex-1 h-full space-y-0.5 sm:space-y-1 transition-all px-1 relative',
                )}
              >
                <div className={cn(
                  'absolute -top-4 rounded-full p-3 shadow-lg transition-all',
                  isActive
                    ? 'bg-gradient-to-br from-blue-600 to-blue-700 dark:from-blue-500 dark:to-blue-600 text-white scale-110'
                    : 'bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 text-gray-600 dark:text-gray-400 hover:scale-105'
                )}>
                  <Icon className="h-6 w-6 flex-shrink-0" />
                </div>
                <span className={cn(
                  'text-[10px] sm:text-xs font-medium truncate max-w-full mt-6',
                  isActive
                    ? 'text-blue-600 dark:text-blue-400'
                    : 'text-gray-600 dark:text-gray-400'
                )}>{item.label}</span>
              </Link>
            )
          }

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


