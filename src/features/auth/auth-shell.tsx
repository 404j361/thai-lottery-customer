import { PreferencesBar } from "@/features/preferences/preferences-bar"
import { useI18n } from "@/features/preferences/i18n-provider"
import { Link } from "@tanstack/react-router"
import type { ReactNode } from "react"

type AuthShellProps = {
  eyebrow: string
  title: string
  subtitle: ReactNode
  panelTitle: string
  panelBody: string
  children: ReactNode
  footer?: ReactNode
}

export function AuthShell({
  eyebrow,
  title,
  subtitle,
  panelTitle,
  panelBody,
  children,
  footer,
}: AuthShellProps) {
  const { t } = useI18n()

  return (
    <main className="auth-shell min-h-dvh lg:grid lg:grid-cols-2">
      <aside className="relative hidden overflow-hidden text-white lg:flex lg:flex-col lg:justify-between lg:px-12 lg:py-12 xl:px-16">
        <div className="absolute inset-0 auth-shell-panel" aria-hidden />
        <div className="relative">
          <Link to="/" className="inline-flex items-center gap-1">
            <img
              src="/brand/pyit-tine-htaung.png"
              alt=""
              className="size-12 rounded-full"
            />
            <span className="font-heading text-xl font-semibold tracking-tight">{t("appName")}</span>
          </Link>
        </div>
        <div className="relative max-w-md">
          <h2 className="font-heading text-3xl font-semibold leading-snug tracking-tight xl:text-4xl">
            {panelTitle}
          </h2>
          <p className="mt-4 text-base leading-relaxed text-white/85">{panelBody}</p>
        </div>
        <p className="relative text-sm text-white/60">{t("landing.footerNote")}</p>
      </aside>

      <section className="app-shell-bg flex min-h-dvh flex-col">
        <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-5 py-8 sm:px-6 lg:max-w-lg lg:px-10 lg:py-12">
          <div className="mb-6 flex items-center justify-between gap-3 lg:hidden">
            <Link to="/" className="inline-flex items-center gap-1">
              <img
                src="/brand/pyit-tine-htaung.png"
                alt=""
                className="size-10 rounded-full ring-1 ring-primary/15"
              />
              <span className="font-heading text-lg font-semibold tracking-tight text-slate-900">
                {t("appName")}
              </span>
            </Link>
            <div className="w-auto max-w-[13.5rem] shrink-0 sm:max-w-none">
              <PreferencesBar showTheme={false} compact />
            </div>
          </div>

          <div className="rounded-2xl border border-primary/15 bg-card/95 p-5 shadow-sm backdrop-blur sm:p-7 lg:rounded-3xl lg:border-primary/20 lg:p-8 lg:shadow-md">
            <p className="text-sm font-medium text-primary/80">{eyebrow}</p>
            <h1 className="mt-1 font-heading text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
              {title}
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-slate-500 sm:text-[0.95rem]">{subtitle}</p>

            <div className="mt-6 sm:mt-8">{children}</div>
            {footer ? <div className="mt-6 text-center text-sm text-slate-500">{footer}</div> : null}
          </div>

          <div className="mt-4 hidden rounded-2xl border border-primary/15 bg-card/90 p-4 backdrop-blur lg:block">
            <PreferencesBar showTheme={false} />
          </div>
        </div>
      </section>
    </main>
  )
}
