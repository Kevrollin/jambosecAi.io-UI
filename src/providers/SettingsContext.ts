import { createContext, useContext } from 'react'

export type Settings = {
  locale: string
}

export type SettingsContextValue = {
  settings: Settings
  setLocale: (locale: string) => void
}

export const defaultSettings: Settings = {
  locale: 'en',
}

export const SettingsContext = createContext<SettingsContextValue | undefined>(undefined)

export const useSettings = (): SettingsContextValue => {
  const context = useContext(SettingsContext)

  if (!context) {
    throw new Error('useSettings must be used within SettingsProvider')
  }

  return context
}
