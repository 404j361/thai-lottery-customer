export type OtpChallenge = {
  otpToken: string
  expiresIn: number
  message: string
  email: string
  purpose: "login" | "register"
}

const OTP_STORAGE_KEY = "thai_lottery_otp_challenge"

export function saveOtpChallenge(challenge: OtpChallenge) {
  if (typeof window === "undefined") return
  window.sessionStorage.setItem(OTP_STORAGE_KEY, JSON.stringify(challenge))
}

export function getOtpChallenge(): OtpChallenge | null {
  if (typeof window === "undefined") return null
  try {
    const raw = window.sessionStorage.getItem(OTP_STORAGE_KEY)
    if (!raw) return null
    const value: unknown = JSON.parse(raw)
    if (
      !value ||
      typeof value !== "object" ||
      typeof (value as OtpChallenge).otpToken !== "string" ||
      typeof (value as OtpChallenge).email !== "string"
    ) {
      return null
    }
    return value as OtpChallenge
  } catch {
    return null
  }
}

export function clearOtpChallenge() {
  if (typeof window === "undefined") return
  window.sessionStorage.removeItem(OTP_STORAGE_KEY)
}
