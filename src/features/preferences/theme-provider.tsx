import {
  DEFAULT_THEME,
  THEME_STORAGE_KEY,
  isThemeMode,
  type ThemeMode,
} from "@/i18n/languages"
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react"

/**
 * Temporary product switch: keep dark-theme plumbing, but force light UI.
 * Flip `forceLight` to `false` to restore theme picker / dark mode later.
 */
const themePolicy = {
  forceLight: true,
}

export const FORCE_LIGHT_THEME = Boolean(themePolicy.forceLight)

type ThemeContextValue = {
  theme: ThemeMode
  resolved: "light" | "dark"
  setTheme: (theme: ThemeMode) => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

function readStoredTheme(): ThemeMode {
  if (FORCE_LIGHT_THEME) return "light"
  if (typeof window === "undefined") return DEFAULT_THEME
  try {
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY)
    return isThemeMode(stored) ? stored : DEFAULT_THEME
  } catch {
    return DEFAULT_THEME
  }
}

function resolveTheme(theme: ThemeMode): "light" | "dark" {
  if (FORCE_LIGHT_THEME) return "light"
  if (theme === "light" || theme === "dark") return theme
  if (typeof window === "undefined") return "light"
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
}

function applyThemeClass(resolved: "light" | "dark") {
  document.documentElement.classList.toggle("dark", resolved === "dark")
  document.documentElement.style.colorScheme = resolved
}

function buildThemeBootScript(forceLight: boolean) {
  if (forceLight) {
    return `(function(){try{document.documentElement.classList.remove("dark");document.documentElement.style.colorScheme="light";}catch(e){}})();`
  }
  return `(function(){try{var k=${JSON.stringify(THEME_STORAGE_KEY)};var t=localStorage.getItem(k)||${JSON.stringify(DEFAULT_THEME)};var d=t==="dark"||(t!=="light"&&matchMedia("(prefers-color-scheme: dark)").matches);document.documentElement.classList.toggle("dark",d);document.documentElement.style.colorScheme=d?"dark":"light";}catch(e){}})();`
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeMode>(FORCE_LIGHT_THEME ? "light" : DEFAULT_THEME)
  const [resolved, setResolved] = useState<"light" | "dark">("light")

  useEffect(() => {
    const stored = readStoredTheme()
    setThemeState(stored)
    const next = resolveTheme(stored)
    setResolved(next)
    applyThemeClass(next)
  }, [])

  useEffect(() => {
    const next = resolveTheme(theme)
    setResolved(next)
    applyThemeClass(next)
    if (FORCE_LIGHT_THEME) return
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, theme)
    } catch {
      // ignore storage failures
    }

    if (theme !== "system") return
    const media = window.matchMedia("(prefers-color-scheme: dark)")
    const onChange = () => {
      const system = resolveTheme("system")
      setResolved(system)
      applyThemeClass(system)
    }
    media.addEventListener("change", onChange)
    return () => media.removeEventListener("change", onChange)
  }, [theme])

  const value = useMemo(
    () => ({
      theme: FORCE_LIGHT_THEME ? ("light" as const) : theme,
      resolved: FORCE_LIGHT_THEME ? ("light" as const) : resolved,
      setTheme: FORCE_LIGHT_THEME ? () => undefined : setThemeState,
    }),
    [resolved, theme]
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const value = useContext(ThemeContext)
  if (!value) throw new Error("useTheme must be used within ThemeProvider")
  return value
}

/** Inline boot script to avoid theme flash before React hydrates. */
export const themeBootScript = buildThemeBootScript(FORCE_LIGHT_THEME)
