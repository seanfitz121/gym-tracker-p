'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { AuthCallbackHandler } from './auth-callback-handler'
import Link from 'next/link'

export function AuthForm() {
  const searchParams = useSearchParams()
  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [loading, setLoading] = useState(false)
  const [magicLinkSent, setMagicLinkSent] = useState(false)
  const [isResettingPassword, setIsResettingPassword] = useState(false)
  const [resetEmailSent, setResetEmailSent] = useState(false)
  const [hasAuthCallback, setHasAuthCallback] = useState(false)
  const [agreedToTerms, setAgreedToTerms] = useState(false)

  // Check if there's an auth callback in the URL
  useEffect(() => {
    const type = searchParams?.get('type')
    const error = searchParams?.get('error')
    const reset = searchParams?.get('reset')
    const confirmation = searchParams?.get('confirmation_url')
    const hash = window.location.hash
    
    setHasAuthCallback(!!(type || error || reset || confirmation || hash))
  }, [searchParams])

  const handleEmailPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const supabase = createClient()

      if (isSignUp) {
        // Check if user agreed to terms
        if (!agreedToTerms) {
          toast.error('You must agree to the Privacy Policy and Terms of Service')
          setLoading(false)
          return
        }

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
            emailRedirectTo: `${window.location.origin}/app/dashboard`,
            data: {
              username,
            }
          },
        })

        if (signUpError) throw signUpError

        // Profile is automatically created by database trigger
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
        window.location.replace('/app/dashboard')
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
          emailRedirectTo: `${window.location.origin}/app/dashboard`,
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

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const supabase = createClient()
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth?reset=true`,
      })

      if (error) throw error

      setResetEmailSent(true)
      toast.success('Password reset link sent! Check your email.')
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

  if (resetEmailSent) {
    return (
      <Card className="border-2">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center mb-4">
            <span className="text-2xl">🔐</span>
          </div>
          <CardTitle>Password reset email sent</CardTitle>
          <CardDescription>
            We sent a password reset link to <span className="font-medium text-gray-900 dark:text-gray-100">{email}</span>. Click the link to set a new password.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            variant="outline"
            onClick={() => {
              setResetEmailSent(false)
              setIsResettingPassword(false)
            }}
            className="w-full"
          >
            Back to sign in
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (isResettingPassword) {
    return (
      <Card className="border-2">
        <CardHeader>
          <CardTitle className="text-2xl">Reset password</CardTitle>
          <CardDescription>
            Enter your email and we'll send you a link to reset your password
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePasswordReset} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="reset-email">Email</Label>
              <Input
                id="reset-email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-11"
              />
            </div>
            <Button type="submit" className="w-full h-11" disabled={loading}>
              {loading ? 'Sending...' : 'Send reset link'}
            </Button>
          </form>
          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => setIsResettingPassword(false)}
              className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
            >
              Back to sign in
            </button>
          </div>
        </CardContent>
      </Card>
    )
  }

  // If there's an auth callback in URL, show callback handler instead
  if (hasAuthCallback) {
    return <AuthCallbackHandler />
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
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              {!isSignUp && (
                <button
                  type="button"
                  onClick={() => setIsResettingPassword(true)}
                  className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
                >
                  Forgot password?
                </button>
              )}
            </div>
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

          {/* Terms Agreement Checkbox (Sign Up Only) */}
          {isSignUp && (
            <div className="flex items-start space-x-3 rounded-lg border p-4 bg-gray-50 dark:bg-gray-900">
              <Checkbox
                id="terms"
                checked={agreedToTerms}
                onCheckedChange={(checked) => setAgreedToTerms(checked as boolean)}
                className="mt-1"
              />
              <div className="space-y-1">
                <label
                  htmlFor="terms"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                >
                  I agree to the Privacy Policy and Terms of Service
                </label>
                <p className="text-xs text-muted-foreground">
                  By creating an account, you agree to our{' '}
                  <Link
                    href="/legal/privacy"
                    target="_blank"
                    className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 underline"
                  >
                    Privacy Policy
                  </Link>
                  {' '}and{' '}
                  <Link
                    href="/legal/terms"
                    target="_blank"
                    className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 underline"
                  >
                    Terms of Service
                  </Link>
                </p>
              </div>
            </div>
          )}

          <Button type="submit" className="w-full h-11" disabled={loading || (isSignUp && !agreedToTerms)}>
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

