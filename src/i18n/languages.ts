export type Locale = "my" | "en" | "th"
export type ThemeMode = "light" | "dark" | "system"

export const DEFAULT_LOCALE: Locale = "my"
export const DEFAULT_THEME: ThemeMode = "system"

export const LOCALE_STORAGE_KEY = "thai_lottery_customer_locale"
export const THEME_STORAGE_KEY = "thai_lottery_customer_theme"

export const languages: Array<{
  code: Locale
  labelKey: "languages.my" | "languages.en" | "languages.th"
  nativeName: string
  flag: "mm" | "gb" | "th"
  htmlLang: string
  dateLocale: string
}> = [
  { code: "my", labelKey: "languages.my", nativeName: "မြန်မာ", flag: "mm", htmlLang: "my", dateLocale: "my-MM" },
  { code: "en", labelKey: "languages.en", nativeName: "English", flag: "gb", htmlLang: "en", dateLocale: "en-GB" },
  { code: "th", labelKey: "languages.th", nativeName: "ไทย", flag: "th", htmlLang: "th", dateLocale: "th-TH" },
]

export function isLocale(value: unknown): value is Locale {
  return value === "my" || value === "en" || value === "th"
}

export function isThemeMode(value: unknown): value is ThemeMode {
  return value === "light" || value === "dark" || value === "system"
}
