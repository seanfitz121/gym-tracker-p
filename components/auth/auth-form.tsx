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
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/app/log`,
          },
        })

        if (error) throw error

        toast.success('Account created! Please check your email to confirm.')
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
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
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
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

