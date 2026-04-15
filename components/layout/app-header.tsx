'use client'

import { useEffect } from 'react'
import { User } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'
import { useProfile } from '@/lib/hooks/use-profile'
import { usePremiumStatus } from '@/lib/hooks/use-premium'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Settings, LogOut, User as UserIcon, HelpCircle, Newspaper, FileText, Zap, Wrench, Lock, ShieldCheck } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ThemeLogo } from '@/components/common/theme-logo'
import { GoldenUsername } from '@/components/gamification/golden-username'
import { toast } from 'sonner'
import { NotificationBell } from '@/components/notifications/notification-bell'

interface AppHeaderProps {
  user: User
}

export function AppHeader({ user }: AppHeaderProps) {
  const router = useRouter()
  const { profile, refresh } = useProfile(user.id)
  const { isPremium } = usePremiumStatus()

  // Listen for profile updates from settings page
  useEffect(() => {
    const handleProfileUpdate = () => {
      refresh()
    }

    window.addEventListener('profile-updated', handleProfileUpdate)
    return () => window.removeEventListener('profile-updated', handleProfileUpdate)
  }, [refresh])

  const triggerLoading = () => {
    window.dispatchEvent(new Event('navigation-start'))
  }

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    toast.success('Signed out successfully')
    router.push('/auth')
  }

  // Get display name or fallback to email
  const displayName = profile?.display_name || user.email?.split('@')[0] || 'User'
  
  // Get initials
  const initials = profile?.display_name
    ? profile.display_name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : user.email
        ?.split('@')[0]
        .slice(0, 2)
        .toUpperCase() || 'U'

  return (
    <header className="sticky top-0 z-40 border-b bg-background/88 px-3 py-2 backdrop-blur-xl safe-pt">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3">
        <Link 
          href="/app/dashboard" 
          onClick={triggerLoading}
          className="group flex min-w-0 cursor-pointer items-center transition-opacity hover:opacity-85"
        >
          <ThemeLogo
            width={140}
            height={40}
            className="h-8 w-auto object-contain md:h-10"
            priority
          />
        </Link>
        <div className="flex items-center gap-1.5">
          <Button 
            variant="ghost" 
            size="icon"
            className="hidden sm:inline-flex"
            asChild
          >
            <Link href="/app/tools" onClick={triggerLoading}>
              <Wrench className="h-5 w-5" />
              <span className="sr-only">Tools</span>
            </Link>
          </Button>
          <Button 
            variant="ghost" 
            size="icon"
            className="relative"
            asChild
          >
            <Link href="/app/premium" onClick={triggerLoading}>
              <Zap className="h-5 w-5 text-primary premium-pulse" />
              {isPremium && (
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex h-3 w-3 rounded-full bg-primary"></span>
                </span>
              )}
              <span className="sr-only">Premium</span>
            </Link>
          </Button>
          
          {/* Notification Bell */}
          <NotificationBell />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-11 w-11 rounded-full p-0">
                <Avatar className="h-10 w-10 border border-border">
                  <AvatarImage src={profile?.avatar_url || undefined} alt={displayName} />
                  <AvatarFallback>
                    {profile?.avatar_url ? (
                      <UserIcon className="h-5 w-5" />
                    ) : (
                      initials
                    )}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64">
            <DropdownMenuLabel>
              <div className="flex flex-col space-y-1.5">
                <GoldenUsername
                  username={displayName}
                  isPremium={isPremium}
                  flairEnabled={profile?.premium_flair_enabled ?? true}
                  className="text-sm font-medium leading-none"
                  showIcon={true}
                />
                <p className="text-xs leading-none text-muted-foreground">
                  {user.email}
                </p>
                <div className="mt-2 inline-flex w-fit items-center gap-1 rounded-md border px-2 py-1 text-[11px] font-semibold text-muted-foreground">
                  <ShieldCheck className="h-3 w-3 text-primary" />
                  Synced training account
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={() => { triggerLoading(); router.push('/app/tools') }}
              className="h-11 cursor-pointer sm:hidden"
            >
              <Wrench className="mr-2 h-5 w-5" />
              <span className="text-base">Tools</span>
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => { triggerLoading(); router.push('/app/tools#premium-tools') }}
              className="h-11 cursor-pointer"
            >
              <Lock className="mr-2 h-5 w-5" />
              <span className="text-base">Premium Tools</span>
              <span className="ml-auto">
                <Zap className="h-3 w-3 fill-primary text-primary" />
              </span>
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => { triggerLoading(); router.push('/app/patch-notes') }}
              className="h-11 cursor-pointer"
            >
              <FileText className="mr-2 h-5 w-5" />
              <span className="text-base">Patch Notes</span>
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => { triggerLoading(); router.push('/app/blog') }}
              className="h-11 cursor-pointer"
            >
              <Newspaper className="mr-2 h-5 w-5" />
              <span className="text-base">Blog</span>
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => { triggerLoading(); router.push('/app/tips') }}
              className="h-11 cursor-pointer"
            >
              <HelpCircle className="mr-2 h-5 w-5" />
              <span className="text-base">Tips & Guides</span>
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => { triggerLoading(); router.push('/app/settings') }}
              className="h-11 cursor-pointer"
            >
              <Settings className="mr-2 h-5 w-5" />
              <span className="text-base">Settings</span>
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={handleSignOut}
              className="h-11 cursor-pointer"
            >
              <LogOut className="mr-2 h-5 w-5" />
              <span className="text-base">Sign out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
