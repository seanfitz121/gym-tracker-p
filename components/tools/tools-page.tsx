'use client'

import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Scale, Droplets, LayoutTemplate, Lock, Sparkles, Calculator } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { AdBanner } from '@/components/ads/ad-banner'
import { AD_SLOTS } from '@/lib/config/ads'

interface ToolCardProps {
  href: string
  icon: React.ReactNode
  title: string
  description: string
  isPremium?: boolean
  comingSoon?: boolean
}

function ToolCard({ href, icon, title, description, isPremium, comingSoon }: ToolCardProps) {
  const content = (
    <Card className={`h-full ${comingSoon ? 'opacity-60' : 'cursor-pointer hover:border-blue-400 dark:hover:border-blue-600'}`}>
      <CardHeader className="space-y-3">
        <div className="flex items-start justify-between">
          <div className="rounded-lg bg-blue-50 dark:bg-blue-950 p-3 w-fit">
            {icon}
          </div>
          <div className="flex gap-2">
            {isPremium && (
              <Badge variant="secondary" className="flex items-center gap-1">
                <Lock className="h-3 w-3" />
                Premium
              </Badge>
            )}
            {comingSoon && (
              <Badge variant="outline" className="flex items-center gap-1">
                <Sparkles className="h-3 w-3" />
                Soon
              </Badge>
            )}
          </div>
        </div>
        <div>
          <CardTitle className="text-lg">{title}</CardTitle>
          <CardDescription className="mt-2">{description}</CardDescription>
        </div>
      </CardHeader>
    </Card>
  )

  return comingSoon ? (
    <div className="block">{content}</div>
  ) : (
    <Link href={href} className="block transition-all hover:scale-[1.02] active:scale-[0.98]">
      {content}
    </Link>
  )
}

export function ToolsPage() {
  return (
    <div className="container max-w-4xl mx-auto p-4 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Tools</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Track your progress with our suite of fitness tools
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ToolCard
          href="/app/tools/1rm-calculator"
          icon={<Calculator className="h-6 w-6 text-blue-600 dark:text-blue-400" />}
          title="1RM Calculator"
          description="Estimate your one-rep max and get working weight percentages using multiple formulas"
        />

        <ToolCard
          href="/app/tools/plate-calculator"
          icon={<Scale className="h-6 w-6 text-blue-600 dark:text-blue-400" />}
          title="Plate Calculator"
          description="Calculate which plates to load on each side of the barbell to reach your target weight"
        />

        <ToolCard
          href="/app/weight"
          icon={<Scale className="h-6 w-6 text-blue-600 dark:text-blue-400" />}
          title="Weight Tracker"
          description="Monitor your bodyweight progress with charts, trends, and goal tracking"
          isPremium
        />

        <ToolCard
          href="/app/hydration"
          icon={<Droplets className="h-6 w-6 text-blue-600 dark:text-blue-400" />}
          title="Hydration Tracker"
          description="Stay hydrated with daily water intake tracking and streak monitoring"
          isPremium
        />

        <ToolCard
          href="/app/templates"
          icon={<LayoutTemplate className="h-6 w-6 text-blue-600 dark:text-blue-400" />}
          title="Workout Templates"
          description="Create and manage workout templates for quick access to your favorite routines"
        />

        {/* Placeholder for future tools */}
        <ToolCard
          href="#"
          icon={<Sparkles className="h-6 w-6 text-blue-600 dark:text-blue-400" />}
          title="More Coming Soon"
          description="We're constantly adding new tools to help you achieve your fitness goals"
          comingSoon
        />
      </div>

      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 border-blue-200 dark:border-blue-700">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="rounded-full bg-blue-100 dark:bg-blue-800/50 p-3">
              <Sparkles className="h-6 w-6 text-blue-600 dark:text-blue-300" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-lg mb-1 text-gray-900 dark:text-gray-100">Have a suggestion?</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                We're always looking to add more helpful tools. Let us know what features would help you most!
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Ad - Content separator at bottom (free users only) */}
      <div className="pt-4">
        <AdBanner 
          adSlot={AD_SLOTS.CONTENT_SEPARATOR}
          adFormat="auto"
          showPlaceholder={true}
          className="max-w-3xl mx-auto"
        />
      </div>
    </div>
  )
}

