import { getOtpChallenge } from "@/features/auth/otp"
import { getSession } from "@/features/auth/session"
import { VerifyOtpPage } from "@/features/auth/verify-otp"
import { createFileRoute, redirect } from "@tanstack/react-router"

export const Route = createFileRoute("/verify-otp")({
  beforeLoad: () => {
    if (typeof window === "undefined") return
    if (getSession()?.accessToken) throw redirect({ to: "/home" })
    if (!getOtpChallenge()?.otpToken) throw redirect({ to: "/login" })
  },
  component: VerifyOtpPage,
})
