import { Metadata } from 'next'
import { OneRMCalculator } from '@/components/tools/one-rm-calculator'
import { AdBanner } from '@/components/ads/ad-banner'
import { AD_SLOTS } from '@/lib/config/ads'
import { ThemeLogo } from '@/components/common/theme-logo'
import { Footer } from '@/components/layout/footer'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export const metadata: Metadata = {
  title: '1RM Calculator - Calculate Your One Rep Max | Plate Progress',
  description: 'Free one-rep max calculator. Estimate your 1RM using Epley, Brzycki, and Lombardi formulas. Get working weight percentages for strength training programs.',
  keywords: '1rm calculator, one rep max calculator, strength calculator, powerlifting calculator, max lift calculator',
}

export default function PublicOneRMCalculatorPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      {/* Navigation */}
      <nav className="border-b sticky top-0 bg-white/80 dark:bg-gray-950/80 backdrop-blur-lg z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/">
            <ThemeLogo
              width={160}
              height={40}
              className="h-10 w-auto"
            />
          </Link>
          <div className="flex items-center gap-4">
            <Button asChild variant="ghost" size="sm">
              <Link href="/blog">Blog</Link>
            </Button>
            <Button asChild size="sm">
              <Link href="/auth">Sign In</Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* Calculator */}
      <div className="container max-w-4xl mx-auto px-4 py-8 space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-4xl md:text-5xl font-bold">
            1RM Calculator
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Calculate your one-rep max and training percentages
          </p>
        </div>

        <OneRMCalculator />

        {/* Ad - After calculator */}
        <div className="pt-8">
          <AdBanner 
            adSlot={AD_SLOTS.CONTENT_SEPARATOR}
            adFormat="auto"
            showPlaceholder={false}
            className="max-w-3xl mx-auto"
          />
        </div>

        {/* Information Section */}
        <div className="prose prose-gray dark:prose-invert max-w-none">
          <h2>How to Use This 1RM Calculator</h2>
          <p>
            Enter the weight you lifted and how many reps you completed. The calculator will estimate your one-rep max (1RM) using three proven formulas: Epley, Brzycki, and Lombardi.
          </p>
          
          <h3>What is a One Rep Max?</h3>
          <p>
            Your one-rep max (1RM) is the maximum weight you can lift for a single repetition with proper form. It's a key metric for:
          </p>
          <ul>
            <li><strong>Programming workouts</strong> - Many programs use percentages of your 1RM</li>
            <li><strong>Tracking progress</strong> - Watch your 1RM increase over time</li>
            <li><strong>Setting goals</strong> - Know what weight to aim for</li>
          </ul>

          <h3>Which Formula is Best?</h3>
          <p>
            All three formulas are accurate for sets in the 3-8 rep range. For sets above 10 reps, accuracy decreases. We recommend:
          </p>
          <ul>
            <li><strong>Epley</strong> - Best for 4-6 rep range</li>
            <li><strong>Brzycki</strong> - Best for 2-3 rep range</li>
            <li><strong>Lombardi</strong> - Good all-around estimate</li>
          </ul>

          <h3>Training Percentages</h3>
          <p>Use these percentages of your 1RM for different training goals:</p>
          <ul>
            <li><strong>Strength (1-5 reps)</strong> - 85-100% of 1RM</li>
            <li><strong>Hypertrophy (6-12 reps)</strong> - 65-85% of 1RM</li>
            <li><strong>Endurance (12+ reps)</strong> - 50-65% of 1RM</li>
          </ul>
        </div>

        {/* CTA */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 rounded-lg p-8 text-center space-y-4">
          <h3 className="text-2xl font-bold">Track Your 1RM Automatically</h3>
          <p className="text-muted-foreground">
            Plate Progress calculates your 1RM for every exercise automatically as you log workouts. See your strength progress over time with beautiful charts!
          </p>
          <Button asChild size="lg">
            <Link href="/auth">Start Tracking Free</Link>
          </Button>
        </div>

        {/* Ad - Bottom */}
        <div className="pt-4">
          <AdBanner 
            adSlot={AD_SLOTS.BOTTOM_BANNER}
            adFormat="auto"
            showPlaceholder={false}
            className="max-w-3xl mx-auto"
          />
        </div>
      </div>

      <Footer />
    </div>
  )
}

