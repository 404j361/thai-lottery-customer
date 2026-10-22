import { useI18n } from "@/features/preferences/i18n-provider"
import { Link, Outlet, useRouterState } from "@tanstack/react-router"
import { ArrowDownToLine, Clock3, Home, Ticket, UserRound, type LucideIcon } from "lucide-react"

type NavItem = {
  to: "/home" | "/deposit" | "/history" | "/account"
  label: string
  icon: LucideIcon
}

export function CustomerShell() {
  const pathname = useRouterState({ select: (state) => state.location.pathname })
  const { t } = useI18n()

  const leftNav: NavItem[] = [
    { to: "/home", label: t("nav.home"), icon: Home },
    { to: "/deposit", label: t("nav.deposit"), icon: ArrowDownToLine },
  ]
  const rightNav: NavItem[] = [
    { to: "/history", label: t("nav.history"), icon: Clock3 },
    { to: "/account", label: t("nav.account"), icon: UserRound },
  ]

  const ticketsActive = pathname === "/tickets" || pathname.startsWith("/tickets/")

  function isActive(to: NavItem["to"]) {
    return pathname === to || pathname.startsWith(`${to}/`) || (to === "/account" && pathname === "/bank")
  }

  return (
    <div className="app-shell-bg mx-auto flex min-h-svh w-full max-w-lg flex-col">
      <main className="flex-1 px-4 pt-5 pb-32">
        <Outlet />
      </main>

      <nav className="fixed inset-x-0 bottom-0 z-30 pb-[env(safe-area-inset-bottom)]">
        <div className="relative mx-auto max-w-lg px-3 pb-3 pt-7">
          <Link
            to="/tickets"
            aria-label={t("nav.tickets")}
            className="absolute top-0 left-1/2 z-20 -translate-x-1/2"
          >
            <span
              className={`flex size-[4.25rem] flex-col items-center justify-center rounded-full ring-4 ring-background transition-transform duration-150 ease-out active:scale-90 ${
                ticketsActive
                  ? "bg-primary text-primary-foreground shadow-[0_10px_24px_rgb(42_99_217/0.45)]"
                  : "border-2 border-primary bg-card text-primary shadow-[0_8px_20px_rgb(26_43_63/0.12)]"
              }`}
            >
              <Ticket className="size-6" />
              <span className="mt-0.5 text-[10px] font-semibold leading-none">{t("nav.tickets")}</span>
            </span>
          </Link>

          <div className="grid grid-cols-[1fr_4.75rem_1fr] items-end rounded-[1.7rem] border border-border/80 bg-card/95 px-1.5 pt-2 pb-1.5 shadow-[0_10px_30px_rgb(26_43_63/0.08)] backdrop-blur-xl">
            <div className="grid grid-cols-2 gap-0.5">
              {leftNav.map((item) => (
                <SideNavLink key={item.to} item={item} active={isActive(item.to)} />
              ))}
            </div>
            <div aria-hidden className="h-11" />
            <div className="grid grid-cols-2 gap-0.5">
              {rightNav.map((item) => (
                <SideNavLink key={item.to} item={item} active={isActive(item.to)} />
              ))}
            </div>
          </div>
        </div>
      </nav>
    </div>
  )
}

function SideNavLink({ item, active }: { item: NavItem; active: boolean }) {
  const Icon = item.icon
  return (
    <Link
      to={item.to}
      className={`flex flex-col items-center gap-1 rounded-2xl px-1 py-2 text-[11px] font-medium transition-[transform,colors] duration-150 ease-out active:scale-90 ${
        active
          ? "bg-primary/10 text-primary"
          : "text-muted-foreground hover:bg-muted/70 hover:text-foreground"
      }`}
    >
      <Icon className="size-5" />
      <span className="truncate">{item.label}</span>
    </Link>
  )
}
