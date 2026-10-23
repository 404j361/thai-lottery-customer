import { Button } from "@/components/ui/button"
import { clearSession, getSession } from "@/features/auth/session"
import { ContactChannels } from "@/features/contact/contact-channels"
import { customerApi } from "@/features/customer/api"
import { PreferencesBar } from "@/features/preferences/preferences-bar"
import { useI18n } from "@/features/preferences/i18n-provider"
import { apiUrl, getApiErrorMessage } from "@/lib/api"
import type { UserProfile } from "@/lib/types"
import { Link, useNavigate } from "@tanstack/react-router"
import { Building2, ChevronRight, LogOut, Settings2, UserRound } from "lucide-react"
import { useCallback, useEffect, useState } from "react"

export function AccountPage() {
  const navigate = useNavigate()
  const session = getSession()
  const { t } = useI18n()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setError(null)
    try {
      setProfile(await customerApi.profile())
    } catch (cause) {
      setError(getApiErrorMessage(cause, t("somethingWrong")))
    }
  }, [t])

  useEffect(() => {
    void load()
  }, [load])

  async function logout() {
    const refreshToken = session?.refreshToken
    clearSession()
    if (refreshToken) {
      try {
        await fetch(apiUrl("/api/v1/auth/logout"), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refreshToken }),
        })
      } catch {
        // ignore
      }
    }
    await navigate({ to: "/login" })
  }

  return (
    <div className="space-y-4">
      <header className="flex items-center gap-3">
        <span className="flex size-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Settings2 className="size-5" />
        </span>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{t("account.title")}</h1>
          <p className="text-sm text-muted-foreground">{t("account.subtitle")}</p>
        </div>
      </header>

      {error ? (
        <div role="alert" className="rounded-3xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      ) : null}

      <section className="rounded-[1.6rem] border border-border/80 bg-card/95 p-4 shadow-sm backdrop-blur">
        <div className="flex items-center gap-3">
          <span className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <UserRound className="size-5" />
          </span>
          <div className="min-w-0">
            <p className="truncate font-semibold">
              {profile?.firstName && profile.lastName
                ? `${profile.firstName} ${profile.lastName}`
                : (profile?.email ?? session?.email ?? t("customer"))}
            </p>
            <p className="truncate text-xs text-muted-foreground">
              {profile?.email ?? t("account.signedIn")}
            </p>
          </div>
        </div>
      </section>

      <section className="overflow-hidden rounded-[1.6rem] border border-border/80 bg-card/95 shadow-sm backdrop-blur">
        <Link to="/bank" className="flex items-center gap-3 px-4 py-4 transition-colors hover:bg-muted/50">
          <span className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Building2 className="size-4" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold">{t("account.bankAccount")}</p>
            <p className="truncate text-xs text-muted-foreground">
              {profile?.bank
                ? `${profile.bank.bankName} · ${profile.bank.accountNumber}`
                : t("account.addBankHint")}
            </p>
          </div>
          <ChevronRight className="size-4 text-muted-foreground" />
        </Link>
      </section>

      <section className="space-y-4 rounded-[1.6rem] border border-border/80 bg-card/95 p-4 shadow-sm backdrop-blur">
        <div>
          <p className="text-sm font-semibold">{t("account.settings")}</p>
          <p className="mt-1 text-xs text-muted-foreground">{t("account.settingsHint")}</p>
        </div>
        <PreferencesBar />
      </section>

      <section className="space-y-3 rounded-[1.6rem] border border-border/80 bg-card/95 p-4 shadow-sm backdrop-blur">
        <div>
          <p className="text-sm font-semibold">{t("account.contact")}</p>
          <p className="mt-1 text-xs text-muted-foreground">{t("account.contactHint")}</p>
        </div>
        <ContactChannels variant="card" />
      </section>

      <Button
        variant="outline"
        className="h-12 w-full rounded-2xl border-border/80 bg-card/90 text-sm font-medium tracking-normal normal-case backdrop-blur"
        onClick={() => void logout()}
      >
        <LogOut className="size-4" />
        {t("signOut")}
      </Button>
    </div>
  )
}
