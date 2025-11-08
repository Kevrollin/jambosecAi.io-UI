import { apiClient } from '../../../config/api/client'
import { endpoints } from '../../../config/api/endpoints'
import {
  Guide,
  GuideCategory,
  GuideDetail,
  ExternalLink,
  SearchResult,
  AIGeneratedSuggestion,
  KnowledgeDocument,
  KnowledgeSource,
} from '../types'

// Get current language from settings or default to 'en'
const getLang = (): string => {
  try {
    const settings = localStorage.getItem('jambosec_settings')
    if (settings) {
      const parsed = JSON.parse(settings)
      return parsed.locale === 'sw' ? 'sw' : 'en'
    }
  } catch {
    // Ignore parse errors
  }
  return 'en'
}

// Build query params with language
const buildParams = (params: Record<string, string | undefined>): string => {
  const lang = getLang()
  const allParams = { ...params, lang }
  const queryString = Object.entries(allParams)
    .filter(([_, value]) => value !== undefined)
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value!)}`)
    .join('&')
  return queryString ? `?${queryString}` : ''
}

// Categories
export const getCategories = async (): Promise<GuideCategory[]> => {
  const lang = getLang()
  return apiClient.get(`${endpoints.knowledge.categories}?lang=${lang}`, { withAuth: false })
}

// Guides
export const getGuides = async (options?: {
  category?: string
  search?: string
}): Promise<Guide[]> => {
  const params = buildParams({
    category: options?.category,
    search: options?.search,
  })
  return apiClient.get(`${endpoints.knowledge.guides}${params}`, { withAuth: false })
}

// Guide Detail
export const getGuideDetail = async (slug: string): Promise<GuideDetail> => {
  const lang = getLang()
  return apiClient.get(`${endpoints.knowledge.guideDetail(slug)}?lang=${lang}`, {
    withAuth: false,
  })
}

// External Links
export const getExternalLinks = async (): Promise<ExternalLink[]> => {
  const lang = getLang()
  return apiClient.get(`${endpoints.knowledge.links}?lang=${lang}`, { withAuth: false })
}

// Semantic Search
export const searchKnowledge = async (
  query: string,
  k: number = 5,
): Promise<SearchResult[]> => {
  const lang = getLang()
  return apiClient.get(
    `${endpoints.knowledge.search}?q=${encodeURIComponent(query)}&k=${k}&lang=${lang}`,
    { withAuth: false },
  )
}

// AI Suggestion
export const getAISuggestion = async (
  query: string,
  relatedGuideSlugs: string[] = [],
): Promise<AIGeneratedSuggestion> => {
  const lang = getLang()
  // Send language in Accept-Language header (backend reads from header or query param)
  const response = await apiClient.post<{
    title: string
    content: string
    related_guides: Guide[]
  }>(
    endpoints.knowledge.aiSuggestion,
    {
      query,
      related_guide_slugs: relatedGuideSlugs,
    },
    {
      withAuth: false,
      headers: {
        'Accept-Language': lang,
      },
    },
  )
  
  // Convert snake_case to camelCase
  return {
    title: response.title,
    content: response.content,
    relatedGuides: response.related_guides || [],
  }
}

// Submit Guide Feedback
export const submitGuideFeedback = async (
  guideSlug: string,
  rating: 'helpful' | 'not-helpful',
  comment?: string,
): Promise<{ detail: string; feedback_id: number }> => {
  return apiClient.post(
    endpoints.knowledge.guideFeedback(guideSlug),
    {
      guide_slug: guideSlug,
      rating,
      comment: comment || '',
    },
    { withAuth: false },
  )
}

// Legacy endpoints (kept for backward compatibility)
export const listKnowledgeSources = (): Promise<KnowledgeSource[]> => {
  return apiClient.get(endpoints.knowledge.sources || '/v1/knowledge/sources')
}

export const listKnowledgeDocuments = (): Promise<KnowledgeDocument[]> => {
  return apiClient.get(endpoints.knowledge.documents || '/v1/knowledge/documents')
}
