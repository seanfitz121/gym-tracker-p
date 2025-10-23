'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import { 
  Zap, 
  Check, 
  Sparkles, 
  Crown,
  AlertCircle,
  CheckCircle,
  XCircle,
  Loader2,
  ExternalLink
} from 'lucide-react'
import { usePremiumStatus, useCreateCheckoutSession } from '@/lib/hooks/use-premium'
import { PREMIUM_FEATURES, PREMIUM_PRICE } from '@/lib/types/premium'
import { format } from 'date-fns'

export function PremiumPage() {
  const searchParams = useSearchParams()
  const { subscription, isPremium, loading } = usePremiumStatus()
  const { createCheckoutSession, loading: checkoutLoading } = useCreateCheckoutSession()
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  useEffect(() => {
    // Check for success/cancel params from Stripe redirect
    const success = searchParams?.get('success')
    const canceled = searchParams?.get('canceled')

    if (success === 'true') {
      setStatusMessage({ 
        type: 'success', 
        message: 'Welcome to Premium! Your subscription is now active.' 
      })
      // Clear URL params
      window.history.replaceState({}, '', '/app/premium')
    } else if (canceled === 'true') {
      setStatusMessage({ 
        type: 'error', 
        message: 'Subscription canceled. You can try again anytime!' 
      })
      // Clear URL params
      window.history.replaceState({}, '', '/app/premium')
    }
  }, [searchParams])

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Skeleton className="h-12 w-64 mb-4" />
        <Skeleton className="h-6 w-96 mb-8" />
        <div className="grid gap-4">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 pb-24 md:pb-8 max-w-5xl">
      {/* Animated Background Effects */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-0 -right-4 w-72 h-72 bg-yellow-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      {/* Header */}
      <div className="text-center mb-12 relative">
        <div className="inline-flex items-center justify-center gap-3 mb-6 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-600 to-yellow-500 blur-2xl opacity-30 animate-pulse"></div>
          <Crown className="h-12 w-12 text-yellow-500 relative z-10 drop-shadow-[0_0_15px_rgba(234,179,8,0.5)]" />
          <h1 className="text-5xl md:text-6xl font-black bg-gradient-to-r from-purple-600 via-pink-600 to-yellow-500 bg-clip-text text-transparent relative z-10 gradient-animate">
            Premium
          </h1>
          <Sparkles className="h-12 w-12 text-purple-500 relative z-10 drop-shadow-[0_0_15px_rgba(168,85,247,0.5)]" />
        </div>
        <p className="text-xl md:text-2xl font-semibold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-gray-100 dark:to-gray-400 bg-clip-text text-transparent mb-2">
          Unlock Your Full Potential
        </p>
        <p className="text-base text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Take your fitness journey to legendary status with exclusive features designed for serious lifters
        </p>
      </div>

      {/* Status Messages */}
      {statusMessage && (
        <Alert className={`mb-6 ${statusMessage.type === 'success' ? 'border-green-500' : 'border-red-500'}`}>
          {statusMessage.type === 'success' ? (
            <CheckCircle className="h-4 w-4 text-green-500" />
          ) : (
            <XCircle className="h-4 w-4 text-red-500" />
          )}
          <AlertDescription>{statusMessage.message}</AlertDescription>
        </Alert>
      )}

      {/* Current Subscription Status */}
      {isPremium && subscription && (
        <Card className="mb-8 border-2 border-purple-500/50 bg-gradient-to-br from-purple-900/10 via-pink-900/10 to-yellow-900/10 dark:from-purple-950/30 dark:via-pink-950/30 dark:to-yellow-950/30 relative overflow-hidden shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-yellow-500/10 shimmer"></div>
          <CardHeader className="relative z-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Sparkles className="h-6 w-6 text-purple-500 animate-pulse" />
                  <div className="absolute inset-0 bg-purple-500 blur-xl opacity-50"></div>
                </div>
                <CardTitle className="text-2xl bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Premium Active
                </CardTitle>
              </div>
              <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 text-white border-0 shadow-lg">
                <Crown className="h-3 w-3 mr-1" />
                Premium
              </Badge>
            </div>
            <CardDescription className="text-base">
              🎉 You have access to all premium features
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Status:</span>
                <span className="font-medium capitalize">{subscription.status}</span>
              </div>
              {subscription.current_period_end && (
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Renews on:</span>
                  <span className="font-medium">
                    {format(new Date(subscription.current_period_end), 'MMM dd, yyyy')}
                  </span>
                </div>
              )}
              {subscription.cancel_at_period_end && (
                <Alert className="mt-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Your subscription will end on {format(new Date(subscription.current_period_end!), 'MMM dd, yyyy')}
                  </AlertDescription>
                </Alert>
              )}
            </div>
            <Separator className="my-4" />
            <Button
              asChild
              variant="outline"
              className="w-full"
            >
              <Link 
                href="https://billing.stripe.com/p/login/eVq00k1Bdb2b1gu91jgUM00" 
                target="_blank"
                rel="noopener noreferrer"
              >
                Manage Subscription
                <ExternalLink className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Pricing Card */}
      {!isPremium && (
        <Card className="mb-8 border-2 border-purple-500 bg-gradient-to-br from-purple-50 via-pink-50 to-yellow-50 dark:from-purple-950/30 dark:via-pink-950/30 dark:to-yellow-950/30 shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-yellow-500/10"></div>
          <CardHeader className="text-center relative z-10">
            <div className="mx-auto mb-6 p-4 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl w-fit relative shadow-xl">
              <Zap className="h-10 w-10 text-white animate-pulse" />
              <div className="absolute inset-0 bg-gradient-to-br from-purple-600 to-pink-600 blur-2xl opacity-50 animate-pulse"></div>
            </div>
            <div className="mb-2">
              <span className="text-5xl md:text-6xl font-black bg-gradient-to-r from-purple-600 via-pink-600 to-yellow-500 bg-clip-text text-transparent">
                €{PREMIUM_PRICE}
              </span>
              <span className="text-xl font-medium text-gray-600 dark:text-gray-400">/month</span>
            </div>
            <CardDescription className="text-base">
              Cancel anytime • No commitments • Full access instantly
            </CardDescription>
          </CardHeader>
          <CardContent className="relative z-10">
            {/* Coming Soon Overlay */}
            <div className="relative">
              <Button
                disabled
                size="lg"
                className="w-full h-14 text-lg font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-yellow-500 text-white shadow-xl opacity-50 cursor-not-allowed"
              >
                <Crown className="h-6 w-6 mr-2" />
                Upgrade to Premium Now
                <Sparkles className="h-6 w-6 ml-2" />
              </Button>
              
              {/* Coming Soon Badge */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 text-white px-6 py-3 rounded-xl shadow-2xl border-2 border-white transform -rotate-3 animate-pulse">
                  <div className="flex items-center gap-2">
                    <Zap className="h-5 w-5" />
                    <span className="font-black text-lg uppercase tracking-wide">Coming Soon</span>
                    <Sparkles className="h-5 w-5" />
                  </div>
                </div>
              </div>
            </div>
            
            <p className="text-xs text-center mt-4 text-gray-500 dark:text-gray-400">
              ⚠️ Premium features currently in development
            </p>
          </CardContent>
        </Card>
      )}

      {/* Features List */}
      <div className="space-y-8">
        <div className="text-center">
          <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-yellow-500 bg-clip-text text-transparent mb-2">
            Premium Features
          </h2>
          <p className="text-gray-600 dark:text-gray-400">Everything you need to reach your fitness goals</p>
          <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 rounded-full text-sm font-medium">
            <Zap className="h-4 w-4" />
            <span>Currently in development - Stay tuned!</span>
          </div>
        </div>
        <div className="grid gap-5">
          {PREMIUM_FEATURES.map((feature, index) => (
            <Card 
              key={feature.id} 
              className="group hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 border-2 border-transparent hover:border-purple-500/50 bg-gradient-to-br from-white to-purple-50/30 dark:from-gray-900 dark:to-purple-950/20 relative overflow-hidden"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/0 via-pink-500/0 to-yellow-500/0 group-hover:from-purple-500/5 group-hover:via-pink-500/5 group-hover:to-yellow-500/5 transition-all duration-500"></div>
              <CardContent className="p-6 relative z-10">
                <div className="flex items-start gap-4">
                  <div className="text-5xl flex-shrink-0 transform group-hover:scale-110 transition-transform duration-300">
                    {feature.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                        {feature.title}
                      </h3>
                      {feature.comingSoon && (
                        <Badge variant="secondary" className="text-xs bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300">
                          Coming Soon
                        </Badge>
                      )}
                    </div>
                    <p className="text-base text-gray-700 dark:text-gray-300 leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                  {isPremium && (
                    <div className="flex-shrink-0">
                      <div className="relative">
                        <Check className="h-6 w-6 text-green-600 relative z-10" />
                        <div className="absolute inset-0 bg-green-400 blur-lg opacity-50"></div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* FAQ or Additional Info */}
      <Card className="mt-12 border-2 border-purple-500/20 bg-gradient-to-br from-purple-50/50 to-pink-50/50 dark:from-purple-950/20 dark:to-pink-950/20 shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Why Go Premium?
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-base text-gray-700 dark:text-gray-300">
          <div className="flex gap-3">
            <span className="text-2xl">💪</span>
            <p>
              Premium helps support the ongoing development and maintenance of Plate Progress. 
              Your subscription enables us to add new features, improve performance, and keep 
              the app running smoothly for everyone.
            </p>
          </div>
          <div className="flex gap-3">
            <span className="text-2xl">🎯</span>
            <p>
              All core workout tracking features will always remain free. Premium is for those 
              who want to go beyond the basics and get the most out of their fitness journey.
            </p>
          </div>
          <div className="flex gap-3">
            <span className="text-2xl">🚀</span>
            <p>
              Join the elite community of dedicated lifters who are serious about tracking every 
              aspect of their progress and reaching legendary status.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

