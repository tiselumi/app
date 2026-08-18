import { useEffect, useState, type ReactNode } from 'react'

import { translations } from './translations'
import type { Locale } from './types'
import { I18nContext, type I18nContextValue } from './useI18n'

const LOCAL_STORAGE_LOCALE_KEY = 'tiselumi:locale'

function getDefaultLocale(): Locale {
  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_LOCALE_KEY)
    if (saved === 'en' || saved === 'ru') return saved

    if (typeof navigator !== 'undefined' && navigator.language) {
      if (navigator.language.toLowerCase().startsWith('ru')) {
        return 'ru'
      }
    }
  } catch {
    // Fallback
  }
  return 'en'
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(getDefaultLocale)

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale)
    try {
      localStorage.setItem(LOCAL_STORAGE_LOCALE_KEY, newLocale)
      document.documentElement.lang = newLocale
    } catch {
      // Ignore
    }
  }

  useEffect(() => {
    try {
      document.documentElement.lang = locale
    } catch {
      // Ignore
    }
  }, [locale])

  const value: I18nContextValue = {
    locale,
    setLocale,
    t: translations[locale],
  }

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}
