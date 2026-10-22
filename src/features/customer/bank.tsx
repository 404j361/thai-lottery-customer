import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { customerApi } from "@/features/customer/api"
import { useI18n } from "@/features/preferences/i18n-provider"
import { getApiErrorMessage } from "@/lib/api"
import type { UserBank } from "@/lib/types"
import { LoaderCircle } from "lucide-react"
import { useCallback, useEffect, useState, type FormEvent } from "react"

export function BankPage() {
  const { t } = useI18n()
  const [bank, setBank] = useState<UserBank | null>(null)
  const [loading, setLoading] = useState(true)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      setBank(await customerApi.getBank())
    } catch (cause) {
      setError(getApiErrorMessage(cause, t("somethingWrong")))
    } finally {
      setLoading(false)
    }
  }, [t])

  useEffect(() => {
    void load()
  }, [load])

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const body = {
      bankName: String(form.get("bankName") ?? "").trim(),
      accountName: String(form.get("accountName") ?? "").trim(),
      accountNumber: String(form.get("accountNumber") ?? "").trim(),
    }
    if (!body.bankName || !body.accountName || !body.accountNumber) {
      setError(t("bank.fillAll"))
      return
    }

    setPending(true)
    setError(null)
    setSuccess(null)
    try {
      const saved = bank ? await customerApi.updateBank(body) : await customerApi.createBank(body)
      setBank(saved)
      setSuccess(bank ? t("bank.updated") : t("bank.saved"))
    } catch (cause) {
      setError(getApiErrorMessage(cause, t("somethingWrong")))
    } finally {
      setPending(false)
    }
  }

  async function removeBank() {
    if (!bank || !window.confirm(t("bank.confirmRemove"))) return
    setPending(true)
    setError(null)
    setSuccess(null)
    try {
      await customerApi.deleteBank()
      setBank(null)
      setSuccess(t("bank.removed"))
    } catch (cause) {
      setError(getApiErrorMessage(cause, t("somethingWrong")))
    } finally {
      setPending(false)
    }
  }

  if (loading) {
    return <p className="rounded-2xl border bg-card p-6 text-sm text-muted-foreground">{t("bank.loading")}</p>
  }

  return (
    <div className="space-y-5">
      <header>
        <h1 className="font-heading text-2xl font-semibold tracking-tight">{t("bank.title")}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t("bank.subtitle")}</p>
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

      <form className="space-y-4 rounded-3xl border bg-card p-4" onSubmit={(event) => void submit(event)}>
        <label className="grid gap-2 text-sm font-medium">
          {t("bank.bankName")}
          <Input name="bankName" defaultValue={bank?.bankName ?? ""} placeholder={t("bank.bankNamePlaceholder")} required disabled={pending} />
        </label>
        <label className="grid gap-2 text-sm font-medium">
          {t("bank.accountName")}
          <Input
            name="accountName"
            defaultValue={bank?.accountName ?? ""}
            placeholder={t("bank.accountNamePlaceholder")}
            required
            disabled={pending}
          />
        </label>
        <label className="grid gap-2 text-sm font-medium">
          {t("bank.accountNumber")}
          <Input
            name="accountNumber"
            defaultValue={bank?.accountNumber ?? ""}
            placeholder="1234567890"
            required
            disabled={pending}
            inputMode="numeric"
          />
        </label>
        <Button type="submit" className="h-12 w-full rounded-xl text-sm font-medium tracking-normal normal-case" disabled={pending}>
          {pending ? (
            <>
              <LoaderCircle className="animate-spin" />
              {t("bank.saving")}
            </>
          ) : bank ? (
            t("bank.update")
          ) : (
            t("bank.save")
          )}
        </Button>
      </form>

      {bank ? (
        <Button
          type="button"
          variant="outline"
          className="h-11 w-full rounded-xl text-sm font-medium tracking-normal normal-case text-destructive"
          disabled={pending}
          onClick={() => void removeBank()}
        >
          {t("bank.remove")}
        </Button>
      ) : null}
    </div>
  )
}
