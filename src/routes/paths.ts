export const paths = {
  root: '/',
  accounts: {
    root: '/accounts',
  },
  chat: {
    root: '/chat',
  },
  knowledge: {
    root: '/knowledge',
    guide: (slug: string) => `/knowledge/guide/${slug}`,
  },
  auth: {
    login: '/login',
    signup: '/signup',
  },
  policy: {
    privacy: '/policy/privacy',
  },
} as const
