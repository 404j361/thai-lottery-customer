import { I18nProvider } from "@/features/preferences/i18n-provider"
import { ThemeProvider } from "@/features/preferences/theme-provider"
import type { ReactNode } from "react"

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <I18nProvider>{children}</I18nProvider>
    </ThemeProvider>
  )
}
