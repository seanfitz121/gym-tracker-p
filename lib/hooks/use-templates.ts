'use client'

import { useEffect, useState } from 'react'
import { createClient } from '../supabase/client'
import type { Template, TemplatePayload } from '../types'

export function useTemplates(userId?: string) {
  const [templates, setTemplates] = useState<Template[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!userId) {
      setLoading(false)
      return
    }

    const fetchTemplates = async () => {
      try {
        const supabase = createClient()
        const { data, error } = await supabase
          .from('template')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })

        if (error) throw error
        setTemplates(data || [])
      } catch (err) {
        setError(err as Error)
      } finally {
        setLoading(false)
      }
    }

    fetchTemplates()
  }, [userId])

  return { templates, loading, error }
}

export function useCreateTemplate() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const createTemplate = async (
    userId: string,
    name: string,
    payload: TemplatePayload
  ): Promise<Template | null> => {
    setLoading(true)
    setError(null)

    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('template')
        .insert({
          user_id: userId,
          name,
          payload: payload as any,
        })
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

  return { createTemplate, loading, error }
}

export function useUpdateTemplate() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const updateTemplate = async (
    templateId: string,
    name: string,
    payload: TemplatePayload
  ): Promise<Template | null> => {
    setLoading(true)
    setError(null)

    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('template')
        .update({
          name,
          payload: payload as any,
        })
        .eq('id', templateId)
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

  return { updateTemplate, loading, error }
}

export function useDeleteTemplate() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const deleteTemplate = async (templateId: string): Promise<boolean> => {
    setLoading(true)
    setError(null)

    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('template')
        .delete()
        .eq('id', templateId)

      if (error) throw error
      return true
    } catch (err) {
      setError(err as Error)
      return false
    } finally {
      setLoading(false)
    }
  }

  return { deleteTemplate, loading, error }
}


