'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Loader2, CheckCircle } from 'lucide-react'

export function AuthCallbackHandler() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isPasswordReset, setIsPasswordReset] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [updatingPassword, setUpdatingPassword] = useState(false)
  const [passwordUpdated, setPasswordUpdated] = useState(false)

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const supabase = createClient()
        
        // Check for error in URL (from Supabase)
        const errorParam = searchParams?.get('error')
        const errorDescription = searchParams?.get('error_description')
        
        if (errorParam) {
          setError(errorDescription || errorParam)
          toast.error(errorDescription || 'Authentication failed')
          setLoading(false)
          return
        }

        // Check for different auth events
        const type = searchParams?.get('type')
        
        // Handle email confirmation
        if (type === 'signup' || searchParams?.get('confirmation_url')) {
          toast.success('Email confirmed! Welcome to Plate Progress!', {
            duration: 5000,
            icon: '🎉',
          })
          setTimeout(() => {
            router.push('/app/dashboard')
          }, 1000)
          return
        }

        // Handle magic link
        if (type === 'magiclink') {
          const { data: { session }, error } = await supabase.auth.getSession()
          
          if (error) {
            toast.error('Magic link expired or invalid')
            setError('Magic link expired')
          } else if (session) {
            toast.success('Signed in successfully!', {
              icon: '✨',
            })
            setTimeout(() => {
              router.push('/app/dashboard')
            }, 1000)
          }
          setLoading(false)
          return
        }

        // Handle password recovery/reset
        if (type === 'recovery' || searchParams?.get('reset') === 'true') {
          // Check if we have a valid session for password reset
          const { data: { session } } = await supabase.auth.getSession()
          
          if (session) {
            setIsPasswordReset(true)
            setLoading(false)
            return
          } else {
            toast.error('Password reset link expired or invalid')
            setError('Reset link expired')
            setLoading(false)
            return
          }
        }

        // Check if there's a hash fragment (Supabase sometimes uses this)
        if (window.location.hash) {
          const hashParams = new URLSearchParams(window.location.hash.substring(1))
          const accessToken = hashParams.get('access_token')
          const type = hashParams.get('type')
          
          if (accessToken) {
            if (type === 'recovery') {
              setIsPasswordReset(true)
              setLoading(false)
              return
            }
            
            // For other types with access token, verify session
            const { data: { session } } = await supabase.auth.getSession()
            if (session) {
              toast.success('Authentication successful!', {
                icon: '✅',
              })
              setTimeout(() => {
                router.push('/app/dashboard')
              }, 1000)
              return
            }
          }
        }

        // No special auth event detected
        setLoading(false)
      } catch (err) {
        console.error('Auth callback error:', err)
        setError('An error occurred during authentication')
        toast.error('Authentication failed')
        setLoading(false)
      }
    }

    handleAuthCallback()
  }, [searchParams, router])

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }
    
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    setUpdatingPassword(true)

    try {
      const supabase = createClient()
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      })

      if (error) throw error

      setPasswordUpdated(true)
      toast.success('Password updated successfully!', {
        icon: '🎉',
        duration: 5000,
      })

      // Redirect to dashboard after short delay
      setTimeout(() => {
        router.push('/app/dashboard')
      }, 2000)
    } catch (error: any) {
      console.error('Password update error:', error)
      toast.error(error.message || 'Failed to update password')
    } finally {
      setUpdatingPassword(false)
    }
  }

  // Show loading state while processing callback
  if (loading) {
    return (
      <Card className="border-2">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Processing authentication...</p>
        </CardContent>
      </Card>
    )
  }

  // Show password reset form
  if (isPasswordReset && !passwordUpdated) {
    return (
      <Card className="border-2">
        <CardHeader>
          <CardTitle className="text-2xl">Set new password</CardTitle>
          <CardDescription>
            Enter your new password below
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePasswordUpdate} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="new-password">New Password</Label>
              <Input
                id="new-password"
                type="password"
                placeholder="••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={6}
                className="h-11"
                disabled={updatingPassword}
              />
              <p className="text-xs text-gray-500">Must be at least 6 characters</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm Password</Label>
              <Input
                id="confirm-password"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
                className="h-11"
                disabled={updatingPassword}
              />
            </div>

            <Button 
              type="submit" 
              className="w-full h-11" 
              disabled={updatingPassword || !newPassword || !confirmPassword}
            >
              {updatingPassword ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Updating password...
                </>
              ) : (
                'Update password'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    )
  }

  // Show success state after password update
  if (passwordUpdated) {
    return (
      <Card className="border-2">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center mb-4">
            <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
          </div>
          <CardTitle>Password updated!</CardTitle>
          <CardDescription>
            Redirecting you to your dashboard...
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  // Show error state
  if (error) {
    return (
      <Card className="border-2 border-red-200 dark:border-red-800">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 rounded-full bg-red-100 dark:bg-red-900 flex items-center justify-center mb-4">
            <span className="text-2xl">❌</span>
          </div>
          <CardTitle className="text-red-600 dark:text-red-400">Authentication Error</CardTitle>
          <CardDescription className="text-red-600 dark:text-red-400">
            {error}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            variant="outline"
            onClick={() => router.push('/auth')}
            className="w-full"
          >
            Back to sign in
          </Button>
        </CardContent>
      </Card>
    )
  }

  // No callback detected, return null to show normal auth form
  return null
}

