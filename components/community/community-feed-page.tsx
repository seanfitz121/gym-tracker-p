'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Search, TrendingUp, Users, Globe } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { PostCard } from './post-card'
import { CreatePostDialog } from './create-post-dialog'
import type { CommunityCategory, PostWithAuthor } from '@/lib/types/community'
import { createClient } from '@/lib/supabase/client'

export function CommunityFeedPage() {
  const router = useRouter()
  const [categories, setCategories] = useState<CommunityCategory[]>([])
  const [posts, setPosts] = useState<PostWithAuthor[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [feedType, setFeedType] = useState<'global' | 'friends'>('global')
  const [searchQuery, setSearchQuery] = useState('')
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch('/api/community/categories')
        const data = await res.json()
        setCategories(data.categories || [])
      } catch (error) {
        console.error('Error fetching categories:', error)
      }
    }
    fetchCategories()
  }, [])

  // Fetch posts
  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true)
      try {
        const params = new URLSearchParams({
          type: feedType,
          page: page.toString(),
          limit: '20'
        })

        if (selectedCategory !== 'all') {
          params.set('type', 'category')
          params.set('category', selectedCategory)
        }

        const res = await fetch(`/api/community/feed?${params}`)
        const data = await res.json()
        
        if (page === 1) {
          setPosts(data.posts || [])
        } else {
          setPosts(prev => [...prev, ...(data.posts || [])])
        }
        
        setHasMore(data.hasMore)
      } catch (error) {
        console.error('Error fetching posts:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchPosts()
  }, [selectedCategory, feedType, page])

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category)
    setPage(1)
    setPosts([])
  }

  const handleFeedTypeChange = (type: 'global' | 'friends') => {
    setFeedType(type)
    setSelectedCategory('all')
    setPage(1)
    setPosts([])
  }

  const handlePostCreated = (newPost: PostWithAuthor) => {
    setPosts(prev => [newPost, ...prev])
    setIsCreateDialogOpen(false)
  }

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      setPage(prev => prev + 1)
    }
  }

  const filteredPosts = searchQuery
    ? posts.filter(post =>
        post.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.body.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : posts

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* Header Section */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold">Community</h1>
            <p className="text-muted-foreground mt-1">
              Connect, share, and learn with fellow lifters
            </p>
          </div>
          <Button
            size="lg"
            onClick={() => setIsCreateDialogOpen(true)}
            className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 shadow-lg"
          >
            <Plus className="h-5 w-5 mr-2" />
            New Post
          </Button>
        </div>

        {/* Feed Type Tabs */}
        <div className="flex gap-2 mb-4">
          <Button
            variant={feedType === 'global' ? 'default' : 'outline'}
            onClick={() => handleFeedTypeChange('global')}
            className="flex items-center gap-2"
          >
            <Globe className="h-4 w-4" />
            Global
          </Button>
          <Button
            variant={feedType === 'friends' ? 'default' : 'outline'}
            onClick={() => handleFeedTypeChange('friends')}
            className="flex items-center gap-2"
          >
            <Users className="h-4 w-4" />
            Friends
          </Button>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search posts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Category Tabs */}
      <div className="mb-6">
        <Tabs value={selectedCategory} onValueChange={handleCategoryChange}>
          <TabsList className="w-full grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:flex lg:justify-start gap-2 h-auto p-2">
            <TabsTrigger value="all" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              All
            </TabsTrigger>
            {categories.map(cat => (
              <TabsTrigger key={cat.code} value={cat.code} className="flex items-center gap-2">
                <span>{cat.icon}</span>
                <span className="hidden sm:inline">{cat.name}</span>
                <span className="sm:hidden">{cat.name.split(' ')[0]}</span>
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      {/* Posts Feed */}
      <div className="space-y-4">
        {loading && page === 1 ? (
          <div className="text-center py-12">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
            <p className="mt-4 text-muted-foreground">Loading posts...</p>
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-gray-900 rounded-xl border">
            <p className="text-xl font-semibold mb-2">No posts yet</p>
            <p className="text-muted-foreground mb-4">
              {feedType === 'friends' 
                ? "Your friends haven't posted anything yet"
                : "Be the first to share something!"}
            </p>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Post
            </Button>
          </div>
        ) : (
          <>
            {filteredPosts.map(post => (
              <PostCard key={post.id} post={post} />
            ))}

            {/* Load More */}
            {hasMore && (
              <div className="text-center py-4">
                <Button
                  variant="outline"
                  onClick={handleLoadMore}
                  disabled={loading}
                >
                  {loading ? 'Loading...' : 'Load More'}
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Create Post Dialog */}
      <CreatePostDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        categories={categories}
        onPostCreated={handlePostCreated}
      />
    </div>
  )
}

