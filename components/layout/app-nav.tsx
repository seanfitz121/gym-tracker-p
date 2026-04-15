'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Dumbbell, History, TrendingUp, Users } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/app/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/app/history', label: 'History', icon: History },
  { href: '/app/log', label: 'Log', icon: Dumbbell, primary: true },
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
    <nav className="fixed inset-x-0 bottom-0 z-50 px-2 pb-[max(0.5rem,var(--safe-bottom))]">
      <div className="mx-auto flex h-20 max-w-2xl items-center justify-around rounded-t-lg border border-b-0 bg-background/92 px-1 shadow-industrial backdrop-blur-xl md:rounded-lg md:border">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href || (item.href !== '/app/dashboard' && pathname.startsWith(item.href))

          const tourId = 
            item.href === '/app/history' ? 'nav-history' :
            item.href === '/app/progress' ? 'nav-progress' :
            item.href === '/app/social' ? 'nav-social' :
            undefined

          if (item.primary) {
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={handleNavClick}
                data-tour="log-workout"
                className={cn(
                  'group flex flex-1 flex-col items-center justify-center gap-1 px-1 text-center',
                )}
              >
                <div className={cn(
                  'flex h-14 w-14 -translate-y-4 items-center justify-center rounded-full border-4 border-background shadow-industrial transition-all',
                  isActive
                    ? 'bg-primary text-primary-foreground scale-105'
                    : 'bg-foreground text-background group-hover:bg-primary group-hover:text-primary-foreground'
                )}>
                  <Icon className="h-6 w-6" />
                </div>
                <span className={cn(
                  '-mt-3 text-[11px] font-black uppercase leading-none',
                  isActive
                    ? 'text-primary'
                    : 'text-muted-foreground'
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
                'flex h-full flex-1 flex-col items-center justify-center gap-1 rounded-md px-1 transition-colors',
                isActive
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="max-w-full truncate text-[10px] font-bold uppercase">{item.label}</span>
              {isActive && <span className="h-1 w-6 rounded-full bg-primary" />}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}


