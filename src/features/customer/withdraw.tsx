import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { customerApi } from "@/features/customer/api"
import { useI18n } from "@/features/preferences/i18n-provider"
import { getApiErrorMessage } from "@/lib/api"
import { formatMoney } from "@/lib/format"
import type { UserBalance, UserBank } from "@/lib/types"
import { Link } from "@tanstack/react-router"
import { LoaderCircle } from "lucide-react"
import { useCallback, useEffect, useState, type FormEvent } from "react"

export function WithdrawPage() {
  const { t } = useI18n()
  const [balances, setBalances] = useState<UserBalance[]>([])
  const [bank, setBank] = useState<UserBank | null>(null)
  const [walletId, setWalletId] = useState("")
  const [loading, setLoading] = useState(true)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [balanceList, userBank] = await Promise.all([customerApi.balances(), customerApi.getBank()])
      setBalances(balanceList)
      setBank(userBank)
      setWalletId((current) => current || (balanceList.length > 0 ? balanceList[0].wallet.id : ""))
    } catch (cause) {
      setError(getApiErrorMessage(cause, t("somethingWrong")))
    } finally {
      setLoading(false)
    }
  }, [t])

  useEffect(() => {
    void load()
  }, [load])

  const selected = balances.find((item) => item.wallet.id === walletId)

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!walletId) {
      setError(t("withdraw.chooseWallet"))
      return
    }
    const form = new FormData(event.currentTarget)
    const amount = Number(form.get("amount"))
    const note = String(form.get("note") ?? "").trim()
    if (!amount || amount <= 0) {
      setError(t("withdraw.validAmount"))
      return
    }

    setPending(true)
    setError(null)
    setSuccess(null)
    try {
      await customerApi.withdraw({
        walletId,
        amount,
        note: note || undefined,
      })
      setSuccess(t("withdraw.success"))
      event.currentTarget.reset()
      await load()
    } catch (cause) {
      setError(getApiErrorMessage(cause, t("somethingWrong")))
    } finally {
      setPending(false)
    }
  }

  if (loading) {
    return <p className="rounded-2xl border bg-card p-6 text-sm text-muted-foreground">{t("withdraw.loading")}</p>
  }

  if (!bank) {
    return (
      <div className="space-y-5">
        <header>
          <h1 className="font-heading text-2xl font-semibold tracking-tight">{t("withdraw.title")}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{t("withdraw.needBankHint")}</p>
        </header>
        <div className="rounded-3xl border bg-card p-6 text-center">
          <p className="text-sm text-muted-foreground">{t("withdraw.noBank")}</p>
          <Link
            to="/bank"
            className="mt-4 inline-flex h-12 w-full items-center justify-center rounded-xl bg-primary px-6 text-sm font-medium text-primary-foreground"
          >
            {t("withdraw.addBank")}
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <header>
        <h1 className="font-heading text-2xl font-semibold tracking-tight">{t("withdraw.title")}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t("withdraw.subtitle")}</p>
      </header>

      {success ? (
        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-800 dark:text-emerald-200">
          {success}
        </div>
      ) : null}
      {error ? (
        <div role="alert" className="rounded-2xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      ) : null}

      <div className="rounded-2xl border bg-card p-4">
        <p className="text-xs text-muted-foreground">{t("withdraw.yourBank")}</p>
        <p className="mt-1 font-medium">{bank.bankName}</p>
        <p className="mt-2 font-heading text-xl font-semibold tracking-wide">{bank.accountNumber}</p>
        <p className="mt-1 text-sm text-muted-foreground">{bank.accountName}</p>
        <Link to="/bank" className="mt-3 inline-block text-xs font-medium text-primary">
          {t("withdraw.editBank")}
        </Link>
      </div>

      <form className="space-y-4" onSubmit={(event) => void submit(event)}>
        <label className="grid gap-2 text-sm font-medium">
          {t("withdraw.wallet")}
          <select
            className="h-12 w-full rounded-xl border border-input bg-background px-3.5 text-base"
            value={walletId}
            onChange={(event) => setWalletId(event.target.value)}
            disabled={pending}
          >
            {balances.map((item) => (
              <option key={item.wallet.id} value={item.wallet.id}>
                {item.wallet.name} · {formatMoney(item.balance, item.wallet.currency)}
              </option>
            ))}
          </select>
        </label>
        {selected ? (
          <p className="text-xs text-muted-foreground">
            {t("withdraw.available", { amount: formatMoney(selected.balance, selected.wallet.currency) })}
          </p>
        ) : null}
        <label className="grid gap-2 text-sm font-medium">
          {t("withdraw.amount")}
          <Input name="amount" type="number" inputMode="decimal" min="0.01" step="0.01" placeholder="5000" required disabled={pending} />
        </label>
        <label className="grid gap-2 text-sm font-medium">
          {t("withdraw.note")} <span className="font-normal text-muted-foreground">{t("optional")}</span>
          <Input name="note" placeholder={t("withdraw.notePlaceholder")} disabled={pending} />
        </label>
        <Button type="submit" className="h-12 w-full rounded-xl text-sm font-medium tracking-normal normal-case" disabled={pending}>
          {pending ? (
            <>
              <LoaderCircle className="animate-spin" />
              {t("withdraw.requesting")}
            </>
          ) : (
            t("withdraw.request")
          )}
        </Button>
      </form>
    </div>
  )
}
