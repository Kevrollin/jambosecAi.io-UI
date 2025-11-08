export type ChatRole = 'user' | 'assistant' | 'system'

export type ChatSource = {
  title: string
  url: string
  snippet?: string
}

export type ChatMessage = {
  id: string
  sessionId: string
  role: ChatRole
  content: string
  createdAt: string
  sources?: ChatSource[]
  isBlocked?: boolean
  blockReason?: string
}

export type ChatFeedback = {
  id: string
  messageId: string
  rating: 'up' | 'down' | '1' | '2' | '3' | '4' | '5'
  comment?: string
  createdAt: string
}

export type ChatSession = {
  id: string
  title: string
  createdAt: string
  updatedAt: string
  language?: string
}
