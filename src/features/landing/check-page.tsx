import { Link } from "@tanstack/react-router"
import { Search, Sparkles, XCircle } from "lucide-react"
import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent, type KeyboardEvent } from "react"

import { customerApi } from "@/features/customer/api"
import { LandingShell } from "@/features/landing/landing-shell"
import { useI18n } from "@/features/preferences/i18n-provider"
import {
  checkTicketAgainstDraw,
  type TicketCheckPrize,
} from "@/features/results/draw-result-view"
import { getApiErrorMessage } from "@/lib/api"
import { formatDay } from "@/lib/format"
import type { Draw } from "@/lib/types"
import { cn } from "@/lib/utils"

const DIGIT_COUNT = 6

export function LandingCheckPage() {
  const { t, dateLocale } = useI18n()
  const [latestDraw, setLatestDraw] = useState<Draw | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [digits, setDigits] = useState<string[]>(() => Array.from({ length: DIGIT_COUNT }, () => ""))
  const [checkMessage, setCheckMessage] = useState<"idle" | "invalid" | "none" | TicketCheckPrize>("idle")
  const inputRefs = useRef<Array<HTMLInputElement | null>>([])

  const ticketNumber = digits.join("")

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const draws = await customerApi.results("latest")
      setLatestDraw(draws[0] ?? null)
    } catch (cause) {
      setError(getApiErrorMessage(cause, t("somethingWrong")))
      setLatestDraw(null)
    } finally {
      setLoading(false)
    }
  }, [t])

  useEffect(() => {
    void load()
  }, [load])

  const prizeLabel = useMemo(
    () => (prize: TicketCheckPrize) => {
      if (prize === "first") return t("results.first")
      if (prize === "near") return t("results.near")
      if (prize === "second") return t("results.second")
      if (prize === "third") return t("results.third")
      if (prize === "fourth") return t("results.fourth")
      if (prize === "fifth") return t("results.fifth")
      if (prize === "last3") return t("results.last3")
      return t("results.last2")
    },
    [t]
  )

  function setDigitAt(index: number, value: string) {
    const digit = value.replace(/\D/g, "").slice(-1)
    setDigits((prev) => {
      const next = [...prev]
      next[index] = digit
      return next
    })
    setCheckMessage("idle")
    if (digit && index < DIGIT_COUNT - 1) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  function onDigitKeyDown(index: number, event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Backspace" && !digits[index] && index > 0) {
      event.preventDefault()
      setDigits((prev) => {
        const next = [...prev]
        next[index - 1] = ""
        return next
      })
      inputRefs.current[index - 1]?.focus()
    }
    if (event.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
    if (event.key === "ArrowRight" && index < DIGIT_COUNT - 1) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  function onDigitPaste(event: React.ClipboardEvent<HTMLInputElement>) {
    event.preventDefault()
    const pasted = event.clipboardData.getData("text").replace(/\D/g, "").slice(0, DIGIT_COUNT)
    if (!pasted) return
    const next = Array.from({ length: DIGIT_COUNT }, (_, i) => pasted[i] ?? "")
    setDigits(next)
    setCheckMessage("idle")
    const focusAt = Math.min(pasted.length, DIGIT_COUNT - 1)
    inputRefs.current[focusAt]?.focus()
  }

  function onCheckTicket(event?: FormEvent) {
    event?.preventDefault()
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

  const isWin = checkMessage !== "idle" && checkMessage !== "invalid" && checkMessage !== "none"
  const isMiss = checkMessage === "none"

  return (
    <LandingShell>
      <main className="check-stage relative flex flex-1 flex-col">
        <div className="absolute inset-0 check-stage-bg" aria-hidden />
        <div className="relative mx-auto flex w-full max-w-lg flex-1 flex-col justify-center px-5 py-12 sm:py-16">
          <div className="check-stage-copy text-center">
            <img
              src="/brand/pyit-tine-htaung.png"
              alt=""
              className="mx-auto h-14 w-14 rounded-full bg-white/10 object-contain p-0.5 ring-1 ring-white/25"
            />
            <h1 className="mt-5 font-heading text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              {t("landing.checkTitle")}
            </h1>
            <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-sky-100/85 sm:text-base">
              {t("landing.checkHint")}
            </p>
          </div>

          <form
            onSubmit={onCheckTicket}
            className="check-ticket-stub mt-8 overflow-hidden rounded-[1.75rem] bg-white shadow-2xl shadow-slate-950/30"
          >
            <div className="h-1.5 bg-[linear-gradient(90deg,#1a5bb5_0%,#f59e0b_100%)]" aria-hidden />

            <div className="px-5 py-6 sm:px-7 sm:py-8">
              {loading ? <p className="mb-4 text-center text-sm text-slate-500">{t("loading")}</p> : null}
              {error ? <p className="mb-4 text-center text-sm text-rose-600">{error}</p> : null}

              <p className="text-center text-xs font-medium text-slate-500">{t("tickets.number")}</p>

              <div className="mt-3 flex justify-center gap-1.5 sm:gap-2" onPaste={onDigitPaste}>
                {digits.map((digit, index) => (
                  <input
                    key={index}
                    ref={(node) => {
                      inputRefs.current[index] = node
                    }}
                    type="text"
                    inputMode="numeric"
                    autoComplete={index === 0 ? "one-time-code" : "off"}
                    maxLength={1}
                    value={digit}
                    disabled={loading}
                    aria-label={`${t("tickets.number")} ${index + 1}`}
                    onChange={(event) => setDigitAt(index, event.target.value)}
                    onKeyDown={(event) => onDigitKeyDown(index, event)}
                    onFocus={(event) => event.currentTarget.select()}
                    className={cn(
                      "size-11 rounded-xl border border-sky-500/25 bg-sky-50/80 text-center font-heading text-xl font-bold text-slate-900 tabular-nums outline-none transition sm:size-12 sm:text-2xl",
                      "focus:border-[#1a5bb5] focus:bg-white focus:ring-2 focus:ring-[#1a5bb5]/25",
                      "disabled:opacity-60"
                    )}
                  />
                ))}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="mt-6 inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#1a5bb5] text-sm font-semibold text-white transition hover:bg-[#154a96] disabled:opacity-60"
              >
                <Search className="size-4" aria-hidden />
                {t("landing.checkAction")}
              </button>

              {checkMessage === "invalid" ? (
                <p role="alert" className="mt-4 text-center text-sm text-rose-600">
                  {t("landing.checkInvalid")}
                </p>
              ) : null}

              {isWin ? (
                <div
                  key={`win-${ticketNumber}-${checkMessage}`}
                  className="check-result-reveal mt-5 rounded-2xl bg-[linear-gradient(145deg,#0c2a56_0%,#13407a_100%)] px-4 py-5 text-center text-white"
                >
                  <Sparkles className="mx-auto size-6 text-amber-300" aria-hidden />
                  <p className="mt-2 text-sm font-medium text-sky-100/90">{t("landing.checkWinTitle")}</p>
                  <p className="mt-1 font-heading text-xl font-semibold text-amber-300">
                    {prizeLabel(checkMessage)}
                  </p>
                  <p className="mt-2 font-heading text-lg tracking-[0.28em] tabular-nums text-white">
                    {ticketNumber}
                  </p>
                </div>
              ) : null}

              {isMiss ? (
                <div
                  key={`miss-${ticketNumber}`}
                  className="check-result-reveal mt-5 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-5 text-center"
                >
                  <XCircle className="mx-auto size-6 text-slate-400" aria-hidden />
                  <p className="mt-2 text-sm font-semibold text-slate-800">{t("landing.checkMissTitle")}</p>
                  <p className="mt-1 text-sm text-slate-500">{t("landing.checkMiss")}</p>
                </div>
              ) : null}
            </div>
          </form>

          <div className="mt-6 flex flex-col items-center gap-2 text-center">
            {latestDraw ? (
              <p className="text-sm text-sky-100/80">
                {t("landing.checkAgainst")}{" "}
                <span className="font-medium text-white">
                  {formatDay(latestDraw.drawDate, dateLocale)}
                </span>
              </p>
            ) : null}
            <Link
              to="/draw-results"
              className="text-sm font-semibold text-amber-300 underline-offset-4 hover:underline"
            >
              {t("landing.checkSeeResults")}
            </Link>
          </div>
        </div>
      </main>
    </LandingShell>
  )
}
