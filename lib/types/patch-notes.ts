export interface PatchNote {
  id: string
  author_id: string
  version: string
  title: string
  content: string
  published: boolean
  created_at: string
  updated_at: string
  author?: {
    display_name: string | null
    avatar_url: string | null
  }
}

export interface CreatePatchNoteInput {
  version: string
  title: string
  content: string
  published: boolean
}

export interface UpdatePatchNoteInput {
  version?: string
  title?: string
  content?: string
  published?: boolean
}

