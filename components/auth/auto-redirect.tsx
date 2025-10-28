'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export function AutoRedirect() {
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        // User is authenticated, redirect to app
        router.replace('/app/dashboard')
      }
    }

    checkAuth()
  }, [router])

  return null
}

