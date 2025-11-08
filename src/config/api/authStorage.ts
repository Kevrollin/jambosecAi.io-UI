type AuthTokens = {
  access: string
  refresh: string
}

type StoredAuth = {
  tokens: AuthTokens
  remember: boolean
}

const STORAGE_KEY = 'niru:auth'

const isBrowser = () => typeof window !== 'undefined'

const readFromStorage = (storage: Storage): StoredAuth | null => {
  try {
    const raw = storage.getItem(STORAGE_KEY)
    if (!raw) {
      return null
    }

    return JSON.parse(raw) as StoredAuth
  } catch {
    storage.removeItem(STORAGE_KEY)
    return null
  }
}

let inMemoryAuth: StoredAuth | null = null

const writeToStorage = (storage: Storage, value: StoredAuth) => {
  storage.setItem(STORAGE_KEY, JSON.stringify(value))
}

const clearStorage = (storage: Storage) => {
  storage.removeItem(STORAGE_KEY)
}

export const authStorage = {
  get(): StoredAuth | null {
    if (inMemoryAuth) {
      return inMemoryAuth
    }

    if (!isBrowser()) {
      return null
    }

    const sessionValue = readFromStorage(window.sessionStorage)
    if (sessionValue) {
      inMemoryAuth = sessionValue
      return sessionValue
    }

    const localValue = readFromStorage(window.localStorage)
    if (localValue) {
      inMemoryAuth = localValue
      return localValue
    }

    return null
  },

  set(tokens: AuthTokens, remember: boolean) {
    if (!isBrowser()) {
      inMemoryAuth = { tokens, remember }
      return
    }

    const target = remember ? window.localStorage : window.sessionStorage
    const other = remember ? window.sessionStorage : window.localStorage

    const value: StoredAuth = { tokens, remember }
    writeToStorage(target, value)
    clearStorage(other)
    inMemoryAuth = value
  },

  clear() {
    inMemoryAuth = null

    if (!isBrowser()) {
      return
    }

    clearStorage(window.sessionStorage)
    clearStorage(window.localStorage)
  },
}

export type { AuthTokens, StoredAuth }

