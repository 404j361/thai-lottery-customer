import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { AuthShell } from "@/features/auth/auth-shell"
import { useI18n } from "@/features/preferences/i18n-provider"
import { Link } from "@tanstack/react-router"
import { LoaderCircle } from "lucide-react"
import { useRegister } from "./use-register"

export function RegisterPage() {
  const { register, pending, error } = useRegister()
  const { t } = useI18n()

  return (
    <AuthShell
      eyebrow={t("auth.createWalletAccount")}
      title={t("auth.getStarted")}
      subtitle={t("auth.registerHint")}
      panelTitle={t("auth.panelRegisterTitle")}
      panelBody={t("auth.panelRegisterBody")}
      footer={
        <>
          {t("auth.alreadyHaveAccount")}{" "}
          <Link to="/login" className="font-semibold text-sky-700 underline-offset-4 hover:underline">
            {t("auth.signIn")}
          </Link>
        </>
      }
    >
      <form
        className="flex flex-col gap-4"
        onSubmit={(event) => {
          event.preventDefault()
          void register(new FormData(event.currentTarget))
        }}
      >
        <label className="grid gap-2 text-sm font-medium text-slate-800">
          {t("auth.email")}
          <Input
            type="email"
            name="email"
            autoComplete="email"
            placeholder={t("auth.emailPlaceholder")}
            required
            disabled={pending}
            className="rounded-xl"
          />
        </label>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-3">
          <label className="grid gap-2 text-sm font-medium text-slate-800">
            {t("auth.firstName")}
            <Input
              name="firstName"
              autoComplete="given-name"
              placeholder={t("auth.firstNamePlaceholder")}
              required
              disabled={pending}
              className="rounded-xl"
              maxLength={80}
            />
          </label>
          <label className="grid gap-2 text-sm font-medium text-slate-800">
            {t("auth.lastName")}
            <Input
              name="lastName"
              autoComplete="family-name"
              placeholder={t("auth.lastNamePlaceholder")}
              required
              disabled={pending}
              className="rounded-xl"
              maxLength={80}
            />
          </label>
        </div>
        <label className="grid gap-2 text-sm font-medium text-slate-800">
          {t("auth.password")}
          <Input
            type="password"
            name="password"
            autoComplete="new-password"
            placeholder={t("auth.passwordMinPlaceholder")}
            required
            disabled={pending}
            className="rounded-xl"
          />
        </label>
        <label className="grid gap-2 text-sm font-medium text-slate-800">
          {t("auth.confirmPassword")}
          <Input
            type="password"
            name="confirm"
            autoComplete="new-password"
            placeholder={t("auth.confirmPlaceholder")}
            required
            disabled={pending}
            className="rounded-xl"
          />
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
          disabled={pending}
        >
          {pending ? (
            <>
              <LoaderCircle className="animate-spin" />
              {t("auth.sendingCode")}
            </>
          ) : (
            t("auth.sendCode")
          )}
        </Button>
      </form>
    </AuthShell>
  )
}
