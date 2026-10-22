import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { AuthShell } from "@/features/auth/auth-shell"
import { useI18n } from "@/features/preferences/i18n-provider"
import { Link } from "@tanstack/react-router"
import { LoaderCircle } from "lucide-react"
import { useState } from "react"
import { getOtpChallenge } from "./otp"
import { useVerifyOtp } from "./use-verify-otp"

export function VerifyOtpPage() {
  const { t } = useI18n()
  const { verify, pending, error } = useVerifyOtp()
  const [challenge] = useState(() => getOtpChallenge())
  const [otp, setOtp] = useState("")

  return (
    <AuthShell
      eyebrow={t("auth.verifyEyebrow")}
      title={t("auth.verifyTitle")}
      subtitle={
        <>
          {challenge?.message || t("auth.verifyHint")}
          {challenge?.email ? (
            <>
              <br />
              <span className="font-medium text-slate-800">{challenge.email}</span>
            </>
          ) : null}
        </>
      }
      panelTitle={t("auth.panelLoginTitle")}
      panelBody={t("auth.panelLoginBody")}
      footer={
        <Link to="/login" className="font-semibold text-sky-700 underline-offset-4 hover:underline">
          {t("auth.returnToSignIn")}
        </Link>
      }
    >
      <form
        className="flex flex-col gap-4"
        onSubmit={(event) => {
          event.preventDefault()
          void verify(otp)
        }}
      >
        <label className="grid gap-2 text-sm font-medium text-slate-800">
          {t("auth.otp")}
          <Input
            name="otp"
            inputMode="numeric"
            autoComplete="one-time-code"
            placeholder={t("auth.otpPlaceholder")}
            value={otp}
            onChange={(event) => setOtp(event.target.value.replace(/\D/g, "").slice(0, 6))}
            required
            disabled={pending}
            className="rounded-xl text-center font-heading text-2xl tracking-[0.35em]"
            maxLength={6}
            pattern="\d{6}"
          />
          {challenge?.expiresIn ? (
            <span className="text-xs font-normal text-slate-500">
              {t("auth.otpExpires", { minutes: String(Math.max(1, Math.round(challenge.expiresIn / 60))) })}
            </span>
          ) : null}
        </label>
        {error ? (
          <p
            role="alert"
            className="rounded-xl border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive"
          >
            {error}
          </p>
        ) : null}
        <Button
          type="submit"
          className="h-12 w-full rounded-xl text-sm font-medium tracking-normal normal-case"
          disabled={pending || otp.length !== 6}
        >
          {pending ? (
            <>
              <LoaderCircle className="animate-spin" />
              {t("auth.verifying")}
            </>
          ) : (
            t("auth.verifyContinue")
          )}
        </Button>
      </form>
    </AuthShell>
  )
}
