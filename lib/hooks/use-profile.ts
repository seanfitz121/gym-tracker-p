'use client'

import { useEffect, useState } from 'react'
import { createClient } from '../supabase/client'
import type { Profile } from '../types'

export function useProfile(userId?: string) {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!userId) {
      setLoading(false)
      return
    }

    const fetchProfile = async () => {
      try {
        const supabase = createClient()
        const { data, error } = await supabase
          .from('profile')
          .select('*')
          .eq('id', userId)
          .single()

        if (error) {
          // Profile doesn't exist - this is expected for users who haven't completed setup
          if (error.code === 'PGRST116') {
            setProfile(null)
          } else {
            throw error
          }
        } else {
          setProfile(data)
        }
      } catch (err) {
        setError(err as Error)
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [userId])

  const refresh = async () => {
    if (!userId) return

    try {
      const supabase = createClient()
      const { data } = await supabase
        .from('profile')
        .select('*')
        .eq('id', userId)
        .single()

      if (data) setProfile(data)
    } catch (err) {
      console.error('Error refreshing profile:', err)
    }
  }

  return { profile, loading, error, refresh }
}

export function useUpdateProfile() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const updateProfile = async (
    userId: string,
    updates: Partial<Pick<Profile, 'display_name' | 'avatar_url'>>
  ): Promise<Profile | null> => {
    setLoading(true)
    setError(null)

    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('profile')
        .update(updates)
        .eq('id', userId)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (err) {
      setError(err as Error)
      return null
    } finally {
      setLoading(false)
    }
  }

  return { updateProfile, loading, error }
}

export function useUploadAvatar() {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const uploadAvatar = async (
    userId: string,
    file: File
  ): Promise<string | null> => {
    setUploading(true)
    setError(null)

    try {
      const supabase = createClient()

      // Create a unique file name
      const fileExt = file.name.split('.').pop()
      const fileName = `${userId}-${Date.now()}.${fileExt}`
      const filePath = fileName // Remove 'avatars/' prefix since bucket is already named 'avatars'

      // Upload the file to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true,
        })

      if (uploadError) {
        console.error('Avatar upload error:', uploadError)
        throw uploadError
      }

      // Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath)

      return publicUrl
    } catch (err) {
      console.error('Upload avatar error:', err)
      setError(err as Error)
      return null
    } finally {
      setUploading(false)
    }
  }

  return { uploadAvatar, uploading, error }
}

