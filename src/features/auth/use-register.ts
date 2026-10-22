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

export function useRegister() {
  const navigate = useNavigate()
  const { t } = useI18n()
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function register(form: FormData) {
    const email = String(form.get("email") ?? "").trim()
    const password = String(form.get("password") ?? "")
    const confirm = String(form.get("confirm") ?? "")
    const firstName = String(form.get("firstName") ?? "").trim()
    const lastName = String(form.get("lastName") ?? "").trim()

    if (!email || !password) {
      setError(t("auth.enterEmailPassword"))
      return
    }
    if (!firstName || !lastName) {
      setError(t("auth.enterNames"))
      return
    }
    if (password.length < 8) {
      setError(t("auth.passwordMin"))
      return
    }
    if (password !== confirm) {
      setError(t("auth.passwordMismatch"))
      return
    }

    setPending(true)
    setError(null)
    try {
      const challenge = await apiRequest<OtpChallengeResponse>("/api/v1/auth/register", {
        method: "POST",
        body: JSON.stringify({ email, password, firstName, lastName }),
      })
      if (!challenge.otpToken) throw new Error(t("auth.otpMissingToken"))
      const payload: OtpChallenge = {
        otpToken: challenge.otpToken,
        expiresIn: challenge.expiresIn,
        message: challenge.message,
        email,
        purpose: "register",
      }
      saveOtpChallenge(payload)
      await navigate({ to: "/verify-otp" })
    } catch (cause) {
      setError(getApiErrorMessage(cause, t("somethingWrong")))
    } finally {
      setPending(false)
    }
  }

  return { register, pending, error }
}
