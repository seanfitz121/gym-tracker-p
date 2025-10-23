'use client'

import { useEffect } from 'react'
import { User } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'
import { useProfile } from '@/lib/hooks/use-profile'
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
import { Settings, LogOut, User as UserIcon, Dumbbell, HelpCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'sonner'

interface AppHeaderProps {
  user: User
}

export function AppHeader({ user }: AppHeaderProps) {
  const router = useRouter()
  const { profile, refresh } = useProfile(user.id)

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
    <header className="bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800 px-4 py-3">
      <div className="flex items-center justify-between">
        <Link 
          href="/app/log" 
          onClick={triggerLoading}
          className="flex items-center gap-2 group cursor-pointer hover:opacity-80 transition-opacity"
        >
          <div className="relative">
            <Dumbbell className="h-7 w-7 text-blue-600 dark:text-blue-500 transform group-hover:scale-110 transition-transform" />
            <div className="absolute inset-0 bg-blue-500 blur-lg opacity-20 group-hover:opacity-30 transition-opacity" />
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-500 dark:to-purple-500 bg-clip-text text-transparent">
              Plate
            </span>
            <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 dark:from-purple-500 dark:to-blue-500 bg-clip-text text-transparent -mt-1">
              Progress
            </span>
          </div>
        </Link>
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="icon"
            className="h-10 w-10"
            asChild
          >
            <Link href="/app/tips" onClick={triggerLoading}>
              <HelpCircle className="h-5 w-5" />
              <span className="sr-only">Tips & Guides</span>
            </Link>
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                <Avatar className="h-10 w-10">
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
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">
                  {displayName}
                </p>
                <p className="text-xs leading-none text-muted-foreground">
                  {user.email}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => { triggerLoading(); router.push('/app/tips') }}>
              <HelpCircle className="mr-2 h-4 w-4" />
              Tips & Guides
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => { triggerLoading(); router.push('/app/settings') }}>
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleSignOut}>
              <LogOut className="mr-2 h-4 w-4" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}

