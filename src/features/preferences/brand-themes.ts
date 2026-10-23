import type { ColorTheme } from "@/lib/types"

/** Brand color palettes — swap via Preferences without editing component classes. */
/** Same ids as API `preferences.colorTheme`. */
export type BrandPalette = ColorTheme

export const DEFAULT_BRAND: BrandPalette = "blood"
export const BRAND_STORAGE_KEY = "thai_lottery_customer_brand"

export const brandPalettes: Array<{
  id: BrandPalette
  labelKey: "preferences.brandOcean" | "preferences.brandBlood" | "preferences.brandGreen"
}> = [
  { id: "ocean", labelKey: "preferences.brandOcean" },
  { id: "blood", labelKey: "preferences.brandBlood" },
  { id: "green", labelKey: "preferences.brandGreen" },
]

export function isBrandPalette(value: unknown): value is BrandPalette {
  return value === "ocean" || value === "blood" || value === "green"
}
