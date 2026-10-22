import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { customerApi } from "@/features/customer/api"
import { useI18n } from "@/features/preferences/i18n-provider"
import { getApiErrorMessage } from "@/lib/api"
import { formatMoney } from "@/lib/format"
import type { DepositBank, WalletSummary } from "@/lib/types"
import { Check, Copy, LoaderCircle, Trash2, Upload, X } from "lucide-react"
import { useCallback, useEffect, useRef, useState, type ChangeEvent, type FormEvent } from "react"

export function DepositPage() {
  const { t } = useI18n()
  const [step, setStep] = useState(1)
  const [wallets, setWallets] = useState<WalletSummary[]>([])
  const [banks, setBanks] = useState<DepositBank[]>([])
  const [walletId, setWalletId] = useState("")
  const [bankId, setBankId] = useState("")
  const [loading, setLoading] = useState(true)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [previewQr, setPreviewQr] = useState<string | null>(null)
  const [receiptFile, setReceiptFile] = useState<File | null>(null)
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null)
  const receiptInputRef = useRef<HTMLInputElement>(null)

  const clearReceipt = useCallback(() => {
    setReceiptFile(null)
    setReceiptPreview((current) => {
      if (current) URL.revokeObjectURL(current)
      return null
    })
    if (receiptInputRef.current) receiptInputRef.current.value = ""
  }, [])

  const loadWallets = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const walletList = await customerApi.wallets()
      setWallets(walletList)
      setWalletId((current) => {
        if (walletList.length === 1) return walletList[0].id
        if (current && walletList.some((wallet) => wallet.id === current)) return current
        return walletList[0]?.id ?? ""
      })
    } catch (cause) {
      setError(getApiErrorMessage(cause, t("somethingWrong")))
    } finally {
      setLoading(false)
    }
  }, [t])

  useEffect(() => {
    void loadWallets()
  }, [loadWallets])

  useEffect(() => {
    if (!walletId) return
    void (async () => {
      try {
        const list = await customerApi.depositBanks(walletId)
        setBanks(list)
        setBankId((current) => {
          if (list.length === 1) return list[0].id
          if (current && list.some((item) => item.id === current)) return current
          return list[0]?.id ?? ""
        })
      } catch (cause) {
        setError(getApiErrorMessage(cause, t("somethingWrong")))
      }
    })()
  }, [t, walletId])

  useEffect(() => {
    return () => {
      if (receiptPreview) URL.revokeObjectURL(receiptPreview)
    }
  }, [receiptPreview])

  const selectedBank = banks.find((item) => item.id === bankId)
  const selectedWallet = wallets.find((item) => item.id === walletId)

  async function copyAccount() {
    if (!selectedBank) return
    try {
      await navigator.clipboard.writeText(selectedBank.accountNumber)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1500)
    } catch {
      setError(t("deposit.copyFailed"))
    }
  }

  function continueToPay() {
    if (!walletId || !bankId) {
      setError(t("deposit.selectBankFirst"))
      return
    }
    setError(null)
    setSuccess(null)
    setStep(2)
  }

  function onReceiptChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) {
      clearReceipt()
      return
    }
    setReceiptPreview((current) => {
      if (current) URL.revokeObjectURL(current)
      return URL.createObjectURL(file)
    })
    setReceiptFile(file)
    setError(null)
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const formElement = event.currentTarget
    if (!walletId || !bankId) {
      setError(t("deposit.chooseFirst"))
      return
    }
    const form = new FormData(formElement)
    const amount = Number(form.get("amount"))
    if (!amount || amount <= 0) {
      setError(t("deposit.validAmount"))
      return
    }
    if (!receiptFile || receiptFile.size === 0) {
      setError(t("deposit.needReceipt"))
      return
    }

    const body = new FormData()
    body.set("walletId", walletId)
    body.set("paymentMethodBankId", bankId)
    body.set("amount", String(amount))
    const note = String(form.get("note") ?? "").trim()
    if (note) body.set("note", note)
    body.set("receipt", receiptFile)

    setPending(true)
    setError(null)
    setSuccess(null)
    try {
      await customerApi.deposit(body)
      formElement.reset()
      clearReceipt()
      setStep(1)
      setSuccess(t("deposit.success"))
    } catch (cause) {
      setError(getApiErrorMessage(cause, t("somethingWrong")))
    } finally {
      setPending(false)
    }
  }

  return (
    <div className="space-y-5">
      <header>
        <p className="text-xs font-semibold tracking-[0.16em] text-primary uppercase">
          {t("deposit.stepOf", { step })}
        </p>
        <h1 className="mt-1 font-heading text-2xl font-semibold tracking-tight">{t("deposit.title")}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t("deposit.subtitle")}</p>
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

      {loading ? (
        <p className="rounded-2xl border bg-card p-6 text-sm text-muted-foreground">{t("deposit.loadingOptions")}</p>
      ) : (
        <>
          {step === 1 ? (
            <section className="space-y-4">
              <h2 className="text-sm font-medium">{t("deposit.transferTo")}</h2>

              {wallets.length > 1 ? (
                <label className="grid gap-2 text-sm font-medium">
                  {t("deposit.chooseWallet")}
                  <select
                    className="h-12 w-full rounded-xl border border-input bg-background px-3.5 text-base"
                    value={walletId}
                    onChange={(event) => setWalletId(event.target.value)}
                  >
                    {wallets.map((wallet) => (
                      <option key={wallet.id} value={wallet.id}>
                        {wallet.name} · {wallet.currency}
                      </option>
                    ))}
                  </select>
                </label>
              ) : selectedWallet ? (
                <div className="rounded-2xl border border-border/80 bg-card px-4 py-3">
                  <p className="text-xs text-muted-foreground">{t("deposit.chooseWallet")}</p>
                  <p className="mt-1 text-sm font-semibold">
                    {selectedWallet.name} · {selectedWallet.currency}
                  </p>
                </div>
              ) : null}

              <div className="space-y-1">
                <p className="text-sm font-medium">{t("deposit.transferHintTitle")}</p>
                <p className="text-xs leading-5 text-muted-foreground">{t("deposit.transferHintBody")}</p>
              </div>

              {banks.length ? (
                <div className="space-y-3">
                  {banks.map((bank) => {
                    const active = bankId === bank.id
                    return (
                      <div
                        key={bank.id}
                        role="button"
                        tabIndex={0}
                        onClick={() => setBankId(bank.id)}
                        onKeyDown={(event) => {
                          if (event.key === "Enter" || event.key === " ") {
                            event.preventDefault()
                            setBankId(bank.id)
                          }
                        }}
                        className={`w-full cursor-pointer rounded-2xl border p-4 text-left transition-colors ${
                          active ? "border-primary bg-primary/5" : "bg-card hover:bg-muted/40"
                        }`}
                      >
                        <p className="text-xs text-muted-foreground">{bank.paymentMethod.name}</p>
                        <p className="mt-1 font-medium">{bank.bankName}</p>
                        <p className="mt-2 font-heading text-xl font-semibold tracking-wide">{bank.accountNumber}</p>
                        <p className="mt-1 text-sm text-muted-foreground">{bank.accountName}</p>
                        {bank.imageQr ? (
                          <button
                            type="button"
                            className="mx-auto mt-4 block w-fit"
                            onClick={(event) => {
                              event.stopPropagation()
                              setBankId(bank.id)
                              setPreviewQr(bank.imageQr)
                            }}
                            aria-label={t("deposit.tapQr")}
                          >
                            <img
                              src={bank.imageQr}
                              alt={t("deposit.qrAlt")}
                              className="size-44 rounded-xl border bg-white object-contain p-2"
                            />
                            <span className="mt-2 block text-center text-xs text-primary">{t("deposit.tapQr")}</span>
                          </button>
                        ) : null}
                      </div>
                    )
                  })}
                </div>
              ) : (
                <p className="rounded-2xl border bg-card p-6 text-sm text-muted-foreground">{t("deposit.noBanks")}</p>
              )}

              <Button
                type="button"
                className="h-12 w-full rounded-xl text-sm font-medium tracking-normal normal-case"
                disabled={!walletId || !bankId}
                onClick={continueToPay}
              >
                {t("deposit.continuePay")}
              </Button>
            </section>
          ) : null}

          {step === 2 && selectedBank && selectedWallet ? (
            <section className="space-y-4">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-sm font-medium">{t("deposit.amountReceipt")}</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  className="rounded-lg"
                  onClick={() => {
                    clearReceipt()
                    setStep(1)
                  }}
                >
                  {t("deposit.changeBank")}
                </Button>
              </div>

              <div className="rounded-2xl border bg-card p-4">
                <p className="text-xs text-muted-foreground">{t("deposit.sendMoneyTo")}</p>
                <p className="mt-1 font-medium">{selectedBank.bankName}</p>
                <div className="mt-2 flex items-center gap-2">
                  <p className="font-heading text-xl font-semibold tracking-wide">{selectedBank.accountNumber}</p>
                  <Button type="button" variant="outline" size="sm" className="rounded-lg" onClick={() => void copyAccount()}>
                    {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
                    {copied ? t("copied") : t("copy")}
                  </Button>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{selectedBank.accountName}</p>
              </div>

              <form className="space-y-4" onSubmit={(event) => void submit(event)}>
                <label className="grid gap-2 text-sm font-medium">
                  {t("deposit.amount", { currency: selectedWallet.currency })}
                  <Input name="amount" type="number" inputMode="decimal" min="0.01" step="0.01" placeholder="10000" required disabled={pending} />
                </label>
                <label className="grid gap-2 text-sm font-medium">
                  {t("deposit.note")} <span className="font-normal text-muted-foreground">{t("optional")}</span>
                  <Input name="note" placeholder={t("deposit.notePlaceholder")} disabled={pending} />
                </label>

                <div className="grid gap-2 text-sm font-medium">
                  <span>{t("deposit.receiptPhoto")}</span>
                  {receiptPreview && receiptFile ? (
                    <div className="relative overflow-hidden rounded-2xl border bg-card">
                      <img
                        src={receiptPreview}
                        alt={t("deposit.receiptPreviewAlt")}
                        className="max-h-64 w-full object-contain bg-muted/40"
                      />
                      <div className="flex items-center justify-between gap-3 border-t px-3 py-2.5">
                        <p className="min-w-0 truncate text-xs text-muted-foreground">{receiptFile.name}</p>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="shrink-0 rounded-lg"
                          disabled={pending}
                          onClick={clearReceipt}
                        >
                          <Trash2 className="size-3.5" />
                          {t("deposit.removeReceipt")}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <label className="flex h-28 cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border border-dashed bg-card px-4 text-center text-sm font-normal text-muted-foreground">
                      <Upload className="size-5" />
                      {t("deposit.tapImage")}
                      <input
                        ref={receiptInputRef}
                        name="receipt"
                        type="file"
                        accept="image/*"
                        capture="environment"
                        className="sr-only"
                        disabled={pending}
                        onChange={onReceiptChange}
                      />
                    </label>
                  )}
                </div>

                <Button
                  type="submit"
                  className="h-12 w-full rounded-xl text-sm font-medium tracking-normal normal-case"
                  disabled={pending || !receiptFile}
                >
                  {pending ? (
                    <>
                      <LoaderCircle className="animate-spin" />
                      {t("deposit.submitting")}
                    </>
                  ) : (
                    t("deposit.submit", { currency: selectedWallet.currency })
                  )}
                </Button>
                <p className="text-center text-xs text-muted-foreground">
                  {t("deposit.tip", { example: formatMoney(10000, selectedWallet.currency) })}
                </p>
              </form>
            </section>
          ) : null}
        </>
      )}

      {previewQr ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <button
            type="button"
            className="absolute inset-0"
            aria-label={t("close")}
            onClick={() => setPreviewQr(null)}
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-label={t("deposit.qrAlt")}
            className="relative z-10 w-full max-w-sm rounded-3xl border bg-background p-4 shadow-xl"
          >
            <div className="mb-3 flex items-center justify-between gap-3">
              <p className="text-sm font-medium">{t("deposit.qrAlt")}</p>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="rounded-xl"
                aria-label={t("close")}
                onClick={() => setPreviewQr(null)}
              >
                <X className="size-4" />
              </Button>
            </div>
            <img
              src={previewQr}
              alt={t("deposit.qrAlt")}
              className="mx-auto w-full max-w-[20rem] rounded-2xl border bg-white object-contain p-3"
            />
            <Button
              type="button"
              className="mt-4 h-11 w-full rounded-xl text-sm font-medium tracking-normal normal-case"
              onClick={() => setPreviewQr(null)}
            >
              {t("close")}
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  )
}
