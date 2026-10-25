const STORAGE_KEY = "thai-lottery.mobileOAuthReturn"

/** Deep links we will bounce OAuth tokens back into (Expo / app scheme). */
export function isAllowedMobileOAuthReturn(url: string): boolean {
  try {
    const parsed = new URL(url)
    return (
      parsed.protocol === "exp:" ||
      parsed.protocol === "exps:" ||
      parsed.protocol === "thailottery:"
    )
  } catch {
    return false
  }
}

export function saveMobileOAuthReturn(url: string): void {
  if (typeof window === "undefined") return
  if (!isAllowedMobileOAuthReturn(url)) return
  window.sessionStorage.setItem(STORAGE_KEY, url)
}

export function takeMobileOAuthReturn(): string | null {
  if (typeof window === "undefined") return null
  const value = window.sessionStorage.getItem(STORAGE_KEY)
  window.sessionStorage.removeItem(STORAGE_KEY)
  if (!value || !isAllowedMobileOAuthReturn(value)) return null
  return value
}

export function buildMobileOAuthCallbackUrl(
  returnUrl: string,
  tokens: { accessToken: string; refreshToken: string; expiresIn?: number }
): string {
  const dest = new URL(returnUrl)
  dest.searchParams.set("accessToken", tokens.accessToken)
  dest.searchParams.set("refreshToken", tokens.refreshToken)
  if (tokens.expiresIn != null && Number.isFinite(tokens.expiresIn)) {
    dest.searchParams.set("expiresIn", String(tokens.expiresIn))
  }
  return dest.toString()
}
