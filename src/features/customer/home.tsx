import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { customerApi } from "@/features/customer/api"
import { TicketOfferGrid } from "@/features/customer/ticket-offer-grid"
import { WaveBackdrop } from "@/features/customer/wave-backdrop"
import { getSession } from "@/features/auth/session"
import { useI18n } from "@/features/preferences/i18n-provider"
import { getApiErrorMessage } from "@/lib/api"
import { formatDate, formatMoney, statusClass, statusMessageKey, typeMessageKey } from "@/lib/format"
import type { TicketOffer, UserBalance, UserProfile, WalletTransaction } from "@/lib/types"
import { Link } from "@tanstack/react-router"
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  Building2,
  Clock3,
  Eye,
  EyeOff,
  RefreshCw,
  Ticket,
  Trophy,
} from "lucide-react"
import { useCallback, useEffect, useMemo, useState } from "react"

export function HomePage() {
  const { t, dateLocale } = useI18n()
  const session = getSession()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [balances, setBalances] = useState<UserBalance[]>([])
  const [tickets, setTickets] = useState<TicketOffer[]>([])
  const [recent, setRecent] = useState<WalletTransaction[]>([])
  const [loading, setLoading] = useState(true)
  const [historyOpen, setHistoryOpen] = useState(false)
  const [historyLoading, setHistoryLoading] = useState(false)
  const [historyError, setHistoryError] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [hidden, setHidden] = useState(false)
  const [walletIndex, setWalletIndex] = useState(0)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [userProfile, balanceList, ticketList] = await Promise.all([
        customerApi.profile(),
        customerApi.balances(),
        customerApi.tickets(),
      ])
      setProfile(userProfile)
      setBalances(balanceList)
      setTickets(ticketList.slice(0, 6))
      setWalletIndex(0)
    } catch (cause) {
      setError(getApiErrorMessage(cause, t("somethingWrong")))
    } finally {
      setLoading(false)
    }
  }, [t])

  const loadHistory = useCallback(async () => {
    setHistoryLoading(true)
    setHistoryError(null)
    try {
      const transactions = await customerApi.transactions()
      setRecent(transactions.slice(0, 8))
    } catch (cause) {
      setHistoryError(getApiErrorMessage(cause, t("somethingWrong")))
    } finally {
      setHistoryLoading(false)
    }
  }, [t])

  useEffect(() => {
    void load()
  }, [load])

  useEffect(() => {
    if (historyOpen) void loadHistory()
  }, [historyOpen, loadHistory])

  const activeBalance = balances.length > 0 ? balances[Math.min(walletIndex, balances.length - 1)] : undefined
  const greeting = useMemo(() => {
    const hour = new Date().getHours()
    if (hour < 12) return t("home.goodMorning")
    if (hour < 18) return t("home.goodAfternoon")
    return t("home.goodEvening")
  }, [t])

  const displayName =
    [profile?.firstName, profile?.lastName].filter(Boolean).join(" ").trim() ||
    session?.name?.trim() ||
    profile?.email ||
    session?.email ||
    t("myWallet")

  const actions = [
    { to: "/tickets" as const, label: t("home.buyTickets"), icon: Ticket },
    { to: "/results" as const, label: t("home.results"), icon: Trophy },
    { to: "/deposit" as const, label: t("home.topUp"), icon: ArrowDownToLine },
    { to: "/withdraw" as const, label: t("home.cashOut"), icon: ArrowUpFromLine },
    { to: "/bank" as const, label: t("home.bankShort"), icon: Building2 },
  ]

  return (
    <div className="space-y-4">
      <header className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-1">
          <span className="flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-2xl">
            <img
              src="/brand/pyit-tine-htaung.png"
              alt={t("appName")}
              className="size-10"
            />
          </span>
          <div className="min-w-0">
            <p className="text-sm font-medium text-muted-foreground">{greeting}</p>
            <p className="truncate text-base font-semibold tracking-tight">{displayName}</p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            className="rounded-2xl border-border/80 bg-card/90 backdrop-blur transition-transform duration-150 ease-out active:scale-90"
            onClick={() => setHistoryOpen(true)}
            aria-label={t("home.recent")}
          >
            <Clock3 className="size-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="rounded-2xl border-border/80 bg-card/90 backdrop-blur transition-transform duration-150 ease-out active:scale-90"
            onClick={() => void load()}
            disabled={loading}
            aria-label={t("refresh")}
          >
            <RefreshCw className={`size-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </header>

      {error ? (
        <div role="alert" className="rounded-3xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          <p>{error}</p>
          <Button size="sm" variant="outline" className="mt-3 rounded-xl" onClick={() => void load()}>
            {t("tryAgain")}
          </Button>
        </div>
      ) : null}

      <section className="wave-card relative overflow-hidden rounded-[1.7rem] p-5 text-white">
        <WaveBackdrop />
        <div className="relative z-10">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm text-white/80">
              {activeBalance ? `${t("home.walletBalance")} (${activeBalance.wallet.currency})` : t("home.walletBalance")}
            </p>
            <button
              type="button"
              className="rounded-full p-1.5 text-white/80 transition-colors hover:bg-white/10 hover:text-white"
              onClick={() => setHidden((value) => !value)}
              aria-label={hidden ? t("home.showBalance") : t("home.hideBalance")}
            >
              {hidden ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>

          {loading ? (
            <p className="mt-5 text-3xl font-semibold tracking-tight">••••</p>
          ) : activeBalance ? (
            <>
              <p className="mt-4 font-heading text-[2.1rem] leading-none font-semibold tracking-tight">
                {hidden ? "••••••" : formatMoney(activeBalance.balance)}
              </p>
              <p className="mt-3 text-sm text-white/75">
                {t("home.totalBalance")} ({activeBalance.wallet.currency}):{" "}
                {hidden ? "••••" : formatMoney(activeBalance.balance)}
              </p>
            </>
          ) : (
            <p className="mt-5 text-sm text-white/80">{t("home.noWallets")}</p>
          )}

          {balances.length > 1 ? (
            <div className="mt-4 flex gap-2">
              {balances.map((item, index) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setWalletIndex(index)}
                  className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                    index === walletIndex ? "bg-white text-primary" : "bg-white/15 text-white"
                  }`}
                >
                  {item.wallet.currency}
                </button>
              ))}
            </div>
          ) : null}
        </div>
      </section>

      <section className="rounded-[1.6rem] border border-border/80 bg-card/95 p-3 shadow-sm backdrop-blur">
        <div className="grid grid-cols-5 gap-0.5">
          {actions.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              className="flex flex-col items-center gap-2 rounded-2xl px-0.5 py-3 text-center transition-transform duration-150 ease-out hover:bg-muted/70 active:scale-90"
            >
              <span className="flex size-11 items-center justify-center rounded-full bg-primary/10 text-primary sm:size-12">
                <Icon className="size-5" />
              </span>
              <span className="text-[11px] font-medium sm:text-xs">{label}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="rounded-[1.6rem] border border-border/80 bg-card/95 p-4 shadow-sm backdrop-blur">
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 className="text-base font-semibold tracking-tight">{t("home.tickets")}</h2>
          <Link to="/tickets" className="text-xs font-semibold text-primary">
            {t("home.seeAll")}
          </Link>
        </div>
        {loading ? (
          <p className="py-8 text-center text-sm text-muted-foreground">{t("loading")}</p>
        ) : tickets.length ? (
          <TicketOfferGrid tickets={tickets} />
        ) : (
          <div className="rounded-2xl bg-muted/50 px-4 py-8 text-center">
            <p className="text-sm text-muted-foreground">{t("home.noTickets")}</p>
            <Link
              to="/tickets"
              className="mt-3 inline-flex h-10 items-center justify-center rounded-xl bg-primary px-4 text-sm font-medium text-primary-foreground"
            >
              {t("home.buyTickets")}
            </Link>
          </div>
        )}
      </section>

      <Dialog open={historyOpen} onOpenChange={setHistoryOpen}>
        <DialogContent
          showCloseButton
          className="top-auto bottom-0 left-1/2 max-h-[min(85dvh,40rem)] w-full max-w-lg translate-x-[-50%] translate-y-0 gap-4 rounded-t-[1.6rem] rounded-b-none p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] data-open:slide-in-from-bottom-4 data-closed:slide-out-to-bottom-4 data-open:zoom-in-100 data-closed:zoom-out-100"
        >
          <DialogHeader className="pr-10">
            <DialogTitle className="normal-case tracking-tight">{t("home.recent")}</DialogTitle>
            <DialogDescription>{t("home.recentHint")}</DialogDescription>
          </DialogHeader>

          <div className="min-h-0 flex-1 overflow-y-auto">
            {historyLoading ? (
              <p className="py-10 text-center text-sm text-muted-foreground">{t("loading")}</p>
            ) : historyError ? (
              <div className="rounded-2xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                <p>{historyError}</p>
                <Button size="sm" variant="outline" className="mt-3 rounded-xl" onClick={() => void loadHistory()}>
                  {t("tryAgain")}
                </Button>
              </div>
            ) : recent.length ? (
              <div className="divide-y divide-border/70">
                {recent.map((tx) => (
                  <div key={tx.id} className="flex items-center gap-3 py-3">
                    <span
                      className={`flex size-10 shrink-0 items-center justify-center rounded-full ${
                        tx.type === "DEPOSIT" ? "bg-emerald-500/10 text-emerald-600" : "bg-sky-500/10 text-sky-600"
                      }`}
                    >
                      {tx.type === "DEPOSIT" ? <ArrowDownToLine className="size-4" /> : <ArrowUpFromLine className="size-4" />}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">
                        {t(typeMessageKey(tx.type))} · {formatMoney(tx.amount, tx.wallet.currency)}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">{formatDate(tx.createdAt, dateLocale)}</p>
                    </div>
                    <span className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${statusClass(tx.status)}`}>
                      {t(statusMessageKey(tx.status))}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl bg-muted/50 px-4 py-8 text-center">
                <p className="text-sm text-muted-foreground">{t("home.noTx")}</p>
              </div>
            )}
          </div>

          <Link
            to="/history"
            onClick={() => setHistoryOpen(false)}
            className="inline-flex h-11 w-full items-center justify-center rounded-xl bg-primary text-sm font-semibold text-primary-foreground"
          >
            {t("home.seeAllHistory")}
          </Link>
        </DialogContent>
      </Dialog>
    </div>
  )
}
