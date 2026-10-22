import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { customerApi } from "@/features/customer/api"
import { useI18n } from "@/features/preferences/i18n-provider"
import { ApiError, getApiErrorMessage } from "@/lib/api"
import { formatDay, formatMoney } from "@/lib/format"
import type { TicketOffer, TicketPurchase, UserBalance } from "@/lib/types"
import { Link, useNavigate } from "@tanstack/react-router"
import { ArrowLeft, Minus, PartyPopper, Plus } from "lucide-react"
import { useCallback, useEffect, useMemo, useState } from "react"

const CONFETTI = [
  { dx: "-4.5rem", dy: "-5.5rem", color: "#4b8fff", delay: "0ms" },
  { dx: "4.2rem", dy: "-5.2rem", color: "#f6d27a", delay: "40ms" },
  { dx: "-5.2rem", dy: "-2.2rem", color: "#e07a5f", delay: "80ms" },
  { dx: "5rem", dy: "-2.4rem", color: "#34d399", delay: "120ms" },
  { dx: "-3.2rem", dy: "-6.4rem", color: "#a78bfa", delay: "160ms" },
  { dx: "3.4rem", dy: "-6.2rem", color: "#fb7185", delay: "200ms" },
  { dx: "-5.8rem", dy: "-4rem", color: "#38bdf8", delay: "240ms" },
  { dx: "5.6rem", dy: "-3.8rem", color: "#fbbf24", delay: "280ms" },
  { dx: "0rem", dy: "-7rem", color: "#60a5fa", delay: "100ms" },
  { dx: "-1.8rem", dy: "-6.8rem", color: "#f472b6", delay: "140ms" },
  { dx: "1.8rem", dy: "-6.8rem", color: "#4ade80", delay: "180ms" },
  { dx: "-4rem", dy: "-1rem", color: "#facc15", delay: "220ms" },
] as const

export function TicketDetailPage({ ticketId }: { ticketId: string }) {
  const { t, dateLocale } = useI18n()
  const navigate = useNavigate()
  const [ticket, setTicket] = useState<TicketOffer | null>(null)
  const [balances, setBalances] = useState<UserBalance[]>([])
  const [walletId, setWalletId] = useState("")
  const [quantity, setQuantity] = useState(1)
  const [loading, setLoading] = useState(true)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [purchase, setPurchase] = useState<TicketPurchase | null>(null)
  const [congratsOpen, setCongratsOpen] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [offer, balanceList] = await Promise.all([customerApi.ticket(ticketId), customerApi.balances()])
      setTicket(offer)
      setBalances(balanceList)
      setWalletId((current) => {
        if (current && offer.prices.some((price) => price.walletId === current)) return current
        return offer.prices[0]?.walletId ?? ""
      })
      setQuantity(1)
    } catch (cause) {
      if (cause instanceof ApiError && cause.status === 401) {
        await navigate({ to: "/login" })
        return
      }
      setTicket(null)
      setError(getApiErrorMessage(cause, t("somethingWrong")))
    } finally {
      setLoading(false)
    }
  }, [navigate, t, ticketId])

  useEffect(() => {
    void load()
  }, [load])

  const selectedPrice = useMemo(
    () => ticket?.prices.find((price) => price.walletId === walletId),
    [ticket, walletId]
  )
  const selectedBalance = balances.find((item) => item.wallet.id === walletId)
  const maxQty = Math.max(ticket?.quantity ?? 0, 0)
  const total = selectedPrice ? Number(selectedPrice.price) * quantity : 0

  function changeQty(next: number) {
    setQuantity(Math.min(Math.max(maxQty, 1), Math.max(1, next)))
  }

  async function buy() {
    if (!ticket || !walletId || !selectedPrice) {
      setError(t("tickets.chooseWallet"))
      return
    }
    if (quantity < 1 || quantity > maxQty) {
      setError(t("tickets.validQuantity"))
      return
    }

    setPending(true)
    setError(null)
    try {
      const purchasedQty = quantity
      const result = await customerApi.purchaseTicket({
        ticketId: ticket.id,
        walletId,
        quantity: purchasedQty,
      })
      setPurchase(result)
      setTicket((current) =>
        current ? { ...current, quantity: Math.max(0, current.quantity - purchasedQty) } : current
      )
      setQuantity(1)
      setCongratsOpen(true)
      try {
        setBalances(await customerApi.balances())
      } catch {
        // Keep the success modal even if balance refresh fails.
      }
    } catch (cause) {
      if (cause instanceof ApiError && cause.status === 401) {
        await navigate({ to: "/login" })
        return
      }
      setCongratsOpen(false)
      setPurchase(null)
      setError(getApiErrorMessage(cause, t("somethingWrong")))
    } finally {
      setPending(false)
    }
  }

  const celebrationNumber = purchase?.number ?? ticket?.number ?? "—"
  const celebrationQty = purchase?.quantity ?? 1

  return (
    <div className="space-y-4">
      <header className="flex items-center gap-3">
        <Link
          to="/tickets"
          aria-label={t("tickets.back")}
          className="inline-flex size-10 items-center justify-center rounded-xl border border-border bg-transparent hover:bg-muted"
        >
          <ArrowLeft className="size-4" />
        </Link>
        <div className="min-w-0">
          <h1 className="font-heading text-2xl font-semibold tracking-tight">{t("tickets.detailTitle")}</h1>
          <p className="truncate text-sm text-muted-foreground">{ticket?.draw?.name ?? t("tickets.buyHint")}</p>
        </div>
      </header>

      {error && !congratsOpen ? (
        <div role="alert" className="rounded-3xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      ) : null}

      {loading ? (
        <p className="py-16 text-center text-sm text-muted-foreground">{t("loading")}</p>
      ) : ticket ? (
        <>
          <section className="rounded-[1.7rem] border border-border/80 bg-card/95 p-5 shadow-sm">
            <p className="text-sm text-muted-foreground">{t("tickets.number")}</p>
            <p className="mt-2 font-heading text-4xl font-semibold tracking-[0.22em]">{ticket.number}</p>
            <dl className="mt-5 grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-2xl bg-muted/50 px-3 py-3">
                <dt className="text-xs text-muted-foreground">{t("tickets.packSize")}</dt>
                <dd className="mt-1 font-semibold">{ticket.packSize}</dd>
              </div>
              <div className="rounded-2xl bg-muted/50 px-3 py-3">
                <dt className="text-xs text-muted-foreground">{t("tickets.stock")}</dt>
                <dd className="mt-1 font-semibold">{ticket.quantity}</dd>
              </div>
              <div className="col-span-2 rounded-2xl bg-muted/50 px-3 py-3">
                <dt className="text-xs text-muted-foreground">{t("tickets.draw")}</dt>
                <dd className="mt-1 font-semibold">
                  {ticket.draw?.name ?? "—"}
                  {ticket.draw?.drawDate ? ` · ${formatDay(ticket.draw.drawDate, dateLocale)}` : ""}
                </dd>
              </div>
            </dl>
          </section>

          <section className="space-y-3 rounded-[1.6rem] border border-border/80 bg-card/95 p-4 shadow-sm">
            <div>
              <p className="text-sm font-semibold">{t("tickets.payWith")}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">{t("tickets.payWithHint")}</p>
            </div>
            {ticket.prices.length ? (
              <div className="space-y-2">
                {ticket.prices.map((price) => {
                  const balance = balances.find((item) => item.wallet.id === price.walletId)
                  const active = walletId === price.walletId
                  return (
                    <button
                      key={price.walletId}
                      type="button"
                      onClick={() => setWalletId(price.walletId)}
                      className={`flex w-full items-center justify-between gap-3 rounded-2xl border px-3.5 py-3 text-left transition-colors ${
                        active ? "border-primary bg-primary/10" : "border-border/80 bg-background/70 hover:bg-muted/50"
                      }`}
                    >
                      <div>
                        <p className="text-sm font-semibold">{price.walletName}</p>
                        <p className="text-xs text-muted-foreground">
                          {t("tickets.availableBalance", {
                            amount: balance ? formatMoney(balance.balance, price.currency) : "—",
                          })}
                        </p>
                      </div>
                      <p className="text-sm font-semibold text-primary">{formatMoney(price.price, price.currency)}</p>
                    </button>
                  )
                })}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">{t("tickets.noPrice")}</p>
            )}
          </section>

          <section className="space-y-3 rounded-[1.6rem] border border-border/80 bg-card/95 p-4 shadow-sm">
            <p className="text-sm font-semibold">{t("tickets.quantity")}</p>
            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="rounded-xl"
                disabled={quantity <= 1}
                onClick={() => changeQty(quantity - 1)}
                aria-label={t("tickets.decrease")}
              >
                <Minus className="size-4" />
              </Button>
              <Input
                type="number"
                min={1}
                max={maxQty}
                value={quantity}
                onChange={(event) => changeQty(Number(event.target.value) || 1)}
                className="text-center font-semibold"
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="rounded-xl"
                disabled={quantity >= maxQty}
                onClick={() => changeQty(quantity + 1)}
                aria-label={t("tickets.increase")}
              >
                <Plus className="size-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">{t("tickets.maxStock", { stock: String(maxQty) })}</p>
            <div className="flex items-center justify-between rounded-2xl bg-muted/50 px-3.5 py-3">
              <span className="text-sm text-muted-foreground">{t("tickets.total")}</span>
              <span className="text-base font-semibold">
                {selectedPrice ? formatMoney(total, selectedPrice.currency) : "—"}
              </span>
            </div>
            {selectedBalance && selectedPrice && Number(selectedBalance.balance) < total ? (
              <p className="text-xs text-destructive">{t("tickets.insufficientBalance")}</p>
            ) : null}
            <Button className="h-12 w-full rounded-xl" disabled={pending || !selectedPrice || ticket.quantity < 1} onClick={() => void buy()}>
              {pending ? t("tickets.buying") : t("tickets.confirmBuy")}
            </Button>
          </section>
        </>
      ) : (
        <div className="rounded-[1.4rem] bg-muted/50 px-4 py-10 text-center text-sm text-muted-foreground">{t("tickets.notFound")}</div>
      )}

      <Dialog open={congratsOpen} onOpenChange={setCongratsOpen}>
        <DialogContent
          showCloseButton={false}
          className="congrats-pop max-w-sm gap-0 overflow-hidden rounded-[1.8rem] border-border/80 p-0 sm:max-w-sm"
        >
          <div className="relative overflow-hidden px-6 pt-8 pb-6 text-center">
            <div className="pointer-events-none absolute inset-0" aria-hidden>
              {CONFETTI.map((piece, index) => (
                <span
                  key={index}
                  className="congrats-burst"
                  style={{
                    backgroundColor: piece.color,
                    animationDelay: piece.delay,
                    ["--dx" as string]: piece.dx,
                    ["--dy" as string]: piece.dy,
                  }}
                />
              ))}
            </div>

            <div className="congrats-shine relative mx-auto flex size-16 items-center justify-center rounded-full bg-primary/15 text-primary">
              <PartyPopper className="size-8" />
            </div>

            <DialogHeader className="relative mt-5 items-center text-center">
              <DialogTitle className="normal-case tracking-tight">{t("tickets.congratsTitle")}</DialogTitle>
              <DialogDescription className="mt-1 text-center">{t("tickets.congratsSubtitle")}</DialogDescription>
            </DialogHeader>

            <div className="relative mt-6 rounded-[1.4rem] border border-primary/20 bg-primary/5 px-4 py-5">
              <p className="text-xs font-medium text-muted-foreground">{t("tickets.number")}</p>
              <p className="mt-2 font-heading text-3xl font-semibold tracking-[0.22em] text-primary">
                {celebrationNumber}
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                {t("tickets.qtyPacks", { qty: String(celebrationQty) })}
                {purchase?.totalAmount
                  ? ` · ${formatMoney(purchase.totalAmount, purchase.wallet?.currency)}`
                  : ""}
              </p>
            </div>

            <div className="relative mt-6 grid gap-2">
              <Button
                className="h-11 w-full rounded-xl"
                onClick={() => {
                  setCongratsOpen(false)
                  void navigate({ to: "/tickets" })
                }}
              >
                {t("tickets.viewPurchases")}
              </Button>
              <Button variant="outline" className="h-11 w-full rounded-xl" onClick={() => setCongratsOpen(false)}>
                {t("tickets.keepBuying")}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
