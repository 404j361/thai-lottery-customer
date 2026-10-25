import { completeOAuthSession } from "@/features/auth/session"
import { resolvePostAuthPath } from "@/features/auth/profile"
import {
  buildMobileOAuthCallbackUrl,
  takeMobileOAuthReturn,
} from "@/features/auth/mobile-oauth-return"
import { Button } from "@/components/ui/button"
import { useI18n } from "@/features/preferences/i18n-provider"
import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { LoaderCircle, ShieldAlert } from "lucide-react"
import { useEffect, useState } from "react"

export const Route = createFileRoute("/auth/callback")({
  validateSearch: (search: Record<string, unknown>) => ({
    accessToken: typeof search.accessToken === "string" ? search.accessToken : "",
    refreshToken: typeof search.refreshToken === "string" ? search.refreshToken : "",
    expiresIn:
      typeof search.expiresIn === "string"
        ? Number(search.expiresIn)
        : typeof search.expiresIn === "number"
          ? search.expiresIn
          : undefined,
    error: typeof search.error === "string" ? search.error : "",
  }),
  component: GoogleCallbackPage,
})

function GoogleCallbackPage() {
  const { accessToken, refreshToken, expiresIn, error: authError } = Route.useSearch()
  const navigate = useNavigate()
  const { t } = useI18n()
  const [error, setError] = useState<string | null>(authError || null)

  useEffect(() => {
    if (authError) return
    if (!accessToken || !refreshToken) {
      setError(t("auth.googleMissingTokens"))
      return
    }

    // Expo / native: bounce tokens to the app deep link and do not keep a web session.
    const mobileReturn = takeMobileOAuthReturn()
    if (mobileReturn) {
      window.location.replace(
        buildMobileOAuthCallbackUrl(mobileReturn, {
          accessToken,
          refreshToken,
          expiresIn,
        })
      )
      return
    }

    void (async () => {
      try {
        completeOAuthSession(accessToken, refreshToken, expiresIn)
        const next = await resolvePostAuthPath()
        await navigate({ to: next, replace: true })
      } catch {
        setError(t("auth.googleSaveFailed"))
      }
    })()
  }, [accessToken, authError, expiresIn, navigate, refreshToken, t])

  if (error) {
    return (
      <main className="flex min-h-svh items-center justify-center bg-muted/30 p-6">
        <section className="w-full max-w-md rounded-2xl border bg-background p-6 text-center">
          <ShieldAlert className="mx-auto size-9 text-destructive" />
          <h1 className="mt-4 font-heading text-xl font-semibold">{t("auth.googleFailedTitle")}</h1>
          <p role="alert" className="mt-2 text-sm text-muted-foreground">
            {error}
          </p>
          <Button
            className="mt-6 h-11 w-full rounded-xl text-sm font-medium tracking-normal normal-case"
            onClick={() => void navigate({ to: "/login", replace: true })}
          >
            {t("auth.returnToSignIn")}
          </Button>
        </section>
      </main>
    )
  }

  return (
    <main className="flex min-h-svh items-center justify-center bg-muted/30 p-6">
      <div role="status" className="flex items-center gap-3 rounded-2xl border bg-background px-5 py-4 text-sm">
        <LoaderCircle className="size-5 animate-spin text-primary" />
        {t("auth.completingGoogle")}
      </div>
    </main>
  )
}
