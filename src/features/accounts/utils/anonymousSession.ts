import { AnonymousSession } from '../types'

const STORAGE_KEY = 'niru:anonymous-session'

const generateSessionId = () => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }

  return `anon-${Math.random().toString(36).slice(2, 10)}`
}

export const ensureAnonymousSession = (): AnonymousSession => {
  if (typeof window === 'undefined') {
    const now = new Date().toISOString()
    return { sessionId: 'server-placeholder', createdAt: now }
  }

  const existing = window.localStorage.getItem(STORAGE_KEY)

  if (existing) {
    try {
      return JSON.parse(existing) as AnonymousSession
    } catch {
      window.localStorage.removeItem(STORAGE_KEY)
    }
  }

  const session: AnonymousSession = {
    sessionId: generateSessionId(),
    createdAt: new Date().toISOString(),
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session))
  return session
}
