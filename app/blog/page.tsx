import { PublicBlogList } from '@/components/blog/public-blog-list'
import { AdBanner } from '@/components/ads/ad-banner'
import { AD_SLOTS } from '@/lib/config/ads'
import { ThemeLogo } from '@/components/common/theme-logo'
import { Footer } from '@/components/layout/footer'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export const metadata = {
  title: 'Fitness & Training Blog | Plate Progress',
  description: 'Expert fitness tips, workout guides, training advice, and progress tracking insights. Learn how to maximize your gains and track your fitness journey.',
  keywords: 'fitness blog, workout tips, training guide, strength training, progressive overload, 1RM calculator, workout tracking',
}

export default function PublicBlogPage() {
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
              <Link href="/">Home</Link>
            </Button>
            <Button asChild size="sm">
              <Link href="/auth">Sign In</Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* Blog Content */}
      <div className="container max-w-4xl mx-auto px-4 py-8 space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold">
            Fitness & Training Blog
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Expert tips, training insights, and workout advice to help you reach your fitness goals
          </p>
        </div>

        <PublicBlogList />

        {/* Ad - Bottom of blog list */}
        <div className="pt-8">
          <AdBanner 
            adSlot={AD_SLOTS.CONTENT_SEPARATOR}
            adFormat="auto"
            showPlaceholder={true}
            className="max-w-3xl mx-auto"
          />
        </div>
      </div>

      <Footer />
    </div>
  )
}

