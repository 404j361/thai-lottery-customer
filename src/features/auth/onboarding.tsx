import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { customerApi } from "@/features/customer/api"
import { useI18n } from "@/features/preferences/i18n-provider"
import { getApiErrorMessage } from "@/lib/api"
import { useNavigate } from "@tanstack/react-router"
import { LoaderCircle, Ticket } from "lucide-react"
import { useState, type FormEvent } from "react"

export function OnboardingPage() {
  const { t } = useI18n()
  const navigate = useNavigate()
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const firstName = String(form.get("firstName") ?? "").trim()
    const lastName = String(form.get("lastName") ?? "").trim()

    if (!firstName || !lastName) {
      setError(t("auth.enterNames"))
      return
    }

    setPending(true)
    setError(null)
    try {
      await customerApi.updateProfile({ firstName, lastName })
      await navigate({ to: "/home", replace: true })
    } catch (cause) {
      setError(getApiErrorMessage(cause, t("somethingWrong")))
    } finally {
      setPending(false)
    }
  }

  return (
    <main className="app-shell-bg mx-auto flex min-h-svh w-full max-w-md flex-col justify-center px-5 py-8">
      <div className="rounded-[1.8rem] border border-border/80 bg-card/95 p-6 shadow-sm backdrop-blur">
        <div className="mb-8 flex items-center gap-3">
          <span className="flex size-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm">
            <Ticket className="size-6" />
          </span>
          <div>
            <p className="text-lg font-semibold tracking-tight">{t("appName")}</p>
            <p className="text-sm text-muted-foreground">{t("onboarding.eyebrow")}</p>
          </div>
        </div>

        <h1 className="text-3xl font-semibold tracking-tight">{t("onboarding.title")}</h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">{t("onboarding.subtitle")}</p>

        <form className="mt-8 space-y-4" onSubmit={(event) => void submit(event)}>
          <label className="grid gap-2 text-sm font-medium">
            {t("auth.firstName")}
            <Input
              name="firstName"
              autoComplete="given-name"
              placeholder={t("auth.firstNamePlaceholder")}
              required
              disabled={pending}
              className="rounded-2xl"
              maxLength={80}
            />
          </label>
          <label className="grid gap-2 text-sm font-medium">
            {t("auth.lastName")}
            <Input
              name="lastName"
              autoComplete="family-name"
              placeholder={t("auth.lastNamePlaceholder")}
              required
              disabled={pending}
              className="rounded-2xl"
              maxLength={80}
            />
          </label>
          {error ? (
            <p role="alert" className="rounded-2xl border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
              {error}
            </p>
          ) : null}
          <Button type="submit" className="h-12 w-full rounded-2xl text-sm font-medium tracking-normal normal-case" disabled={pending}>
            {pending ? (
              <>
                <LoaderCircle className="animate-spin" />
                {t("onboarding.saving")}
              </>
            ) : (
              t("onboarding.continue")
            )}
          </Button>
        </form>
      </div>
    </main>
  )
}
