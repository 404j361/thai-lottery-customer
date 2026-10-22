import { Button } from "@/components/ui/button"
import { customerApi } from "@/features/customer/api"
import { useI18n } from "@/features/preferences/i18n-provider"
import { getApiErrorMessage } from "@/lib/api"
import { formatDate, formatMoney, statusClass, statusMessageKey, typeMessageKey } from "@/lib/format"
import type { TransactionStatus, TransactionType, WalletTransaction } from "@/lib/types"
import { RefreshCw } from "lucide-react"
import { useCallback, useEffect, useMemo, useState } from "react"

export function HistoryPage() {
  const { t, dateLocale } = useI18n()
  const [items, setItems] = useState<WalletTransaction[]>([])
  const [type, setType] = useState<"" | TransactionType>("")
  const [status, setStatus] = useState<"" | TransactionStatus>("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selected, setSelected] = useState<WalletTransaction | null>(null)

  const typeFilters = useMemo(
    () =>
      [
        { value: "" as const, label: t("history.all") },
        { value: "DEPOSIT" as const, label: t("type.DEPOSIT") },
        { value: "WITHDRAW" as const, label: t("type.WITHDRAW") },
      ] as const,
    [t]
  )

  const statusFilters = useMemo(
    () =>
      [
        { value: "" as const, label: t("history.anyStatus") },
        { value: "PENDING" as const, label: t("status.PENDING") },
        { value: "APPROVED" as const, label: t("status.APPROVED") },
        { value: "REJECTED" as const, label: t("status.REJECTED") },
      ] as const,
    [t]
  )

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const list = await customerApi.transactions({
        type: type || undefined,
        status: status || undefined,
      })
      setItems(list)
    } catch (cause) {
      setError(getApiErrorMessage(cause, t("somethingWrong")))
    } finally {
      setLoading(false)
    }
  }, [status, t, type])

  useEffect(() => {
    void load()
  }, [load])

  return (
    <div className="space-y-5">
      <header className="flex items-start justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-semibold tracking-tight">{t("history.title")}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{t("history.subtitle")}</p>
        </div>
        <Button variant="outline" size="icon" className="rounded-xl" onClick={() => void load()} disabled={loading} aria-label={t("refresh")}>
          <RefreshCw className={`size-4 ${loading ? "animate-spin" : ""}`} />
        </Button>
      </header>

      <div className="flex flex-wrap gap-2">
        {typeFilters.map((item) => (
          <button
            key={item.label}
            type="button"
            onClick={() => setType(item.value)}
            className={`rounded-full px-3 py-1.5 text-xs font-medium ${
              type === item.value ? "bg-primary text-primary-foreground" : "border bg-card text-muted-foreground"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>
      <select
        className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm"
        value={status}
        onChange={(event) => setStatus(event.target.value as "" | TransactionStatus)}
      >
        {statusFilters.map((item) => (
          <option key={item.label} value={item.value}>
            {item.label}
          </option>
        ))}
      </select>

      {error ? (
        <div role="alert" className="rounded-2xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      ) : null}

      <section className="rounded-3xl border bg-card">
        {loading ? (
          <p className="p-6 text-center text-sm text-muted-foreground">{t("history.loading")}</p>
        ) : items.length ? (
          <div className="divide-y">
            {items.map((tx) => (
              <button
                key={tx.id}
                type="button"
                onClick={() => setSelected(tx)}
                className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-muted/40"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">
                    {t(typeMessageKey(tx.type))} · {formatMoney(tx.amount, tx.wallet.currency)}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">{formatDate(tx.createdAt, dateLocale)}</p>
                </div>
                <span className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${statusClass(tx.status)}`}>
                  {t(statusMessageKey(tx.status))}
                </span>
              </button>
            ))}
          </div>
        ) : (
          <p className="p-6 text-center text-sm text-muted-foreground">{t("history.empty")}</p>
        )}
      </section>

      {selected ? (
        <div className="fixed inset-0 z-40 flex items-end bg-black/40 p-4 sm:items-center sm:justify-center">
          <button type="button" className="absolute inset-0" aria-label={t("close")} onClick={() => setSelected(null)} />
          <div className="relative z-10 w-full max-w-md rounded-3xl border bg-background p-5 shadow-xl">
            <h2 className="font-heading text-lg font-semibold">
              {t("history.details", { type: t(typeMessageKey(selected.type)) })}
            </h2>
            <dl className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between gap-3">
                <dt className="text-muted-foreground">{t("history.amount")}</dt>
                <dd className="font-medium">{formatMoney(selected.amount, selected.wallet.currency)}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-muted-foreground">{t("history.status")}</dt>
                <dd>
                  <span className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${statusClass(selected.status)}`}>
                    {t(statusMessageKey(selected.status))}
                  </span>
                </dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-muted-foreground">{t("history.when")}</dt>
                <dd>{formatDate(selected.createdAt, dateLocale)}</dd>
              </div>
              {selected.reference ? (
                <div className="flex justify-between gap-3">
                  <dt className="text-muted-foreground">{t("history.reference")}</dt>
                  <dd className="text-right">{selected.reference}</dd>
                </div>
              ) : null}
              {selected.rejectReason ? (
                <div className="rounded-xl bg-destructive/5 px-3 py-2 text-destructive">
                  {t("history.reason", { reason: selected.rejectReason })}
                </div>
              ) : null}
              {selected.destBankName ? (
                <div className="rounded-xl bg-muted/60 px-3 py-2 text-xs">
                  {t("history.toBank", {
                    bank: selected.destBankName,
                    account: selected.destAccountNumber ?? "",
                  })}
                  <br />
                  {selected.destAccountName}
                </div>
              ) : null}
              {selected.receiptUrl ? (
                <a href={selected.receiptUrl} target="_blank" rel="noreferrer" className="block text-primary underline-offset-4 hover:underline">
                  {t("history.viewReceipt")}
                </a>
              ) : null}
            </dl>
            <Button className="mt-5 h-11 w-full rounded-xl text-sm font-medium tracking-normal normal-case" onClick={() => setSelected(null)}>
              {t("close")}
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  )
}
