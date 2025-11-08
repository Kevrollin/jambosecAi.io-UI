// Backend API Types
export type GuideCategory = {
  slug: string
  title: string
  icon?: string
}

export type Guide = {
  slug: string
  title: string
  snippet: string
  published_at: string
  tags?: string[]
  category?: GuideCategory
}

export type GuideDetail = {
  slug: string
  title: string
  body: string
  tags?: string[]
  published_at: string
  category: {
    slug: string
    title: string
    icon?: string
  }
}

export type ExternalLink = {
  label: string
  url: string
  category?: string
  order: number
}

export type SearchResult = {
  score: number
  text: string
  document_title: string
  document_slug: string
  chunk_index: number
}

// AI Generated Content
export type AIGeneratedSuggestion = {
  title: string
  content: string
  relatedGuides: Guide[]
}

// Legacy types (kept for backward compatibility)
export type KnowledgeSource = {
  id: string
  name: string
  type: 'web' | 'file' | 'manual'
  createdAt: string
}

export type KnowledgeDocument = {
  id: string
  title: string
  sourceId: string
  createdAt: string
  status: 'pending' | 'ready' | 'failed'
}

export type KnowledgeChunk = {
  id: string
  documentId: string
  text: string
  embeddingId?: string
}
