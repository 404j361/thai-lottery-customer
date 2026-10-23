import { CountryFlag } from "@/components/flags"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useBrand } from "@/features/preferences/brand-provider"
import { brandPalettes, isBrandPalette, type BrandPalette } from "@/features/preferences/brand-themes"
import { useI18n } from "@/features/preferences/i18n-provider"
import { FORCE_LIGHT_THEME, useTheme } from "@/features/preferences/theme-provider"
import { isLocale, isThemeMode, languages, type Locale, type ThemeMode } from "@/i18n/languages"
import { Droplets, Leaf, Monitor, Moon, Sun, Waves } from "lucide-react"

const themes: Array<{
  value: ThemeMode
  icon: typeof Sun
  labelKey: "preferences.themeLight" | "preferences.themeDark" | "preferences.themeSystem"
}> = [
  { value: "light", icon: Sun, labelKey: "preferences.themeLight" },
  { value: "dark", icon: Moon, labelKey: "preferences.themeDark" },
  { value: "system", icon: Monitor, labelKey: "preferences.themeSystem" },
]

const brandIcons: Record<BrandPalette, typeof Waves> = {
  ocean: Waves,
  blood: Droplets,
  green: Leaf,
}

type PreferencesBarProps = {
  showLanguage?: boolean
  showTheme?: boolean
  showBrand?: boolean
  /** Icon-only / compact controls for tight headers */
  compact?: boolean
  className?: string
}

export function PreferencesBar({
  showLanguage = true,
  showTheme = !FORCE_LIGHT_THEME,
  showBrand = true,
  compact = false,
  className = "",
}: PreferencesBarProps) {
  const { locale, setLocale, t } = useI18n()
  const { theme, setTheme } = useTheme()
  const { brand, setBrand } = useBrand()
  const currentLanguage = languages.find((item) => item.code === locale) ?? languages[0]
  const currentTheme = themes.find((item) => item.value === theme) ?? themes[2]
  const currentBrand = brandPalettes.find((item) => item.id === brand) ?? brandPalettes[0]
  const languageItems = languages.map((item) => ({ label: item.nativeName, value: item.code }))
  const themeItems = themes.map((item) => ({ label: t(item.labelKey), value: item.value }))
  const brandItems = brandPalettes.map((item) => ({ label: t(item.labelKey), value: item.id }))

  return (
    <div className={`flex ${compact ? "flex-row items-center gap-2" : "flex-col gap-3"} ${className}`}>
      {showLanguage ? (
        <label className={compact ? "block min-w-0" : "grid gap-2 text-sm font-medium"}>
          {compact ? null : t("preferences.language")}
          <Select
            items={languageItems}
            value={locale}
            onValueChange={(value) => {
              if (isLocale(value)) setLocale(value)
            }}
          >
            <SelectTrigger
              size={compact ? "sm" : "default"}
              aria-label={t("preferences.language")}
              className={
                compact
                  ? "h-9 w-full min-w-0 rounded-xl border border-input bg-background px-2.5"
                  : "h-12 w-full min-w-0 rounded-2xl border border-input bg-background px-3.5"
              }
            >
              <SelectValue>
                {(value: Locale) => {
                  const selected = languages.find((item) => item.code === value) ?? currentLanguage
                  return (
                    <>
                      <CountryFlag code={selected.flag} className="rounded-[2px]" />
                      {selected.nativeName}
                    </>
                  )
                }}
              </SelectValue>
            </SelectTrigger>
            <SelectContent alignItemWithTrigger={false} align="start" className="min-w-44">
              <SelectGroup>
                {languages.map((item) => (
                  <SelectItem key={item.code} value={item.code}>
                    <CountryFlag code={item.flag} className="rounded-[2px]" />
                    {item.nativeName}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </label>
      ) : null}

      {showBrand ? (
        <label className={compact ? "block min-w-0" : "grid gap-2 text-sm font-medium"}>
          {compact ? null : t("preferences.brand")}
          <Select
            items={brandItems}
            value={brand}
            onValueChange={(value) => {
              if (isBrandPalette(value)) setBrand(value)
            }}
          >
            <SelectTrigger
              size={compact ? "sm" : "default"}
              aria-label={t("preferences.brand")}
              className={
                compact
                  ? "h-9 w-full min-w-0 rounded-xl border border-input bg-background px-2.5"
                  : "h-12 w-full min-w-0 rounded-2xl border border-input bg-background px-3.5"
              }
            >
              <SelectValue>
                {(value: BrandPalette) => {
                  const selected = brandPalettes.find((item) => item.id === value) ?? currentBrand
                  const Icon = brandIcons[selected.id]
                  return (
                    <>
                      <Icon />
                      {t(selected.labelKey)}
                    </>
                  )
                }}
              </SelectValue>
            </SelectTrigger>
            <SelectContent alignItemWithTrigger={false} align="end" className="min-w-44">
              <SelectGroup>
                {brandPalettes.map(({ id, labelKey }) => {
                  const Icon = brandIcons[id]
                  return (
                    <SelectItem key={id} value={id}>
                      <Icon />
                      {t(labelKey)}
                    </SelectItem>
                  )
                })}
              </SelectGroup>
            </SelectContent>
          </Select>
        </label>
      ) : null}

      {showTheme ? (
        <label className={compact ? "block min-w-0" : "grid gap-2 text-sm font-medium"}>
          {compact ? null : t("preferences.theme")}
          <Select
            items={themeItems}
            value={theme}
            onValueChange={(value) => {
              if (isThemeMode(value)) setTheme(value)
            }}
          >
            <SelectTrigger
              size={compact ? "sm" : "default"}
              aria-label={t("preferences.theme")}
              className={
                compact
                  ? "h-9 w-full min-w-0 rounded-xl border border-input bg-background px-2.5"
                  : "h-12 w-full min-w-0 rounded-2xl border border-input bg-background px-3.5"
              }
            >
              <SelectValue>
                {(value: ThemeMode) => {
                  const selected = themes.find((item) => item.value === value) ?? currentTheme
                  const Icon = selected.icon
                  return (
                    <>
                      <Icon />
                      {t(selected.labelKey)}
                    </>
                  )
                }}
              </SelectValue>
            </SelectTrigger>
            <SelectContent alignItemWithTrigger={false} align="end" className="min-w-40">
              <SelectGroup>
                {themes.map(({ value, icon: Icon, labelKey }) => (
                  <SelectItem key={value} value={value}>
                    <Icon />
                    {t(labelKey)}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </label>
      ) : null}
    </div>
  )
}
