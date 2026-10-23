import { BrandProvider } from "@/features/preferences/brand-provider"
import { I18nProvider } from "@/features/preferences/i18n-provider"
import { PreferencesSync } from "@/features/preferences/preferences-sync"
import { ThemeProvider } from "@/features/preferences/theme-provider"
import type { ReactNode } from "react"

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <BrandProvider>
        <I18nProvider>
          <PreferencesSync />
          {children}
        </I18nProvider>
      </BrandProvider>
    </ThemeProvider>
  )
}
