import { Settings } from '../../../providers/SettingsContext'

const messages: Record<string, Partial<Record<Settings['locale'], string>>> = {
  greeting: {
    en: 'Hello',
    es: 'Hola',
  },
}

export const translate = (
  key: keyof typeof messages,
  locale: Settings['locale'],
  fallback = '',
) => {
  return messages[key]?.[locale] ?? fallback
}
