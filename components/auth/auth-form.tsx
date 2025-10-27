'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'

export function AuthForm() {
  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [loading, setLoading] = useState(false)
  const [magicLinkSent, setMagicLinkSent] = useState(false)

  const handleEmailPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const supabase = createClient()

      if (isSignUp) {
        // Validate username format
        if (!/^[a-zA-Z0-9_-]{3,20}$/.test(username)) {
          toast.error('Username must be 3-20 characters (letters, numbers, _, -)')
          setLoading(false)
          return
        }

        // Check if username is already taken via API (to bypass RLS)
        const checkResponse = await fetch('/api/users/check-username-available', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username })
        })

        if (!checkResponse.ok) {
          const checkData = await checkResponse.json()
          toast.error(checkData.error || 'Failed to check username availability')
          setLoading(false)
          return
        }

        const { available } = await checkResponse.json()
        if (!available) {
          toast.error('Username is already taken')
          setLoading(false)
          return
        }

        // Create auth user
        const { data: authData, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/app/log`,
            data: {
              username,
            }
          },
        })

        if (signUpError) throw signUpError

        // Create profile with username via API (to ensure proper permissions)
        if (authData.user) {
          try {
            const profileResponse = await fetch('/api/users/create-profile', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ 
                userId: authData.user.id,
                username,
                displayName: username 
              })
            })

            if (!profileResponse.ok) {
              const profileError = await profileResponse.json()
              console.error('Profile creation error:', profileError)
              // Continue anyway - user is created
            }
          } catch (err) {
            console.error('Failed to create profile:', err)
            // Continue anyway - user can set up profile later
          }
        }

        toast.success('Account created! Please check your email to confirm.')
      } else {
        // Login with email or username
        let loginEmail = email

        // Check if input looks like a username (no @ symbol)
        if (!email.includes('@')) {
          // Look up email by username via API
          try {
            const response = await fetch('/api/auth/username-to-email', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ username: email })
            })

            if (!response.ok) {
              toast.error('Invalid username or password')
              setLoading(false)
              return
            }

            const data = await response.json()
            loginEmail = data.email
          } catch (err) {
            toast.error('Invalid username or password')
            setLoading(false)
            return
          }
        }

        const { error } = await supabase.auth.signInWithPassword({
          email: loginEmail,
          password,
        })

        if (error) throw error

        toast.success('Signed in successfully!')
        // Force hard reload to bypass service worker cache
        window.location.replace('/app/log')
      }
    } catch (error: any) {
      toast.error(error.message || 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/app/log`,
        },
      })

      if (error) throw error

      setMagicLinkSent(true)
      toast.success('Magic link sent! Check your email.')
    } catch (error: any) {
      toast.error(error.message || 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  if (magicLinkSent) {
    return (
      <Card className="border-2">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center mb-4">
            <span className="text-2xl">✉️</span>
          </div>
          <CardTitle>Check your email</CardTitle>
          <CardDescription>
            We sent a magic link to <span className="font-medium text-gray-900 dark:text-gray-100">{email}</span>. Click the link to sign in.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            variant="outline"
            onClick={() => setMagicLinkSent(false)}
            className="w-full"
          >
            Back to sign in
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-2">
      <CardHeader>
        <CardTitle className="text-2xl">{isSignUp ? 'Create account' : 'Welcome back'}</CardTitle>
        <CardDescription>
          {isSignUp
            ? 'Get started with your free account'
            : 'Sign in to continue to your workouts'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleEmailPassword} className="space-y-4">
          {isSignUp && (
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                placeholder="cool_username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                minLength={3}
                maxLength={20}
                pattern="[a-zA-Z0-9_\-]{3,20}"
                className="h-11"
              />
              <p className="text-xs text-gray-500">
                3-20 characters (letters, numbers, _, -)
              </p>
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="email">
              {isSignUp ? 'Email' : 'Email or Username'}
            </Label>
            <Input
              id="email"
              type={isSignUp ? 'email' : 'text'}
              placeholder={isSignUp ? 'you@example.com' : 'email or username'}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="h-11"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="h-11"
            />
            {isSignUp && (
              <p className="text-xs text-gray-500">Must be at least 6 characters</p>
            )}
          </div>
          <Button type="submit" className="w-full h-11" disabled={loading}>
            {loading ? 'Loading...' : isSignUp ? 'Create account' : 'Sign in'}
          </Button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="px-2 bg-white dark:bg-gray-950 text-gray-500">Or continue with</span>
          </div>
        </div>

        <Button
          variant="outline"
          onClick={handleMagicLink}
          className="w-full h-11"
          disabled={loading || !email}
        >
          Email me a magic link
        </Button>

        <div className="mt-6 text-center text-sm">
          <button
            type="button"
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
          >
            {isSignUp
              ? 'Already have an account? Sign in'
              : "Don't have an account? Sign up"}
          </button>
        </div>
      </CardContent>
    </Card>
  )
}

