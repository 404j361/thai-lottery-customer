import { LoginPage } from "@/features/auth/login"
import { getSession } from "@/features/auth/session"
import { createFileRoute, redirect } from "@tanstack/react-router"

export const Route = createFileRoute("/login")({
  beforeLoad: () => {
    if (getSession() && (typeof window === "undefined" || getSession()?.accessToken !== "")) {
      throw redirect({ to: "/home" })
    }
  },
  component: LoginPage,
})
