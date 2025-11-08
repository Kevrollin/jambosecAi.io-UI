import { apiClient } from '../../../config/api/client'
import { endpoints } from '../../../config/api/endpoints'
import type { AuthTokens } from '../../../config/api/authStorage'
import { AnonymousSession, Account, ApiUser } from '../types'
import { ensureAnonymousSession } from '../utils/anonymousSession'

const mapApiUserToAccount = (user: ApiUser): Account => {
  const displayName = [user.first_name, user.last_name].join(' ').trim()

  return {
    id: user.id,
    username: user.username,
    email: user.email,
    firstName: user.first_name,
    lastName: user.last_name,
    joinedAt: user.date_joined,
    displayName: displayName.length > 0 ? displayName : user.username || user.email,
  }
}

type AuthResponse = {
  user: ApiUser
  access: string
  refresh: string
}

export type LoginPayload = {
  login: string
  password: string
}

export type SignupPayload = {
  username: string
  email: string
  password: string
}

export type AuthResult = {
  account: Account
  tokens: AuthTokens
}

export const signup = async (payload: SignupPayload): Promise<AuthResult> => {
  const response = await apiClient.post<AuthResponse>(endpoints.auth.signup, payload, {
    withAuth: false,
  })

  return {
    account: mapApiUserToAccount(response.user),
    tokens: {
      access: response.access,
      refresh: response.refresh,
    },
  }
}

export const login = async (payload: LoginPayload): Promise<AuthResult> => {
  const response = await apiClient.post<AuthResponse>(endpoints.auth.login, payload, {
    withAuth: false,
  })

  return {
    account: mapApiUserToAccount(response.user),
    tokens: {
      access: response.access,
      refresh: response.refresh,
    },
  }
}

export const logout = async (refreshToken: string): Promise<void> => {
  await apiClient.post(endpoints.auth.logout, { refresh: refreshToken })
}

export const fetchCurrentAccount = async (): Promise<Account> => {
  const user = await apiClient.get<ApiUser>(endpoints.auth.me)
  return mapApiUserToAccount(user)
}

export const fetchAccountSessions = (): Promise<AnonymousSession[]> => {
  return apiClient.get<AnonymousSession[]>(endpoints.accounts.sessions)
}

export const ensureSession = (): AnonymousSession => {
  return ensureAnonymousSession()
}

export type UpdateProfilePayload = {
  username?: string
  email?: string
  first_name?: string
  last_name?: string
}

export type UserStats = {
  chat: {
    total_sessions: number
    total_messages: number
  }
  feedback: {
    total: number
    helpful: number
  }
}

export const updateProfile = async (payload: UpdateProfilePayload): Promise<Account> => {
  const user = await apiClient.patch<ApiUser>(endpoints.accounts.updateProfile, payload)
  return mapApiUserToAccount(user)
}

export const getUserStats = async (): Promise<UserStats> => {
  return apiClient.get<UserStats>(endpoints.accounts.userStats)
}

export const deleteAccount = async (): Promise<void> => {
  await apiClient.delete(endpoints.accounts.deleteAccount)
}

export type ChangePasswordPayload = {
  old_password: string
  new_password: string
}

export const changePassword = async (payload: ChangePasswordPayload): Promise<void> => {
  await apiClient.post(endpoints.auth.changePassword, payload)
}

export const accountMapper = {
  fromApi: mapApiUserToAccount,
}
