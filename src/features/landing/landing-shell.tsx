import { Link, useRouterState } from "@tanstack/react-router"
import type { ReactNode } from "react"

import { CountryFlag } from "@/components/flags"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { getSession } from "@/features/auth/session"
import { useI18n } from "@/features/preferences/i18n-provider"
import { isLocale, languages, type Locale } from "@/i18n/languages"
import { cn } from "@/lib/utils"

const NAV = [
  { to: "/" as const, labelKey: "landing.navHome" as const },
  { to: "/buy" as const, labelKey: "landing.navBuy" as const },
  { to: "/check" as const, labelKey: "landing.navCheck" as const },
  { to: "/draw-results" as const, labelKey: "landing.navResults" as const },
]

export function LandingShell({ children }: { children: ReactNode }) {
  const { t, locale, setLocale } = useI18n()
  const pathname = useRouterState({ select: (state) => state.location.pathname })
  const session = typeof window === "undefined" ? null : getSession()
  const signedIn = Boolean(session?.accessToken)
  const languageItems = languages.map((item) => ({ label: item.nativeName, value: item.code }))

  return (
    <div className="landing-page flex min-h-dvh flex-col text-slate-900">
      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#0c2a56]/92 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-5 lg:px-8">
          <Link to="/" className="flex items-center gap-1 text-white">
            <img src="/brand/pyit-tine-htaung.png" alt="" className="h-10 w-10 rounded-full" />
            <span className="font-heading text-lg font-semibold tracking-tight">{t("appName")}</span>
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {NAV.map((item) => {
              const active = pathname === item.to
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={cn("landing-nav-link", active && "bg-white/15 text-white")}
                >
                  {t(item.labelKey)}
                </Link>
              )
            })}
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <Select
              items={languageItems}
              value={locale}
              onValueChange={(value) => {
                if (isLocale(value)) setLocale(value)
              }}
            >
              <SelectTrigger
                size="sm"
                aria-label={t("preferences.language")}
                className="h-9 min-w-0 rounded-lg border-white/20 bg-white/10 px-2.5 text-white hover:bg-white/15"
              >
                <SelectValue>
                  {(value: Locale) => {
                    const selected = languages.find((item) => item.code === value) ?? languages[0]
                    return (
                      <>
                        <CountryFlag code={selected.flag} className="rounded-[2px]" />
                        <span className="hidden sm:inline">{selected.nativeName}</span>
                      </>
                    )
                  }}
                </SelectValue>
              </SelectTrigger>
              <SelectContent alignItemWithTrigger={false} align="end" className="min-w-40">
                <SelectGroup>
                  {languages.map((item) => (
                    <SelectItem key={item.code} value={item.code}>
                      <CountryFlag code={item.flag} className="rounded-[2px]" />
                      {item.nativeName}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>

            {signedIn ? (
              <Link
                to="/home"
                className="inline-flex h-9 items-center rounded-lg bg-amber-400 px-3.5 text-sm font-semibold text-slate-900 transition hover:bg-amber-300"
              >
                {t("landing.openWallet")}
              </Link>
            ) : (
              <Link
                to="/login"
                className="inline-flex h-9 items-center rounded-lg bg-amber-400 px-3.5 text-sm font-semibold text-slate-900 transition hover:bg-amber-300"
              >
                {t("auth.signIn")}
              </Link>
            )}
          </div>
        </div>

        <nav className="flex gap-1 overflow-x-auto border-t border-white/10 px-3 py-2 md:hidden">
          {NAV.map((item) => {
            const active = pathname === item.to
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium transition",
                  active ? "bg-white/15 text-white" : "text-sky-100/80 hover:bg-white/10 hover:text-white"
                )}
              >
                {t(item.labelKey)}
              </Link>
            )
          })}
        </nav>
      </header>

      <div className="flex flex-1 flex-col">{children}</div>

      <footer className="border-t border-sky-900/10 bg-[#0c2a56] text-sky-100/80">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-5 py-8 sm:flex-row sm:items-center sm:justify-between lg:px-8">
          <div className="flex items-center gap-1">
            <img src="/brand/pyit-tine-htaung.png" alt="" className="h-8 w-8 rounded-full" />
            <span className="font-heading text-sm font-semibold text-white">{t("appName")}</span>
          </div>
          <p className="text-xs sm:text-sm">{t("landing.footerNote")}</p>
        </div>
      </footer>
    </div>
  )
}
