import { createClient } from '@/lib/supabase/server'
import { PublicBlogPostView } from '@/components/blog/public-blog-post-view'
import { ThemeLogo } from '@/components/common/theme-logo'
import { Footer } from '@/components/layout/footer'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'

interface PageProps {
  params: Promise<{
    slug: string
  }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createClient()
  
  // Try to find post by slug first, then by ID
  let { data: post } = await supabase
    .from('blog_post')
    .select('*')
    .eq('slug', slug)
    .eq('published', true)
    .single()

  if (!post) {
    ({ data: post } = await supabase
      .from('blog_post')
      .select('*')
      .eq('id', slug)
      .eq('published', true)
      .single())
  }

  if (!post) {
    return {
      title: 'Post Not Found',
    }
  }

  return {
    title: `${post.title} | Plate Progress Blog`,
    description: post.subtitle || post.body.substring(0, 160),
    keywords: 'fitness, workout, training, strength training, gym tips',
    openGraph: {
      title: post.title,
      description: post.subtitle || post.body.substring(0, 160),
      type: 'article',
      images: post.cover_image_url ? [post.cover_image_url] : [],
    },
  }
}

export default async function PublicBlogPostPage({ params }: PageProps) {
  const { slug } = await params
  const supabase = await createClient()
  
  // Try to find post by ID (using slug param as ID for now)
  const { data: post, error } = await supabase
    .from('blog_post')
    .select('*')
    .eq('id', slug)
    .eq('published', true)
    .single()

  if (error || !post) {
    notFound()
  }

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

      {/* Blog Post Content */}
      <PublicBlogPostView post={post} />

      <Footer />
    </div>
  )
}

