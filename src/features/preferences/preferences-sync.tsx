import { customerApi } from "@/features/customer/api"
import { SESSION_CHANGE_EVENT, getAccessToken } from "@/features/auth/session"
import { useBrand } from "@/features/preferences/brand-provider"
import { isBrandPalette, type BrandPalette } from "@/features/preferences/brand-themes"
import { useI18n } from "@/features/preferences/i18n-provider"
import { FORCE_LIGHT_THEME, useTheme } from "@/features/preferences/theme-provider"
import { isLocale, isThemeMode, type Locale, type ThemeMode } from "@/i18n/languages"
import { useEffect, useRef } from "react"

type SyncedPrefs = {
  colorTheme: BrandPalette
  locale: Locale
  appearance?: ThemeMode
}

/**
 * When signed in, load UI preferences from the profile and persist local
 * brand / locale / appearance changes back to PATCH /users/profile.
 * Guests keep using localStorage only.
 */
export function PreferencesSync() {
  const { brand, setBrand } = useBrand()
  const { locale, setLocale } = useI18n()
  const { theme, setTheme } = useTheme()
  const readyToPersist = useRef(false)
  const loadGeneration = useRef(0)
  const lastSynced = useRef<SyncedPrefs | null>(null)
  const settersRef = useRef({ setBrand, setLocale, setTheme })
  settersRef.current = { setBrand, setLocale, setTheme }

  useEffect(() => {
    let cancelled = false

    async function loadFromProfile() {
      const generation = ++loadGeneration.current
      readyToPersist.current = false

      if (!getAccessToken()) {
        lastSynced.current = null
        return
      }

      try {
        const profile = await customerApi.profile()
        if (cancelled || generation !== loadGeneration.current) return

        const prefs = profile.preferences
        const { setBrand: applyBrand, setLocale: applyLocale, setTheme: applyTheme } =
          settersRef.current

        if (prefs) {
          if (isBrandPalette(prefs.colorTheme)) applyBrand(prefs.colorTheme)
          if (isLocale(prefs.locale)) applyLocale(prefs.locale)
          if (!FORCE_LIGHT_THEME && isThemeMode(prefs.appearance)) {
            applyTheme(prefs.appearance)
          }

          if (isBrandPalette(prefs.colorTheme) && isLocale(prefs.locale)) {
            lastSynced.current = {
              colorTheme: prefs.colorTheme,
              locale: prefs.locale,
              ...(!FORCE_LIGHT_THEME && isThemeMode(prefs.appearance)
                ? { appearance: prefs.appearance }
                : {}),
            }
          }
        }
      } catch {
        // Keep local prefs if profile cannot be loaded; still allow later PATCH.
      } finally {
        window.setTimeout(() => {
          if (!cancelled && generation === loadGeneration.current && getAccessToken()) {
            readyToPersist.current = true
          }
        }, 0)
      }
    }

    void loadFromProfile()

    const onSessionChange = () => {
      void loadFromProfile()
    }
    window.addEventListener(SESSION_CHANGE_EVENT, onSessionChange)
    return () => {
      cancelled = true
      window.removeEventListener(SESSION_CHANGE_EVENT, onSessionChange)
    }
  }, [])

  useEffect(() => {
    if (!readyToPersist.current || !getAccessToken()) return

    const next: SyncedPrefs = {
      colorTheme: brand,
      locale,
      ...(FORCE_LIGHT_THEME ? {} : { appearance: theme }),
    }

    const prev = lastSynced.current
    if (
      prev &&
      prev.colorTheme === next.colorTheme &&
      prev.locale === next.locale &&
      (FORCE_LIGHT_THEME || prev.appearance === next.appearance)
    ) {
      return
    }

    const handle = window.setTimeout(() => {
      if (!readyToPersist.current || !getAccessToken()) return
      void customerApi
        .updateProfile({
          preferences: {
            colorTheme: next.colorTheme,
            locale: next.locale,
            ...(FORCE_LIGHT_THEME ? {} : { appearance: next.appearance }),
          },
        })
        .then(() => {
          lastSynced.current = next
        })
        .catch(() => {
          // Ignore offline / auth errors; localStorage already has the value.
        })
    }, 350)

    return () => window.clearTimeout(handle)
  }, [brand, locale, theme])

  return null
}
