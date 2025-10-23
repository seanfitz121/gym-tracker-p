import { useState, useEffect } from 'react'
import { BlogPost, CreateBlogPostInput, UpdateBlogPostInput } from '@/lib/types/blog'

export function useBlogPosts() {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchPosts = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/blog')
      
      if (!response.ok) {
        throw new Error('Failed to fetch blog posts')
      }

      const data = await response.json()
      setPosts(data)
      setError(null)
    } catch (err) {
      console.error('Error fetching blog posts:', err)
      setError(err instanceof Error ? err.message : 'Failed to load posts')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPosts()
  }, [])

  return { posts, loading, error, refresh: fetchPosts }
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

