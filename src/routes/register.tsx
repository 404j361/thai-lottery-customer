import { RegisterPage } from "@/features/auth/register"
import { getSession } from "@/features/auth/session"
import { createFileRoute, redirect } from "@tanstack/react-router"

export const Route = createFileRoute("/register")({
  beforeLoad: () => {
    if (getSession() && (typeof window === "undefined" || getSession()?.accessToken !== "")) {
      throw redirect({ to: "/home" })
    }
  },
  component: RegisterPage,
})
