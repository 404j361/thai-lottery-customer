import { OnboardingPage } from "@/features/auth/onboarding"
import { needsOnboarding } from "@/features/auth/profile"
import { clearSession, getAccessToken, getSession } from "@/features/auth/session"
import { customerApi } from "@/features/customer/api"
import { createFileRoute, isRedirect, redirect } from "@tanstack/react-router"

export const Route = createFileRoute("/onboarding")({
  beforeLoad: async () => {
    const session = getSession()
    if (!session) throw redirect({ to: "/login" })
    if (typeof window !== "undefined" && !getAccessToken()) {
      clearSession()
      throw redirect({ to: "/login" })
    }
    if (typeof window === "undefined") return
    try {
      const profile = await customerApi.profile()
      if (!needsOnboarding(profile)) throw redirect({ to: "/home" })
    } catch (error) {
      if (isRedirect(error)) throw error
      // If profile cannot be loaded, still show onboarding so the user can recover.
    }
  },
  component: OnboardingPage,
})
