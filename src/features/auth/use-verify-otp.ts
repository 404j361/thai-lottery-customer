import { resolvePostAuthPath } from "@/features/auth/profile"
import { useI18n } from "@/features/preferences/i18n-provider"
import { apiRequest, getApiErrorMessage } from "@/lib/api"
import { useNavigate } from "@tanstack/react-router"
import { useState } from "react"
import { clearOtpChallenge, getOtpChallenge } from "./otp"
import { saveSession, type AuthSession } from "./session"

type AuthTokensResponse = {
  accessToken: string
  refreshToken: string
  tokenType?: string
  expiresIn: number
}

export function useVerifyOtp() {
  const navigate = useNavigate()
  const { t } = useI18n()
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function verify(otp: string) {
    const challenge = getOtpChallenge()
    if (!challenge?.otpToken) {
      setError(t("auth.otpExpired"))
      await navigate({ to: "/login", replace: true })
      return
    }
    const code = otp.trim()
    if (!/^\d{6}$/.test(code)) {
      setError(t("auth.otpInvalid"))
      return
    }

    setPending(true)
    setError(null)
    try {
      const tokens = await apiRequest<AuthTokensResponse>("/api/v1/auth/verify-otp", {
        method: "POST",
        body: JSON.stringify({ otpToken: challenge.otpToken, otp: code }),
      })
      if (!tokens.accessToken) throw new Error(t("auth.noAccessToken"))
      const session: AuthSession = {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        expiresIn: tokens.expiresIn,
        email: challenge.email,
      }
      saveSession(session)
      clearOtpChallenge()
      const next = await resolvePostAuthPath()
      await navigate({ to: next, replace: true })
    } catch (cause) {
      setError(getApiErrorMessage(cause, t("somethingWrong")))
    } finally {
      setPending(false)
    }
  }

  return { verify, pending, error }
}
