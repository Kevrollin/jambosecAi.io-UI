import { authStorage } from './authStorage'
import { endpoints } from './endpoints'

export class ApiError extends Error {
  status: number
  body: unknown

  constructor(message: string, status: number, body: unknown) {
    super(message)
    this.status = status
    this.body = body
  }
}

type RequestConfig = {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  body?: unknown
  headers?: Record<string, string>
  withAuth?: boolean
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '/api'

type JsonValue = Record<string, unknown> | Array<unknown> | string | number | boolean | null

const parseJsonSafely = async (response: Response): Promise<JsonValue | undefined> => {
  const contentType = response.headers.get('content-type') ?? ''
  if (!contentType.includes('application/json')) {
    return undefined
  }

  try {
    return (await response.json()) as JsonValue
  } catch {
    return undefined
  }
}

const refreshAccessToken = async (refreshToken: string) => {
  const response = await fetch(`${API_BASE_URL}${endpoints.auth.refresh}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ refresh: refreshToken }),
  })

  if (!response.ok) {
    const body = await parseJsonSafely(response)
    throw new ApiError('Failed to refresh access token', response.status, body)
  }

  const data = (await response.json()) as { access: string }
  return data.access
}

const request = async <T>(path: string, config: RequestConfig = {}, attempt = 0): Promise<T> => {
  const { body, method = 'GET', headers = {}, withAuth = true } = config

  const requestHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...headers,
  }

  const authSnapshot = withAuth ? authStorage.get() : null
  if (withAuth && authSnapshot?.tokens.access) {
    requestHeaders.Authorization = `Bearer ${authSnapshot.tokens.access}`
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: requestHeaders,
    body: body ? JSON.stringify(body) : undefined,
  })

  if (response.status === 401 && withAuth && attempt === 0 && authSnapshot?.tokens.refresh) {
    try {
      const newAccess = await refreshAccessToken(authSnapshot.tokens.refresh)
      authStorage.set(
        {
          access: newAccess,
          refresh: authSnapshot.tokens.refresh,
        },
        authSnapshot.remember,
      )
      return request<T>(path, config, attempt + 1)
    } catch {
      authStorage.clear()
    }
  }

  if (!response.ok) {
    const body = await parseJsonSafely(response)
    throw new ApiError(`Request to ${path} failed`, response.status, body)
  }

  if (response.status === 204) {
    return undefined as T
  }

  const bodyJson = await parseJsonSafely(response)
  return (bodyJson as T | undefined) ?? (undefined as T)
}

export const apiClient = {
  get: <T>(path: string, config?: Omit<RequestConfig, 'method' | 'body'>) => request<T>(path, config),
  post: <T>(path: string, body?: unknown, config?: Omit<RequestConfig, 'method' | 'body'>) =>
    request<T>(path, { ...config, method: 'POST', body }),
  put: <T>(path: string, body?: unknown, config?: Omit<RequestConfig, 'method' | 'body'>) =>
    request<T>(path, { ...config, method: 'PUT', body }),
  patch: <T>(path: string, body?: unknown, config?: Omit<RequestConfig, 'method' | 'body'>) =>
    request<T>(path, { ...config, method: 'PATCH', body }),
  delete: <T>(path: string, config?: Omit<RequestConfig, 'method' | 'body' | 'headers'>) =>
    request<T>(path, { ...config, method: 'DELETE' }),
}
