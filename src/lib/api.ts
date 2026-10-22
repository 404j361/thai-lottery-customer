import {
  clearSession,
  getAccessToken,
  getRefreshToken,
  getStoredSession,
  saveSession,
} from "@/features/auth/session"

const API_BASE_URL = import.meta.env.VITE_API_URL ?? ""

type ApiEnvelope<T> = { data?: T; success?: boolean; message?: string | string[] }
type AuthTokens = { accessToken: string; refreshToken: string; expiresIn: number; tokenType?: string }

export class ApiError extends Error {
  constructor(message: string, public readonly status: number) {
    super(message)
    this.name = "ApiError"
  }
}

function getMessage(body: unknown, fallback: string): string {
  if (body && typeof body === "object" && "message" in body) {
    const message = body.message
    if (typeof message === "string") return message
    if (Array.isArray(message)) return message.filter((item): item is string => typeof item === "string").join(", ") || fallback
  }
  return fallback
}

function unwrap<T>(body: unknown): T {
  if (body && typeof body === "object" && "data" in body) return (body as ApiEnvelope<T>).data as T
  return body as T
}

let refreshInFlight: Promise<string | null> | null = null

async function refreshAccessToken(rejectedAccessToken?: string): Promise<string | null> {
  const latestSession = getStoredSession()
  if (rejectedAccessToken && latestSession?.accessToken !== rejectedAccessToken) {
    return latestSession?.accessToken ?? null
  }
  if (refreshInFlight) return refreshInFlight
  const refreshToken = getRefreshToken()
  const session = getStoredSession()
  if (!refreshToken || !session) return null

  refreshInFlight = (async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      })
      const body: unknown = await response.json().catch(() => null)
      if (!response.ok) throw new ApiError(getMessage(body, response.statusText || "Session refresh failed"), response.status)
      const tokens = unwrap<AuthTokens>(body)
      if (!tokens.accessToken || !tokens.refreshToken) throw new Error("Refresh response did not include rotated tokens.")
      saveSession({ ...session, ...tokens, expiresAt: undefined })
      return tokens.accessToken
    } catch {
      if (getRefreshToken() === refreshToken) clearSession()
      return null
    } finally {
      refreshInFlight = null
    }
  })()
  return refreshInFlight
}

export async function apiRequest<T>(path: string, options: RequestInit = {}, retry = true): Promise<T> {
  const session = getStoredSession()
  let token = getAccessToken()
  if (retry && session?.expiresAt && session.expiresAt <= Date.now() + 30_000) {
    token = await refreshAccessToken() ?? token
  }
  const headers = new Headers(options.headers)
  if (options.body && !(options.body instanceof FormData) && !headers.has("Content-Type")) headers.set("Content-Type", "application/json")
  if (token && !headers.has("Authorization")) headers.set("Authorization", `Bearer ${token}`)
  const response = await fetch(`${API_BASE_URL}${path}`, { ...options, headers })
  const body: unknown = await response.json().catch(() => null)

  if (!response.ok) {
    if (response.status === 401 && retry && token && !path.endsWith("/auth/refresh")) {
      const refreshed = await refreshAccessToken(token)
      if (refreshed) {
        const retryHeaders = new Headers(options.headers)
        if (options.body && !(options.body instanceof FormData) && !retryHeaders.has("Content-Type")) retryHeaders.set("Content-Type", "application/json")
        retryHeaders.set("Authorization", `Bearer ${refreshed}`)
        return apiRequest<T>(path, { ...options, headers: retryHeaders }, false)
      }
    }
    if (response.status === 401 && token) clearSession()
    throw new ApiError(getMessage(body, response.statusText || "Request failed"), response.status)
  }

  return unwrap<T>(body)
}

export function getApiErrorMessage(error: unknown, fallback = "Something went wrong. Please try again."): string {
  if (error instanceof ApiError) return error.message
  if (error instanceof Error && error.message) return error.message
  return fallback
}
