import { Link } from "@tanstack/react-router"
import { Search } from "lucide-react"
import { useCallback, useEffect, useState } from "react"

import { Input } from "@/components/ui/input"
import { getSession } from "@/features/auth/session"
import { customerApi } from "@/features/customer/api"
import { DrawCountdownCard } from "@/features/customer/draw-countdown-card"
import { FeaturedTickets } from "@/features/landing/featured-tickets"
import { LandingShell } from "@/features/landing/landing-shell"
import { useI18n } from "@/features/preferences/i18n-provider"
import { getApiErrorMessage } from "@/lib/api"
import type { Draw, TicketOffer } from "@/lib/types"

export function LandingBuyPage() {
  const { t, dateLocale } = useI18n()
  const signedIn =
    typeof window === "undefined" ? false : Boolean(getSession()?.accessToken)

  const [openDraws, setOpenDraws] = useState<Draw[]>([])
  const [drawId, setDrawId] = useState("")
  const [tickets, setTickets] = useState<TicketOffer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchNumber, setSearchNumber] = useState("")
  const [appliedNumber, setAppliedNumber] = useState("")

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      let drawList: Draw[] = []
      try {
        drawList = await customerApi.draws("OPEN")
      } catch {
        drawList = []
      }
      setOpenDraws(drawList)
      const selected =
        drawId && drawList.some((item) => item.id === drawId) ? drawId : drawList[0]?.id || ""
      if (selected !== drawId) setDrawId(selected)
      setTickets(
        await customerApi.tickets({
          drawId: selected || undefined,
          number: appliedNumber.trim() || undefined,
        })
      )
    } catch (cause) {
      setError(getApiErrorMessage(cause, t("somethingWrong")))
      setTickets([])
    } finally {
      setLoading(false)
    }
  }, [appliedNumber, drawId, t])

  useEffect(() => {
    void load()
  }, [load])

  return (
    <LandingShell>
      <main className="mx-auto w-full max-w-6xl px-5 py-10 lg:px-8 lg:py-14">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="font-heading text-2xl font-semibold tracking-tight text-slate-900 lg:text-3xl">
              {t("landing.ticketsTitle")}
            </h1>
            <p className="mt-1 text-sm text-slate-500 sm:text-base">{t("landing.ticketsSubtitle")}</p>
          </div>
          {!loading && tickets.length > 0 ? (
            <p className="text-sm text-slate-500">{t("tickets.count", { count: String(tickets.length) })}</p>
          ) : null}
        </div>

        <div className="mt-8 flex flex-col gap-4">
          <DrawCountdownCard
            draws={openDraws}
            drawId={drawId}
            onDrawId={setDrawId}
            dateLocale={dateLocale}
          />

          <div className="rounded-2xl border border-primary/20 bg-white/90 p-3 shadow-sm sm:p-4">
            <label className="relative block min-w-0">
              <Input
                value={searchNumber}
                onChange={(event) => setSearchNumber(event.target.value.replace(/\D/g, "").slice(0, 6))}
                onKeyDown={(event) => {
                  if (event.key === "Enter") setAppliedNumber(searchNumber.trim())
                }}
                placeholder={t("tickets.numberPlaceholder")}
                className="pr-12"
                inputMode="numeric"
                maxLength={6}
              />
              <button
                type="button"
                onClick={() => setAppliedNumber(searchNumber.trim())}
                aria-label={t("tickets.search")}
                className="absolute top-1/2 right-1.5 flex size-9 -translate-y-1/2 items-center justify-center rounded-lg bg-primary text-white transition hover:bg-primary/90"
              >
                <Search className="size-4" />
              </button>
            </label>
          </div>

          {loading ? <p className="text-sm text-slate-500">{t("loading")}</p> : null}
          {error ? <p className="text-sm text-rose-600">{error}</p> : null}
          {!loading && !error && tickets.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-primary/30 bg-white/70 px-6 py-12 text-center text-sm text-slate-500">
              {t("landing.ticketsEmpty")}
            </p>
          ) : null}
          {!loading && tickets.length > 0 ? <FeaturedTickets tickets={tickets} /> : null}

          <div className="pt-1">
            {signedIn ? (
              <Link
                to="/tickets"
                className="inline-flex h-11 items-center rounded-xl bg-primary px-5 text-sm font-semibold text-white transition hover:bg-primary/90"
              >
                {t("landing.ticketsViewAll")}
              </Link>
            ) : (
              <Link
                to="/login"
                className="inline-flex h-11 items-center rounded-xl bg-primary px-5 text-sm font-semibold text-white transition hover:bg-primary/90"
              >
                {t("landing.ticketsSignInToBuy")}
              </Link>
            )}
          </div>
        </div>
      </main>
    </LandingShell>
  )
}
