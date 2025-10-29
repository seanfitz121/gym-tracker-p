import { Metadata } from 'next'
import { PlateCalculator } from '@/components/tools/plate-calculator'
import { AdBanner } from '@/components/ads/ad-banner'
import { AD_SLOTS } from '@/lib/config/ads'
import { ThemeLogo } from '@/components/common/theme-logo'
import { Footer } from '@/components/layout/footer'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Plate Calculator - Barbell Loading Calculator | Plate Progress',
  description: 'Free plate calculator for barbell loading. Instantly calculate which plates to load on each side for any target weight. Supports all bar types and plate sizes.',
  keywords: 'plate calculator, barbell calculator, weight calculator, gym calculator, plate loading calculator',
}

export default function PublicPlateCalculatorPage() {
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
            Plate Calculator
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Calculate which plates to load on each side of the barbell
          </p>
        </div>

        <PlateCalculator />

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
          <h2>How to Use This Plate Calculator</h2>
          <p>
            Enter your target weight and select your bar type. The calculator will show you exactly which plates to load on each side of the barbell using the most efficient combination.
          </p>
          
          <h3>Why Use a Plate Calculator?</h3>
          <p>
            A plate calculator saves time and prevents errors when loading the bar. Benefits include:
          </p>
          <ul>
            <li><strong>Save time</strong> - No mental math between sets</li>
            <li><strong>Avoid errors</strong> - Loading the wrong weight is dangerous</li>
            <li><strong>Efficient loading</strong> - Uses the fewest plates possible</li>
            <li><strong>Learn patterns</strong> - Memorize common combinations faster</li>
          </ul>

          <h3>Common Weight Combinations</h3>
          <p>Memorize these standards for quick loading with a 45 lb bar:</p>
          <ul>
            <li><strong>135 lbs</strong> - 1 × 45 lb plate per side</li>
            <li><strong>225 lbs</strong> - 2 × 45 lb plates per side</li>
            <li><strong>315 lbs</strong> - 3 × 45 lb plates per side</li>
            <li><strong>405 lbs</strong> - 4 × 45 lb plates per side</li>
          </ul>

          <h3>Different Bar Types</h3>
          <p>Always account for the bar weight:</p>
          <ul>
            <li><strong>Standard Olympic Bar</strong> - 45 lbs (20 kg)</li>
            <li><strong>Women's Bar</strong> - 35 lbs (15 kg)</li>
            <li><strong>Safety Squat Bar</strong> - 60-70 lbs</li>
            <li><strong>Trap/Hex Bar</strong> - 45-60 lbs</li>
          </ul>

          <h3>Pro Loading Tips</h3>
          <ul>
            <li><strong>Load heavy first</strong> - Start with 45s, then add smaller plates</li>
            <li><strong>Use collars</strong> - Always secure plates with collars</li>
            <li><strong>Unload symmetrically</strong> - Remove from both sides alternately</li>
            <li><strong>Match heights</strong> - Keep bar level with same plate types</li>
          </ul>
        </div>

        {/* CTA */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 rounded-lg p-8 text-center space-y-4">
          <h3 className="text-2xl font-bold">More Tools for Your Training</h3>
          <p className="text-muted-foreground">
            Plate Progress includes 1RM calculators, body weight tracking, workout templates, and more - all integrated with your workout logs!
          </p>
          <Button asChild size="lg">
            <Link href="/auth">Try All Tools Free</Link>
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

