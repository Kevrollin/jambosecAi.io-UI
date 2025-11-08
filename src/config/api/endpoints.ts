export const endpoints = {
  auth: {
    signup: '/v1/auth/signup/',
    login: '/v1/auth/login/',
    logout: '/v1/auth/logout/',
    refresh: '/v1/auth/refresh/',
    me: '/v1/auth/me/',
    changePassword: '/v1/auth/password/change/',
  },
  core: {
    health: '/core/health',
  },
  accounts: {
    sessions: '/accounts/sessions',
    updateProfile: '/v1/auth/me/update/',
    userStats: '/v1/auth/me/stats/',
    deleteAccount: '/v1/auth/me/delete/',
  },
  chat: {
    ask: '/v1/chat/ask/',
    sessions: '/v1/chat/sessions/',
    sessionDetail: (sessionId: string) => `/v1/chat/sessions/${sessionId}/`,
    messages: (sessionId: string) => `/v1/chat/sessions/${sessionId}/messages/`,
    feedback: '/v1/chat/feedback/',
  },
  knowledge: {
    categories: '/v1/knowledge/categories/',
    guides: '/v1/knowledge/guides/',
    guideDetail: (slug: string) => `/v1/knowledge/guides/${slug}/`,
    guideFeedback: (slug: string) => `/v1/knowledge/guides/${slug}/feedback/`,
    links: '/v1/knowledge/links/',
    search: '/v1/knowledge/search/',
    aiSuggestion: '/v1/knowledge/ai-suggestion/',
  },
  policy: {
    privacy: '/policy/privacy',
  },
} as const
