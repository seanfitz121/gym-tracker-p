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
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Crown className="h-10 w-10 text-yellow-500" />
          <h1 className="text-4xl font-bold bg-gradient-to-r from-yellow-500 to-orange-500 bg-clip-text text-transparent">
            Plate Progress Premium
          </h1>
        </div>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          Unlock exclusive features and take your fitness tracking to the next level
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
        <Card className="mb-8 border-yellow-500/50 bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-950/20 dark:to-orange-950/20">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-yellow-600" />
                <CardTitle>Premium Active</CardTitle>
              </div>
              <Badge variant="default" className="bg-yellow-500 hover:bg-yellow-600">
                <Crown className="h-3 w-3 mr-1" />
                Premium
              </Badge>
            </div>
            <CardDescription>
              You have access to all premium features
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
        <Card className="mb-8 border-2 border-yellow-500">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-full w-fit">
              <Zap className="h-8 w-8 text-yellow-600" />
            </div>
            <CardTitle className="text-3xl">
              €{PREMIUM_PRICE}
              <span className="text-lg font-normal text-gray-600 dark:text-gray-400">/month</span>
            </CardTitle>
            <CardDescription>Cancel anytime, no commitments</CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={createCheckoutSession}
              disabled={checkoutLoading}
              size="lg"
              className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white"
            >
              {checkoutLoading ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Loading...
                </>
              ) : (
                <>
                  <Crown className="h-5 w-5 mr-2" />
                  Upgrade to Premium
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Features List */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-center mb-6">
          Premium Features
        </h2>
        <div className="grid gap-4">
          {PREMIUM_FEATURES.map((feature) => (
            <Card key={feature.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="text-4xl">{feature.icon}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-semibold">{feature.title}</h3>
                      {feature.comingSoon && (
                        <Badge variant="secondary" className="text-xs">
                          Coming Soon
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {feature.description}
                    </p>
                  </div>
                  {isPremium && (
                    <Check className="h-5 w-5 text-green-600 flex-shrink-0" />
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* FAQ or Additional Info */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Why Premium?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-gray-600 dark:text-gray-400">
          <p>
            Premium helps support the ongoing development and maintenance of Plate Progress. 
            Your subscription enables us to add new features, improve performance, and keep 
            the app running smoothly for everyone.
          </p>
          <p>
            All core workout tracking features will always remain free. Premium is for those 
            who want to go beyond the basics and get the most out of their fitness journey.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

