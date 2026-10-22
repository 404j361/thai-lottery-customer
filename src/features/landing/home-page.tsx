import { Link } from "@tanstack/react-router"
import { useCallback, useEffect, useState } from "react"

import { customerApi } from "@/features/customer/api"
import { FeaturedTickets } from "@/features/landing/featured-tickets"
import { LandingShell } from "@/features/landing/landing-shell"
import { useI18n } from "@/features/preferences/i18n-provider"
import { getApiErrorMessage } from "@/lib/api"
import type { TicketOffer } from "@/lib/types"

const FEATURED_LIMIT = 6

export function LandingHomePage() {
  const { t } = useI18n()
  const [tickets, setTickets] = useState<TicketOffer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const list = await customerApi.tickets()
      setTickets(list.slice(0, FEATURED_LIMIT))
    } catch (cause) {
      setError(getApiErrorMessage(cause, t("somethingWrong")))
      setTickets([])
    } finally {
      setLoading(false)
    }
  }, [t])

  useEffect(() => {
    void load()
  }, [load])

  return (
    <LandingShell>
      <section className="landing-hero relative overflow-hidden">
        <div className="absolute inset-0 landing-hero-bg" aria-hidden />
        <div className="relative mx-auto max-w-6xl px-5 py-16 lg:px-8 lg:py-24">
          <div className="landing-hero-copy max-w-xl">
            <div className="flex items-center gap-2">
              <img
                src="/brand/pyit-tine-htaung.png"
                alt=""
                className="h-16 w-16 rounded-full sm:h-20 sm:w-20"
              />
              <p className="font-heading text-3xl font-semibold tracking-tight text-white sm:text-4xl lg:text-5xl">
                {t("appName")}
              </p>
            </div>
            <h1 className="mt-6 font-heading text-2xl font-medium leading-snug tracking-tight text-sky-50 sm:text-3xl">
              {t("landing.headline")}
            </h1>
            <p className="mt-3 max-w-md text-base leading-relaxed text-sky-100/85">{t("landing.subhead")}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/buy"
                className="inline-flex h-12 items-center rounded-xl bg-amber-400 px-6 text-sm font-semibold text-slate-900 shadow-lg shadow-amber-900/20 transition hover:bg-amber-300"
              >
                {t("landing.navBuy")}
              </Link>
              <Link
                to="/draw-results"
                className="inline-flex h-12 items-center rounded-xl border border-white/25 bg-white/10 px-6 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/15"
              >
                {t("landing.ctaResults")}
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-14 lg:px-8 lg:py-16">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="font-heading text-2xl font-semibold tracking-tight text-slate-900 lg:text-3xl">
              {t("landing.featuredTitle")}
            </h2>
            <p className="mt-1 text-sm text-slate-500 sm:text-base">{t("landing.featuredSubtitle")}</p>
          </div>
          <Link
            to="/buy"
            className="text-sm font-semibold text-[#1a5bb5] underline-offset-4 hover:underline"
          >
            {t("landing.navBuy")}
          </Link>
        </div>

        <div className="mt-8">
          {loading ? <p className="text-sm text-slate-500">{t("loading")}</p> : null}
          {error ? <p className="text-sm text-rose-600">{error}</p> : null}
          {!loading && !error && tickets.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-sky-500/30 bg-white/70 px-6 py-12 text-center text-sm text-slate-500">
              {t("landing.ticketsEmpty")}
            </p>
          ) : null}
          {!loading && tickets.length > 0 ? <FeaturedTickets tickets={tickets} /> : null}
        </div>
      </section>
    </LandingShell>
  )
}
