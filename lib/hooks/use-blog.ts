import { useState, useEffect, useCallback } from 'react'
import { BlogPost, CreateBlogPostInput, UpdateBlogPostInput } from '@/lib/types/blog'

interface PaginationInfo {
  page: number
  limit: number
  total: number
  totalPages: number
  hasMore: boolean
}

export function useBlogPosts(page: number = 1, limit: number = 10) {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState<PaginationInfo | null>(null)

  const fetchPosts = useCallback(async (pageNum: number) => {
    try {
      setLoading(true)
      const response = await fetch(`/api/blog?page=${pageNum}&limit=${limit}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch blog posts')
      }

      const data = await response.json()
      
      // Handle both old format (array) and new format (object with posts and pagination)
      if (Array.isArray(data)) {
        setPosts(data)
        setPagination(null)
      } else {
        setPosts(data.posts || [])
        setPagination(data.pagination || null)
      }
      
      setError(null)
    } catch (err) {
      console.error('Error fetching blog posts:', err)
      setError(err instanceof Error ? err.message : 'Failed to load posts')
    } finally {
      setLoading(false)
    }
  }, [limit])

  useEffect(() => {
    fetchPosts(page)
  }, [page, fetchPosts])

  return { 
    posts, 
    loading, 
    error, 
    pagination,
    refresh: () => fetchPosts(page),
    fetchPage: (pageNum: number) => fetchPosts(pageNum)
  }
}

export function useCreateBlogPost() {
  const [loading, setLoading] = useState(false)

  const createPost = async (input: CreateBlogPostInput): Promise<BlogPost | null> => {
    try {
      setLoading(true)
      const response = await fetch('/api/blog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create post')
      }

      const post = await response.json()
      return post
    } catch (err) {
      console.error('Error creating blog post:', err)
      throw err
    } finally {
      setLoading(false)
    }
  }

  return { createPost, loading }
}

export function useUpdateBlogPost() {
  const [loading, setLoading] = useState(false)

  const updatePost = async (id: string, input: UpdateBlogPostInput): Promise<BlogPost | null> => {
    try {
      setLoading(true)
      const response = await fetch(`/api/blog/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update post')
      }

      const post = await response.json()
      return post
    } catch (err) {
      console.error('Error updating blog post:', err)
      throw err
    } finally {
      setLoading(false)
    }
  }

  return { updatePost, loading }
}

export function useDeleteBlogPost() {
  const [loading, setLoading] = useState(false)

  const deletePost = async (id: string): Promise<boolean> => {
    try {
      setLoading(true)
      const response = await fetch(`/api/blog/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to delete post')
      }

      return true
    } catch (err) {
      console.error('Error deleting blog post:', err)
      throw err
    } finally {
      setLoading(false)
    }
  }

  return { deletePost, loading }
}

