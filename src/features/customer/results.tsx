import { useCallback, useEffect, useState } from "react"

import { customerApi } from "@/features/customer/api"
import { useI18n } from "@/features/preferences/i18n-provider"
import { DrawResultView } from "@/features/results/draw-result-view"
import { getApiErrorMessage } from "@/lib/api"
import type { Draw, ResultsRange } from "@/lib/types"

const RANGES: ResultsRange[] = ["latest", "month", "3months", "6months"]

export function ResultsPage() {
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
    <div className="space-y-4">
      <section className="rounded-2xl border border-sky-500/20 bg-white px-4 py-5 shadow-sm">
        <h1 className="font-heading text-2xl font-semibold tracking-tight text-slate-900">{t("results.title")}</h1>
        <p className="mt-1 text-sm text-slate-500">{t("results.subtitle")}</p>
      </section>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {RANGES.map((value) => {
          const active = value === range
          return (
            <button
              key={value}
              type="button"
              onClick={() => setRange(value)}
              className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-medium transition ${
                active
                  ? "bg-sky-600 text-white shadow-sm"
                  : "border border-sky-500/20 bg-white text-slate-600 hover:border-sky-400/40"
              }`}
            >
              {rangeLabel(value)}
            </button>
          )
        })}
      </div>

      {loading ? <p className="text-sm text-slate-500">{t("loading")}</p> : null}
      {error ? <p className="text-sm text-rose-600">{error}</p> : null}

      {!loading && !error && draws.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-sky-500/25 bg-white px-4 py-8 text-center text-sm text-slate-500">
          {t("results.empty")}
        </p>
      ) : null}

      <div className="space-y-4">
        {draws.map((draw, index) => (
          <DrawResultView
            key={draw.id}
            draw={draw}
            dateLocale={dateLocale}
            layout="app"
            defaultOpen={index === 0}
          />
        ))}
      </div>
    </div>
  )
}
