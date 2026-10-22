import { saveOtpChallenge, type OtpChallenge } from "@/features/auth/otp"
import { useI18n } from "@/features/preferences/i18n-provider"
import { apiRequest, getApiErrorMessage } from "@/lib/api"
import { useNavigate } from "@tanstack/react-router"
import { useState } from "react"

type OtpChallengeResponse = {
  otpToken: string
  expiresIn: number
  message: string
}

export function useLogin() {
  const navigate = useNavigate()
  const { t } = useI18n()
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function login(form: FormData) {
    const email = String(form.get("email") ?? "").trim()
    const password = String(form.get("password") ?? "")
    if (!email || !password) {
      setError(t("auth.enterEmailPassword"))
      return
    }

    setPending(true)
    setError(null)
    try {
      const challenge = await apiRequest<OtpChallengeResponse>("/api/v1/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      })
      if (!challenge.otpToken) throw new Error(t("auth.otpMissingToken"))
      const payload: OtpChallenge = {
        otpToken: challenge.otpToken,
        expiresIn: challenge.expiresIn,
        message: challenge.message,
        email,
        purpose: "login",
      }
      saveOtpChallenge(payload)
      await navigate({ to: "/verify-otp" })
    } catch (cause) {
      setError(getApiErrorMessage(cause, t("somethingWrong")))
    } finally {
      setPending(false)
    }
  }

  return { login, pending, error }
}
