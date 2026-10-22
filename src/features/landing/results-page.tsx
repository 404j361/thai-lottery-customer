import { useCallback, useEffect, useState } from "react"

import { customerApi } from "@/features/customer/api"
import { LandingShell } from "@/features/landing/landing-shell"
import { useI18n } from "@/features/preferences/i18n-provider"
import { DrawResultView } from "@/features/results/draw-result-view"
import { getApiErrorMessage } from "@/lib/api"
import type { Draw, ResultsRange } from "@/lib/types"

const RANGES: ResultsRange[] = ["latest", "month", "3months", "6months"]

export function LandingResultsPage() {
  const { t, dateLocale } = useI18n()
  const [range, setRange] = useState<ResultsRange>("latest")
  const [draws, setDraws] = useState<Draw[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
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

  useEffect(() => {
    void load()
  }, [load])

  const rangeLabel = (value: ResultsRange) => {
    if (value === "latest") return t("results.latest")
    if (value === "month") return t("results.month")
    if (value === "3months") return t("results.months3")
    return t("results.months6")
  }

  return (
    <LandingShell>
      <main className="mx-auto w-full max-w-6xl px-5 py-10 lg:px-8 lg:py-14">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="font-heading text-2xl font-semibold tracking-tight text-slate-900 lg:text-3xl">
              {t("results.title")}
            </h1>
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

        <div className="mt-8 space-y-6">
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
      </main>
    </LandingShell>
  )
}
