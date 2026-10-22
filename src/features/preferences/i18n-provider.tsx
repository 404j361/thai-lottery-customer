import { translate, type MessageKey } from "@/i18n"
import {
  DEFAULT_LOCALE,
  LOCALE_STORAGE_KEY,
  languages,
  isLocale,
  type Locale,
} from "@/i18n/languages"
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react"

type I18nContextValue = {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: (key: MessageKey, vars?: Record<string, string | number>) => string
  dateLocale: string
}

const I18nContext = createContext<I18nContextValue | null>(null)

function readStoredLocale(): Locale {
  if (typeof window === "undefined") return DEFAULT_LOCALE
  try {
    const stored = window.localStorage.getItem(LOCALE_STORAGE_KEY)
    return isLocale(stored) ? stored : DEFAULT_LOCALE
  } catch {
    return DEFAULT_LOCALE
  }
}

function writeStoredLocale(locale: Locale) {
  if (typeof window === "undefined") return
  try {
    window.localStorage.setItem(LOCALE_STORAGE_KEY, locale)
  } catch {
    // ignore storage failures
  }
}

function applyDocumentLang(locale: Locale) {
  if (typeof document === "undefined") return
  const meta = languages.find((item) => item.code === locale)
  document.documentElement.lang = meta?.htmlLang ?? locale
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(DEFAULT_LOCALE)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    const stored = readStoredLocale()
    setLocaleState(stored)
    applyDocumentLang(stored)
    setHydrated(true)
  }, [])

  const setLocale = (next: Locale) => {
    setLocaleState(next)
    applyDocumentLang(next)
    writeStoredLocale(next)
  }

  useEffect(() => {
    if (!hydrated) return
    applyDocumentLang(locale)
  }, [hydrated, locale])

  const value = useMemo<I18nContextValue>(() => {
    const meta = languages.find((item) => item.code === locale)
    return {
      locale,
      setLocale,
      t: (key, vars) => translate(locale, key, vars),
      dateLocale: meta?.dateLocale ?? "my-MM",
    }
  }, [locale])

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useI18n() {
  const value = useContext(I18nContext)
  if (!value) throw new Error("useI18n must be used within I18nProvider")
  return value
}
