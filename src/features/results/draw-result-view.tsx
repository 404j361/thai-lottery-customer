import { useI18n } from "@/features/preferences/i18n-provider"
import { formatMoney } from "@/lib/format"
import type { Draw, DrawPrizeGroup, DrawResults } from "@/lib/types"
import { cn } from "@/lib/utils"
import { ChevronDown } from "lucide-react"
import { useState, type ReactNode } from "react"

type PrizeMask = "front3" | "back3" | "back2"

function formatDrawHeading(value: string, dateLocale: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return new Intl.DateTimeFormat(dateLocale, {
    weekday: "short",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date)
}

function maskedChars(value: string, mask?: PrizeMask) {
  if (mask === "front3") return [...value.split(""), "·", "·", "·"]
  if (mask === "back3") return ["·", "·", "·", ...value.split("")]
  if (mask === "back2") return ["·", "·", "·", "·", ...value.split("")]
  return value.split("")
}

function formatTicketDigits(value: string, mask?: PrizeMask) {
  return maskedChars(value, mask).join("")
}

/** Digit slots for hero; compact nowrap string for lists. */
function TicketNumber({
  value,
  mask,
  size = "md",
  tone = "ink",
}: {
  value: string
  mask?: PrizeMask
  size?: "sm" | "md" | "hero"
  tone?: "ink" | "onDark"
}) {
  const chars = maskedChars(value, mask)
  const label = chars.filter((char) => char !== "·").join("")

  if (size === "sm" || size === "md") {
    return (
      <span
        className={cn(
          "inline-block whitespace-nowrap font-heading font-semibold tabular-nums",
          size === "md" ? "text-lg tracking-wide sm:text-xl" : "text-sm tracking-wide",
          tone === "ink" ? "text-slate-900" : "text-white"
        )}
        aria-label={label}
      >
        {formatTicketDigits(value, mask)}
      </span>
    )
  }

  return (
    <span
      className={cn(
        "inline-flex flex-nowrap items-center justify-center gap-1.5 whitespace-nowrap font-heading font-semibold tabular-nums sm:gap-2",
        tone === "ink" ? "text-slate-900" : "text-white"
      )}
      aria-label={label}
    >
      {chars.map((char, index) => (
        <span
          key={`${char}-${index}`}
          className={cn(
            "inline-flex size-9 shrink-0 items-center justify-center rounded-md text-center text-2xl sm:size-11 sm:text-3xl md:size-12 md:text-4xl",
            tone === "onDark" && "bg-white/12",
            char === "·" && (tone === "onDark" ? "text-white/35" : "text-slate-300")
          )}
          aria-hidden={char === "·" ? true : undefined}
        >
          {char}
        </span>
      ))}
    </span>
  )
}

function NumberGrid({ numbers, mask }: { numbers: string[]; mask?: PrizeMask }) {
  if (numbers.length === 0) return null
  return (
    <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
      {numbers.map((number) => (
        <li
          key={number}
          className="flex min-w-0 items-center justify-center rounded-xl border border-primary/15 bg-primary/5 px-2 py-2.5 sm:px-3"
        >
          <TicketNumber value={number} mask={mask} size="sm" />
        </li>
      ))}
    </ul>
  )
}

function PrizeDisclosure({
  id,
  title,
  priceLabel,
  count,
  open,
  onToggle,
  children,
}: {
  id: string
  title: string
  priceLabel: string
  count: number
  open: boolean
  onToggle: () => void
  children: ReactNode
}) {
  return (
    <section className="overflow-hidden rounded-2xl border border-primary/20 bg-white/90">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={`prize-panel-${id}`}
        id={`prize-trigger-${id}`}
        onClick={onToggle}
        className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition hover:bg-primary/5 sm:px-5"
      >
        <ChevronDown
          className={cn(
            "size-4 shrink-0 text-sky-700 transition-transform duration-200",
            open && "rotate-180"
          )}
          aria-hidden
        />
        <span className="min-w-0 flex-1">
          <span className="block font-heading text-sm font-semibold tracking-tight text-slate-900 sm:text-base">
            {title}
          </span>
          <span className="mt-0.5 block text-xs text-slate-500 sm:text-sm">{priceLabel}</span>
        </span>
        <span className="shrink-0 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium tabular-nums text-primary">
          {count}
        </span>
      </button>
      {open ? (
        <div
          id={`prize-panel-${id}`}
          role="region"
          aria-labelledby={`prize-trigger-${id}`}
          className="border-t border-primary/15 px-4 py-4 sm:px-5"
        >
          {children}
        </div>
      ) : null}
    </section>
  )
}

export function DrawResultView({
  draw,
  dateLocale,
  layout = "app",
  defaultOpen = true,
}: {
  draw: Draw
  dateLocale: string
  layout?: "app" | "landing"
  /** Whether the draw date panel starts expanded. */
  defaultOpen?: boolean
}) {
  const { t } = useI18n()
  const results = draw.results as DrawResults | null | undefined
  const [drawOpen, setDrawOpen] = useState(defaultOpen)
  const [openIds, setOpenIds] = useState<Set<string>>(() => new Set(["second"]))

  if (!results?.prizes) return null

  const { prizes } = results
  const firstNumber = prizes.first.numbers[0]
  const nearNumbers = prizes.near1.numbers
  const panelId = `draw-panel-${draw.id}`
  const triggerId = `draw-trigger-${draw.id}`

  const price = (group: DrawPrizeGroup, withEach = false) => {
    const amount = `${formatMoney(group.price)} ${t("results.baht")}`
    return withEach ? `${amount} ${t("results.each")}` : amount
  }

  function toggle(id: string) {
    setOpenIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const disclosures: Array<{
    id: string
    title: string
    priceLabel: string
    count: number
    body: ReactNode
  }> = [
    {
      id: "second",
      title: t("results.second"),
      priceLabel: price(prizes.second, true),
      count: prizes.second.numbers.length,
      body: <NumberGrid numbers={prizes.second.numbers} />,
    },
    {
      id: "third",
      title: t("results.third"),
      priceLabel: price(prizes.third, true),
      count: prizes.third.numbers.length,
      body: <NumberGrid numbers={prizes.third.numbers} />,
    },
    {
      id: "fourth",
      title: t("results.fourth"),
      priceLabel: price(prizes.fourth, true),
      count: prizes.fourth.numbers.length,
      body: <NumberGrid numbers={prizes.fourth.numbers} />,
    },
    {
      id: "fifth",
      title: t("results.fifth"),
      priceLabel: price(prizes.fifth, true),
      count: prizes.fifth.numbers.length,
      body: <NumberGrid numbers={prizes.fifth.numbers} />,
    },
    {
      id: "last3",
      title: t("results.last3"),
      priceLabel: price(prizes.last3Front, true),
      count: prizes.last3Front.numbers.length + prizes.last3Back.numbers.length,
      body: (
        <div className="flex flex-col gap-4">
          <NumberGrid numbers={prizes.last3Front.numbers} mask="front3" />
          <NumberGrid numbers={prizes.last3Back.numbers} mask="back3" />
        </div>
      ),
    },
    {
      id: "last2",
      title: t("results.last2"),
      priceLabel: price(prizes.last2, true),
      count: prizes.last2.numbers.length,
      body: <NumberGrid numbers={prizes.last2.numbers} mask="back2" />,
    },
  ]

  return (
    <article
      className={cn(
        "overflow-hidden rounded-2xl border border-primary/20 bg-white/90",
        layout === "landing" && "shadow-sm"
      )}
    >
      <button
        type="button"
        aria-expanded={drawOpen}
        aria-controls={panelId}
        id={triggerId}
        onClick={() => setDrawOpen((value) => !value)}
        className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition hover:bg-primary/5 sm:px-5"
      >
        <ChevronDown
          className={cn(
            "size-4 shrink-0 text-sky-700 transition-transform duration-200",
            drawOpen && "rotate-180"
          )}
          aria-hidden
        />
        <h2 className="min-w-0 flex-1 font-heading text-lg font-semibold tracking-tight text-slate-900 sm:text-xl">
          {formatDrawHeading(draw.drawDate, dateLocale)}
        </h2>
        {firstNumber ? (
          <span className="hidden shrink-0 font-heading text-sm font-semibold tabular-nums text-primary sm:inline">
            {firstNumber}
          </span>
        ) : null}
      </button>

      {drawOpen ? (
        <div
          id={panelId}
          role="region"
          aria-labelledby={triggerId}
          className={cn(
            "flex flex-col gap-4 border-t border-primary/15 px-4 py-4 sm:px-5",
            layout === "landing" && "gap-5"
          )}
        >
          {/* First prize — the one loud moment */}
          <section className="relative overflow-hidden rounded-2xl bg-[linear-gradient(145deg,var(--wave-to)_0%,var(--wave-mid)_48%,var(--wave-to)_100%)] px-5 py-7 text-white shadow-lg shadow-[0_12px_32px_var(--wave-shadow)] sm:px-8 sm:py-9">
            <div
              className="pointer-events-none absolute -right-8 -top-10 size-40 rounded-full bg-amber-400/15 blur-2xl"
              aria-hidden
            />
            <div
              className="pointer-events-none absolute -bottom-12 left-1/4 size-48 rounded-full bg-sky-400/10 blur-3xl"
              aria-hidden
            />
            <div className="relative flex flex-col items-center text-center">
              <p className="text-sm font-medium text-white/85">
                {t("results.first")}
                <span className="mx-2 text-sky-200/40">·</span>
                <span className="text-amber-300">{price(prizes.first)}</span>
              </p>
              {firstNumber ? (
                <div className="mt-5">
                  <TicketNumber value={firstNumber} size="hero" tone="onDark" />
                </div>
              ) : null}
            </div>
          </section>

          {nearNumbers.length > 0 ? (
            <section
              className={cn(
                "grid gap-3",
                nearNumbers.length === 1 ? "grid-cols-1" : "grid-cols-2"
              )}
            >
              {nearNumbers.map((number) => (
                <div
                  key={number}
                  className="rounded-2xl border border-amber-400/30 bg-amber-50/80 px-4 py-4 text-center"
                >
                  <p className="text-xs font-medium text-amber-900/70 sm:text-sm">
                    {t("results.near")} · {price(prizes.near1)}
                  </p>
                  <div className="mt-2">
                    <TicketNumber value={number} size="md" />
                  </div>
                </div>
              ))}
            </section>
          ) : null}

          <div className="flex flex-col gap-2">
            {disclosures.map((item) => {
              if (item.count === 0) return null
              return (
                <PrizeDisclosure
                  key={item.id}
                  id={`${draw.id}-${item.id}`}
                  title={item.title}
                  priceLabel={item.priceLabel}
                  count={item.count}
                  open={openIds.has(item.id)}
                  onToggle={() => toggle(item.id)}
                >
                  {item.body}
                </PrizeDisclosure>
              )
            })}
          </div>
        </div>
      ) : null}
    </article>
  )
}

export type TicketCheckPrize =
  | "first"
  | "near"
  | "second"
  | "third"
  | "fourth"
  | "fifth"
  | "last3"
  | "last2"

/** Check a 6-digit ticket against one draw's published prizes. */
export function checkTicketAgainstDraw(draw: Draw, rawNumber: string): TicketCheckPrize | "none" | null {
  const number = rawNumber.replace(/\D/g, "")
  if (number.length !== 6) return null
  const prizes = draw.results?.prizes
  if (!prizes) return null

  if (prizes.first.numbers.includes(number)) return "first"
  if (prizes.near1.numbers.includes(number)) return "near"
  if (prizes.second.numbers.includes(number)) return "second"
  if (prizes.third.numbers.includes(number)) return "third"
  if (prizes.fourth.numbers.includes(number)) return "fourth"
  if (prizes.fifth.numbers.includes(number)) return "fifth"
  if (prizes.last3Front.numbers.includes(number.slice(0, 3))) return "last3"
  if (prizes.last3Back.numbers.includes(number.slice(3))) return "last3"
  if (prizes.last2.numbers.includes(number.slice(4))) return "last2"
  return "none"
}
