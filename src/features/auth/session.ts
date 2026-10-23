import { createIsomorphicFn } from "@tanstack/react-start"
import { getCookie } from "@tanstack/react-start/server"

const STORAGE_KEY = "thai_lottery_customer_session"
const COOKIE_KEY = "thai_lottery_customer_gate"
const SESSION_AGE_SECONDS = 60 * 60 * 24 * 7

/** Fired in the browser after saveSession / clearSession so UI can re-sync. */
export const SESSION_CHANGE_EVENT = "thai-lottery-session-change"

function emitSessionChange() {
  if (typeof window === "undefined") return
  window.dispatchEvent(new Event(SESSION_CHANGE_EVENT))
}

export type AuthSession = {
  accessToken: string
  refreshToken?: string
  expiresIn?: number
  expiresAt?: number
  email?: string
  name?: string
}

function isSession(value: unknown): value is AuthSession {
  return Boolean(
    value &&
      typeof value === "object" &&
      "accessToken" in value &&
      typeof value.accessToken === "string" &&
      value.accessToken.length > 0
  )
}

function parseSession(raw: string | null | undefined): AuthSession | null {
  if (!raw) return null
  try {
    const value: unknown = JSON.parse(decodeURIComponent(raw))
    return isSession(value) ? value : null
  } catch {
    try {
      const value: unknown = JSON.parse(raw)
      return isSession(value) ? value : null
    } catch {
      return null
    }
  }
}

function readBrowserSession(): AuthSession | null {
  try {
    return parseSession(window.localStorage.getItem(STORAGE_KEY))
  } catch {
    return null
  }
}

/** SSR uses a non-sensitive cookie gate; tokens are only read from browser storage. */
export const getSession = createIsomorphicFn()
  .server((): AuthSession | null => {
    const gate = getCookie(COOKIE_KEY)
    return gate ? { accessToken: "ssr-session" } : null
  })
  .client(readBrowserSession)

export function getAccessToken(): string | null {
  return typeof window === "undefined" ? null : readBrowserSession()?.accessToken ?? null
}

export function getRefreshToken(): string | null {
  return typeof window === "undefined" ? null : readBrowserSession()?.refreshToken ?? null
}

export function getStoredSession(): AuthSession | null {
  return typeof window === "undefined" ? null : readBrowserSession()
}

export function saveSession(session: AuthSession): void {
  const saved = {
    ...session,
    expiresAt: session.expiresAt ?? (session.expiresIn ? Date.now() + session.expiresIn * 1000 : undefined),
  }
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(saved))
  document.cookie = `${COOKIE_KEY}=active; Path=/; Max-Age=${SESSION_AGE_SECONDS}; SameSite=Lax`
  emitSessionChange()
}

export function completeOAuthSession(accessToken: string, refreshToken: string, expiresIn?: number): void {
  saveSession({ accessToken, refreshToken, expiresIn })
}

export function clearSession(): void {
  try {
    window.localStorage.removeItem(STORAGE_KEY)
  } catch {
    // Storage can be unavailable in restricted browser contexts.
  }
  if (typeof document !== "undefined") {
    document.cookie = `${COOKIE_KEY}=; Path=/; Max-Age=0; SameSite=Lax`
  }
  emitSessionChange()
}
