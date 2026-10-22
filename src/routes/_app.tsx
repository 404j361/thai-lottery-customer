import { CustomerShell } from "@/features/app/customer-shell"
import { needsOnboarding } from "@/features/auth/profile"
import { clearSession, getAccessToken, getSession } from "@/features/auth/session"
import { customerApi } from "@/features/customer/api"
import { createFileRoute, isRedirect, redirect } from "@tanstack/react-router"

export const Route = createFileRoute("/_app")({
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
      if (needsOnboarding(profile)) throw redirect({ to: "/onboarding" })
    } catch (error) {
      if (isRedirect(error)) throw error
      // Keep the user in the app if profile fetch fails; screens will show their own errors.
    }
  },
  component: CustomerShell,
})
