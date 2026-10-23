import {
  BRAND_STORAGE_KEY,
  DEFAULT_BRAND,
  isBrandPalette,
  type BrandPalette,
} from "@/features/preferences/brand-themes"
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react"

type BrandContextValue = {
  brand: BrandPalette
  setBrand: (brand: BrandPalette) => void
}

const BrandContext = createContext<BrandContextValue | null>(null)

function readStoredBrand(): BrandPalette {
  if (typeof window === "undefined") return DEFAULT_BRAND
  try {
    const stored = window.localStorage.getItem(BRAND_STORAGE_KEY)
    return isBrandPalette(stored) ? stored : DEFAULT_BRAND
  } catch {
    return DEFAULT_BRAND
  }
}

function applyBrandAttribute(brand: BrandPalette) {
  document.documentElement.dataset.brand = brand
}

export function BrandProvider({ children }: { children: ReactNode }) {
  const [brand, setBrandState] = useState<BrandPalette>(DEFAULT_BRAND)

  useEffect(() => {
    const stored = readStoredBrand()
    setBrandState(stored)
    applyBrandAttribute(stored)
  }, [])

  useEffect(() => {
    applyBrandAttribute(brand)
    try {
      window.localStorage.setItem(BRAND_STORAGE_KEY, brand)
    } catch {
      // ignore storage failures
    }
  }, [brand])

  const value = useMemo(
    () => ({
      brand,
      setBrand: setBrandState,
    }),
    [brand]
  )

  return <BrandContext.Provider value={value}>{children}</BrandContext.Provider>
}

export function useBrand() {
  const value = useContext(BrandContext)
  if (!value) throw new Error("useBrand must be used within BrandProvider")
  return value
}

/** Inline boot script to avoid brand flash before React hydrates. */
export const brandBootScript = `(function(){try{var k=${JSON.stringify(BRAND_STORAGE_KEY)};var d=${JSON.stringify(DEFAULT_BRAND)};var b=localStorage.getItem(k)||d;if(b!=="ocean"&&b!=="blood"&&b!=="green")b=d;document.documentElement.setAttribute("data-brand",b);}catch(e){document.documentElement.setAttribute("data-brand",${JSON.stringify(DEFAULT_BRAND)});}})();`
