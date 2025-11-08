import { PropsWithChildren, useCallback, useEffect, useMemo, useState } from 'react'

import {
  SettingsContext,
  SettingsContextValue,
  defaultSettings,
} from './SettingsContext'

const SETTINGS_STORAGE_KEY = 'jambosec_settings'

// Load settings from localStorage
const loadSettings = () => {
  try {
    const stored = localStorage.getItem(SETTINGS_STORAGE_KEY)
    if (stored) {
      return JSON.parse(stored)
    }
  } catch {
    // Ignore parse errors
  }
  return defaultSettings
}

// Save settings to localStorage
const saveSettings = (settings: typeof defaultSettings) => {
  try {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings))
  } catch {
    // Ignore storage errors
  }
}

export const SettingsProvider = ({ children }: PropsWithChildren) => {
  const [settings, setSettings] = useState(loadSettings)

  // Save settings whenever they change
  useEffect(() => {
    saveSettings(settings)
  }, [settings])

  const setLocale = useCallback((locale: string) => {
    setSettings((current) => {
      const updated = { ...current, locale }
      saveSettings(updated)
      return updated
    })
  }, [])

  const value = useMemo<SettingsContextValue>(
    () => ({ settings, setLocale }),
    [settings, setLocale],
  )

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>
}
