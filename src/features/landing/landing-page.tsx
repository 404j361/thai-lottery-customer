import { Link } from "@tanstack/react-router"
import { Search } from "lucide-react"
import { useCallback, useEffect, useMemo, useState } from "react"

import { CountryFlag } from "@/components/flags"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { getSession } from "@/features/auth/session"
import { customerApi } from "@/features/customer/api"
import { DrawCountdownCard } from "@/features/customer/draw-countdown-card"
import { TicketOfferGrid } from "@/features/customer/ticket-offer-grid"
import { useI18n } from "@/features/preferences/i18n-provider"
import {
  checkTicketAgainstDraw,
  DrawResultView,
  type TicketCheckPrize,
} from "@/features/results/draw-result-view"
import { isLocale, languages, type Locale } from "@/i18n/languages"
import { getApiErrorMessage } from "@/lib/api"
import type { Draw, ResultsRange, TicketOffer } from "@/lib/types"

const RANGES: ResultsRange[] = ["latest", "month", "3months", "6months"]

export function LandingPage() {
  const { t, locale, setLocale, dateLocale } = useI18n()
  const session = typeof window === "undefined" ? null : getSession()
  const signedIn = Boolean(session?.accessToken)

  const [range, setRange] = useState<ResultsRange>("latest")
  const [draws, setDraws] = useState<Draw[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [ticketNumber, setTicketNumber] = useState("")
  const [checkMessage, setCheckMessage] = useState<"idle" | "invalid" | "none" | TicketCheckPrize>("idle")

  const [openDraws, setOpenDraws] = useState<Draw[]>([])
  const [drawId, setDrawId] = useState("")
  const [tickets, setTickets] = useState<TicketOffer[]>([])
  const [ticketsLoading, setTicketsLoading] = useState(true)
  const [ticketsError, setTicketsError] = useState<string | null>(null)
  const [searchNumber, setSearchNumber] = useState("")
  const [appliedNumber, setAppliedNumber] = useState("")

  const loadResults = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      setDraws(await customerApi.results(range))
    } catch (cause) {
      setError(getApiErrorMessage(cause, t("somethingWrong")))
      setDraws([])
    } finally {
      setLoading(false)
    }
  }, [range, t])

  const loadTickets = useCallback(async () => {
    setTicketsLoading(true)
    setTicketsError(null)
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
      setTicketsError(getApiErrorMessage(cause, t("somethingWrong")))
      setTickets([])
    } finally {
      setTicketsLoading(false)
    }
  }, [appliedNumber, drawId, t])

  useEffect(() => {
    void loadResults()
  }, [loadResults])

  useEffect(() => {
    void loadTickets()
  }, [loadTickets])

  const latestDraw = useMemo(() => draws[0] ?? null, [draws])

  const rangeLabel = (value: ResultsRange) => {
    if (value === "latest") return t("results.latest")
    if (value === "month") return t("results.month")
    if (value === "3months") return t("results.months3")
    return t("results.months6")
  }

  const prizeLabel = (prize: TicketCheckPrize) => {
    if (prize === "first") return t("results.first")
    if (prize === "near") return t("results.near")
    if (prize === "second") return t("results.second")
    if (prize === "third") return t("results.third")
    if (prize === "fourth") return t("results.fourth")
    if (prize === "fifth") return t("results.fifth")
    if (prize === "last3") return t("results.last3")
    return t("results.last2")
  }

  function onCheckTicket() {
    if (!latestDraw) {
      setCheckMessage("none")
      return
    }
    const result = checkTicketAgainstDraw(latestDraw, ticketNumber)
    if (result === null) {
      setCheckMessage("invalid")
      return
    }
    setCheckMessage(result)
  }

  const languageItems = languages.map((item) => ({ label: item.nativeName, value: item.code }))

  return (
    <div className="landing-page min-h-dvh text-slate-900">
      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#0c2a56]/92 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-6 px-6 lg:px-8">
          <a href="#top" className="flex items-center gap-1 text-white">
            <img src="/brand/pyit-tine-htaung.png" alt="" className="h-10 w-10 rounded-full" />
            <span className="font-heading text-lg font-semibold tracking-tight">{t("appName")}</span>
          </a>

          <nav className="hidden items-center gap-1 md:flex">
            <a href="#top" className="landing-nav-link">
              {t("landing.navHome")}
            </a>
            <a href="#tickets" className="landing-nav-link">
              {t("landing.navBuy")}
            </a>
            <a href="#check" className="landing-nav-link">
              {t("landing.navCheck")}
            </a>
            <a href="#results" className="landing-nav-link">
              {t("landing.navResults")}
            </a>
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
      </header>

      <main id="top">
        <section className="landing-hero relative overflow-hidden">
          <div className="absolute inset-0 landing-hero-bg" aria-hidden />
          <div className="relative mx-auto grid max-w-6xl gap-10 px-6 py-16 lg:grid-cols-[1.15fr_0.85fr] lg:items-end lg:px-8 lg:py-24">
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
                <a
                  href="#tickets"
                  className="inline-flex h-12 items-center rounded-xl bg-amber-400 px-6 text-sm font-semibold text-slate-900 shadow-lg shadow-amber-900/20 transition hover:bg-amber-300"
                >
                  {t("landing.navBuy")}
                </a>
                <a
                  href="#results"
                  className="inline-flex h-12 items-center rounded-xl border border-white/25 bg-white/10 px-6 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/15"
                >
                  {t("landing.ctaResults")}
                </a>
              </div>
            </div>

            <aside
              id="check"
              className="landing-check-panel rounded-2xl border border-white/15 bg-white/95 p-6 shadow-2xl shadow-slate-950/25 backdrop-blur"
            >
              <h2 className="font-heading text-xl font-semibold tracking-tight text-slate-900">
                {t("landing.checkTitle")}
              </h2>
              <p className="mt-1 text-sm text-slate-500">{t("landing.checkHint")}</p>
              <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                <Input
                  inputMode="numeric"
                  maxLength={6}
                  placeholder={t("landing.checkPlaceholder")}
                  value={ticketNumber}
                  onChange={(event) => {
                    setTicketNumber(event.target.value.replace(/\D/g, "").slice(0, 6))
                    setCheckMessage("idle")
                  }}
                  className="h-12 font-heading text-lg tracking-[0.35em] tabular-nums"
                />
                <button
                  type="button"
                  onClick={onCheckTicket}
                  className="inline-flex h-12 shrink-0 items-center justify-center rounded-xl bg-[#1a5bb5] px-5 text-sm font-semibold text-white transition hover:bg-[#154a96]"
                >
                  {t("landing.checkAction")}
                </button>
              </div>
              {checkMessage === "invalid" ? (
                <p className="mt-3 text-sm text-rose-600">{t("landing.checkInvalid")}</p>
              ) : null}
              {checkMessage === "none" ? (
                <p className="mt-3 text-sm text-slate-600">{t("landing.checkMiss")}</p>
              ) : null}
              {checkMessage !== "idle" && checkMessage !== "invalid" && checkMessage !== "none" ? (
                <p className="mt-3 text-sm font-medium text-emerald-700">
                  {t("landing.checkHit", { prize: prizeLabel(checkMessage) })}
                </p>
              ) : null}
            </aside>
          </div>
        </section>

        <section id="tickets" className="mx-auto max-w-6xl px-6 py-14 lg:px-8 lg:py-16">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="font-heading text-2xl font-semibold tracking-tight text-slate-900 lg:text-3xl">
                {t("landing.ticketsTitle")}
              </h2>
              <p className="mt-1 text-sm text-slate-500 sm:text-base">{t("landing.ticketsSubtitle")}</p>
            </div>
            {!ticketsLoading && tickets.length > 0 ? (
              <p className="text-sm text-slate-500">
                {t("tickets.count", { count: String(tickets.length) })}
              </p>
            ) : null}
          </div>

          <div className="mt-8 flex flex-col gap-4">
            <DrawCountdownCard
              draws={openDraws}
              drawId={drawId}
              onDrawId={setDrawId}
              dateLocale={dateLocale}
            />

            <div className="rounded-2xl border border-sky-500/20 bg-white/90 p-3 shadow-sm sm:p-4">
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
                  className="absolute top-1/2 right-1.5 flex size-9 -translate-y-1/2 items-center justify-center rounded-lg bg-[#1a5bb5] text-white transition hover:bg-[#154a96]"
                >
                  <Search className="size-4" />
                </button>
              </label>
            </div>

            {ticketsLoading ? <p className="text-sm text-slate-500">{t("loading")}</p> : null}
            {ticketsError ? <p className="text-sm text-rose-600">{ticketsError}</p> : null}
            {!ticketsLoading && !ticketsError && tickets.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-sky-500/30 bg-white/70 px-6 py-12 text-center text-sm text-slate-500">
                {t("landing.ticketsEmpty")}
              </p>
            ) : null}
            {!ticketsLoading && tickets.length > 0 ? (
              <TicketOfferGrid tickets={tickets} variant="landing" />
            ) : null}

            <div className="flex flex-wrap gap-3 pt-1">
              {signedIn ? (
                <Link
                  to="/tickets"
                  className="inline-flex h-11 items-center rounded-xl bg-[#1a5bb5] px-5 text-sm font-semibold text-white transition hover:bg-[#154a96]"
                >
                  {t("landing.ticketsViewAll")}
                </Link>
              ) : (
                <Link
                  to="/login"
                  className="inline-flex h-11 items-center rounded-xl bg-[#1a5bb5] px-5 text-sm font-semibold text-white transition hover:bg-[#154a96]"
                >
                  {t("landing.ticketsSignInToBuy")}
                </Link>
              )}
            </div>
          </div>
        </section>

        <section id="results" className="mx-auto max-w-6xl px-6 pb-14 lg:px-8 lg:pb-16">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="font-heading text-2xl font-semibold tracking-tight text-slate-900 lg:text-3xl">
                {t("results.title")}
              </h2>
              <p className="mt-1 text-sm text-slate-500 sm:text-base">{t("results.subtitle")}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {RANGES.map((value) => {
                const active = value === range
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setRange(value)}
                    className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                      active
                        ? "bg-[#1a5bb5] text-white shadow-sm"
                        : "border border-sky-500/25 bg-white text-slate-600 hover:border-sky-400/50"
                    }`}
                  >
                    {rangeLabel(value)}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="mt-8 space-y-10">
            {loading ? <p className="text-sm text-slate-500">{t("loading")}</p> : null}
            {error ? <p className="text-sm text-rose-600">{error}</p> : null}
            {!loading && !error && draws.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-sky-500/30 bg-white/70 px-6 py-12 text-center text-sm text-slate-500">
                {t("results.empty")}
              </p>
            ) : null}
            {draws.map((draw) => (
              <DrawResultView key={draw.id} draw={draw} dateLocale={dateLocale} layout="landing" />
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t border-sky-900/10 bg-[#0c2a56] text-sky-100/80">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-6 py-8 sm:flex-row sm:items-center sm:justify-between lg:px-8">
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
