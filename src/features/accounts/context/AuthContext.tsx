import { PropsWithChildren, createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { authStorage, type AuthTokens, type StoredAuth } from '../../../config/api/authStorage'
import { ApiError } from '../../../config/api/client'
import {
  fetchCurrentAccount,
  login as loginRequest,
  signup as signupRequest,
  logout as logoutRequest,
  type LoginPayload,
  type SignupPayload,
} from '../services/accountService'
import type { Account } from '../types'

export type AuthStatus = 'checking' | 'authenticated' | 'unauthenticated' | 'error'

type LoginParams = LoginPayload & { remember: boolean }
type SignupParams = SignupPayload & { remember: boolean }

type AuthContextValue = {
  status: AuthStatus
  account: Account | null
  tokens: AuthTokens | null
  remember: boolean
  error: unknown
  login: (params: LoginParams) => Promise<void>
  signup: (params: SignupParams) => Promise<void>
  logout: () => Promise<void>
  refreshAccount: () => Promise<void>
  isAuthenticated: boolean
}

const initialSnapshot: StoredAuth | null = authStorage.get()

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

const useAuthContextValue = (): AuthContextValue => {
  const [status, setStatus] = useState<AuthStatus>('checking')
  const [account, setAccount] = useState<Account | null>(null)
  const [tokens, setTokens] = useState<AuthTokens | null>(initialSnapshot?.tokens ?? null)
  const [remember, setRemember] = useState<boolean>(initialSnapshot?.remember ?? false)
  const [error, setError] = useState<unknown>(undefined)

  const resetAuthState = useCallback(() => {
    setAccount(null)
    setTokens(null)
    setRemember(false)
  }, [])

  const hydrateAccount = useCallback(async () => {
    setStatus('checking')

    const snapshot = authStorage.get()
    if (!snapshot) {
      resetAuthState()
      setError(undefined)
      setStatus('unauthenticated')
      return
    }

    setTokens(snapshot.tokens)
    setRemember(snapshot.remember)

    try {
      const freshAccount = await fetchCurrentAccount()
      setAccount(freshAccount)
      setError(undefined)
      setStatus('authenticated')
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        authStorage.clear()
        resetAuthState()
        setError(undefined)
        setStatus('unauthenticated')
        return
      }

      resetAuthState()
      setError(err)
      setStatus('error')
    }
  }, [resetAuthState])

  useEffect(() => {
    void hydrateAccount()
  }, [hydrateAccount])

  const login = useCallback(
    async (params: LoginParams) => {
      try {
        const result = await loginRequest({ login: params.login, password: params.password })
        authStorage.set(result.tokens, params.remember)
        setTokens(result.tokens)
        setRemember(params.remember)
        setAccount(result.account)
        setError(undefined)
        setStatus('authenticated')
      } catch (err) {
        authStorage.clear()
        resetAuthState()
        setStatus('unauthenticated')
        setError(err)
        throw err
      }
    },
    [resetAuthState],
  )

  const signup = useCallback(
    async (params: SignupParams) => {
      try {
        const result = await signupRequest({
          username: params.username,
          email: params.email,
          password: params.password,
        })
        authStorage.set(result.tokens, params.remember)
        setTokens(result.tokens)
        setRemember(params.remember)
        setAccount(result.account)
        setError(undefined)
        setStatus('authenticated')
      } catch (err) {
        authStorage.clear()
        resetAuthState()
        setStatus('unauthenticated')
        setError(err)
        throw err
      }
    },
    [resetAuthState],
  )

  const logout = useCallback(async () => {
    if (tokens?.refresh) {
      try {
        await logoutRequest(tokens.refresh)
      } catch {
        // Ignore logout failures; we will clear tokens regardless
      }
    }

    authStorage.clear()
    resetAuthState()
    setError(undefined)
    setStatus('unauthenticated')
  }, [resetAuthState, tokens])

  const refreshAccount = useCallback(async () => {
    await hydrateAccount()
  }, [hydrateAccount])

  return useMemo(
    () => ({
      status,
      account,
      tokens,
      remember,
      error,
      login,
      signup,
      logout,
      refreshAccount,
      isAuthenticated: status === 'authenticated',
    }),
    [account, error, login, logout, refreshAccount, remember, signup, status, tokens],
  )
}

export const AuthProvider = ({ children }: PropsWithChildren) => {
  const value = useAuthContextValue()
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }

  return context
}

