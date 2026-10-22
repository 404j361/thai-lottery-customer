import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { customerApi } from "@/features/customer/api"
import { DrawCountdownCard } from "@/features/customer/draw-countdown-card"
import { TicketOfferGrid } from "@/features/customer/ticket-offer-grid"
import { useI18n } from "@/features/preferences/i18n-provider"
import { getApiErrorMessage } from "@/lib/api"
import { formatDay, formatMoney, purchaseStatusClass, purchaseStatusMessageKey } from "@/lib/format"
import type { Draw, TicketOffer, TicketPurchase } from "@/lib/types"
import { RefreshCw, Search, Ticket, Trophy } from "lucide-react"
import { useCallback, useEffect, useMemo, useState } from "react"

type Tab = "shop" | "mine" | "won"

export function TicketsPage() {
  const { t, dateLocale } = useI18n()
  const [tab, setTab] = useState<Tab>("shop")
  const [draws, setDraws] = useState<Draw[]>([])
  const [tickets, setTickets] = useState<TicketOffer[]>([])
  const [purchases, setPurchases] = useState<TicketPurchase[]>([])
  const [winnings, setWinnings] = useState<TicketPurchase[]>([])
  const [drawId, setDrawId] = useState("")
  const [number, setNumber] = useState("")
  const [appliedNumber, setAppliedNumber] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const tabs = useMemo(
    () =>
      [
        { id: "shop" as const, label: t("tickets.shop") },
        { id: "mine" as const, label: t("tickets.mine") },
        { id: "won" as const, label: t("tickets.won") },
      ] as const,
    [t]
  )

  const loadShop = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const drawList = await customerApi.draws("OPEN")
      setDraws(drawList)
      const selected = drawId && drawList.some((item) => item.id === drawId) ? drawId : drawList[0]?.id || ""
      if (selected !== drawId) setDrawId(selected)
      setTickets(
        await customerApi.tickets({
          drawId: selected || undefined,
          number: appliedNumber.trim() || undefined,
        })
      )
    } catch (cause) {
      setError(getApiErrorMessage(cause, t("somethingWrong")))
    } finally {
      setLoading(false)
    }
  }, [appliedNumber, drawId, t])

  const loadPurchases = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      setPurchases(await customerApi.purchases())
    } catch (cause) {
      setError(getApiErrorMessage(cause, t("somethingWrong")))
    } finally {
      setLoading(false)
    }
  }, [t])

  const loadWinnings = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      setWinnings(await customerApi.winningTickets())
    } catch (cause) {
      setError(getApiErrorMessage(cause, t("somethingWrong")))
    } finally {
      setLoading(false)
    }
  }, [t])

  useEffect(() => {
    if (tab === "shop") void loadShop()
    else if (tab === "mine") void loadPurchases()
    else void loadWinnings()
  }, [loadPurchases, loadShop, loadWinnings, tab])

  function refresh() {
    if (tab === "shop") void loadShop()
    else if (tab === "mine") void loadPurchases()
    else void loadWinnings()
  }

  return (
    <div className="space-y-4">
      <header className="flex items-start justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-semibold tracking-tight">{t("tickets.title")}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{t("tickets.subtitle")}</p>
        </div>
        <Button variant="outline" size="icon" className="rounded-xl" onClick={refresh} disabled={loading} aria-label={t("refresh")}>
          <RefreshCw className={`size-4 ${loading ? "animate-spin" : ""}`} />
        </Button>
      </header>

      <div className="grid grid-cols-3 gap-1 rounded-[1.4rem] border border-border/80 bg-card/95 p-1.5 shadow-sm">
        {tabs.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setTab(item.id)}
            className={`rounded-xl px-2 py-2.5 text-xs font-semibold transition-colors ${
              tab === item.id ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:bg-muted/70"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {error ? (
        <div role="alert" className="rounded-3xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          <p>{error}</p>
          <Button size="sm" variant="outline" className="mt-3 rounded-xl" onClick={refresh}>
            {t("tryAgain")}
          </Button>
        </div>
      ) : null}

      {tab === "shop" ? (
        <ShopPanel
          draws={draws}
          drawId={drawId}
          onDrawId={setDrawId}
          number={number}
          onNumber={setNumber}
          tickets={tickets}
          loading={loading}
          dateLocale={dateLocale}
          onSearch={() => setAppliedNumber(number.trim())}
        />
      ) : null}

      {tab === "mine" ? (
        <PurchaseList items={purchases} loading={loading} empty={t("tickets.noPurchases")} dateLocale={dateLocale} />
      ) : null}

      {tab === "won" ? (
        <PurchaseList items={winnings} loading={loading} empty={t("tickets.noWinnings")} dateLocale={dateLocale} winnerEmphasis />
      ) : null}
    </div>
  )
}

function ShopPanel({
  draws,
  drawId,
  onDrawId,
  number,
  onNumber,
  tickets,
  loading,
  dateLocale,
  onSearch,
}: {
  draws: Draw[]
  drawId: string
  onDrawId: (value: string) => void
  number: string
  onNumber: (value: string) => void
  tickets: TicketOffer[]
  loading: boolean
  dateLocale: string
  onSearch: () => void
}) {
  const { t } = useI18n()

  return (
    <div className="space-y-4">
      <DrawCountdownCard draws={draws} drawId={drawId} onDrawId={onDrawId} dateLocale={dateLocale} />

      <section className="rounded-[1.6rem] border border-border/80 bg-card/95 p-3 shadow-sm">
        <label className="relative block min-w-0">
          <Input
            value={number}
            onChange={(event) => onNumber(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") onSearch()
            }}
            placeholder={t("tickets.numberPlaceholder")}
            className="pr-12"
            inputMode="numeric"
          />
          <button
            type="button"
            onClick={onSearch}
            aria-label={t("tickets.search")}
            className="absolute top-1/2 right-1.5 flex size-9 -translate-y-1/2 items-center justify-center rounded-lg bg-primary text-primary-foreground transition-opacity hover:opacity-90"
          >
            <Search className="size-4" />
          </button>
        </label>
      </section>

      <section className="space-y-3">
        <div className="flex items-baseline justify-between gap-3">
          <h2 className="text-base font-semibold tracking-tight">{t("tickets.available")}</h2>
          {!loading && tickets.length ? (
            <p className="text-xs text-muted-foreground">{t("tickets.count", { count: String(tickets.length) })}</p>
          ) : null}
        </div>
        {loading ? (
          <p className="py-10 text-center text-sm text-muted-foreground">{t("loading")}</p>
        ) : tickets.length ? (
          <TicketOfferGrid tickets={tickets} />
        ) : (
          <div className="rounded-[1.4rem] bg-muted/50 px-4 py-10 text-center text-sm text-muted-foreground">
            {t("tickets.noTickets")}
          </div>
        )}
      </section>
    </div>
  )
}

function PurchaseList({
  items,
  loading,
  empty,
  dateLocale,
  winnerEmphasis = false,
}: {
  items: TicketPurchase[]
  loading: boolean
  empty: string
  dateLocale: string
  winnerEmphasis?: boolean
}) {
  const { t } = useI18n()

  if (loading) return <p className="py-10 text-center text-sm text-muted-foreground">{t("loading")}</p>
  if (!items.length) {
    return <div className="rounded-[1.4rem] bg-muted/50 px-4 py-10 text-center text-sm text-muted-foreground">{empty}</div>
  }

  return (
    <div className="space-y-2">
      {items.map((item) => (
        <article
          key={item.id}
          className={`rounded-[1.4rem] border px-4 py-3.5 shadow-sm ${
            item.isWinner || winnerEmphasis
              ? "border-amber-400/50 bg-amber-50/80 dark:bg-amber-500/10"
              : "border-border/80 bg-card/95"
          }`}
        >
          <div className="flex items-start gap-3">
            <span
              className={`flex size-11 shrink-0 items-center justify-center rounded-2xl ${
                item.isWinner ? "bg-amber-500/15 text-amber-700" : "bg-primary/10 text-primary"
              }`}
            >
              {item.isWinner ? <Trophy className="size-5" /> : <Ticket className="size-5" />}
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <p className="font-heading text-xl font-semibold tracking-[0.18em]">{item.number}</p>
                <span className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${purchaseStatusClass(item.status)}`}>
                  {t(purchaseStatusMessageKey(item.status))}
                </span>
              </div>
              <p className="mt-1 text-sm font-medium">
                {formatMoney(item.totalAmount, item.wallet?.currency)} · {t("tickets.qtyPacks", { qty: String(item.quantity) })}
              </p>
              <p className="mt-0.5 truncate text-xs text-muted-foreground">
                {item.draw?.name ?? t("tickets.draw")} · {formatDay(item.createdAt, dateLocale)}
              </p>
              {item.isWinner ? <p className="mt-2 text-xs font-semibold text-amber-700 dark:text-amber-300">{t("tickets.winner")}</p> : null}
            </div>
          </div>
        </article>
      ))}
    </div>
  )
}
