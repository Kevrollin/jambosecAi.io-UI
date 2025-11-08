import { apiClient } from '../../../config/api/client'
import { endpoints } from '../../../config/api/endpoints'
import { ChatFeedback, ChatMessage, ChatSession } from '../types'

type AskPayload = {
  message: string
  lang?: 'en' | 'sw'
  session_id?: string
}

type AskResponse = {
  session_id: string
  reply: string
  lang: string
  sources: Array<{ title: string; url: string; snippet?: string }>
  safety: { blocked: boolean; reason?: string }
}

type FeedbackPayload = {
  session_id: string
  message_id?: string
  rating: ChatFeedback['rating']
  comment?: string
}

type PaginatedResponse<T> = {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

export const askChat = (payload: AskPayload): Promise<AskResponse> => {
  return apiClient.post(endpoints.chat.ask, payload)
}

export const listChatSessions = (): Promise<ChatSession[]> => {
  return apiClient.get(endpoints.chat.sessions)
}

export const getChatSession = (sessionId: string): Promise<ChatSession> => {
  return apiClient.get(endpoints.chat.sessionDetail(sessionId))
}

export const listChatMessages = async (sessionId: string): Promise<ChatMessage[]> => {
  const response = await apiClient.get<PaginatedResponse<ChatMessage>>(endpoints.chat.messages(sessionId))
  // Backend returns paginated response, extract results
  if ('results' in response) {
    return response.results
  }
  // Fallback if response is already an array
  return Array.isArray(response) ? response : []
}

export const submitChatFeedback = (payload: FeedbackPayload): Promise<ChatFeedback> => {
  return apiClient.post(endpoints.chat.feedback, payload)
}

export const deleteChatSession = (sessionId: string): Promise<void> => {
  return apiClient.delete(endpoints.chat.sessionDetail(sessionId))
}

export const updateChatSessionTitle = (sessionId: string, title: string): Promise<ChatSession> => {
  return apiClient.patch(endpoints.chat.sessionDetail(sessionId), { title })
}
