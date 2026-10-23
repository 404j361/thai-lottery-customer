import { WaveBackdrop } from "@/features/customer/wave-backdrop"
import { useI18n } from "@/features/preferences/i18n-provider"
import { formatDay } from "@/lib/format"
import type { Draw } from "@/lib/types"
import { cn } from "@/lib/utils"
import { CalendarDays } from "lucide-react"
import { useEffect, useState } from "react"


type CountdownParts = {
  days: number
  hours: number
  minutes: number
  seconds: number
  ended: boolean
}

function getCountdown(target: string, now = Date.now()): CountdownParts {
  const end = new Date(target).getTime()
  if (Number.isNaN(end)) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, ended: true }
  }
  const diff = Math.max(0, end - now)
  const totalSeconds = Math.floor(diff / 1000)
  return {
    days: Math.floor(totalSeconds / 86_400),
    hours: Math.floor((totalSeconds % 86_400) / 3_600),
    minutes: Math.floor((totalSeconds % 3_600) / 60),
    seconds: totalSeconds % 60,
    ended: diff <= 0,
  }
}

function pad(value: number) {
  return String(value).padStart(2, "0")
}

export function DrawCountdownCard({
  draws,
  drawId,
  onDrawId,
  dateLocale,
}: {
  draws: Draw[]
  drawId: string
  onDrawId: (value: string) => void
  dateLocale: string
}) {
  const { t } = useI18n()

  if (draws.length === 0) {
    return (
      <section className="rounded-[1.6rem] border border-border/80 bg-card/95 px-4 py-8 text-center text-sm text-muted-foreground shadow-sm">
        {t("tickets.noOpenDraws")}
      </section>
    )
  }

  const selectedDraw = draws.find((draw) => draw.id === drawId) ?? draws[0]

  return (
    <DrawCountdownCardInner
      draws={draws}
      selectedDraw={selectedDraw}
      onDrawId={onDrawId}
      dateLocale={dateLocale}
    />
  )
}

function DrawCountdownCardInner({
  draws,
  selectedDraw,
  onDrawId,
  dateLocale,
}: {
  draws: Draw[]
  selectedDraw: Draw
  onDrawId: (value: string) => void
  dateLocale: string
}) {
  const { t } = useI18n()
  const [countdown, setCountdown] = useState<CountdownParts>(() => getCountdown(selectedDraw.drawDate))

  useEffect(() => {
    const tick = () => setCountdown(getCountdown(selectedDraw.drawDate))
    tick()
    const id = window.setInterval(tick, 1000)
    return () => window.clearInterval(id)
  }, [selectedDraw.drawDate])

  const day = formatDay(selectedDraw.drawDate, dateLocale)
  const title =
    selectedDraw.name.trim().toLowerCase() === day.toLowerCase() ? day : selectedDraw.name

  const units = [
    { key: "days", value: countdown.days, label: t("tickets.countdownDays") },
    { key: "hours", value: countdown.hours, label: t("tickets.countdownHours") },
    { key: "minutes", value: countdown.minutes, label: t("tickets.countdownMinutes") },
    { key: "seconds", value: countdown.seconds, label: t("tickets.countdownSeconds") },
  ] as const

  return (
    <section className="wave-card relative overflow-hidden rounded-[1.6rem] text-white">
      <WaveBackdrop />

      <div className="relative z-10 px-4 py-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-medium text-white/70">{t("tickets.openDraws")}</p>
            <p className="mt-1 truncate font-heading text-lg font-semibold tracking-tight">{title}</p>
          </div>
          <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-white/20 bg-white/15 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur-sm">
            <CalendarDays className="size-3.5" />
            {day}
          </span>
        </div>

        {countdown.ended ? (
          <p className="mt-5 rounded-2xl border border-amber-300/30 bg-amber-400/15 px-3 py-3 text-sm font-medium text-amber-100">
            {t("tickets.countdownEnded")}
          </p>
        ) : (
          <div className="mt-5">
            <p className="text-[11px] font-medium tracking-wide text-white/65 uppercase">
              {t("tickets.countdownLabel")}
            </p>
            <div className="mt-2 grid grid-cols-4 gap-2">
              {units.map((unit) => (
                <div
                  key={unit.key}
                  className="rounded-2xl border border-white/20 bg-white/12 px-2 py-2.5 text-center backdrop-blur-sm"
                >
                  <p className="font-heading text-xl font-semibold tabular-nums tracking-tight">
                    {pad(unit.value)}
                  </p>
                  <p className="mt-0.5 text-[10px] font-medium text-white/70">{unit.label}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {draws.length > 1 ? (
        <div className="relative z-10 flex gap-1.5 overflow-x-auto border-t border-white/15 bg-black/10 px-3 py-3">
          {draws.map((draw) => {
            const drawDay = formatDay(draw.drawDate, dateLocale)
            const label = draw.name.trim().toLowerCase() === drawDay.toLowerCase() ? drawDay : draw.name
            const active = draw.id === selectedDraw.id
            return (
              <button
                key={draw.id}
                type="button"
                onClick={() => onDrawId(draw.id)}
                className={cn(
                  "shrink-0 rounded-full px-3.5 py-2 text-xs font-semibold transition-colors",
                  active
                    ? "bg-white text-[var(--wave-to)]"
                    : "bg-white/10 text-white/85 ring-1 ring-white/20 hover:bg-white/20"
                )}
              >
                {label}
              </button>
            )
          })}
        </div>
      ) : null}
    </section>
  )
}
