import { saveMobileOAuthReturn, isAllowedMobileOAuthReturn } from "@/features/auth/mobile-oauth-return"
import { useI18n } from "@/features/preferences/i18n-provider"
import { apiUrl } from "@/lib/api"
import { createFileRoute, Link } from "@tanstack/react-router"
import { LoaderCircle, ShieldAlert } from "lucide-react"
import { useEffect, useState } from "react"

/**
 * Mobile Google OAuth entry (Expo in-app browser).
 * Stores the app deep link, then starts the same Nest Google flow used by web.
 * After Nest redirects back to /auth/callback, that page bounces tokens to the app.
 */
export const Route = createFileRoute("/auth/mobile-google")({
  validateSearch: (search: Record<string, unknown>) => ({
    returnUrl: typeof search.returnUrl === "string" ? search.returnUrl : "",
  }),
  component: MobileGoogleStartPage,
})

function googleAuthStartUrl(): string {
  const path = "/api/v1/auth/google?app=shop"
  const url = apiUrl(path)
  if (url.startsWith("http://") || url.startsWith("https://")) return url
  // Production customer builds sometimes use same-origin /api; OAuth must hit the API host.
  return `https://api.wannaaung.dev${path}`
}

function MobileGoogleStartPage() {
  const { returnUrl } = Route.useSearch()
  const { t } = useI18n()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!returnUrl || !isAllowedMobileOAuthReturn(returnUrl)) {
      setError(t("auth.googleMissingTokens"))
      return
    }

    saveMobileOAuthReturn(returnUrl)
    window.location.replace(googleAuthStartUrl())
  }, [returnUrl, t])

  if (error) {
    return (
      <main className="flex min-h-svh items-center justify-center bg-muted/30 p-6">
        <section className="w-full max-w-md rounded-2xl border bg-background p-6 text-center">
          <ShieldAlert className="mx-auto size-9 text-destructive" />
          <h1 className="mt-4 font-heading text-xl font-semibold">{t("auth.googleFailedTitle")}</h1>
          <p role="alert" className="mt-2 text-sm text-muted-foreground">
            {error}
          </p>
          <Link
            to="/login"
            className="mt-6 inline-flex h-11 w-full items-center justify-center rounded-xl bg-primary text-sm font-medium text-primary-foreground"
          >
            {t("auth.returnToSignIn")}
          </Link>
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
