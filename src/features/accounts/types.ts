export type Account = {
  id: number
  username: string
  email: string
  firstName: string
  lastName: string
  displayName: string
  joinedAt: string
}

export type ApiUser = {
  id: number
  username: string
  email: string
  first_name: string
  last_name: string
  date_joined: string
}

export type AnonymousSession = {
  sessionId: string
  createdAt: string
}
